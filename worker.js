const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function decodeBase64ToBytes(value) {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function safeFileName(name) {
  return String(name || "import.xlsx").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getAuthBase(env) {
  return String(env.AUTH_API_BASE || env.CENTRAL_AUTH_BASE || "").trim().replace(/\/+$/, "");
}

function normalizeLooseKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim()
    .toLowerCase();
}

function collectStringFields(source, bucket = []) {
  if (!source || typeof source !== "object") return bucket;
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string" && value.trim()) {
      bucket.push({ key: normalizeLooseKey(key), value: value.trim() });
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      collectStringFields(value, bucket);
    }
  }
  return bucket;
}

function findUserFieldByHeuristics(source, matcher) {
  const entries = collectStringFields(source, []);
  const found = entries.find((entry) => matcher(entry.key, entry.value));
  return found?.value || "";
}

function getSsoConfig(env, requestUrl) {
  const url = new URL(requestUrl);
  const expectedAudience = String(env.SSO_EXPECTED_AUDIENCE || url.origin).trim();
  const expectedIssuer = String(env.SSO_EXPECTED_ISSUER || getAuthBase(env)).trim();
  const sharedSecret = String(env.SSO_SHARED_SECRET || "").trim();
  return { expectedAudience, expectedIssuer, sharedSecret };
}

function base64UrlToBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function base64UrlDecodeJson(value) {
  const bytes = base64UrlToBytes(value);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

async function importHmacKey(sharedSecret) {
  const keyData = new TextEncoder().encode(sharedSecret);
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
}

async function verifyJwtHs256(token, sharedSecret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    throw new Error("Formato de token invalido.");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = base64UrlDecodeJson(headerB64);
  const payload = base64UrlDecodeJson(payloadB64);

  if (String(header?.alg || "") !== "HS256") {
    throw new Error("Algoritmo do token nao suportado.");
  }

  const key = await importHmacKey(sharedSecret);
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToBytes(signatureB64);
  const valid = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!valid) {
    throw new Error("Assinatura do token invalida.");
  }

  return payload;
}

function normalizeDateKey(value) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return "";
}

async function ensureResultsTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS operator_results_daily (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL DEFAULT '',
      result_date TEXT NOT NULL,
      production_total REAL NOT NULL DEFAULT 0,
      effectiveness REAL NOT NULL DEFAULT 0,
      quality_score REAL NOT NULL DEFAULT 0,
      updated_by_id TEXT NOT NULL DEFAULT '',
      updated_by_name TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, result_date)
    )`
  ).run();
}

async function ensureSsoReplayTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS sso_consumed_tokens (
      jti TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      consumed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();
}

async function ensureSystemSettingsTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS system_settings (
      setting_key TEXT PRIMARY KEY,
      value_text TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by_id TEXT NOT NULL DEFAULT '',
      updated_by_name TEXT NOT NULL DEFAULT ''
    )`
  ).run();
}

function normalizeMaintenanceStatus(raw = {}) {
  return {
    enabled: Boolean(raw?.enabled),
    message: String(raw?.message || "O portal esta temporariamente em manutencao. Tente novamente em alguns minutos."),
    updatedAt: String(raw?.updatedAt || ""),
    updatedById: String(raw?.updatedById || ""),
    updatedByName: String(raw?.updatedByName || "")
  };
}

async function readSystemMaintenanceStatus(db) {
  await ensureSystemSettingsTable(db);
  const row = await db
    .prepare("SELECT value_text FROM system_settings WHERE setting_key = ? LIMIT 1")
    .bind("maintenance_mode")
    .first();
  if (!row?.value_text) {
    return normalizeMaintenanceStatus({ enabled: false });
  }

  try {
    const parsed = JSON.parse(String(row.value_text || "{}"));
    return normalizeMaintenanceStatus(parsed);
  } catch {
    return normalizeMaintenanceStatus({ enabled: false });
  }
}

