const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
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

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function defaultState() {
  return {
    app: "knowledge-base",
    content: [],
    meta: {
      favorites: [],
      searchHistory: [],
      seenNotifications: {},
      alertedUrgentNotifications: {},
      activePresence: {},
      operatorResults: {}
    },
      users: [],
      section: "explorer",
      selectedContentId: null,
      theme: "dark"
    };
  }

function userFromRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    username: row.username || "",
    email: row.email || "",
    role: row.role || "operador",
    lastLoginAt: row.last_login_at || "",
    updatedAt: row.updated_at || "",
    team: row.team || "",
    accessLevel: row.access_level_name || "",
    permissions: safeParse(row.permissions_json || "[]", []),
    password: row.password || "",
    mustChangePassword: Boolean(row.must_change_password),
    active: Boolean(row.active)
  };
}

function contentFromRow(row) {
  return {
    id: row.id,
    title: row.title || "",
    category: row.category || "",
    type: row.type || "",
    summary: row.summary || "",
    tags: safeParse(row.tags_json || "[]", []),
    keywords: safeParse(row.keywords_json || "[]", []),
    body: safeParse(row.body_json || "[]", []),
    attachments: safeParse(row.attachments_json || "[]", []),
    featured: Boolean(row.featured),
    urgent: Boolean(row.urgent),
    allowCopy: Boolean(row.allow_copy),
    accessCount: Number(row.access_count || 0),
    helpful: {
      yes: Number(row.helpful_yes || 0),
      no: Number(row.helpful_no || 0)
    },
    updatedAt: row.updated_at || "",
    createdAt: row.created_at || "",
    active: Boolean(row.active)
  };
}

function attachmentFromRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    type: row.type || "",
    size: Number(row.size || 0),
    uploadedAt: row.uploaded_at || "",
    dataUrl: row.data_url || ""
  };
}

function attachmentFromContentFileRow(row) {
  return {
    id: row.id,
    name: row.file_name || "",
    type: row.file_type || "",
    size: Number(row.file_size || 0),
    uploadedAt: row.created_at || "",
    url: `/api/files/${encodeURIComponent(row.id)}`
  };
}

function sanitizeAttachmentMeta(attachment) {
  if (!attachment) return null;
  return {
    id: String(attachment.id || crypto.randomUUID()),
    name: String(attachment.name || ""),
    type: String(attachment.type || "application/octet-stream"),
    size: Number(attachment.size || 0),
    uploadedAt: String(attachment.uploadedAt || new Date().toISOString()),
    url: attachment.url ? String(attachment.url) : undefined
  };
}

function attachmentToRow(attachment, contentId, position) {
  return {
    id: String(attachment?.id || crypto.randomUUID()),
    content_id: String(contentId || ""),
    name: String(attachment?.name || ""),
    type: String(attachment?.type || "application/octet-stream"),
    size: Number(attachment?.size || 0),
    uploaded_at: String(attachment?.uploadedAt || new Date().toISOString()),
    data_url: String(attachment?.dataUrl || ""),
    position: Number(position || 0),
    active: 1
  };
}

function userToRow(user) {
  const username = String(user?.username || "").trim();
  const safeEmail = String(user?.email || "").trim() || (username ? `${username}@krcs.com.br` : "");
  return {
    id: String(user?.id || ""),
    name: String(user?.name || ""),
    username,
    email: safeEmail,
    role: String(user?.role || "operador"),
    team: String(user?.team || ""),
    access_level_name: String(user?.accessLevel || user?.access_level_name || ""),
    permissions_json: JSON.stringify(Array.isArray(user?.permissions) ? user.permissions : safeParse(user?.permissions_json || "[]", [])),
    password: String(user?.password || ""),
    must_change_password: user?.mustChangePassword ? 1 : 0,
    active: user?.active === false ? 0 : 1
  };
}