async function updateSystemMaintenanceStatus(db, payload = {}) {
  await ensureSystemSettingsTable(db);
  const nextStatus = normalizeMaintenanceStatus({
    enabled: Boolean(payload?.enabled),
    message: String(payload?.message || "").trim(),
    updatedAt: new Date().toISOString(),
    updatedById: String(payload?.updatedById || "").trim(),
    updatedByName: String(payload?.updatedByName || "").trim()
  });

  await db
    .prepare(
      `INSERT INTO system_settings (setting_key, value_text, updated_at, updated_by_id, updated_by_name)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(setting_key) DO UPDATE SET
         value_text = excluded.value_text,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id,
         updated_by_name = excluded.updated_by_name`
    )
    .bind(
      "maintenance_mode",
      JSON.stringify(nextStatus),
      nextStatus.updatedAt,
      nextStatus.updatedById,
      nextStatus.updatedByName
    )
    .run();

  return nextStatus;
}

async function markSsoTokenAsConsumed(db, jti, expSeconds) {
  await ensureSsoReplayTable(db);
  const nowSeconds = Math.floor(Date.now() / 1000);
  await db.prepare("DELETE FROM sso_consumed_tokens WHERE expires_at < ?").bind(nowSeconds).run();
  await db
    .prepare("INSERT INTO sso_consumed_tokens (jti, expires_at, consumed_at) VALUES (?, ?, datetime('now'))")
    .bind(jti, expSeconds)
    .run();
}

function buildRecord(userId, rows) {
  const entries = (rows || []).map((row) => ({
    date: row.result_date,
    productionTotal: Number(row.production_total || 0),
    effectiveness: Number(row.effectiveness || 0),
    qualityScore: Number(row.quality_score || 0),
    updatedById: row.updated_by_id || "",
    updatedByName: row.updated_by_name || "",
    updatedAt: row.updated_at || row.created_at || ""
  }));

  if (!entries.length) return null;
  entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latest = entries[entries.length - 1];
  const productionAverage = entries.reduce((sum, entry) => sum + Number(entry.productionTotal || 0), 0) / entries.length;
  const firstRow = rows[0] || {};

  return {
    userId,
    userName: firstRow.user_name || "",
    username: firstRow.username || "",
    entries,
    daysCount: entries.length,
    productionAverage,
    productionTotal: latest.productionTotal,
    effectiveness: latest.effectiveness,
    qualityScore: latest.qualityScore,
    updatedAt: latest.updatedAt,
    updatedById: latest.updatedById,
    updatedByName: latest.updatedByName
  };
}

async function fetchCentral(env, pathname, options = {}) {
  const authBase = getAuthBase(env);
  if (!authBase) {
    throw new Error("AUTH_API_BASE nao configurado.");
  }

  const response = await fetch(`${authBase}${pathname}`, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || "Falha ao consultar a Central do Operador.");
  }
  return payload;
}

function sanitizeUser(user) {
  let nuvidioUsername = String(
    user?.nuvidioUsername ??
    user?.usuarioNuvidio ??
    user?.usernameNuvidio ??
    user?.nuvidio_user ??
    user?.nuvidio_login ??
    user?.usuario_nuvidio ??
    ""
  ).trim();
  let line0800Username = String(
    user?.line0800Username ??
    user?.usuario0800 ??
    user?.username0800 ??
    user?.["0800Username"] ??
    user?.["0800_user"] ??
    user?.["0800_login"] ??
    user?.usuario_0800 ??
    ""
  ).trim();

  if (!nuvidioUsername) {
    nuvidioUsername = findUserFieldByHeuristics(user, (key) => (
      key.includes("nuvidio") && (key.includes("usuario") || key.includes("username") || key.includes("login") || key.includes("user"))
    ));
  }
  if (!line0800Username) {
    line0800Username = findUserFieldByHeuristics(user, (key) => (
      key.includes("0800") && (key.includes("usuario") || key.includes("username") || key.includes("login") || key.includes("user"))
    ));
  }
  return {
    id: String(user?.id || ""),
    name: String(user?.name || ""),
    username: String(user?.username || ""),
    nuvidioUsername,
    line0800Username,
    role: String(user?.role || "operador"),
    accessLevel: String(user?.accessLevel || "")
  };
}

async function resolveOperators(env) {
  const payload = await fetchCentral(env, "/api/users", { method: "GET" });
  const users = Array.isArray(payload?.users) ? payload.users : [];
  return users
    .map(sanitizeUser)
    .filter((user) => user.id && user.role !== "gestor")
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "pt-BR"));
}