function contentToRow(content) {
  return {
    id: String(content?.id || ""),
    title: String(content?.title || ""),
    category: String(content?.category || ""),
    type: String(content?.type || ""),
    summary: String(content?.summary || ""),
    tags_json: JSON.stringify(Array.isArray(content?.tags) ? content.tags : safeParse(content?.tags_json || "[]", [])),
    keywords_json: JSON.stringify(Array.isArray(content?.keywords) ? content.keywords : safeParse(content?.keywords_json || "[]", [])),
    body_json: JSON.stringify(Array.isArray(content?.body) ? content.body : safeParse(content?.body_json || "[]", [])),
    attachments_json: JSON.stringify((Array.isArray(content?.attachments) ? content.attachments : safeParse(content?.attachments_json || "[]", [])).map(sanitizeAttachmentMeta).filter(Boolean)),
    featured: content?.featured ? 1 : 0,
    urgent: content?.urgent ? 1 : 0,
    allow_copy: content?.allowCopy ? 1 : 0,
    access_count: Number(content?.accessCount || 0),
    helpful_yes: Number(content?.helpful?.yes || 0),
    helpful_no: Number(content?.helpful?.no || 0),
    active: content?.active === false ? 0 : 1,
    created_at: content?.createdAt || new Date().toISOString(),
    updated_at: content?.updatedAt || new Date().toISOString()
  };
}

async function ensureAppStateTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        json_state TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();
}

async function ensureAttachmentTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS content_attachments (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT '',
        size INTEGER NOT NULL DEFAULT 0,
        uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
        data_url TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();
}

async function ensureContentFilesTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS content_files (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL DEFAULT 0,
        r2_key TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();
}

async function ensureUserTrackingColumns(db) {
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN last_login_at TEXT").run();
  } catch (error) {
    const message = String(error?.message || error || "");
    if (!message.includes("duplicate column name")) {
      throw error;
    }
  }
}

async function ensureNotificationReadTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS content_notification_reads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        seen_at TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, content_id)
      )`
    )
    .run();
}

async function ensureContentViewReadTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS content_view_reads (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        username TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'operador',
        first_viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
        view_count INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(content_id, user_id)
      )`
    )
    .run();
}

async function ensureOperatorResultsTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS operator_results_daily (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
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
    )
    .run();
}

function buildOperatorResultRecord(entries, userId) {
  const validEntries = Array.isArray(entries) ? entries.filter((entry) => entry && entry.resultDate) : [];
  if (!validEntries.length) return null;
  validEntries.sort((a, b) => String(a.resultDate).localeCompare(String(b.resultDate)));
  const latest = validEntries[validEntries.length - 1];
  const productionAverage =
    validEntries.reduce((sum, entry) => sum + Number(entry.productionTotal || 0), 0) / validEntries.length;
  return {
    userId,
    entries: validEntries.map((entry) => ({
      date: entry.resultDate,
      productionTotal: Number(entry.productionTotal || 0),
      effectiveness: Number(entry.effectiveness || 0),
      qualityScore: Number(entry.qualityScore || 0),
      updatedById: String(entry.updatedById || ""),
      updatedByName: String(entry.updatedByName || ""),
      updatedAt: String(entry.updatedAt || "")
    })),
    daysCount: validEntries.length,
    productionTotal: Number(latest.productionTotal || 0),
    productionAverage: Number(productionAverage || 0),
    effectiveness: Number(latest.effectiveness || 0),
    qualityScore: Number(latest.qualityScore || 0),
    updatedAt: String(latest.updatedAt || ""),
    updatedById: String(latest.updatedById || ""),
    updatedByName: String(latest.updatedByName || "")
  };
}

async function hydrateOperatorResults(db, state) {
  await ensureOperatorResultsTable(db);
  const rows = await db
    .prepare("SELECT * FROM operator_results_daily ORDER BY result_date ASC, updated_at ASC")
    .all();
  const byUserId = new Map();
  for (const row of rows.results || []) {
    if (!row.user_id || !row.result_date) continue;
    const list = byUserId.get(row.user_id) || [];
    list.push({
      resultDate: row.result_date,
      productionTotal: Number(row.production_total || 0),
      effectiveness: Number(row.effectiveness || 0),
      qualityScore: Number(row.quality_score || 0),
      updatedById: row.updated_by_id || "",
      updatedByName: row.updated_by_name || "",
      updatedAt: row.updated_at || row.created_at || ""
    });
    byUserId.set(row.user_id, list);
  }

  state.meta = state.meta && typeof state.meta === "object" ? state.meta : {};
  const operatorResults = {};
  for (const [userId, entries] of byUserId.entries()) {
    const record = buildOperatorResultRecord(entries, userId);
    if (record) operatorResults[userId] = record;
  }
  state.meta.operatorResults = operatorResults;
  return state;
}

async function persistOperatorResults(db, state) {
  await ensureOperatorResultsTable(db);
  const source = state?.meta?.operatorResults && typeof state.meta.operatorResults === "object"
    ? state.meta.operatorResults
    : {};

  await db.prepare("DELETE FROM operator_results_daily").run();

  for (const [userId, record] of Object.entries(source)) {
    if (!userId) continue;
    const entries = Array.isArray(record?.entries) ? record.entries : [];
    for (const entry of entries) {
      const resultDate = String(entry?.date || "").trim();
      if (!resultDate) continue;
      await db
        .prepare(
          `INSERT INTO operator_results_daily (
            id, user_id, result_date, production_total, effectiveness, quality_score, updated_by_id, updated_by_name, updated_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(user_id, result_date) DO UPDATE SET
            production_total = excluded.production_total,
            effectiveness = excluded.effectiveness,
            quality_score = excluded.quality_score,
            updated_by_id = excluded.updated_by_id,
            updated_by_name = excluded.updated_by_name,
            updated_at = excluded.updated_at`
        )
        .bind(
          `${userId}__${resultDate}`,
          userId,
          resultDate,
          Number(entry?.productionTotal || 0),
          Number(entry?.effectiveness || 0),
          Number(entry?.qualityScore || 0),
          String(entry?.updatedById || record?.updatedById || ""),
          String(entry?.updatedByName || record?.updatedByName || ""),
          String(entry?.updatedAt || record?.updatedAt || new Date().toISOString())
        )
        .run();
    }
  }
}

async function hydrateContentViewStats(db, state) {
  await ensureContentViewReadTable(db);
  const rows = await db
    .prepare("SELECT * FROM content_view_reads ORDER BY updated_at DESC")
    .all();
  const byContent = new Map();
  for (const row of rows.results || []) {
    if (!row.content_id || !row.user_id) continue;
    const contentStats = byContent.get(row.content_id) || {};
    contentStats[row.user_id] = {
      userId: row.user_id,
      name: row.name || "",
      username: row.username || "",
      role: row.role || "operador",
      firstViewedAt: row.first_viewed_at || row.created_at || "",
      lastViewedAt: row.last_viewed_at || row.updated_at || "",
      count: Number(row.view_count || 1)
    };
    byContent.set(row.content_id, contentStats);
  }

  state.content = Array.isArray(state.content)
    ? state.content.map((item) => ({
        ...item,
        viewStats: byContent.get(item.id) || {}
      }))
    : [];
  return state;
}