async function readRecord(db, userId) {
  await ensureResultsTable(db);
  const rows = await db
    .prepare("SELECT * FROM operator_results_daily WHERE user_id = ? ORDER BY result_date ASC, updated_at ASC")
    .bind(userId)
    .all();
  return buildRecord(userId, rows.results || []);
}

async function upsertOperatorResult(db, payload) {
  const userId = String(payload?.userId || "").trim();
  const userName = String(payload?.userName || "").trim();
  const username = String(payload?.username || "").trim();
  const date = normalizeDateKey(payload?.date);
  const productionTotal = Number(payload?.productionTotal);
  const effectiveness = Number(payload?.effectiveness);
  const qualityScore = Number(payload?.qualityScore);
  const updatedById = String(payload?.updatedById || "").trim();
  const updatedByName = String(payload?.updatedByName || "").trim();

  if (!userId || !date || !Number.isFinite(productionTotal) || !Number.isFinite(effectiveness) || !Number.isFinite(qualityScore)) {
    return { ok: false, error: "Payload invalido para resultado do operador." };
  }

  await ensureResultsTable(db);
  await db.prepare(
    `INSERT INTO operator_results_daily (
      id, user_id, user_name, username, result_date, production_total, effectiveness, quality_score,
      updated_by_id, updated_by_name, updated_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, result_date) DO UPDATE SET
      user_name = excluded.user_name,
      username = excluded.username,
      production_total = excluded.production_total,
      effectiveness = excluded.effectiveness,
      quality_score = excluded.quality_score,
      updated_by_id = excluded.updated_by_id,
      updated_by_name = excluded.updated_by_name,
      updated_at = excluded.updated_at`
  )
    .bind(
      `${userId}__${date}`,
      userId,
      userName,
      username,
      date,
      productionTotal,
      effectiveness,
      qualityScore,
      updatedById,
      updatedByName,
      new Date().toISOString()
    )
    .run();

  return { ok: true, userId };
}

async function deleteOperatorResult(db, payload) {
  const userId = String(payload?.userId || "").trim();
  const date = normalizeDateKey(payload?.date);
  if (!userId || !date) {
    return { ok: false, error: "Informe userId e date para excluir o lancamento." };
  }

  await ensureResultsTable(db);
  const result = await db
    .prepare("DELETE FROM operator_results_daily WHERE user_id = ? AND result_date = ?")
    .bind(userId, date)
    .run();

  const deleted = Number(result?.meta?.changes || 0);
  if (!deleted) {
    return { ok: false, error: "Nenhum lancamento encontrado para exclusao nessa data." };
  }

  return { ok: true, userId, date, deleted };
}

async function deleteAllOperatorResults(db) {
  await ensureResultsTable(db);
  const result = await db.prepare("DELETE FROM operator_results_daily").run();
  const deleted = Number(result?.meta?.changes || 0);
  return { ok: true, deleted };
}

async function readAllRecords(db) {
  await ensureResultsTable(db);
  const rows = await db
    .prepare("SELECT * FROM operator_results_daily ORDER BY user_id ASC, result_date ASC, updated_at ASC")
    .all();

  const byUser = new Map();
  for (const row of rows.results || []) {
    const userId = String(row.user_id || "").trim();
    if (!userId) continue;
    const list = byUser.get(userId) || [];
    list.push(row);
    byUser.set(userId, list);
  }

  const records = [];
  for (const [userId, entries] of byUser.entries()) {
    const record = buildRecord(userId, entries);
    if (record) records.push(record);
  }
  return records;
}