async function hydrateNotificationReads(db, state) {
  await ensureNotificationReadTable(db);
  const rows = await db
    .prepare("SELECT * FROM content_notification_reads ORDER BY updated_at DESC")
    .all();
  const seenNotifications = {};
  const alertedUrgentNotifications = {};
  for (const row of rows.results || []) {
    if (!row.user_id || !row.content_id) continue;
    seenNotifications[row.user_id] = seenNotifications[row.user_id] || [];
    alertedUrgentNotifications[row.user_id] = alertedUrgentNotifications[row.user_id] || [];
    if (!seenNotifications[row.user_id].includes(row.content_id)) {
      seenNotifications[row.user_id].push(row.content_id);
    }
    if (!alertedUrgentNotifications[row.user_id].includes(row.content_id)) {
      alertedUrgentNotifications[row.user_id].push(row.content_id);
    }
  }
  state.meta = state.meta && typeof state.meta === "object" ? state.meta : {};
  state.meta.seenNotifications = seenNotifications;
  state.meta.alertedUrgentNotifications = alertedUrgentNotifications;
  return state;
}

async function hydrateAttachments(db, state) {
  await ensureContentFilesTable(db);
  const rows = await db
    .prepare("SELECT * FROM content_files ORDER BY created_at ASC")
    .all();
  const attachmentMap = new Map();
  for (const row of rows.results || []) {
    const list = attachmentMap.get(row.content_id) || [];
    list.push(attachmentFromContentFileRow(row));
    attachmentMap.set(row.content_id, list);
  }
  state.content = Array.isArray(state.content)
    ? state.content.map((item) => {
        const attachmentList = attachmentMap.get(item.id) || [];
        return {
          ...item,
          attachments: attachmentList.length ? attachmentList : Array.isArray(item.attachments) ? item.attachments : [],
          attachment: attachmentList[0] || item.attachment || null
        };
      })
    : [];
  return state;
}

async function buildStateFromTables(db) {
  const settingsRow = await db.prepare("SELECT * FROM app_settings WHERE id = 1").first();
  const userRows = await db.prepare("SELECT * FROM users WHERE active = 1 ORDER BY created_at").all();
  const contentRows = await db.prepare("SELECT * FROM content WHERE active = 1 ORDER BY updated_at DESC").all();

  const state = defaultState();
  state.companyName = settingsRow?.company_name || "KR Consulting & Services";
  state.helpCenter = safeParse(settingsRow?.help_center_json || "[]", []);
  state.users = (userRows.results || []).map(userFromRow);
  state.content = (contentRows.results || []).map(contentFromRow);
  await hydrateContentViewStats(db, state);
  await hydrateAttachments(db, state);
  await hydrateNotificationReads(db, state);
  return hydrateOperatorResults(db, state);
}

async function loadState(db) {
  await ensureAppStateTable(db);
  const row = await db.prepare("SELECT json_state FROM app_state WHERE id = 1").first();
  if (row?.json_state) {
    const parsed = safeParse(row.json_state, null);
      if (parsed && typeof parsed === "object") {
        const relationalState = await buildStateFromTables(db);
        const parsedContentMap = new Map(
          (Array.isArray(parsed.content) ? parsed.content : [])
            .filter((item) => item && item.id)
            .map((item) => [item.id, item])
        );
        const mergedContent = (Array.isArray(relationalState.content) ? relationalState.content : []).map((item) => {
          const parsedItem = parsedContentMap.get(item.id);
          const dbStats = item?.viewStats && typeof item.viewStats === "object" ? item.viewStats : {};
          const parsedStats = parsedItem?.viewStats && typeof parsedItem.viewStats === "object" ? parsedItem.viewStats : {};
          const nextViewStats = Object.keys(dbStats).length ? dbStats : parsedStats;
          return {
            ...item,
            viewStats: nextViewStats
          };
        });
        return hydrateAttachments(db, {
          ...parsed,
          meta: {
            ...(parsed.meta || {}),
            seenNotifications: relationalState.meta?.seenNotifications || {},
            alertedUrgentNotifications: relationalState.meta?.alertedUrgentNotifications || {},
            operatorResults: relationalState.meta?.operatorResults || {}
          },
          users: relationalState.users,
          content: mergedContent,
          companyName: relationalState.companyName,
          helpCenter: relationalState.helpCenter
        });
    }
  }

  const bootstrapState = await buildStateFromTables(db);
  await db
    .prepare(
      `INSERT INTO app_state (id, json_state, updated_at)
       VALUES (1, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET json_state = excluded.json_state, updated_at = datetime('now')`
    )
    .bind(JSON.stringify(bootstrapState))
    .run();
  return bootstrapState;
}

async function saveState(db, state) {
  await ensureAppStateTable(db);
  await persistOperatorResults(db, state);

  const persistedUsers = await resolveUsersForLogin(db);
  await db
      .prepare(
        `INSERT INTO app_state (id, json_state, updated_at)
         VALUES (1, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET json_state = excluded.json_state, updated_at = datetime('now')`
      )
      .bind(JSON.stringify({ ...state, users: persistedUsers }))
      .run();
}

async function resolveUsersForLogin(db) {
  await ensureUserTrackingColumns(db);
  const userRows = await db.prepare("SELECT * FROM users WHERE active = 1 ORDER BY created_at").all();
  return (userRows.results || []).map(userFromRow);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") {
        return jsonResponse({ ok: true }, 204);
      }

      if (url.pathname === "/api/health") {
        return jsonResponse({
          ok: true,
          service: "base-conhecimento",
          hasDB: Boolean(env.DB),
          hasR2: Boolean(env.r2base)
        });
      }

      if (url.pathname === "/api/debug-storage" && request.method === "GET") {
        let contentFilesCount = null;
        let legacyAttachmentsCount = null;
        let debugError = null;
        try {
          if (env.DB) {
            await ensureContentFilesTable(env.DB);
            const contentFiles = await env.DB.prepare("SELECT COUNT(*) AS total FROM content_files").first();
            const legacyAttachments = await env.DB.prepare("SELECT COUNT(*) AS total FROM content_attachments").first();
            contentFilesCount = Number(contentFiles?.total || 0);
            legacyAttachmentsCount = Number(legacyAttachments?.total || 0);
          }
        } catch (error) {
          debugError = String(error?.message || error || "");
        }

        return jsonResponse({
          ok: true,
          worker: "new-r2-flow",
          version: "2026-04-16-r2-debug-2",
          hasDB: Boolean(env.DB),
          hasR2: Boolean(env.r2base),
          r2BindingName: "r2base",
          envKeys: Object.keys(env || {}),
          contentFilesCount,
          legacyAttachmentsCount,
          debugError
        });
      }

      if (!env.DB) {
        return jsonResponse({ ok: false, error: "D1 binding DB nao configurado." }, 500);
      }

        try {
          if (url.pathname === "/api/state" && request.method === "GET") {
            const state = await loadState(env.DB);
            return jsonResponse({ ok: true, state });
          }

        if (url.pathname === "/api/state" && (request.method === "PUT" || request.method === "POST")) {
          const body = await request.json();
          if (!body || typeof body.state !== "object") {
            return jsonResponse({ ok: false, error: "Payload invalido." }, 400);
          }
          const state = body.state.app === "knowledge-base" ? body.state : { ...defaultState(), ...body.state, app: "knowledge-base" };
          await saveState(env.DB, state);
          return jsonResponse({ ok: true });
        }

        if (url.pathname === "/api/users" && request.method === "GET") {
          const users = await resolveUsersForLogin(env.DB);
          return jsonResponse({ ok: true, users });
        }

        if (url.pathname === "/api/users" && request.method === "POST") {
          const body = await request.json();
          const row = userToRow(body || {});
          if (!row.id || !row.name || !row.username) {
            return jsonResponse({ ok: false, error: "Dados do usuario invalidos." }, 400);
          }

          try {
            const normalizedUsername = String(row.username || "").trim().toLowerCase();
            const existingByUsername = await env.DB
              .prepare("SELECT id FROM users WHERE lower(trim(username)) = ? LIMIT 1")
              .bind(normalizedUsername)
              .first();
            const targetId = String(existingByUsername?.id || row.id);
            await env.DB
              .prepare(
                `INSERT INTO users (
                  id, name, username, email, role, team, access_level_name, permissions_json, password, must_change_password, active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  username = excluded.username,
                  email = excluded.email,
                  role = excluded.role,
                  team = excluded.team,
                  access_level_name = excluded.access_level_name,
                  permissions_json = excluded.permissions_json,
                  password = excluded.password,
                  must_change_password = excluded.must_change_password,
                  active = excluded.active,
                  updated_at = datetime('now')`
              )
              .bind(
                targetId,
                row.name,
                row.username,
                row.email,
                row.role,
                row.team,
                row.access_level_name,
                row.permissions_json,
                row.password,
                row.must_change_password,
                1
              )
              .run();
          } catch (error) {
            const message = String(error?.message || error || "");
            if (message.includes("users.username")) {
              return jsonResponse({ ok: false, error: "Ja existe um usuario com esse login." }, 409);
            }
            if (message.includes("users.email")) {
              return jsonResponse({ ok: false, error: "Nao foi possivel salvar: conflito interno de e-mail." }, 409);
            }
            throw error;
          }

           const users = await resolveUsersForLogin(env.DB);
           return jsonResponse({ ok: true, users });
          }

        if (url.pathname === "/api/content" && request.method === "POST") {
          const body = await request.json();
          const row = contentToRow(body || {});
          if (!row.id || !row.title) {
            return jsonResponse({ ok: false, error: "Dados do conteudo invalidos." }, 400);
          }

          await env.DB
            .prepare(
              `INSERT INTO content (
                id, title, category, type, summary, tags_json, keywords_json, body_json, attachments_json,
                featured, urgent, allow_copy, access_count, helpful_yes, helpful_no, active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                category = excluded.category,
                type = excluded.type,
                summary = excluded.summary,
                tags_json = excluded.tags_json,
                keywords_json = excluded.keywords_json,
                body_json = excluded.body_json,
                attachments_json = excluded.attachments_json,
                featured = excluded.featured,
                urgent = excluded.urgent,
                allow_copy = excluded.allow_copy,
                access_count = excluded.access_count,
                helpful_yes = excluded.helpful_yes,
                helpful_no = excluded.helpful_no,
                active = excluded.active,
                updated_at = datetime('now')`
            )
            .bind(
              row.id,
              row.title,
              row.category,
              row.type,
              row.summary,
              row.tags_json,
              row.keywords_json,
              row.body_json,
              row.attachments_json,
              row.featured,
              row.urgent,
              row.allow_copy,
              row.access_count,
              row.helpful_yes,
              row.helpful_no,
              row.active,
              row.created_at,
              row.updated_at
            )
            .run();

          return jsonResponse({ ok: true });
        }

        if (url.pathname === "/api/content/view" && request.method === "POST") {
          const body = await request.json();
          const contentId = String(body?.contentId || "").trim();
          const userId = String(body?.userId || "").trim();
          const name = String(body?.name || "").trim();
          const username = String(body?.username || "").trim();
          const role = String(body?.role || "operador").trim();
          const viewedAt = String(body?.viewedAt || new Date().toISOString());
          if (!contentId || !userId) {
            return jsonResponse({ ok: false, error: "Conteudo e usuario obrigatorios." }, 400);
          }

          await ensureContentViewReadTable(env.DB);
          await env.DB
            .prepare(
              `INSERT INTO content_view_reads (
                id, content_id, user_id, name, username, role, first_viewed_at, last_viewed_at, view_count, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
              ON CONFLICT(content_id, user_id) DO UPDATE SET
                name = excluded.name,
                username = excluded.username,
                role = excluded.role,
                last_viewed_at = excluded.last_viewed_at,
                view_count = content_view_reads.view_count + 1,
                updated_at = datetime('now')`
            )
            .bind(
              `${contentId}__${userId}`,
              contentId,
              userId,
              name,
              username,
              role,
              viewedAt,
              viewedAt
            )
            .run();

          return jsonResponse({ ok: true });
        }

        if (url.pathname === "/api/content/delete" && request.method === "POST") {
          const body = await request.json();
          const contentId = String(body?.contentId || "").trim();
          if (!contentId) {
            return jsonResponse({ ok: false, error: "Conteudo invalido." }, 400);
          }

            await env.DB.prepare("DELETE FROM content WHERE id = ?").bind(contentId).run();
            await ensureContentFilesTable(env.DB);
            const fileRows = await env.DB.prepare("SELECT id, r2_key FROM content_files WHERE content_id = ?").bind(contentId).all();
            for (const row of fileRows.results || []) {
              if (env.r2base && row.r2_key) {
                await env.r2base.delete(row.r2_key);
              }
            }
            await env.DB.prepare("DELETE FROM content_files WHERE content_id = ?").bind(contentId).run();
            await ensureContentViewReadTable(env.DB);
            await env.DB.prepare("DELETE FROM content_view_reads WHERE content_id = ?").bind(contentId).run();
            return jsonResponse({ ok: true });
          }

        if (url.pathname.startsWith("/api/files/") && request.method === "GET") {
          const fileId = decodeURIComponent(url.pathname.replace("/api/files/", "").trim());
          if (!fileId) {
            return jsonResponse({ ok: false, error: "Arquivo invalido." }, 400);
          }
          await ensureContentFilesTable(env.DB);
          const row = await env.DB.prepare("SELECT * FROM content_files WHERE id = ?").bind(fileId).first();
          if (!row) {
            return jsonResponse({ ok: false, error: "Arquivo nao encontrado." }, 404);
          }
          if (!env.r2base) {
            return jsonResponse({ ok: false, error: "Binding R2 nao configurado." }, 500);
          }
          const object = await env.r2base.get(row.r2_key);
          if (!object) {
            return jsonResponse({ ok: false, error: "Objeto nao encontrado no R2." }, 404);
          }
          const headers = new Headers();
          headers.set("content-type", row.file_type || "application/octet-stream");
          headers.set("content-disposition", `inline; filename="${encodeURIComponent(row.file_name || "arquivo")}"`);
          return new Response(object.body, { status: 200, headers });
        }

        if (url.pathname === "/api/attachments" && request.method === "POST") {
          const body = await request.json();
          const contentId = String(body?.contentId || "").trim();
          const attachments = Array.isArray(body?.attachments) ? body.attachments : [];
          if (!contentId) {
            return jsonResponse({ ok: false, error: "Conteudo invalido." }, 400);
          }
          if (!env.r2base) {
            return jsonResponse({ ok: false, error: "Binding R2 nao configurado." }, 500);
          }

          await ensureContentFilesTable(env.DB);
          const existingRows = await env.DB.prepare("SELECT id, r2_key FROM content_files WHERE content_id = ?").bind(contentId).all();
          for (const row of existingRows.results || []) {
            if (row.r2_key) {
              await env.r2base.delete(row.r2_key);
            }
          }
          await env.DB.prepare("DELETE FROM content_files WHERE content_id = ?").bind(contentId).run();

          const saved = [];
          for (let index = 0; index < attachments.length; index += 1) {
            const attachment = attachments[index];
            if (!attachment?.dataUrl) continue;
            const fileId = String(attachment.id || crypto.randomUUID());
            const mimeMatch = String(attachment.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
            if (!mimeMatch) continue;
            const fileType = String(attachment.type || mimeMatch[1] || "application/octet-stream");
            const base64 = mimeMatch[2] || "";
            const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
            const safeName = String(attachment.name || `arquivo-${index + 1}`).replace(/[^a-zA-Z0-9._-]/g, "_");
            const r2Key = `content/${contentId}/${fileId}-${safeName}`;
            await env.r2base.put(r2Key, bytes, {
              httpMetadata: {
                contentType: fileType
              }
            });
            await env.DB
              .prepare(
                `INSERT INTO content_files (
                  id, content_id, file_name, file_type, file_size, r2_key, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  content_id = excluded.content_id,
                  file_name = excluded.file_name,
                  file_type = excluded.file_type,
                  file_size = excluded.file_size,
                  r2_key = excluded.r2_key`
              )
              .bind(
                fileId,
                contentId,
                String(attachment.name || ""),
                fileType,
                Number(attachment.size || bytes.byteLength || 0),
                r2Key
              )
              .run();
            saved.push({
              id: fileId,
              name: String(attachment.name || ""),
              type: fileType,
              size: Number(attachment.size || bytes.byteLength || 0),
              uploadedAt: new Date().toISOString(),
              url: `/api/files/${encodeURIComponent(fileId)}`
            });
          }

          return jsonResponse({ ok: true, attachments: saved });
        }

        if (url.pathname === "/api/notifications/seen" && request.method === "POST") {
          const body = await request.json();
          const userId = String(body?.userId || "").trim();
          const contentId = String(body?.contentId || "").trim();
          if (!userId || !contentId) {
            return jsonResponse({ ok: false, error: "Usuario e conteudo obrigatorios." }, 400);
          }

          await ensureNotificationReadTable(env.DB);
          await env.DB
            .prepare(
              `INSERT INTO content_notification_reads (
                id, user_id, content_id, seen_at, created_at, updated_at
              ) VALUES (?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
              ON CONFLICT(user_id, content_id) DO UPDATE SET
                seen_at = datetime('now'),
                updated_at = datetime('now')`
            )
            .bind(`${userId}__${contentId}`, userId, contentId)
            .run();

          return jsonResponse({ ok: true });
        }

        if (url.pathname === "/api/login" && request.method === "POST") {
          const body = await request.json();
          const username = String(body?.username || body?.email || "").trim().toLowerCase();
          const password = String(body?.password || "");
          if (!username || !password) {
            return jsonResponse({ ok: false, error: "Usuario e senha obrigatorios." }, 400);
          }

          const users = await resolveUsersForLogin(env.DB);
          const user = users.find((item) => String(item.username || "").trim().toLowerCase() === username || String(item.email || "").trim().toLowerCase() === username);
          if (!user || String(user.password || "") !== password) {
            return jsonResponse({ ok: false, error: "Usuario ou senha invalidos." }, 401);
          }

          const nowIso = new Date().toISOString();
          await env.DB
            .prepare(
              `UPDATE users
               SET last_login_at = ?, updated_at = datetime('now')
               WHERE id = ?`
            )
            .bind(nowIso, user.id)
            .run();

          return jsonResponse({
            ok: true,
            user: {
              id: user.id,
              name: user.name,
              username: user.username,
              role: user.role,
              accessLevel: user.accessLevel,
              lastLoginAt: nowIso,
              mustChangePassword: Boolean(user.mustChangePassword)
            }
          });
        }

      if (url.pathname === "/api/users/password" && request.method === "POST") {
          const body = await request.json();
          const userId = String(body?.userId || "").trim();
          const newPassword = String(body?.newPassword || "").trim();
          if (!userId || !newPassword) {
            return jsonResponse({ ok: false, error: "Usuario e nova senha obrigatorios." }, 400);
          }

          await env.DB
            .prepare(
              `UPDATE users
               SET password = ?, must_change_password = 0, updated_at = datetime('now')
               WHERE id = ?`
            )
            .bind(newPassword, userId)
            .run();

          return jsonResponse({ ok: true });
        }

        return jsonResponse({ ok: false, error: "Rota nao encontrada." }, 404);
      } catch (error) {
        return jsonResponse(
          { ok: false, error: "Falha interna na API.", detail: String(error?.message || error) },
          500
        );
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  }
};