async function verifySsoTokenAndBuildUser(env, requestUrl, token, db) {
  const { sharedSecret, expectedIssuer, expectedAudience } = getSsoConfig(env, requestUrl);
  if (!sharedSecret) {
    throw new Error("SSO_SHARED_SECRET nao configurado.");
  }

  const payload = await verifyJwtHs256(token, sharedSecret);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = Number(payload?.exp);
  const iat = Number(payload?.iat);
  const iss = String(payload?.iss || "");
  const aud = String(payload?.aud || "");
  const jti = String(payload?.jti || "");

  if (!Number.isFinite(exp) || exp <= nowSeconds) {
    throw new Error("Token expirado.");
  }
  if (!Number.isFinite(iat) || iat > nowSeconds + 30) {
    throw new Error("Token com iat invalido.");
  }
  if (!jti) {
    throw new Error("Token sem jti.");
  }
  if (expectedIssuer && iss !== expectedIssuer) {
    throw new Error("Issuer invalido.");
  }
  if (expectedAudience && aud !== expectedAudience) {
    throw new Error("Audience invalida.");
  }

  try {
    await markSsoTokenAsConsumed(db, jti, exp);
  } catch (error) {
    const detail = String(error?.message || "");
    if (detail.includes("UNIQUE")) {
      throw new Error("Token SSO ja utilizado.");
    }
    throw error;
  }

  const id = String(payload?.id || payload?.sub || "").trim();
  const name = String(payload?.name || "").trim();
  const username = String(payload?.username || "").trim();
  const role = String(payload?.role || "operador").trim();
  const accessLevel = String(payload?.accessLevel || payload?.access_level || "").trim();

  if (!id || !name || !username) {
    throw new Error("Token sem dados obrigatorios do usuario.");
  }

  return {
    user: { id, name, username, role, accessLevel },
    payload
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true }, 204);
    }

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === "/api/health") {
      const ssoConfig = getSsoConfig(env, request.url);
      return jsonResponse({
        ok: true,
        service: "portal-resultados-operador",
        hasDB: Boolean(env.DB),
        hasR2: Boolean(env.RESULTS_BUCKET || env.IMPORTS_BUCKET),
        hasImportsBucket: Boolean(env.IMPORTS_BUCKET),
        hasResultsBucket: Boolean(env.RESULTS_BUCKET),
        hasImportR2: Boolean(env.IMPORTS_BUCKET),
        authBaseConfigured: Boolean(getAuthBase(env)),
        ssoSecretConfigured: Boolean(ssoConfig.sharedSecret),
        ssoAudience: ssoConfig.expectedAudience || null,
        ssoIssuer: ssoConfig.expectedIssuer || null
      });
    }

    if (!env.DB) {
      return jsonResponse({ ok: false, error: "D1 binding DB nao configurado." }, 500);
    }

    try {
      if (url.pathname === "/api/login" && request.method === "POST") {
        const body = await request.json();
        const username = String(body?.username || "").trim();
        const password = String(body?.password || "");
        if (!username || !password) {
          return jsonResponse({ ok: false, error: "Usuario e senha obrigatorios." }, 400);
        }

        const payload = await fetchCentral(env, "/api/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        return jsonResponse({ ok: true, user: sanitizeUser(payload.user) });
      }

      if (url.pathname === "/api/sso/consume" && request.method === "POST") {
        const body = await request.json();
        const token = String(body?.token || "").trim();
        if (!token) {
          return jsonResponse({ ok: false, error: "Token SSO obrigatorio." }, 400);
        }

        const result = await verifySsoTokenAndBuildUser(env, request.url, token, env.DB);
        return jsonResponse({
          ok: true,
          user: sanitizeUser(result.user),
          exp: Number(result.payload.exp || 0)
        });
      }

      if (url.pathname === "/api/operators" && request.method === "GET") {
        const operators = await resolveOperators(env);
        return jsonResponse({ ok: true, operators });
      }

      if (url.pathname === "/api/system-status" && request.method === "GET") {
        const status = await readSystemMaintenanceStatus(env.DB);
        return jsonResponse({ ok: true, status });
      }

      if (url.pathname === "/api/system-maintenance" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const actorRole = String(body?.actorRole || "").trim().toLowerCase();
        if (actorRole !== "gestor") {
          return jsonResponse({ ok: false, error: "Somente gestor pode alterar o modo manutencao." }, 403);
        }
        const status = await updateSystemMaintenanceStatus(env.DB, body || {});
        return jsonResponse({ ok: true, status });
      }

      if (url.pathname === "/api/results" && request.method === "GET") {
        const userId = String(url.searchParams.get("userId") || "").trim();
        if (!userId) {
          return jsonResponse({ ok: false, error: "userId obrigatorio." }, 400);
        }

        const record = await readRecord(env.DB, userId);
        return jsonResponse({ ok: true, record });
      }

      if (url.pathname === "/api/results/all" && request.method === "GET") {
        const records = await readAllRecords(env.DB);
        return jsonResponse({ ok: true, records });
      }

      if (url.pathname === "/api/operator-results" && request.method === "POST") {
        const body = await request.json();
        const result = await upsertOperatorResult(env.DB, body || {});
        if (!result.ok) {
          return jsonResponse({ ok: false, error: result.error || "Payload invalido para resultado do operador." }, 400);
        }
        const record = await readRecord(env.DB, result.userId);
        return jsonResponse({ ok: true, record });
      }

      if (url.pathname === "/api/operator-results/delete" && request.method === "POST") {
        const body = await request.json();
        const result = await deleteOperatorResult(env.DB, body || {});
        if (!result.ok) {
          return jsonResponse({ ok: false, error: result.error || "Nao foi possivel excluir o lancamento." }, 400);
        }
        const record = await readRecord(env.DB, result.userId);
        return jsonResponse({ ok: true, deleted: result.deleted, record });
      }

      if (url.pathname === "/api/operator-results/delete-all" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        if (!body?.confirm) {
          return jsonResponse({ ok: false, error: "Confirme a exclusao em lote para continuar." }, 400);
        }
        const result = await deleteAllOperatorResults(env.DB);
        return jsonResponse({ ok: true, deleted: result.deleted });
      }

      if (url.pathname === "/api/operator-results/bulk" && request.method === "POST") {
        const body = await request.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        if (!items.length) {
          return jsonResponse({ ok: false, error: "Envie ao menos um item para importacao em lote." }, 400);
        }

        let imported = 0;
        const errors = [];
        for (let index = 0; index < items.length; index += 1) {
          const result = await upsertOperatorResult(env.DB, items[index]);
          if (result.ok) {
            imported += 1;
          } else {
            errors.push({ index, error: result.error || "Linha invalida" });
          }
        }

        return jsonResponse({
          ok: true,
          imported,
          failed: errors.length,
          errors
        });
      }

      if (url.pathname === "/api/import/remove-by-sheet" && request.method === "POST") {
        const body = await request.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        if (!items.length) {
          return jsonResponse({ ok: false, error: "Envie ao menos um item para remocao em lote." }, 400);
        }

        let removed = 0;
        const errors = [];
        for (let index = 0; index < items.length; index += 1) {
          const result = await deleteOperatorResult(env.DB, items[index]);
          if (result.ok) {
            removed += Number(result.deleted || 1);
          } else {
            errors.push({ index, error: result.error || "Linha invalida ou nao encontrada" });
          }
        }

        return jsonResponse({
          ok: true,
          removed,
          failed: errors.length,
          errors
        });
      }

      if (url.pathname === "/api/import/upload-and-process" && request.method === "POST") {
        if (!env.IMPORTS_BUCKET) {
          return jsonResponse({ ok: false, error: "Binding R2 IMPORTS_BUCKET nao configurado." }, 500);
        }

        const body = await request.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        const fileBase64 = String(body?.fileBase64 || "");
        const fileName = safeFileName(body?.fileName || "import.xlsx");
        const mimeType = String(body?.mimeType || "application/octet-stream");
        if (!items.length) {
          return jsonResponse({ ok: false, error: "Nenhum item valido enviado para importacao." }, 400);
        }
        if (!fileBase64) {
          return jsonResponse({ ok: false, error: "Arquivo da planilha nao enviado." }, 400);
        }

        const importKey = `imports/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
        let imported = 0;
        const errors = [];
        let uploadStored = false;
        let removedFromR2 = false;

        try {
          const bytes = decodeBase64ToBytes(fileBase64);
          await env.IMPORTS_BUCKET.put(importKey, bytes, {
            httpMetadata: { contentType: mimeType }
          });
          uploadStored = true;

          for (let index = 0; index < items.length; index += 1) {
            const result = await upsertOperatorResult(env.DB, items[index]);
            if (result.ok) {
              imported += 1;
            } else {
              errors.push({ index, error: result.error || "Linha invalida" });
            }
          }
        } finally {
          if (uploadStored) {
            await env.IMPORTS_BUCKET.delete(importKey);
            removedFromR2 = true;
          }
        }

        return jsonResponse({
          ok: true,
          imported,
          failed: errors.length,
          errors,
          importKey,
          removedFromR2
        });
      }

      return jsonResponse({ ok: false, error: "Rota nao encontrada." }, 404);
    } catch (error) {
      return jsonResponse(
        { ok: false, error: "Falha interna na API.", detail: String(error?.message || error) },
        500
      );
    }
  }
};
