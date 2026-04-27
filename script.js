const SESSION_KEY = "operator-results-session-v1";
const THEME_KEY = "operator-results-theme-v1";
const DEFAULT_THEME = "dark";
const REMOTE_API_BASE = "/api";
const DEFAULT_MAINTENANCE_MESSAGE = "O portal esta temporariamente em manutencao. Tente novamente em alguns minutos.";

const ACCESS_LEVELS = {
  gestor: { label: "Gestor", canManage: true },
  operador: { label: "Operador", canManage: false }
};

const IMPORT_METRICS = {
  production: { label: "Producao", templateColumns: ["Producao"] },
  effectiveness: {
    label: "Efetividade",
    templateColumns: ["Aprovadas", "Reprovadas", "Sem Acao"]
  },
  quality: { label: "Qualidade", templateColumns: ["Qualidade"] }
};

const IMPORT_METRIC_ORDER = ["production", "effectiveness", "quality"];

const state = {
  section: "dashboard",
  theme: DEFAULT_THEME,
  session: null,
  myRecord: null,
  operators: [],
  adminSelectedUserId: "",
  overviewSelectedUserId: "all",
  adminSelectedRecord: null,
  operationRecords: [],
  importInProgress: false,
  systemMaintenance: {
    enabled: false,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: "",
    updatedByName: ""
  },
  analytics: {
    attendantQuery: "",
    selectedAttendantId: "all",
    selectedDates: [],
    recordKey: ""
  }
};

let chartIdSeed = 0;

const elements = {
  body: document.body,
  loginScreen: document.querySelector("#login-screen"),
  maintenanceScreen: document.querySelector("#maintenance-screen"),
  maintenanceCopy: document.querySelector("#maintenance-copy"),
  maintenanceLogoutButton: document.querySelector("#maintenance-logout-button"),
  loginForm: document.querySelector("#login-form"),
  loginUsername: document.querySelector("#login-username"),
  loginPassword: document.querySelector("#login-password"),
  loginError: document.querySelector("#login-error"),
  appShell: document.querySelector("#app-shell"),
  heroHeader: document.querySelector(".hero-header"),
  bootLoader: document.querySelector("#boot-loader"),
  navLinks: Array.from(document.querySelectorAll(".nav-link")),
  adminNavLink: document.querySelector("#admin-nav-link"),
  refreshButton: document.querySelector("#refresh-button"),
  globalOperatorFilter: document.querySelector("#global-operator-filter"),
  globalOperatorSelect: document.querySelector("#global-operator-select"),
  themeToggle: document.querySelector("#theme-toggle"),
  profileTrigger: document.querySelector("#profile-trigger"),
  profileDropdown: document.querySelector("#profile-dropdown"),
  logoutButton: document.querySelector("#logout-button"),
  sessionName: document.querySelector("#session-name"),
  sessionRole: document.querySelector("#session-role"),
  sessionNameMenu: document.querySelector("#session-name-menu"),
  sessionRoleMenu: document.querySelector("#session-role-menu"),
  profileAvatar: document.querySelector("#profile-avatar"),
  heroGrid: document.querySelector(".portal-hero-grid"),
  heroTitle: document.querySelector("#hero-title"),
  heroDescription: document.querySelector("#hero-description"),
  latestUpdateTitle: document.querySelector("#latest-update-title"),
  latestUpdateCopy: document.querySelector("#latest-update-copy"),
  heroStats: document.querySelector("#hero-stats"),
  dashboardMetrics: document.querySelector("#dashboard-metrics"),
  latestResultCard: document.querySelector("#latest-result-card"),
  dashboardNote: document.querySelector("#dashboard-note"),
  resultMetrics: document.querySelector("#result-metrics"),
  resultSummary: document.querySelector("#result-summary"),
  dashboardTrendChart: document.querySelector("#dashboard-trend-chart"),
  dashboardIllustratedCards: document.querySelector("#dashboard-illustrated-cards"),
  myResultsChart: document.querySelector("#my-results-chart"),
  myResultsIllustrated: document.querySelector("#my-results-illustrated"),
  analyticsAttendantSearch: document.querySelector("#analytics-attendant-search"),
  analyticsAttendantList: document.querySelector("#analytics-attendant-list"),
  analyticsDateList: document.querySelector("#analytics-date-list"),
  analyticsClearFilters: document.querySelector("#analytics-clear-filters"),
  analyticsKpiRow: document.querySelector("#analytics-kpi-row"),
  analyticsGauges: document.querySelector("#analytics-gauges"),
  analyticsConsistency: document.querySelector("#analytics-consistency"),
  analyticsPerformanceBands: document.querySelector("#analytics-performance-bands"),
  analyticsDailyBars: document.querySelector("#analytics-daily-bars"),
  analyticsTagsBars: document.querySelector("#analytics-tags-bars"),
  analyticsDepartments: document.querySelector("#analytics-departments"),
  analyticsTopDays: document.querySelector("#analytics-top-days"),
  analyticsWorkdays: document.querySelector("#analytics-workdays"),
  historyTableWrapper: document.querySelector("#history-table-wrapper"),
  historyDeleteAll: document.querySelector("#history-delete-all"),
  adminForm: document.querySelector("#admin-form"),
  adminUser: document.querySelector("#admin-user"),
  adminDate: document.querySelector("#admin-date"),
  adminOperation: document.querySelector("#admin-operation"),
  adminApproved: document.querySelector("#admin-approved"),
  adminReproved: document.querySelector("#admin-reproved"),
  adminPending: document.querySelector("#admin-pending"),
  adminPendingWrap: document.querySelector("#admin-pending-wrap"),
  adminNoAction: document.querySelector("#admin-no-action"),
  adminProduction: document.querySelector("#admin-production"),
  adminEffectiveness: document.querySelector("#admin-effectiveness"),
  adminQuality: document.querySelector("#admin-quality"),
  adminUploadForm: document.querySelector("#admin-upload-form"),
  uploadModeOptions: document.querySelector("#upload-mode-options"),
  uploadModeInputs: Array.from(document.querySelectorAll('input[name="upload-mode"]')),
  uploadOperation: document.querySelector("#upload-operation"),
  uploadFile: document.querySelector("#upload-file"),
  uploadHelpText: document.querySelector("#upload-help-text"),
  uploadStatus: document.querySelector("#upload-status"),
  importUpload: document.querySelector("#import-upload"),
  downloadTemplate: document.querySelector("#download-template"),
  removeUpload: document.querySelector("#remove-upload"),
  systemMaintenancePanel: document.querySelector("#system-maintenance-panel"),
  maintenanceStatusText: document.querySelector("#maintenance-status-text"),
  maintenanceToggleButton: document.querySelector("#maintenance-toggle-button"),
  adminHistoryWrapper: document.querySelector("#admin-history-wrapper"),
  sections: Array.from(document.querySelectorAll(".content-section"))
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  state.theme = loadTheme();
  applyTheme(state.theme);
  state.session = loadSession();
  bindEvents();
  updateUploadModeHelp();
  syncAdminCalculatedMetrics();
  syncAuthView();

  if (hasSsoTokenInUrl()) {
    try {
      await trySsoAutoLogin();
    } catch (error) {
      handleLogout({ silent: true });
      showLoginError(error?.message || "SSO invalido. Faca login normalmente.");
    }
  } else if (state.session) {
    try {
      await hydratePortal();
    } catch (error) {
      handleLogout({ silent: true });
      showLoginError(error?.message || "Nao foi possivel carregar o portal.");
    }
  }

  elements.body.classList.remove("booting");
}

function bindEvents() {
  elements.loginForm?.addEventListener("submit", handleLogin);
  elements.refreshButton?.addEventListener("click", () => void hydratePortal({ preserveSection: true }));
  elements.themeToggle?.addEventListener("click", handleThemeToggle);
  elements.profileTrigger?.addEventListener("click", toggleProfileMenu);
  elements.logoutButton?.addEventListener("click", () => handleLogout());
  elements.maintenanceLogoutButton?.addEventListener("click", () => handleLogout());
  elements.navLinks.forEach((button) => {
    button.addEventListener("click", () => setSection(button.dataset.section || "dashboard"));
  });
  elements.adminForm?.addEventListener("submit", handleAdminSave);
  elements.adminOperation?.addEventListener("change", syncAdminCalculatedMetrics);
  elements.adminApproved?.addEventListener("input", syncAdminCalculatedMetrics);
  elements.adminReproved?.addEventListener("input", syncAdminCalculatedMetrics);
  elements.adminPending?.addEventListener("input", syncAdminCalculatedMetrics);
  elements.adminNoAction?.addEventListener("input", syncAdminCalculatedMetrics);
  elements.adminUser?.addEventListener("change", () => {
    state.adminSelectedUserId = String(elements.adminUser.value || "");
    if (state.overviewSelectedUserId !== "all") {
      state.overviewSelectedUserId = state.adminSelectedUserId;
    }
    hydrateAdminFormFromRecord();
    void loadAdminSelectedRecord();
    syncGlobalOperatorSelect();
  });
  elements.globalOperatorSelect?.addEventListener("change", () => {
    state.overviewSelectedUserId = String(elements.globalOperatorSelect.value || "all");
    if (state.overviewSelectedUserId !== "all") {
      state.adminSelectedUserId = state.overviewSelectedUserId;
      syncAdminOperatorSelect();
      hydrateAdminFormFromRecord();
      void loadAdminSelectedRecord();
    } else {
      renderAll();
    }
  });
  elements.adminHistoryWrapper?.addEventListener("click", (event) => void handleAdminHistoryClick(event));
  elements.historyTableWrapper?.addEventListener("click", (event) => void handleHistoryTableClick(event));
  elements.adminUploadForm?.addEventListener("submit", (event) => event.preventDefault());
  elements.uploadModeOptions?.addEventListener("change", updateUploadModeHelp);
  elements.uploadOperation?.addEventListener("change", updateUploadModeHelp);
  elements.importUpload?.addEventListener("click", () => void handleSpreadsheetUpload());
  elements.downloadTemplate?.addEventListener("click", handleDownloadTemplate);
  elements.removeUpload?.addEventListener("click", () => void handleSpreadsheetRemoval());
  elements.analyticsClearFilters?.addEventListener("click", handleAnalyticsClearFilters);
  elements.analyticsAttendantSearch?.addEventListener("input", handleAnalyticsAttendantSearchInput);
  elements.analyticsDateList?.addEventListener("change", handleAnalyticsDateChange);
  elements.analyticsAttendantList?.addEventListener("change", handleAnalyticsAttendantChange);
  elements.historyDeleteAll?.addEventListener("click", () => void handleDeleteAllResults());
  elements.maintenanceToggleButton?.addEventListener("click", () => void handleMaintenanceToggle());
  document.addEventListener("click", handleDocumentClick);
}

function hasSsoTokenInUrl() {
  try {
    const url = new URL(window.location.href);
    return Boolean(url.searchParams.get("sso") || url.searchParams.get("token"));
  } catch {
    return false;
  }
}

async function trySsoAutoLogin() {
  const url = new URL(window.location.href);
  const token = String(url.searchParams.get("sso") || url.searchParams.get("token") || "").trim();
  if (!token) return false;

  setBusy(true);
  clearLoginError();
  try {
    const payload = await fetchJson(`${REMOTE_API_BASE}/sso/consume`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token })
    });

    state.session = {
      id: payload.user.id,
      name: payload.user.name,
      username: payload.user.username,
      role: payload.user.role || "operador",
      accessLevel: payload.user.accessLevel || "",
      theme: state.theme,
      loginAt: new Date().toISOString()
    };
    saveSession(state.session);
    removeSsoParamsFromUrl();
    await hydratePortal();
    setSection("dashboard");
    return true;
  } catch (error) {
    removeSsoParamsFromUrl();
    throw new Error(error?.message || "Token SSO invalido ou expirado.");
  } finally {
    setBusy(false);
  }
}

function removeSsoParamsFromUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("sso");
    url.searchParams.delete("token");
    const clean = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", clean || "/");
  } catch {}
}

async function handleLogin(event) {
  event.preventDefault();
  const username = String(elements.loginUsername.value || "").trim();
  const password = String(elements.loginPassword.value || "");
  if (!username || !password) {
    showLoginError("Preencha usuario e senha.");
    return;
  }

  setBusy(true);
  clearLoginError();

  try {
    const payload = await fetchJson(`${REMOTE_API_BASE}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    state.session = {
      id: payload.user.id,
      name: payload.user.name,
      username: payload.user.username,
      role: payload.user.role || "operador",
      accessLevel: payload.user.accessLevel || "",
      theme: state.theme,
      loginAt: new Date().toISOString()
    };
    saveSession(state.session);
    elements.loginForm.reset();
    await hydratePortal();
    setSection("dashboard");
  } catch (error) {
    showLoginError(error?.message || "Nao foi possivel autenticar.");
  } finally {
    setBusy(false);
  }
}

function handleLogout(options = {}) {
  state.session = null;
  state.myRecord = null;
  state.operators = [];
  state.adminSelectedUserId = "";
  state.adminSelectedRecord = null;
  state.systemMaintenance = {
    enabled: false,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: "",
    updatedByName: ""
  };
  saveSession(null);
  elements.loginForm?.reset();
  clearLoginError();
  closeProfileMenu();
  syncAuthView();
  renderAll();
  if (!options.silent) setSection("dashboard");
}

async function hydratePortal(options = {}) {
  if (!state.session?.id) return;
  setBusy(true);
  syncAuthView();

  try {
    await loadSystemMaintenanceStatus();
    if (state.systemMaintenance.enabled && !canManage()) {
      syncAuthView();
      if (!options.preserveSection) setSection("dashboard");
      return;
    }

    await loadMyResults();
    if (canManage()) {
      await loadOperators();
      await loadOperationRecords();
      await loadAdminSelectedRecord();
    } else {
      state.operators = [];
      state.operationRecords = [];
      state.adminSelectedUserId = "";
      state.adminSelectedRecord = null;
    }
    syncAuthView();
    renderAll();
    if (!options.preserveSection) setSection(state.section || "dashboard");
  } finally {
    setBusy(false);
  }
}

async function loadSystemMaintenanceStatus() {
  const payload = await fetchJson(`${REMOTE_API_BASE}/system-status`);
  state.systemMaintenance = normalizeSystemMaintenanceStatus(payload?.status || payload || {});
}

function normalizeSystemMaintenanceStatus(status) {
  const enabled = Boolean(status?.enabled);
  const message = String(status?.message || DEFAULT_MAINTENANCE_MESSAGE).trim() || DEFAULT_MAINTENANCE_MESSAGE;
  const updatedAt = String(status?.updatedAt || "").trim();
  const updatedByName = String(status?.updatedByName || "").trim();
  return { enabled, message, updatedAt, updatedByName };
}

async function loadOperationRecords() {
  if (!canManage()) {
    state.operationRecords = [];
    return;
  }
  const payload = await fetchJson(`${REMOTE_API_BASE}/results/all`);
  const records = Array.isArray(payload?.records) ? payload.records : [];
  state.operationRecords = records.map((record) => normalizeRecord(record)).filter(Boolean);
}

async function loadMyResults() {
  const payload = await fetchJson(`${REMOTE_API_BASE}/results?userId=${encodeURIComponent(state.session.id)}`);
  state.myRecord = normalizeRecord(payload.record);
}

async function loadOperators() {
  const payload = await fetchJson(`${REMOTE_API_BASE}/operators`);
  state.operators = (Array.isArray(payload.operators) ? payload.operators : [])
    .map(normalizeOperatorIdentity)
    .filter((user) => user && user.id)
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "pt-BR"));

  if (!state.adminSelectedUserId || !state.operators.some((user) => user.id === state.adminSelectedUserId)) {
    state.adminSelectedUserId = state.operators[0]?.id || "";
  }
  if (
    state.overviewSelectedUserId !== "all" &&
    !state.operators.some((user) => user.id === state.overviewSelectedUserId)
  ) {
    state.overviewSelectedUserId = state.adminSelectedUserId || "all";
  }
  if (!state.overviewSelectedUserId) state.overviewSelectedUserId = "all";

  renderOperatorSelect();
  hydrateAdminFormFromRecord();
}

function normalizeOperatorIdentity(operator) {
  const source = operator || {};
  const nuvidioUsername = String(
    source?.nuvidioUsername ??
    source?.usuarioNuvidio ??
    source?.usernameNuvidio ??
    source?.nuvidio_user ??
    source?.nuvidio_login ??
    source?.usuario_nuvidio ??
    ""
  ).trim();
  const line0800Username = String(
    source?.line0800Username ??
    source?.usuario0800 ??
    source?.username0800 ??
    source?.["0800Username"] ??
    source?.["0800_user"] ??
    source?.["0800_login"] ??
    source?.usuario_0800 ??
    ""
  ).trim();
  return {
    ...source,
    id: String(source?.id || "").trim(),
    name: String(source?.name || "").trim(),
    username: String(source?.username || "").trim(),
    nuvidioUsername,
    line0800Username
  };
}

async function loadAdminSelectedRecord() {
  if (!canManage() || !state.adminSelectedUserId) {
    state.adminSelectedRecord = null;
    renderAll();
    return;
  }

  const payload = await fetchJson(`${REMOTE_API_BASE}/results?userId=${encodeURIComponent(state.adminSelectedUserId)}`);
  state.adminSelectedRecord = normalizeRecord(payload.record);
  hydrateAdminFormFromRecord();
  renderAll();
}

async function handleAdminSave(event) {
  event.preventDefault();
  if (!canManage()) return;

  const userId = String(elements.adminUser.value || "").trim();
  const selectedUser = state.operators.find((user) => user.id === userId);
  const date = normalizeDateKey(elements.adminDate.value);
  const operation = normalizeOperationType(elements.adminOperation?.value || "nuvidio");
  const approved = parseMetricInput(elements.adminApproved?.value);
  const reproved = parseMetricInput(elements.adminReproved?.value);
  const pending = parseMetricInput(elements.adminPending?.value);
  const noAction = parseMetricInput(elements.adminNoAction?.value);
  const qualityScore = parseMetricInput(elements.adminQuality.value);
  const hasRequiredCounts =
    Number.isFinite(approved) &&
    Number.isFinite(reproved) &&
    Number.isFinite(noAction) &&
    (operation === "0800" ? Number.isFinite(pending) : true);

  const calculated = hasRequiredCounts
    ? calculateDailyTotalsByOperation({
      operation,
      approved,
      reproved,
      pending: Number.isFinite(pending) ? pending : 0,
      noAction
    })
    : null;
  const productionTotal = calculated?.total ?? null;
  const effectiveness = calculated?.effectiveness ?? null;

  if (!selectedUser || !date || !Number.isFinite(productionTotal) || !Number.isFinite(effectiveness) || !Number.isFinite(qualityScore)) {
    window.alert("Preencha operador, data, aprovadas, reprovadas, sem acao (e pendenciadas para 0800) e qualidade com valores validos.");
    return;
  }

  setBusy(true);
  try {
    await fetchJson(`${REMOTE_API_BASE}/operator-results`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId,
        userName: selectedUser.name || "",
        username: selectedUser.username || "",
        date,
        productionTotal,
        effectiveness,
        qualityScore,
        updatedById: state.session?.id || "",
        updatedByName: state.session?.name || "Gestor"
      })
    });
    if (canManage()) await loadOperationRecords();
    await loadAdminSelectedRecord();
    if (state.session?.id === userId) await loadMyResults();
    renderAll();
    window.alert("Resultado salvo com sucesso.");
  } catch (error) {
    window.alert(error?.message || "Nao foi possivel salvar o resultado.");
  } finally {
    setBusy(false);
  }
}

async function handleSpreadsheetUpload() {
  if (!canManage()) return;
  if (state.importInProgress) {
    window.alert("Ja existe uma importacao em andamento. Aguarde a conclusao para enviar outra planilha.");
    return;
  }
  const file = elements.uploadFile?.files?.[0];
  if (!file) {
    window.alert("Selecione uma planilha para importar.");
    return;
  }
  if (!window.XLSX) {
    window.alert("Biblioteca de planilha indisponivel no momento.");
    return;
  }
  const importMetrics = getSelectedImportMetrics();
  const importModeLabel = getImportMetricsLabel(importMetrics);

  state.importInProgress = true;
  if (elements.uploadFile) elements.uploadFile.disabled = true;
  if (elements.importUpload) elements.importUpload.disabled = true;
  if (elements.removeUpload) elements.removeUpload.disabled = true;
  setUploadStatus("Importando planilha em segundo plano. Voce pode continuar navegando no portal.", "loading");

  try {
    const {
      importItems,
      totalRows,
      unmatchedOperatorCount,
      invalidMetricCount,
      invalidDateCount,
      complementedRowsCount,
      buffer
    } = await parseSpreadsheetImportFile(file, {
      importMetrics,
      importOperation: getSelectedImportOperation()
    });
    let updatedCount = 0;

    if (!importItems.length) {
      throw new Error(
        `Nenhuma linha valida foi encontrada.\n` +
        `Sem operador correspondente: ${unmatchedOperatorCount}\n` +
        `Com data invalida: ${invalidDateCount}\n` +
        `Com metrica invalida: ${invalidMetricCount}`
      );
    }

    const fileBase64 = arrayBufferToBase64(buffer);
    const bulkResult = await fetchJson(`${REMOTE_API_BASE}/import/upload-and-process`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: file.name || "import.xlsx",
        mimeType: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileBase64,
        items: importItems
      }),
      timeoutMs: 120000
    });
    updatedCount = Number(bulkResult?.imported || 0);
    const bulkFailed = Number(bulkResult?.failed || 0);
    if (!updatedCount) {
      throw new Error(
        `Nenhuma linha foi gravada no servidor.\n` +
        `Falhas no lote: ${bulkFailed}`
      );
    }

    if (canManage()) await loadOperationRecords();
    await loadAdminSelectedRecord();
    if (state.session?.id) await loadMyResults();
    renderAll();
    setUploadStatus(`Importacao (${importModeLabel}) concluida: ${updatedCount} linha(s) gravada(s).`, "success");
    window.alert(
      `Carga concluida (${importModeLabel}).\n` +
      `- Linhas lidas: ${totalRows}\n` +
      `- Importadas: ${updatedCount}\n` +
      `- Sem operador correspondente: ${unmatchedOperatorCount}\n` +
      `- Ignoradas por data invalida: ${invalidDateCount}\n` +
      `- Ignoradas por metrica invalida: ${invalidMetricCount}\n` +
      `- Linhas complementadas com valores existentes/zero: ${complementedRowsCount}\n` +
      `- Falhas no servidor: ${bulkFailed}`
    );
  } catch (error) {
    setUploadStatus(error?.message || "Falha ao processar a planilha.", "error");
    window.alert(error?.message || "Nao foi possivel processar a planilha.");
  } finally {
    state.importInProgress = false;
    if (elements.uploadFile) elements.uploadFile.disabled = false;
    if (elements.importUpload) elements.importUpload.disabled = false;
    if (elements.removeUpload) elements.removeUpload.disabled = false;
    window.setTimeout(() => {
      if (!state.importInProgress) setUploadStatus("");
    }, 8000);
  }
}

async function handleSpreadsheetRemoval() {
  if (!canManage()) return;
  if (state.importInProgress) {
    window.alert("Ja existe uma operacao de planilha em andamento. Aguarde para remover.");
    return;
  }

  const file = elements.uploadFile?.files?.[0];
  if (!file) {
    window.alert("Selecione a planilha no campo acima para remover a carga correspondente.");
    return;
  }
  if (!window.XLSX) {
    window.alert("Biblioteca de planilha indisponivel no momento.");
    return;
  }

  const confirmed = window.confirm("Deseja remover os lancamentos desta planilha? A exclusao sera feita por Operador + Data.");
  if (!confirmed) return;

  state.importInProgress = true;
  if (elements.uploadFile) elements.uploadFile.disabled = true;
  if (elements.importUpload) elements.importUpload.disabled = true;
  if (elements.removeUpload) elements.removeUpload.disabled = true;
  setUploadStatus("Removendo carga da planilha. Voce pode continuar navegando.", "loading");

  try {
    const {
      importItems,
      totalRows,
      unmatchedOperatorCount,
      invalidDateCount
    } = await parseSpreadsheetImportFile(file, { forRemoval: true });

    if (!importItems.length) {
      throw new Error(
        `Nenhuma linha valida foi encontrada para remocao.\n` +
        `Sem operador correspondente: ${unmatchedOperatorCount}\n` +
        `Com data invalida: ${invalidDateCount}`
      );
    }

    const result = await fetchJson(`${REMOTE_API_BASE}/import/remove-by-sheet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: importItems }),
      timeoutMs: 120000
    });

    const removed = Number(result?.removed || 0);
    const failed = Number(result?.failed || 0);
    if (!removed) {
      throw new Error(`Nenhum lancamento foi removido.\nFalhas: ${failed}`);
    }

    if (canManage()) await loadOperationRecords();
    await loadAdminSelectedRecord();
    if (state.session?.id) await loadMyResults();
    renderAll();
    setUploadStatus(`Remocao concluida: ${removed} lancamento(s) removido(s).`, "success");
    window.alert(
      `Remocao concluida.\n` +
      `- Linhas lidas: ${totalRows}\n` +
      `- Removidas: ${removed}\n` +
      `- Sem operador correspondente: ${unmatchedOperatorCount}\n` +
      `- Ignoradas por data invalida: ${invalidDateCount}\n` +
      `- Falhas no servidor: ${failed}`
    );
  } catch (error) {
    setUploadStatus(error?.message || "Falha ao remover carga da planilha.", "error");
    window.alert(error?.message || "Nao foi possivel remover a carga por planilha.");
  } finally {
    state.importInProgress = false;
    if (elements.uploadFile) elements.uploadFile.disabled = false;
    if (elements.importUpload) elements.importUpload.disabled = false;
    if (elements.removeUpload) elements.removeUpload.disabled = false;
    window.setTimeout(() => {
      if (!state.importInProgress) setUploadStatus("");
    }, 8000);
  }
}

async function parseSpreadsheetImportFile(file, options = {}) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, blankrows: false });
  if (!rows.length) throw new Error("Planilha vazia.");

  const header = rows[0].map((item) => normalizeLooseText(item));
  const idxName = findColumnIndex(header, ["nome do operador", "nome operador", "nome"]);
  const idxUsername = findColumnIndex(header, ["usuario", "login", "username", "matricula"]);
  const idxNuvidioUsername = findColumnIndex(header, ["usuario nuvidio", "username nuvidio", "login nuvidio", "nuvidio"]);
  const idx0800Username = findColumnIndex(header, ["usuario 0800", "username 0800", "login 0800", "0800"]);
  const idxDate = findColumnIndex(header, ["data", "dia", "resultado", "data resultado", "dt"]);
  const idxOperation = findColumnIndex(header, ["operacao", "operacao/canal", "canal", "fila"]);
  const idxApproved = findColumnIndex(header, ["aprovadas", "aprovado", "aprovados"]);
  const idxReproved = findColumnIndex(header, ["reprovadas", "reprovado", "reprovados"]);
  const idxPending = findColumnIndex(header, ["pendenciadas", "pendenciados", "pendencias", "pendente"]);
  const idxNoAction = findColumnIndex(header, ["sem acao", "sem ação", "sem_acao", "semacao"]);
  const idxEffectiveness = findColumnIndex(header, ["efetividade", "conversao", "tx efetividade"]);
  const idxProduction = findColumnIndex(header, ["producao", "producao total", "volume", "qtde"]);
  const idxQuality = findColumnIndex(header, ["qualidade", "nota de qualidade", "nota qualidade", "quality"]);
  const selectedMetrics = getSelectedImportMetrics(options.importMetrics);
  const selectedOperation = normalizeOperationType(options.importOperation || getSelectedImportOperation());

  if (idxName < 0 && idxUsername < 0 && idxNuvidioUsername < 0 && idx0800Username < 0) {
    throw new Error("A planilha precisa ter Nome do Operador, Usuario/Login, Usuario Nuvidio ou Usuario 0800.");
  }
  if (idxDate < 0) {
    throw new Error("A planilha precisa ter a coluna Data para importar intervalo de dias.");
  }
  if (!options.forRemoval) {
    if (!selectedMetrics.size) {
      throw new Error("Selecione pelo menos uma metrica para importar.");
    }
    if (selectedMetrics.has("production") && idxProduction < 0) {
      if (idxApproved < 0 || idxReproved < 0 || idxNoAction < 0) {
        throw new Error("Voce marcou Producao. Envie Producao ou as colunas Aprovadas, Reprovadas e Sem Acao.");
      }
      if (idxOperation < 0 && selectedOperation === "0800" && idxPending < 0) {
        throw new Error("Para operacao 0800, a planilha precisa ter Pendenciadas quando Producao for calculada.");
      }
    }
    if (selectedMetrics.has("effectiveness") && idxEffectiveness < 0 && (idxApproved < 0 || idxReproved < 0 || idxNoAction < 0)) {
      throw new Error("Voce marcou Efetividade. Envie Efetividade ou Operacao + Aprovadas + Reprovadas + Sem Acao.");
    }
    if (selectedMetrics.has("effectiveness") && idxEffectiveness < 0 && idxOperation < 0 && selectedOperation === "0800" && idxPending < 0) {
      throw new Error("Para operacao 0800, a planilha precisa ter Pendenciadas quando Efetividade for calculada.");
    }
    if (selectedMetrics.has("quality") && idxQuality < 0) {
      throw new Error("Voce marcou Qualidade, entao a planilha precisa ter a coluna Qualidade.");
    }
  }

  const operatorByName = new Map(state.operators.map((operator) => [normalizeLooseText(operator.name), operator]));
  const operatorByAnyUsername = new Map();
  state.operators.forEach((operator) => {
    const candidates = [
      operator?.username,
      operator?.nuvidioUsername,
      operator?.line0800Username
    ];
    candidates.forEach((candidate) => {
      const key = normalizeLooseText(candidate);
      if (!key || operatorByAnyUsername.has(key)) return;
      operatorByAnyUsername.set(key, operator);
    });
  });
  const existingEntries = buildExistingEntriesLookup();
  const importItems = [];
  const uniqueKeys = new Set();
  let unmatchedOperatorCount = 0;
  let invalidMetricCount = 0;
  let invalidDateCount = 0;
  let complementedRowsCount = 0;
  let totalRows = 0;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    if (!row.length) continue;
    totalRows += 1;

    const usernameKeys = [
      idxUsername >= 0 ? normalizeLooseText(row[idxUsername]) : "",
      idxNuvidioUsername >= 0 ? normalizeLooseText(row[idxNuvidioUsername]) : "",
      idx0800Username >= 0 ? normalizeLooseText(row[idx0800Username]) : ""
    ].filter(Boolean);
    const operator =
      usernameKeys.map((key) => operatorByAnyUsername.get(key)).find(Boolean) ||
      operatorByName.get(normalizeLooseText(idxName >= 0 ? row[idxName] : ""));
    if (!operator) {
      unmatchedOperatorCount += 1;
      continue;
    }

    const date = normalizeSpreadsheetDate(row[idxDate]);
    if (!date) {
      invalidDateCount += 1;
      continue;
    }

    const baseItem = {
      userId: operator.id,
      userName: operator.name || "",
      username: operator.username || "",
      date
    };
    const uniqueKey = `${baseItem.userId}__${baseItem.date}`;
    if (uniqueKeys.has(uniqueKey)) continue;
    uniqueKeys.add(uniqueKey);

    if (options.forRemoval) {
      importItems.push(baseItem);
      continue;
    }

    const existing = existingEntries.get(uniqueKey) || null;
    const operationFromSheet = idxOperation >= 0 ? String(row[idxOperation] || "") : selectedOperation;
    const approvedFromSheet = idxApproved >= 0 ? parseMetricInput(row[idxApproved]) : NaN;
    const reprovedFromSheet = idxReproved >= 0 ? parseMetricInput(row[idxReproved]) : NaN;
    const pendingFromSheet = idxPending >= 0 ? parseMetricInput(row[idxPending]) : NaN;
    const noActionFromSheet = idxNoAction >= 0 ? parseMetricInput(row[idxNoAction]) : NaN;
    const computedFromCounts = calculateDailyTotalsByOperation({
      operation: operationFromSheet,
      approved: approvedFromSheet,
      reproved: reprovedFromSheet,
      pending: Number.isFinite(pendingFromSheet) ? pendingFromSheet : 0,
      noAction: noActionFromSheet
    });
    const hasCountsForCalculation =
      Number.isFinite(approvedFromSheet) &&
      Number.isFinite(reprovedFromSheet) &&
      Number.isFinite(noActionFromSheet) &&
      (computedFromCounts.operation === "0800" ? Number.isFinite(pendingFromSheet) : true);

    const productionFromSheet = idxProduction >= 0 ? parseMetricInput(row[idxProduction]) : NaN;
    const productionFromComputed = hasCountsForCalculation ? computedFromCounts.total : NaN;
    const effectivenessFromSheet = idxEffectiveness >= 0
      ? parseMetricInput(row[idxEffectiveness], { percent: true })
      : (hasCountsForCalculation ? computedFromCounts.effectiveness : NaN);
    const qualityFromSheet = idxQuality >= 0 ? parseMetricInput(row[idxQuality], { percent: true }) : NaN;

    const productionTotal = resolveMetricBySelection({
      selectedMetrics,
      metric: "production",
      parsedValue: Number.isFinite(productionFromSheet) ? productionFromSheet : productionFromComputed,
      existingValue: Number(existing?.productionTotal)
    });
    const effectiveness = resolveMetricBySelection({
      selectedMetrics,
      metric: "effectiveness",
      parsedValue: effectivenessFromSheet,
      existingValue: Number(existing?.effectiveness)
    });
    const qualityScore = resolveMetricBySelection({
      selectedMetrics,
      metric: "quality",
      parsedValue: qualityFromSheet,
      existingValue: Number(existing?.qualityScore)
    });

    if (!Number.isFinite(effectiveness) || !Number.isFinite(productionTotal) || !Number.isFinite(qualityScore)) {
      invalidMetricCount += 1;
      continue;
    }
    if (!existing && selectedMetrics.size < IMPORT_METRIC_ORDER.length) {
      complementedRowsCount += 1;
    }

    importItems.push({
      ...baseItem,
      productionTotal,
      effectiveness,
      qualityScore,
      updatedById: state.session?.id || "",
      updatedByName: state.session?.name || "Gestor"
    });
  }

  return {
    buffer,
    importItems,
    totalRows,
    unmatchedOperatorCount,
    invalidMetricCount,
    invalidDateCount,
    complementedRowsCount
  };
}

async function handleDeleteAllResults() {
  if (!canManage()) return;
  const confirmed = window.confirm("Tem certeza que deseja APAGAR TODOS os lancamentos da operacao? Esta acao nao pode ser desfeita.");
  if (!confirmed) return;

  setBusy(true);
  try {
    const result = await fetchJson(`${REMOTE_API_BASE}/operator-results/delete-all`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: true })
    });

    state.myRecord = null;
    state.adminSelectedRecord = null;
    state.operationRecords = [];
    renderAll();
    window.alert(`Todos os lancamentos foram apagados com sucesso. Registros removidos: ${Number(result?.deleted || 0)}.`);
  } catch (error) {
    window.alert(error?.message || "Nao foi possivel apagar todos os lancamentos.");
  } finally {
    setBusy(false);
  }
}
function handleDownloadTemplate() {
  if (!canManage()) return;
  if (!window.XLSX) {
    window.alert("Biblioteca de planilha indisponivel.");
    return;
  }
  const selectedMetrics = getSelectedImportMetrics();
  if (!selectedMetrics.size) {
    window.alert("Marque pelo menos uma metrica para baixar o modelo.");
    return;
  }
  const selectedOperation = getSelectedImportOperation();
  const templateColumns = getTemplateColumnsFromSelection(selectedMetrics, selectedOperation);
  const operationUserColumn = selectedOperation === "0800" ? "Usuario 0800" : "Usuario Nuvidio";
  const rows = [["Nome do Operador", "Usuario", operationUserColumn, "Data", ...templateColumns]];
  state.operators.forEach((operator) => {
    const operationUserValue = selectedOperation === "0800"
      ? (operator.line0800Username || "")
      : (operator.nuvidioUsername || "");
    const base = [
      operator.name || "",
      operator.username || "",
      operationUserValue,
      ""
    ];
    rows.push([...base, ...templateColumns.map(() => "")]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  const selectedList = [...selectedMetrics];
  const shortNameMap = { production: "Prod", effectiveness: "Efet", quality: "Qual" };
  const sheetName = `Modelo-${selectedList.map((metric) => shortNameMap[metric] || metric).join("-")}`.slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const suffix = selectedList.join("-");
  XLSX.writeFile(workbook, `modelo-resultados-${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function getSelectedImportMetrics(initialMetrics = null) {
  if (initialMetrics instanceof Set) {
    return new Set([...initialMetrics].filter((metric) => Boolean(IMPORT_METRICS[metric])));
  }
  if (Array.isArray(initialMetrics)) {
    return new Set(initialMetrics.map((item) => String(item || "").trim()).filter((metric) => Boolean(IMPORT_METRICS[metric])));
  }

  const selected = new Set();
  elements.uploadModeInputs.forEach((input) => {
    if (!input?.checked) return;
    const metric = String(input.value || "").trim();
    if (IMPORT_METRICS[metric]) selected.add(metric);
  });
  return selected;
}

function getSelectedImportOperation() {
  return normalizeOperationType(elements.uploadOperation?.value || "nuvidio");
}

function getTemplateColumnsFromSelection(selectedMetrics, operation = "nuvidio") {
  const list = [];
  const seen = new Set();
  const normalizedOperation = normalizeOperationType(operation);
  IMPORT_METRIC_ORDER.forEach((metric) => {
    if (!selectedMetrics.has(metric)) return;
    let cols = Array.isArray(IMPORT_METRICS[metric].templateColumns)
      ? IMPORT_METRICS[metric].templateColumns
      : [];
    if (metric === "effectiveness") {
      cols = normalizedOperation === "0800"
        ? ["Aprovadas", "Reprovadas", "Pendenciadas", "Sem Acao"]
        : ["Aprovadas", "Reprovadas", "Sem Acao"];
    }
    cols.forEach((column) => {
      if (seen.has(column)) return;
      seen.add(column);
      list.push(column);
    });
  });
  return list;
}

function getImportMetricsLabel(selectedMetrics) {
  const labels = [];
  IMPORT_METRIC_ORDER.forEach((metric) => {
    if (!selectedMetrics.has(metric)) return;
    labels.push(IMPORT_METRICS[metric].label);
  });
  return labels.length ? labels.join(" + ") : "Nenhuma metrica";
}

function updateUploadModeHelp() {
  if (!elements.uploadHelpText) return;
  const selectedMetrics = getSelectedImportMetrics();
  const selectedOperation = getSelectedImportOperation();
  if (!selectedMetrics.size) {
    elements.uploadHelpText.textContent = "Marque pelo menos uma metrica (Producao, Efetividade ou Qualidade) para importar.";
    return;
  }

  const templateColumns = getTemplateColumnsFromSelection(selectedMetrics, selectedOperation);
  if (selectedMetrics.has("effectiveness")) {
    const operationLabel = selectedOperation === "0800" ? "0800" : "Nuvidio";
    elements.uploadHelpText.textContent = `Operacao selecionada: ${operationLabel}. Identificacao por Nome, Usuario, Usuario Nuvidio ou Usuario 0800. Efetividade e calculada automaticamente (efetivos/total), e total inclui Sem Acao.`;
    return;
  }

  elements.uploadHelpText.textContent = `Colunas aceitas: Nome do Operador, Usuario, Usuario Nuvidio ou Usuario 0800, Data e ${templateColumns.join(", ")}. As metricas nao marcadas sao mantidas do registro existente; se nao houver, iniciam em zero.`;
}

function buildExistingEntriesLookup() {
  const lookup = new Map();
  const records = [...(state.operationRecords || [])];
  if (state.myRecord) records.push(state.myRecord);
  if (state.adminSelectedRecord) records.push(state.adminSelectedRecord);

  records.forEach((record) => {
    const userId = String(record?.userId || "");
    if (!userId) return;
    (record?.entries || []).forEach((entry) => {
      const date = normalizeDateKey(entry?.date);
      if (!date) return;
      lookup.set(`${userId}__${date}`, {
        productionTotal: Number(entry?.productionTotal),
        effectiveness: Number(entry?.effectiveness),
        qualityScore: Number(entry?.qualityScore)
      });
    });
  });
  return lookup;
}

function resolveMetricBySelection({ selectedMetrics, metric, parsedValue, existingValue }) {
  if (selectedMetrics?.has(metric)) {
    return Number.isFinite(parsedValue) ? Number(parsedValue) : NaN;
  }
  if (Number.isFinite(existingValue)) {
    return Number(existingValue);
  }
  return 0;
}

function syncAuthView() {
  const isLogged = Boolean(state.session?.id);
  const blockedByMaintenance = isLogged && state.systemMaintenance.enabled && !canManage();
  elements.loginScreen?.classList.toggle("hidden", isLogged);
  elements.maintenanceScreen?.classList.toggle("hidden", !blockedByMaintenance);
  elements.appShell?.classList.toggle("hidden", !isLogged || blockedByMaintenance);
  elements.adminNavLink?.classList.toggle("hidden", !canManage());
  elements.systemMaintenancePanel?.classList.toggle("hidden", !canManage());
  updateGlobalOperatorFilterVisibility();
  elements.historyDeleteAll?.classList.toggle("hidden", !canManage());

  if (elements.maintenanceCopy) {
    elements.maintenanceCopy.textContent = state.systemMaintenance.message || DEFAULT_MAINTENANCE_MESSAGE;
  }

  if (!isLogged) return;

  const role = ACCESS_LEVELS[state.session.role] || ACCESS_LEVELS.operador;
  elements.sessionName.textContent = state.session.name || "Operador";
  elements.sessionRole.textContent = role.label;
  elements.sessionNameMenu.textContent = state.session.name || "Operador";
  elements.sessionRoleMenu.textContent = role.label;
  elements.profileAvatar.textContent = getInitials(state.session.name || "Operador");
  syncGlobalOperatorSelect();
  renderMaintenanceControls();
}

function renderMaintenanceControls() {
  if (!canManage()) return;
  if (elements.maintenanceStatusText) {
    if (state.systemMaintenance.enabled) {
      const by = state.systemMaintenance.updatedByName ? ` por ${state.systemMaintenance.updatedByName}` : "";
      const at = state.systemMaintenance.updatedAt ? ` em ${formatDateTime(state.systemMaintenance.updatedAt)}` : "";
      elements.maintenanceStatusText.textContent = `Manutencao ativa${by}${at}.`;
    } else {
      elements.maintenanceStatusText.textContent = "Manutencao desativada.";
    }
  }
  if (elements.maintenanceToggleButton) {
    elements.maintenanceToggleButton.textContent = state.systemMaintenance.enabled ? "Desativar manutencao" : "Ativar manutencao";
    elements.maintenanceToggleButton.classList.toggle("danger", !state.systemMaintenance.enabled);
  }
}

async function handleMaintenanceToggle() {
  if (!canManage()) return;
  const willEnable = !state.systemMaintenance.enabled;
  const actionLabel = willEnable ? "ativar" : "desativar";
  const confirmed = window.confirm(`Deseja ${actionLabel} o modo manutencao do sistema?`);
  if (!confirmed) return;

  setBusy(true);
  try {
    const payload = await fetchJson(`${REMOTE_API_BASE}/system-maintenance`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        enabled: willEnable,
        message: DEFAULT_MAINTENANCE_MESSAGE,
        updatedById: state.session?.id || "",
        updatedByName: state.session?.name || "Gestor",
        actorRole: state.session?.role || "operador"
      })
    });
    state.systemMaintenance = normalizeSystemMaintenanceStatus(payload?.status || {});
    syncAuthView();
    window.alert(state.systemMaintenance.enabled ? "Modo manutencao ativado." : "Modo manutencao desativado.");
  } catch (error) {
    window.alert(error?.message || "Nao foi possivel alterar o modo manutencao.");
  } finally {
    setBusy(false);
  }
}

function renderAll() {
  renderHero();
  renderDashboard();
  renderDashboardAnalytics();
  renderMyResults();
  renderHistory();
  renderAdminHistory();
}

function handleAnalyticsClearFilters() {
  const entries = getAnalyticsSourceEntries();
  const allDates = [...new Set(entries.map((entry) => entry.date))];
  state.analytics.attendantQuery = "";
  state.analytics.selectedAttendantId = canManage() ? "all" : (state.session?.id || "");
  state.analytics.selectedDates = [...allDates];
  if (elements.analyticsAttendantSearch) {
    elements.analyticsAttendantSearch.value = "";
  }
  renderDashboardAnalytics();
}

function handleAnalyticsAttendantSearchInput(event) {
  state.analytics.attendantQuery = String(event?.target?.value || "");
  renderDashboardAnalyticsFilters();
}

function handleAnalyticsDateChange(event) {
  const target = event?.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name !== "analytics-date") return;

  const date = String(target.value || "");
  const current = new Set(state.analytics.selectedDates || []);
  if (target.checked) {
    current.add(date);
  } else {
    current.delete(date);
  }
  state.analytics.selectedDates = [...current];
  renderDashboardAnalytics();
}

async function handleAnalyticsAttendantChange(event) {
  const target = event?.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name !== "analytics-attendant") return;
  const nextId = String(target.value || "").trim();
  if (!nextId) return;

  state.analytics.selectedAttendantId = nextId;
  renderDashboardAnalytics();
}

function renderDashboardAnalytics() {
  renderDashboardAnalyticsFilters();

  const filtered = getAnalyticsFilteredEntries();
  if (!filtered.length) {
    elements.analyticsKpiRow.innerHTML = emptyState("Sem dados", "Nao ha dados para os filtros selecionados.");
    elements.analyticsGauges.innerHTML = "";
    elements.analyticsConsistency.innerHTML = "";
    elements.analyticsPerformanceBands.innerHTML = "";
    elements.analyticsDailyBars.innerHTML = "";
    elements.analyticsTagsBars.innerHTML = "";
    elements.analyticsDepartments.innerHTML = "";
    elements.analyticsTopDays.innerHTML = "";
    elements.analyticsWorkdays.innerHTML = "";
    return;
  }

  const totalProposals = filtered.reduce((sum, entry) => sum + Number(entry.productionTotal || 0), 0);
  const avgEffectiveness = filtered.reduce((sum, entry) => sum + Number(entry.effectiveness || 0), 0) / filtered.length;
  const monthlyQualityValues = getMonthlyQualityValues(filtered);
  const avgQuality = monthlyQualityValues.length
    ? monthlyQualityValues.reduce((sum, value) => sum + Number(value || 0), 0) / monthlyQualityValues.length
    : 0;
  const avgProduction = totalProposals / filtered.length;
  const avgProductionRounded = Math.round(avgProduction);
  const latest = filtered[filtered.length - 1];

  elements.analyticsKpiRow.innerHTML = `
    ${buildAnalyticsKpi("Total atendido", formatMetric(totalProposals))}
    ${buildAnalyticsKpi("Media Efetividade", formatMetric(avgEffectiveness, "%"))}
    ${buildAnalyticsKpi("Media Qualidade", formatMetric(avgQuality, "%"))}
  `;

  elements.analyticsGauges.innerHTML = `
    ${buildGaugeCard("Producao media dia", avgProductionRounded, 0, Math.max(100, avgProductionRounded * 1.4), "")}
    ${buildGaugeCard("Efetividade", avgEffectiveness, 0, 100, "%")}
    ${buildGaugeCard("Qualidade", avgQuality, 0, 100, "%")}
  `;

  elements.analyticsConsistency.innerHTML = buildAnalyticsConsistencyCards(filtered);
  elements.analyticsPerformanceBands.innerHTML = buildAnalyticsPerformanceBands(filtered);
  elements.analyticsDailyBars.innerHTML = buildAnalyticsDailyBars(filtered);
  elements.analyticsTagsBars.innerHTML = buildAnalyticsThreeBars(totalProposals, avgEffectiveness, avgQuality, latest);
  elements.analyticsDepartments.innerHTML = buildAnalyticsTrendPanel(filtered, filtered.length);
  elements.analyticsTopDays.innerHTML = buildAnalyticsTopDays(filtered);
  elements.analyticsWorkdays.innerHTML = "";
}

function renderDashboardAnalyticsFilters() {
  const entries = getAnalyticsSourceEntries();
  entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const allDates = [...new Set(entries.map((entry) => entry.date))];
  const attendantsKey = [...new Set(entries.map((entry) => String(entry.userId || "")))].sort().join(",");
  const recordKey = `${allDates.join(",")}::${attendantsKey}`;

  if (state.analytics.recordKey !== recordKey) {
    state.analytics.recordKey = recordKey;
    state.analytics.selectedDates = [...allDates];
    state.analytics.selectedAttendantId = canManage() ? "all" : (state.session?.id || "");
  } else {
    const allowed = new Set(allDates);
    state.analytics.selectedDates = (state.analytics.selectedDates || []).filter((date) => allowed.has(date));
  }

  const query = normalizeLooseText(state.analytics.attendantQuery || "");
  const availableAttendantIds = new Set(entries.map((entry) => String(entry.userId || "")).filter(Boolean));
  const attendants = canManage()
    ? state.operators
        .filter((operator) => availableAttendantIds.has(String(operator.id || "")))
        .filter((operator) => {
          const haystack = normalizeLooseText(`${operator.name || ""} ${operator.username || ""}`);
          return !query || haystack.includes(query);
        })
    : [{
      id: state.session?.id || "",
      name: state.session?.name || "Operador",
      username: state.session?.username || ""
    }];

  if (canManage()) {
    const valid = state.analytics.selectedAttendantId === "all" || attendants.some((operator) => operator.id === state.analytics.selectedAttendantId);
    if (!valid) state.analytics.selectedAttendantId = "all";
  } else {
    state.analytics.selectedAttendantId = state.session?.id || "";
  }

  elements.analyticsAttendantList.innerHTML = attendants.length
    ? `${canManage() ? `
      <label class="analytics-option">
        <input type="radio" name="analytics-attendant" value="all" ${state.analytics.selectedAttendantId === "all" ? "checked" : ""}>
        <span>Todos os atendentes</span>
      </label>
    ` : ""}
    ${attendants.map((operator) => {
      const checked = state.analytics.selectedAttendantId === operator.id || (!canManage() && operator.id === state.session?.id);
      return `
        <label class="analytics-option">
          <input type="radio" name="analytics-attendant" value="${escapeHtml(operator.id)}" ${checked ? "checked" : ""}>
          <span>${escapeHtml(operator.name || operator.username || "Operador")}</span>
        </label>
      `;
    }).join("")}`
    : `<p class="analytics-empty">Nenhum atendente encontrado.</p>`;

  const selectedSet = new Set(state.analytics.selectedDates || []);
  elements.analyticsDateList.innerHTML = allDates.length
    ? allDates.map((date) => `
      <label class="analytics-option">
        <input type="checkbox" name="analytics-date" value="${date}" ${selectedSet.has(date) ? "checked" : ""}>
        <span>${escapeHtml(formatDate(date))}</span>
      </label>
    `).join("")
    : `<p class="analytics-empty">Sem datas cadastradas.</p>`;
}

function getAnalyticsFilteredEntries() {
  const entries = getAnalyticsSourceEntries();
  const selectedAttendant = String(state.analytics.selectedAttendantId || "");
  const selected = new Set(state.analytics.selectedDates || []);
  const filtered = entries.filter((entry) => {
    const passDate = !selected.size || selected.has(entry.date);
    const passAttendant = !canManage()
      ? String(entry.userId || "") === String(state.session?.id || "")
      : selectedAttendant === "all" || !selectedAttendant || String(entry.userId || "") === selectedAttendant;
    return passDate && passAttendant;
  });
  filtered.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return filtered;
}

function getAnalyticsSourceEntries() {
  if (!canManage()) {
    return (state.myRecord?.entries || []).map((entry) => ({
      ...entry,
      userId: state.session?.id || "",
      userName: state.session?.name || "",
      username: state.session?.username || ""
    }));
  }

  const all = [];
  for (const record of state.operationRecords || []) {
    for (const entry of record?.entries || []) {
      all.push({
        ...entry,
        userId: record.userId || "",
        userName: record.userName || "",
        username: record.username || ""
      });
    }
  }
  return all;
}

function buildAnalyticsKpi(label, value) {
  return `
    <article class="analytics-kpi">
      <strong>${escapeHtml(String(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `;
}

function buildGaugeCard(title, value, min, max, suffix) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const ratio = Math.max(0, Math.min(1, (safeValue - min) / Math.max(max - min, 1)));
  const angle = ratio * 180;
  return `
    <article class="analytics-gauge-card">
      <p>${escapeHtml(title)}</p>
      <div class="analytics-gauge" style="--gauge-angle:${angle.toFixed(2)}deg;">
        <div class="analytics-gauge-center">${escapeHtml(formatMetric(safeValue, suffix))}</div>
      </div>
      <div class="analytics-gauge-legend">
        <span>${escapeHtml(formatMetric(min, suffix))}</span>
        <span>${escapeHtml(formatMetric(max, suffix))}</span>
      </div>
    </article>
  `;
}

function resolveAnalyticsOperatorLabel(entry) {
  const directName = String(entry?.userName || "").trim();
  if (directName) return directName;

  const directUsername = String(entry?.username || "").trim();
  if (directUsername) return directUsername;

  const userId = String(entry?.userId || "").trim();
  if (userId) {
    const mapped = (state.operators || []).find((operator) => String(operator?.id || "") === userId);
    if (mapped?.name) return String(mapped.name);
    if (mapped?.username) return String(mapped.username);
  }

  if (String(state.session?.id || "") === userId) {
    return String(state.session?.name || state.session?.username || "Operador");
  }

  return "Operador";
}

function buildAnalyticsDailyBars(entries) {
  const max = Math.max(...entries.map((entry) => Number(entry.productionTotal || 0)), 1);
  return `
    <div class="analytics-bars-grid">
      ${entries.map((entry) => {
        const height = (Number(entry.productionTotal || 0) / max) * 100;
        const operatorLabel = resolveAnalyticsOperatorLabel(entry);
        return `
          <div class="analytics-bar-item">
            <div class="analytics-bar-track">
              <span class="analytics-bar-fill" style="height:${height.toFixed(2)}%"></span>
            </div>
            <strong>${escapeHtml(formatMetric(entry.productionTotal))}</strong>
            <span class="analytics-bar-date">${escapeHtml(shortDate(entry.date))}</span>
            <span class="analytics-bar-user" title="${escapeHtml(operatorLabel)}">${escapeHtml(operatorLabel)}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function buildAnalyticsThreeBars(totalProposals, avgEffectiveness, avgQuality, latest) {
  const items = [
    { label: "Producao total", value: totalProposals, tone: "green", suffix: "" },
    { label: "Efetividade media", value: avgEffectiveness, tone: "gray", suffix: "%" },
    { label: "Qualidade media", value: avgQuality, tone: "lime", suffix: "%" },
    { label: "Producao ultimo dia", value: Number(latest?.productionTotal || 0), tone: "red", suffix: "" }
  ];
  return items.map((item) => `
    <article class="analytics-tag-card tone-${escapeHtml(item.tone)}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(formatMetric(item.value, item.suffix))}</strong>
    </article>
  `).join("");
}

function buildAnalyticsTrendPanel(entries, workdaysCount = 0) {
  const effectivenessDaily = buildDailyMetricCard(entries, "effectiveness", "Efetividade (%) dia a dia", "%");
  const qualityKpi = buildMonthlyQualityKpiCard(entries);
  return `
    <div class="analytics-trend-two">
      ${effectivenessDaily}
      ${qualityKpi}
      <article class="analytics-days-card analytics-days-card-inline">
        <strong>${escapeHtml(String(workdaysCount))}</strong>
        <span>Dias Trabalhados</span>
      </article>
    </div>
  `;
}

function buildMonthlyQualityKpiCard(entries) {
  const monthlyMap = getMonthlyQualityMap(entries);
  const monthKeys = [...monthlyMap.keys()].sort((a, b) => String(a).localeCompare(String(b)));
  if (!monthKeys.length) {
    return `
      <article class="analytics-trend-kpi-card is-quality">
        <p class="chart-title">Qualidade mensal (monitoria)</p>
        <strong>--%</strong>
      </article>
    `;
  }

  const values = monthKeys.map((key) => Number(monthlyMap.get(key) || 0)).filter(Number.isFinite);
  const latestMonthKey = monthKeys[monthKeys.length - 1];
  const latest = Number(monthlyMap.get(latestMonthKey) || 0);
  const previous = values.length > 1 ? values[values.length - 2] : latest;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const delta = latest - previous;
  const deltaPrefix = delta > 0 ? "+" : "";
  const tone = delta >= 0 ? "up" : "down";

  return `
    <article class="analytics-trend-kpi-card is-quality">
      <p class="chart-title">Qualidade mensal (monitoria)</p>
      <strong>${escapeHtml(formatMetric(latest, "%"))}</strong>
      <div class="analytics-trend-kpi-meta">
        <span>Mes ref ${escapeHtml(formatMonthKey(latestMonthKey))}</span>
        <span>Media mensal ${escapeHtml(formatMetric(average, "%"))}</span>
        <span>Min ${escapeHtml(formatMetric(min, "%"))}</span>
        <span>Max ${escapeHtml(formatMetric(max, "%"))}</span>
      </div>
      <span class="analytics-trend-kpi-delta ${tone}">${escapeHtml(`${deltaPrefix}${formatMetric(delta, "%")}`)}</span>
    </article>
  `;
}

function buildDailyMetricCard(entries, field, label, suffix = "") {
  const rows = [...entries]
    .map((entry) => ({
      date: String(entry?.date || ""),
      value: Number(entry?.[field] || 0)
    }))
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  if (!rows.length) {
    return `
      <article class="analytics-trend-kpi-card is-effectiveness analytics-daily-chart-card">
        <p class="chart-title">${escapeHtml(label)}</p>
        <strong>--${escapeHtml(suffix)}</strong>
      </article>
    `;
  }

  const isPercent = field === "effectiveness" || field === "qualityScore" || suffix === "%";
  const rawMin = Math.min(...rows.map((row) => row.value), 0);
  const rawMax = Math.max(...rows.map((row) => row.value), 1);
  const spread = Math.max(rawMax - rawMin, 1);
  const dynamicPad = Math.max(spread * 0.25, isPercent ? 4 : 6);
  let minValue = Math.max(0, rawMin - dynamicPad);
  let maxValue = rawMax + dynamicPad;
  if (isPercent) {
    minValue = Math.max(0, minValue);
    maxValue = Math.min(100, Math.max(maxValue, rawMax + 2));
  }
  if (maxValue <= minValue) {
    maxValue = minValue + 1;
  }
  const chartWidth = Math.max(760, rows.length * 110);
  const chartHeight = 250;
  const padLeft = 22;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 44;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;
  const denom = Math.max(rows.length - 1, 1);
  const range = Math.max(maxValue - minValue, 1);
  const minPointValue = Math.min(...rows.map((row) => row.value));

  const points = rows.map((row, index) => {
    const x = padLeft + (innerW * index) / denom;
    const ratio = (row.value - minValue) / range;
    const y = padTop + innerH - (ratio * innerH);
    return { x, y, value: row.value, date: row.date };
  });

  const polyline = points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const areaPoints = `${padLeft},${chartHeight - padBottom} ${polyline} ${chartWidth - padRight},${chartHeight - padBottom}`;
  chartIdSeed += 1;
  const gradientId = `analytics-daily-fill-${field}-${chartIdSeed}`;
  const isScrollable = rows.length > 14;
  const chipStep = rows.length > 20 ? 3 : rows.length > 12 ? 2 : 1;
  const xLabelStep = rows.length > 18 ? 3 : rows.length > 10 ? 2 : 1;

  return `
    <article class="analytics-trend-kpi-card is-effectiveness analytics-daily-chart-card">
      <p class="chart-title">${escapeHtml(label)}</p>
      <div class="analytics-daily-chart-scroll${isScrollable ? " is-scrollable" : ""}">
        <svg
          class="analytics-daily-chart-svg"
          viewBox="0 0 ${chartWidth} ${chartHeight}"
          style="${isScrollable ? `width:${chartWidth}px;height:${chartHeight}px;` : `width:100%;height:${chartHeight}px;`}"
          preserveAspectRatio="xMinYMin meet"
          role="img"
          aria-label="${escapeHtml(label)}"
        >
          <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4ea1ff" stop-opacity="0.38"></stop>
              <stop offset="100%" stop-color="#4ea1ff" stop-opacity="0.04"></stop>
            </linearGradient>
          </defs>
          <polygon points="${areaPoints}" fill="url(#${gradientId})"></polygon>
          <polyline points="${polyline}" class="analytics-daily-line"></polyline>
          ${points.map((point) => {
            const pointColor = point.value === minPointValue && rows.length > 2 ? "#ff4d4f" : "#2ee51d";
            return `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="5.2" fill="${pointColor}" class="analytics-daily-point"></circle>`;
          }).join("")}
          ${points.map((point, index) => {
            const showChip = index === 0 || index === points.length - 1 || index % chipStep === 0;
            if (!showChip) return "";
            const text = formatMetric(point.value, suffix);
            const chipWidth = Math.max(38, (text.length * 7) + 14);
            const chipX = Math.max(padLeft, Math.min(point.x - (chipWidth / 2), (chartWidth - padRight) - chipWidth));
            const chipY = Math.max(6, point.y - 22);
            return `
              <g class="analytics-daily-chip">
                <rect x="${chipX.toFixed(2)}" y="${chipY.toFixed(2)}" width="${chipWidth.toFixed(2)}" height="17" rx="8" ry="8"></rect>
                <text x="${(chipX + (chipWidth / 2)).toFixed(2)}" y="${(chipY + 12).toFixed(2)}" class="analytics-daily-chip-label" text-anchor="middle">${escapeHtml(text)}</text>
              </g>
            `;
          }).join("")}
          ${points.map((point, index) => {
            const showXLabel = index === 0 || index === points.length - 1 || index % xLabelStep === 0;
            if (!showXLabel) return "";
            return `<text x="${point.x.toFixed(2)}" y="${(chartHeight - 10).toFixed(2)}" text-anchor="middle" class="analytics-daily-x-label">${escapeHtml(formatDate(point.date))}</text>`;
          }).join("")}
        </svg>
      </div>
    </article>
  `;
}

function buildTrendKpiCard(entries, field, label, suffix = "") {
  const toneClass = field === "effectiveness"
    ? "is-effectiveness"
    : field === "qualityScore"
      ? "is-quality"
      : "";
  const values = entries.map((entry) => Number(entry?.[field] || 0)).filter(Number.isFinite);
  if (!values.length) {
    return `
      <article class="analytics-trend-kpi-card ${toneClass}">
        <p class="chart-title">${escapeHtml(label)}</p>
        <strong>--${escapeHtml(suffix)}</strong>
      </article>
    `;
  }

  const latest = values[values.length - 1];
  const previous = values.length > 1 ? values[values.length - 2] : latest;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const delta = latest - previous;
  const deltaPrefix = delta > 0 ? "+" : "";
  const tone = delta >= 0 ? "up" : "down";

  return `
    <article class="analytics-trend-kpi-card ${toneClass}">
      <p class="chart-title">${escapeHtml(label)}</p>
      <strong>${escapeHtml(formatMetric(latest, suffix))}</strong>
      <div class="analytics-trend-kpi-meta">
        <span>Media ${escapeHtml(formatMetric(average, suffix))}</span>
        <span>Min ${escapeHtml(formatMetric(min, suffix))}</span>
        <span>Max ${escapeHtml(formatMetric(max, suffix))}</span>
      </div>
      <span class="analytics-trend-kpi-delta ${tone}">${escapeHtml(`${deltaPrefix}${formatMetric(delta, suffix)}`)}</span>
    </article>
  `;
}

function buildAnalyticsConsistencyCards(entries) {
  const monthlyQualityValues = getMonthlyQualityValues(entries);
  return `
    ${buildMetricConsistencyCard(entries, "productionTotal", "Producao", "")}
    ${buildMetricConsistencyCard(entries, "effectiveness", "Efetividade", "%")}
    ${buildMetricConsistencyCardFromValues(monthlyQualityValues, "Qualidade mensal", "%")}
  `;
}

function buildMetricConsistencyCard(entries, field, label, suffix) {
  const values = entries.map((entry) => Number(entry?.[field] || 0)).filter(Number.isFinite);
  return buildMetricConsistencyCardFromValues(values, label, suffix);
}

function buildMetricConsistencyCardFromValues(values, label, suffix) {
  if (!values.length) return "";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const stdDev = getStandardDeviation(values, average);
  const variation = average > 0 ? (stdDev / average) * 100 : 0;
  const trendTone = variation <= 12 ? "stable" : variation <= 25 ? "attention" : "critical";
  const trendLabel = variation <= 12 ? "Estavel" : variation <= 25 ? "Oscilando" : "Instavel";

  return `
    <article class="analytics-consistency-card ${trendTone}">
      <div class="analytics-consistency-head">
        <p>${escapeHtml(label)}</p>
        <span>${escapeHtml(trendLabel)}</span>
      </div>
      <strong>${escapeHtml(formatMetric(average, suffix))}</strong>
      <div class="analytics-consistency-meta">
        <span>Min ${escapeHtml(formatMetric(min, suffix))}</span>
        <span>Max ${escapeHtml(formatMetric(max, suffix))}</span>
      </div>
      <div class="analytics-consistency-meta">
        <span>Amplitude ${escapeHtml(formatMetric(max - min, suffix))}</span>
        <span>Var. ${escapeHtml(formatMetric(variation, "%"))}</span>
      </div>
    </article>
  `;
}

function buildAnalyticsPerformanceBands(entries) {
  const entriesWithQualityRef = applyMonthlyQualityReference(entries);
  const maxProduction = Math.max(...entries.map((entry) => Number(entry.productionTotal || 0)), 1);
  const buckets = {
    high: { label: "Alta performance", count: 0, tone: "high" },
    mid: { label: "Faixa estavel", count: 0, tone: "mid" },
    low: { label: "Ponto de atencao", count: 0, tone: "low" }
  };

  entriesWithQualityRef.forEach((entry) => {
    const productionScore = (Number(entry.productionTotal || 0) / Math.max(maxProduction, 1)) * 100;
    const effectiveness = clampPercent(entry.effectiveness);
    const quality = clampPercent(entry.qualityReferenceScore);
    const composite = (productionScore * 0.4) + (effectiveness * 0.3) + (quality * 0.3);

    if (composite >= 80) {
      buckets.high.count += 1;
    } else if (composite >= 60) {
      buckets.mid.count += 1;
    } else {
      buckets.low.count += 1;
    }
  });

  const total = Math.max(entries.length, 1);
  const rows = [buckets.high, buckets.mid, buckets.low];
  return `
    <div class="analytics-band-list">
      ${rows.map((bucket) => {
        const percent = (bucket.count / total) * 100;
        return `
          <div class="analytics-band-row">
            <span>${escapeHtml(bucket.label)}</span>
            <div class="analytics-band-track">
              <span class="analytics-band-fill ${bucket.tone}" style="width:${percent.toFixed(2)}%"></span>
            </div>
            <strong>${escapeHtml(String(bucket.count))}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function buildAnalyticsTopDays(entries) {
  const entriesWithQualityRef = applyMonthlyQualityReference(entries);
  const byOperator = new Map();
  entriesWithQualityRef.forEach((entry) => {
    const userId = String(entry?.userId || "");
    const operatorLabel = resolveAnalyticsOperatorLabel(entry);
    const previous = byOperator.get(userId) || {
      userId,
      operatorLabel,
      days: 0,
      productionSum: 0,
      effectivenessSum: 0,
      qualitySum: 0
    };
    previous.days += 1;
    previous.productionSum += Number(entry?.productionTotal || 0);
    previous.effectivenessSum += clampPercent(entry?.effectiveness);
    previous.qualitySum += clampPercent(entry?.qualityReferenceScore);
    byOperator.set(userId, previous);
  });

  const aggregates = [...byOperator.values()].map((item) => ({
    ...item,
    avgProduction: item.days ? item.productionSum / item.days : 0,
    avgEffectiveness: item.days ? item.effectivenessSum / item.days : 0,
    avgQuality: item.days ? item.qualitySum / item.days : 0
  }));

  const maxProduction = Math.max(...aggregates.map((entry) => Number(entry.avgProduction || 0)), 1);
  const PRODUCTION_WEIGHT = 0.4;
  const EFFECTIVENESS_WEIGHT = 0.3;
  const QUALITY_WEIGHT = 0.3;

  const ranked = aggregates.map((entry) => {
    const productionScore = (Number(entry.avgProduction || 0) / Math.max(maxProduction, 1)) * 100;
    const effectiveness = clampPercent(entry.avgEffectiveness);
    const quality = clampPercent(entry.avgQuality);
    const score =
      (productionScore * PRODUCTION_WEIGHT) +
      (effectiveness * EFFECTIVENESS_WEIGHT) +
      (quality * QUALITY_WEIGHT);
    return {
      ...entry,
      score
    };
  }).sort((a, b) => b.score - a.score);

  const topDays = ranked.slice(0, 5);
  if (!topDays.length) {
    return emptyState("Sem ranking", "Nao ha dados suficientes para calcular o top 5.");
  }

  return `
    <div class="analytics-top-days-list">
      ${topDays.map((entry, index) => `
        <article class="analytics-top-day-item">
          <div class="analytics-top-day-rank">${escapeHtml(String(index + 1))}</div>
          <div class="analytics-top-day-info">
            <strong>${escapeHtml(entry.operatorLabel)}</strong>
            <p>Prod media ${escapeHtml(formatMetric(entry.avgProduction))} | Eff media ${escapeHtml(formatMetric(entry.avgEffectiveness, "%"))} | Qual media ${escapeHtml(formatMetric(entry.avgQuality, "%"))} | Dias ${escapeHtml(String(entry.days))}</p>
          </div>
          <div class="analytics-top-day-score">${escapeHtml(formatMetric(entry.score, "%"))}</div>
        </article>
      `).join("")}
    </div>
  `;
}

function applyMonthlyQualityReference(entries) {
  const monthQuality = getMonthlyQualityMap(entries);
  const sortedMonths = [...monthQuality.keys()].sort((a, b) => a.localeCompare(b));
  return entries.map((entry) => {
    const monthKey = getMonthKey(entry?.date);
    const qualityReferenceScore = resolveQualityReferenceForMonth(monthKey, monthQuality, sortedMonths);
    return { ...entry, qualityReferenceScore };
  });
}

function getMonthlyQualityValues(entries) {
  return [...getMonthlyQualityMap(entries).values()];
}

function getMonthlyQualityMap(entries) {
  const monthly = new Map();
  const sorted = [...entries].sort((a, b) => String(a?.date || "").localeCompare(String(b?.date || "")));
  sorted.forEach((entry) => {
    const monthKey = getMonthKey(entry?.date);
    const quality = Number(entry?.qualityScore);
    if (!monthKey || !Number.isFinite(quality)) return;
    monthly.set(monthKey, quality);
  });
  return monthly;
}

function resolveQualityReferenceForMonth(monthKey, monthQualityMap, sortedMonths) {
  if (!monthKey || !monthQualityMap.size) return 0;
  if (monthQualityMap.has(monthKey)) return Number(monthQualityMap.get(monthKey) || 0);

  let fallback = null;
  for (const knownMonth of sortedMonths) {
    if (knownMonth <= monthKey) {
      fallback = knownMonth;
      continue;
    }
    break;
  }

  if (fallback && monthQualityMap.has(fallback)) {
    return Number(monthQualityMap.get(fallback) || 0);
  }
  return Number(monthQualityMap.get(sortedMonths[0]) || 0);
}

function getMonthKey(dateValue) {
  const normalized = normalizeDateKey(dateValue);
  if (!normalized) return "";
  return String(normalized).slice(0, 7);
}

function getStandardDeviation(values, average) {
  if (!values.length) return 0;
  const variance = values.reduce((sum, value) => {
    const delta = value - average;
    return sum + (delta * delta);
  }, 0) / values.length;
  return Math.sqrt(Math.max(variance, 0));
}

function renderHero() {
  const viewRecord = getOverviewViewRecord();
  const latest = getLatestEntry(viewRecord);
  const selectedOperatorName = getOverviewSelectedOperatorName();
  if (canManage() && state.overviewSelectedUserId === "all") {
    elements.heroTitle.textContent = "Visao geral de toda operacao";
  } else if (canManage() && selectedOperatorName) {
    elements.heroTitle.textContent = `Visao do operador ${selectedOperatorName}`;
  } else {
    elements.heroTitle.textContent = state.session?.name
      ? `${state.session.name}, aqui esta sua leitura mais recente`
      : "Acompanhe sua evolucao diaria";
  }
  elements.heroDescription.textContent = canManage()
    ? "Voce pode lancar os numeros na aba Gestao e acompanhar o operador selecionado."
    : "Use este portal para consultar seu desempenho diario com a mesma credencial da Central do Operador.";

  const stats = [
    { label: "Ultima data", value: latest ? formatDate(latest.date) : "--" },
    { label: "Dias lancados", value: viewRecord?.daysCount ?? 0 }
  ];
  elements.heroStats.innerHTML = stats.map((item) => `
    <article class="metric-card">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(String(item.value))}</strong>
    </article>
  `).join("");

  if (!latest) {
    elements.latestUpdateTitle.textContent = "Aguardando lancamentos";
    elements.latestUpdateCopy.textContent = "Assim que houver um resultado cadastrado, ele ficara visivel aqui.";
    return;
  }

  elements.latestUpdateTitle.textContent = `${formatMetric(latest.productionTotal)} producoes em ${formatDate(latest.date)}`;
  elements.latestUpdateCopy.textContent = `Efetividade de ${formatMetric(latest.effectiveness, "%")} e qualidade de ${formatMetric(latest.qualityScore, "%")}.`;
}

function renderDashboard() {
  const viewRecord = getOverviewViewRecord();
  const latest = getLatestEntry(viewRecord);
  const averages = getRecordAverages(viewRecord);
  const totalProduced = (viewRecord?.entries || []).reduce((sum, entry) => sum + Number(entry?.productionTotal || 0), 0);
  const metrics = [
    { label: "Total atendido", value: totalProduced, suffix: "" },
    { label: "Media de producao", value: averages.production, suffix: "" },
    { label: "Efetividade media", value: averages.effectiveness, suffix: "%" },
    { label: "Qualidade media", value: averages.quality, suffix: "%" }
  ];

  elements.dashboardMetrics.innerHTML = metrics.map(renderMetricCard).join("");
  renderDashboardVisuals(viewRecord);

  if (!latest) {
    const noDataMessage = canManage()
      ? "Nenhum lancamento encontrado para o operador selecionado."
      : "Seu gestor ainda nao cadastrou nenhum lancamento.";
    elements.latestResultCard.innerHTML = emptyState("Sem resultados", noDataMessage);
    if (elements.dashboardNote) {
      elements.dashboardNote.innerHTML = emptyState("Aguardando atualizacao", "Assim que houver um lancamento, este painel passa a resumir seu cenario.");
    }
    return;
  }

  elements.latestResultCard.innerHTML = `
    <article class="admin-item">
      <div class="admin-item-top">
        <div>
          <strong>Resultado de ${escapeHtml(formatDate(latest.date))}</strong>
          <p>Atualizado em ${escapeHtml(formatDateTime(latest.updatedAt))}</p>
        </div>
        <span class="badge script">Disponivel</span>
      </div>
      <p>Producao: ${escapeHtml(formatMetric(latest.productionTotal))}</p>
      <p>Efetividade: ${escapeHtml(formatMetric(latest.effectiveness, "%"))}</p>
      <p>Qualidade: ${escapeHtml(formatMetric(latest.qualityScore, "%"))}</p>
    </article>
  `;

  const message = buildPerformanceMessage(latest);
  if (elements.dashboardNote) {
    elements.dashboardNote.innerHTML = `
      <article class="admin-item">
        <div class="admin-item-top">
          <div>
            <strong>${escapeHtml(message.title)}</strong>
            <p>${escapeHtml(message.copy)}</p>
          </div>
          <span class="badge faq">${escapeHtml(message.badge)}</span>
        </div>
        <p>Media acumulada de producao: ${escapeHtml(formatMetric(averages.production))}</p>
        <p>Media acumulada de efetividade: ${escapeHtml(formatMetric(averages.effectiveness, "%"))}</p>
        <p>Media acumulada de qualidade: ${escapeHtml(formatMetric(averages.quality, "%"))}</p>
        <p>Dias com lancamento: ${escapeHtml(String(viewRecord?.daysCount || 0))}</p>
      </article>
    `;
  }
}

function renderMyResults() {
  const viewRecord = getPrimaryViewRecord();
  const latest = getLatestEntry(viewRecord);
  const averages = getRecordAverages(viewRecord);
  const metrics = [
    { label: "Producao do dia", value: latest?.productionTotal, suffix: "" },
    { label: "Producao media", value: averages.production, suffix: "" },
    { label: "Efetividade media", value: averages.effectiveness, suffix: "%" },
    { label: "Qualidade media", value: averages.quality, suffix: "%" }
  ];
  elements.resultMetrics.innerHTML = metrics.map(renderMetricCard).join("");
  renderMyResultsVisuals(viewRecord);

  if (!latest) {
    const noDataMessage = canManage()
      ? "Selecione um operador na Gestao e lance os resultados para visualizar aqui."
      : "Quando seu gestor lancar os numeros, eles aparecem aqui em detalhe.";
    elements.resultSummary.innerHTML = emptyState("Sem lancamentos", noDataMessage);
    return;
  }

  const entries = [...(viewRecord?.entries || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  elements.resultSummary.innerHTML = entries.slice(0, 3).map((entry) => `
    <article class="admin-item">
      <div class="admin-item-top">
        <div>
          <strong>${escapeHtml(formatDate(entry.date))}</strong>
          <p>Lancado por ${escapeHtml(entry.updatedByName || "Gestor")}</p>
        </div>
        <span class="badge manual">${escapeHtml(formatMetric(entry.qualityScore, "%"))}</span>
      </div>
      <p>Producao: ${escapeHtml(formatMetric(entry.productionTotal))}</p>
      <p>Efetividade: ${escapeHtml(formatMetric(entry.effectiveness, "%"))}</p>
      <p>Atualizado em ${escapeHtml(formatDateTime(entry.updatedAt))}</p>
    </article>
  `).join("");
}

function renderHistory() {
  if (!canManage()) {
    const viewRecord = getPrimaryViewRecord();
    elements.historyTableWrapper.innerHTML = renderRecordTable(viewRecord, "Voce ainda nao possui historico cadastrado.");
    return;
  }

  const entries = getManagerHistoryEntries();
  if (!entries.length) {
    elements.historyTableWrapper.innerHTML = emptyState("Sem historico", "Nenhum registro encontrado na operacao.");
    return;
  }

  elements.historyTableWrapper.innerHTML = renderManagerHistoryTable(entries);
}

function getManagerHistoryEntries() {
  const rows = [];
  for (const record of state.operationRecords || []) {
    const operatorName = String(record?.userName || record?.username || "Operador");
    for (const entry of record?.entries || []) {
      rows.push({
        userId: String(record?.userId || ""),
        operatorName,
        date: String(entry?.date || ""),
        productionTotal: Number(entry?.productionTotal || 0),
        effectiveness: Number(entry?.effectiveness || 0),
        qualityScore: Number(entry?.qualityScore || 0),
        updatedByName: String(entry?.updatedByName || "Gestor"),
        updatedAt: String(entry?.updatedAt || "")
      });
    }
  }

  rows.sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || "") || 0;
    const bTime = Date.parse(b.updatedAt || "") || 0;
    if (aTime !== bTime) return bTime - aTime;
    if (a.date !== b.date) return String(b.date).localeCompare(String(a.date));
    return String(a.operatorName).localeCompare(String(b.operatorName), "pt-BR");
  });
  return rows;
}

function renderManagerHistoryTable(entries) {
  return `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Operador</th>
            <th>Data</th>
            <th>Producao</th>
            <th>Efetividade</th>
            <th>Qualidade</th>
            <th>Lancado por</th>
            <th>Atualizado em</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map((entry) => `
            <tr>
              <td>${escapeHtml(entry.operatorName)}</td>
              <td>${escapeHtml(formatDate(entry.date))}</td>
              <td>${escapeHtml(formatMetric(entry.productionTotal))}</td>
              <td>${escapeHtml(formatMetric(entry.effectiveness, "%"))}</td>
              <td>${escapeHtml(formatMetric(entry.qualityScore, "%"))}</td>
              <td>${escapeHtml(entry.updatedByName)}</td>
              <td>${escapeHtml(formatDateTime(entry.updatedAt))}</td>
              <td>
                <div class="table-actions-inline">
                  <button
                    type="button"
                    class="ghost-button edit-result-button"
                    data-action="edit-result"
                    data-user-id="${escapeHtml(entry.userId)}"
                    data-date="${escapeHtml(entry.date)}"
                    data-production="${escapeHtml(String(entry.productionTotal))}"
                    data-effectiveness="${escapeHtml(String(entry.effectiveness))}"
                    data-quality="${escapeHtml(String(entry.qualityScore))}"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="ghost-button danger delete-result-button"
                    data-action="delete-result"
                    data-user-id="${escapeHtml(entry.userId)}"
                    data-date="${escapeHtml(entry.date)}"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDashboardVisuals(viewRecord) {
  const entries = getRecentEntries(viewRecord, 10);
  if (!entries.length) {
    elements.dashboardTrendChart.innerHTML = emptyState("Sem dados", "Cadastre lancamentos para liberar os graficos.");
    elements.dashboardIllustratedCards.innerHTML = "";
    return;
  }

  const latest = entries[entries.length - 1];
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;
  const productionDelta = previous ? latest.productionTotal - previous.productionTotal : 0;
  const effectivenessDelta = previous ? latest.effectiveness - previous.effectiveness : 0;
  const qualityDelta = previous ? latest.qualityScore - previous.qualityScore : 0;

  const lineChart = buildLineChartSvg(entries, "productionTotal", "#4ea1ff");
  const bars = entries.map((entry) => ({ label: shortDate(entry.date), value: entry.productionTotal }));
  const barsChart = buildMiniBars(bars, "#63dca2");

  elements.dashboardTrendChart.innerHTML = `
    <article class="chart-card">
      <p class="chart-title">Producao por dia</p>
      ${lineChart}
    </article>
    <article class="chart-card">
      <p class="chart-title">Barras de producao</p>
      ${barsChart}
    </article>
  `;

  elements.dashboardIllustratedCards.innerHTML = `
    ${buildDeltaCard("Producao", latest.productionTotal, productionDelta, "")}
    ${buildDeltaCard("Efetividade", latest.effectiveness, effectivenessDelta, "%")}
    ${buildDeltaCard("Qualidade", latest.qualityScore, qualityDelta, "%")}
  `;
}

function renderMyResultsVisuals(viewRecord) {
  const entries = getRecentEntries(viewRecord, 14);
  if (!entries.length) {
    elements.myResultsChart.innerHTML = emptyState("Sem dados", "Os graficos aparecem quando houver lancamentos.");
    elements.myResultsIllustrated.innerHTML = "";
    return;
  }

  const latest = entries[entries.length - 1];
  const prodLine = buildLineChartSvg(entries, "productionTotal", "#4ea1ff");
  const effLine = buildLineChartSvg(entries, "effectiveness", "#ffb16c", 100);

  elements.myResultsChart.innerHTML = `
    <article class="chart-card">
      <p class="chart-title">Linha de producao</p>
      ${prodLine}
    </article>
    <article class="chart-card">
      <p class="chart-title">Linha de efetividade</p>
      ${effLine}
    </article>
  `;

  const qualityProgress = clampPercent(latest.qualityScore);
  const effectivenessProgress = clampPercent(latest.effectiveness);
  const consistency = clampPercent((latest.qualityScore + latest.effectiveness) / 2);

  elements.myResultsIllustrated.innerHTML = `
    ${buildProgressVisual("Qualidade", qualityProgress)}
    ${buildProgressVisual("Efetividade", effectivenessProgress)}
    ${buildProgressVisual("Indice composto", consistency)}
  `;
}

function renderAdminHistory() {
  if (!canManage()) {
    elements.adminHistoryWrapper.innerHTML = emptyState("Acesso restrito", "Somente gestor pode consultar esta area.");
    return;
  }
  elements.adminHistoryWrapper.innerHTML = renderRecordTable(
    state.adminSelectedRecord,
    "Selecione um operador com lancamentos para visualizar o historico.",
    { allowDelete: true, allowEdit: true, userId: state.adminSelectedUserId || "" }
  );
}

function renderRecordTable(record, emptyMessage, options = {}) {
  const entries = [...(record?.entries || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (!entries.length) return emptyState("Sem historico", emptyMessage);
  const allowDelete = Boolean(options?.allowDelete && options?.userId);
  const allowEdit = Boolean(options?.allowEdit && options?.userId);
  const userId = String(options?.userId || "");

  return `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Producao</th>
            <th>Efetividade</th>
            <th>Qualidade</th>
            <th>Lancado por</th>
            <th>Atualizado em</th>
            ${(allowDelete || allowEdit) ? "<th>Acoes</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${entries.map((entry) => `
            <tr>
              <td>${escapeHtml(formatDate(entry.date))}</td>
              <td>${escapeHtml(formatMetric(entry.productionTotal))}</td>
              <td>${escapeHtml(formatMetric(entry.effectiveness, "%"))}</td>
              <td>${escapeHtml(formatMetric(entry.qualityScore, "%"))}</td>
              <td>${escapeHtml(entry.updatedByName || "Gestor")}</td>
              <td>${escapeHtml(formatDateTime(entry.updatedAt))}</td>
              ${(allowDelete || allowEdit) ? `
                <td>
                  <div class="table-actions-inline">
                    ${allowEdit ? `
                      <button
                        type="button"
                        class="ghost-button edit-result-button"
                        data-action="edit-result"
                        data-user-id="${escapeHtml(userId)}"
                        data-date="${escapeHtml(String(entry.date || ""))}"
                        data-production="${escapeHtml(String(entry.productionTotal || 0))}"
                        data-effectiveness="${escapeHtml(String(entry.effectiveness || 0))}"
                        data-quality="${escapeHtml(String(entry.qualityScore || 0))}"
                      >
                        Editar
                      </button>
                    ` : ""}
                    ${allowDelete ? `
                      <button
                        type="button"
                        class="ghost-button danger delete-result-button"
                        data-action="delete-result"
                        data-user-id="${escapeHtml(userId)}"
                        data-date="${escapeHtml(String(entry.date || ""))}"
                      >
                        Excluir
                      </button>
                    ` : ""}
                  </div>
                </td>
              ` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function handleAdminHistoryClick(event) {
  if (!canManage()) return;
  const button = event.target?.closest?.("button[data-action]");
  if (!button) return;
  await handleHistoryActionButton(button);
}

async function handleHistoryTableClick(event) {
  if (!canManage()) return;
  const button = event.target?.closest?.("button[data-action]");
  if (!button) return;
  await handleHistoryActionButton(button);
}

async function handleHistoryActionButton(button) {
  const action = String(button.getAttribute("data-action") || "");
  if (action === "edit-result") {
    const userId = String(button.getAttribute("data-user-id") || "").trim();
    const date = normalizeDateKey(button.getAttribute("data-date"));
    const productionTotal = parseMetricInput(button.getAttribute("data-production"));
    const effectiveness = parseMetricInput(button.getAttribute("data-effectiveness"));
    const qualityScore = parseMetricInput(button.getAttribute("data-quality"));
    if (!userId || !date || !Number.isFinite(productionTotal) || !Number.isFinite(qualityScore)) {
      window.alert("Nao foi possivel carregar os dados do registro para edicao.");
      return;
    }

    state.adminSelectedUserId = userId;
    syncAdminOperatorSelect();
    syncGlobalOperatorSelect();
    hydrateAdminFormFromRecord();
    if (elements.adminDate) elements.adminDate.value = date;
    if (elements.adminOperation) elements.adminOperation.value = "nuvidio";
    if (elements.adminApproved) elements.adminApproved.value = "";
    if (elements.adminReproved) elements.adminReproved.value = "";
    if (elements.adminPending) elements.adminPending.value = "";
    if (elements.adminNoAction) elements.adminNoAction.value = "";
    if (elements.adminProduction) elements.adminProduction.value = String(productionTotal || 0);
    if (elements.adminEffectiveness) elements.adminEffectiveness.value = Number.isFinite(effectiveness) ? String(effectiveness) : "";
    if (elements.adminQuality) elements.adminQuality.value = String(qualityScore);
    setSection("admin");
    window.alert("Registro carregado no formulario de Gestao. Ajuste os campos e clique em Salvar resultado.");
    return;
  }

  if (action === "delete-result") {
    await handleDeleteResultButton(button);
  }
}

async function handleDeleteResultButton(button) {
  const userId = String(button.getAttribute("data-user-id") || "").trim();
  const date = normalizeDateKey(button.getAttribute("data-date"));
  if (!userId || !date) {
    window.alert("Nao foi possivel identificar o lancamento para exclusao.");
    return;
  }

  const confirmed = window.confirm(`Deseja excluir o lancamento do dia ${formatDate(date)}?`);
  if (!confirmed) return;

  setBusy(true);
  try {
    await fetchJson(`${REMOTE_API_BASE}/operator-results/delete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, date })
    });

    state.adminSelectedUserId = userId;
    syncAdminOperatorSelect();
    syncGlobalOperatorSelect();
    if (canManage()) await loadOperationRecords();
    await loadAdminSelectedRecord();
    if (state.session?.id === userId) await loadMyResults();
    renderAll();
    window.alert("Lancamento excluido com sucesso.");
  } catch (error) {
    window.alert(error?.message || "Nao foi possivel excluir o lancamento.");
  } finally {
    setBusy(false);
  }
}

function renderOperatorSelect() {
  syncAdminOperatorSelect();
  syncGlobalOperatorSelect();
}

function syncAdminOperatorSelect() {
  if (!elements.adminUser) return;
  elements.adminUser.innerHTML = state.operators.length
    ? state.operators.map((operator) => `<option value="${escapeHtml(operator.id)}">${escapeHtml(operator.name || operator.username || "Operador")}</option>`).join("")
    : `<option value="">Nenhum operador encontrado</option>`;
  elements.adminUser.value = state.adminSelectedUserId || "";
}

function syncGlobalOperatorSelect() {
  if (!elements.globalOperatorSelect) return;
  if (!canManage()) {
    elements.globalOperatorSelect.innerHTML = "";
    return;
  }
  const options = [
    `<option value="all">Todos os operadores</option>`,
    ...state.operators.map((operator) => `<option value="${escapeHtml(operator.id)}">${escapeHtml(operator.name || operator.username || "Operador")}</option>`)
  ];
  elements.globalOperatorSelect.innerHTML = options.join("");
  elements.globalOperatorSelect.value = state.overviewSelectedUserId || "all";
}

function hydrateAdminFormFromRecord() {
  if (!canManage()) return;
  const latest = getLatestEntry(state.adminSelectedRecord);
  const fallbackDate = getDefaultResultDate();
  elements.adminDate.value = latest?.date || fallbackDate;
  if (elements.adminOperation) elements.adminOperation.value = "nuvidio";
  if (elements.adminApproved) elements.adminApproved.value = "";
  if (elements.adminReproved) elements.adminReproved.value = "";
  if (elements.adminPending) elements.adminPending.value = "";
  if (elements.adminNoAction) elements.adminNoAction.value = "";
  elements.adminProduction.value = Number.isFinite(latest?.productionTotal) ? String(latest.productionTotal) : "";
  elements.adminEffectiveness.value = Number.isFinite(latest?.effectiveness) ? String(latest.effectiveness) : "";
  elements.adminQuality.value = Number.isFinite(latest?.qualityScore) ? String(latest.qualityScore) : "";
  syncAdminCalculatedMetrics();
}

function setSection(sectionId) {
  let nextSection = String(sectionId || "dashboard");
  if (nextSection === "my-results") {
    nextSection = "dashboard";
  }
  const hasSection = elements.sections.some((section) => section.id === nextSection);
  if (!hasSection) {
    nextSection = "dashboard";
  }

  state.section = nextSection;
  elements.sections.forEach((section) => section.classList.toggle("active", section.id === nextSection));
  elements.navLinks.forEach((button) => button.classList.toggle("active", button.dataset.section === nextSection));
  elements.heroHeader?.classList.remove("hidden");
  elements.heroGrid?.classList.toggle("hidden", nextSection !== "dashboard");
  updateGlobalOperatorFilterVisibility();
}

function updateGlobalOperatorFilterVisibility() {
  const shouldShow = canManage() && state.section === "dashboard";
  elements.globalOperatorFilter?.classList.toggle("hidden", !shouldShow);
}

function canManage() {
  return Boolean(state.session?.role && ACCESS_LEVELS[state.session.role]?.canManage);
}

function toggleProfileMenu() {
  const expanded = elements.profileTrigger.getAttribute("aria-expanded") === "true";
  elements.profileTrigger.setAttribute("aria-expanded", expanded ? "false" : "true");
  elements.profileDropdown.classList.toggle("hidden", expanded);
}

function closeProfileMenu() {
  elements.profileTrigger?.setAttribute("aria-expanded", "false");
  elements.profileDropdown?.classList.add("hidden");
}

function handleDocumentClick(event) {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (elements.profileDropdown.contains(target) || elements.profileTrigger.contains(target)) return;
  closeProfileMenu();
}

function handleThemeToggle() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  state.theme = nextTheme;
  applyTheme(nextTheme);
  saveTheme(nextTheme);
  if (state.session) {
    state.session = { ...state.session, theme: nextTheme };
    saveSession(state.session);
  }
}

function applyTheme(theme) {
  elements.body?.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return saved && typeof saved === "object" ? saved : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

function loadTheme() {
  try {
    const sessionTheme = loadSession()?.theme;
    if (sessionTheme === "light" || sessionTheme === "dark") return sessionTheme;
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

async function fetchJson(url, options = {}) {
  const timeoutMs = Number.isFinite(options?.timeoutMs) ? Number(options.timeoutMs) : 30000;
  const { timeoutMs: _timeoutMs, ...fetchOptions } = options || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.error || "Falha na comunicacao com a API.");
    }
    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Tempo limite excedido na comunicacao com o servidor.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeRecord(record) {
  if (!record || typeof record !== "object") return null;
  const entries = (Array.isArray(record.entries) ? record.entries : []).map((entry) => {
    const date = normalizeDateKey(entry?.date);
    const productionTotal = Number(entry?.productionTotal);
    const effectiveness = Number(entry?.effectiveness);
    const qualityScore = Number(entry?.qualityScore);
    if (!date || !Number.isFinite(productionTotal) || !Number.isFinite(effectiveness) || !Number.isFinite(qualityScore)) {
      return null;
    }
    return {
      date,
      productionTotal,
      effectiveness,
      qualityScore,
      updatedAt: String(entry?.updatedAt || ""),
      updatedById: String(entry?.updatedById || ""),
      updatedByName: String(entry?.updatedByName || "Gestor")
    };
  }).filter(Boolean);
  if (!entries.length) return null;
  entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latest = entries[entries.length - 1];

  return {
    userId: String(record.userId || ""),
    userName: String(record.userName || ""),
    username: String(record.username || ""),
    entries,
    daysCount: entries.length,
    productionAverage: entries.reduce((sum, entry) => sum + entry.productionTotal, 0) / entries.length,
    productionTotal: latest.productionTotal,
    effectiveness: latest.effectiveness,
    qualityScore: latest.qualityScore,
    updatedAt: latest.updatedAt,
    updatedById: latest.updatedById,
    updatedByName: latest.updatedByName
  };
}

function getLatestEntry(record) {
  return Array.isArray(record?.entries) && record.entries.length ? record.entries[record.entries.length - 1] : null;
}

function getRecordAverages(record) {
  const entries = Array.isArray(record?.entries) ? record.entries : [];
  const count = entries.length;
  if (!count) {
    return { production: null, effectiveness: null, quality: null };
  }

  const productionSum = entries.reduce((sum, entry) => sum + Number(entry.productionTotal || 0), 0);
  const effectivenessSum = entries.reduce((sum, entry) => sum + Number(entry.effectiveness || 0), 0);
  const qualitySum = entries.reduce((sum, entry) => sum + Number(entry.qualityScore || 0), 0);

  return {
    production: productionSum / count,
    effectiveness: effectivenessSum / count,
    quality: qualitySum / count
  };
}

function getRecentEntries(record, maxItems = 10) {
  const entries = Array.isArray(record?.entries) ? [...record.entries] : [];
  entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (entries.length <= maxItems) return entries;
  return entries.slice(entries.length - maxItems);
}

function buildLineChartSvg(entries, field, color, fixedMax = null) {
  const values = entries.map((entry) => Number(entry?.[field] || 0));
  const labels = entries.map((entry) => shortDate(entry?.date));
  const width = Math.max(560, (Math.max(values.length, 2) - 1) * 86 + 92);
  const isScrollable = values.length > 7;
  const height = 220;
  const padLeft = 22;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 34;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const denom = Math.max(values.length - 1, 1);
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 1);
  const spread = Math.max(rawMax - rawMin, 1);
  const dynamicPad = Math.max(spread * 0.24, field === "productionTotal" ? 6 : 4);
  let minValue = Math.max(0, rawMin - dynamicPad);
  let maxValue = rawMax + dynamicPad;
  if (Number.isFinite(fixedMax)) {
    maxValue = Math.min(Math.max(fixedMax, maxValue), fixedMax);
  }
  if (maxValue <= minValue) {
    maxValue = minValue + 1;
  }

  const points = values.map((value, index) => {
    const x = padLeft + (innerW * index) / denom;
    const ratio = (value - minValue) / Math.max(maxValue - minValue, 1);
    const y = padTop + innerH - ratio * innerH;
    return { x, y, value };
  });

  const polyline = points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const areaPoints = `${padLeft},${height - padBottom} ${polyline} ${width - padRight},${height - padBottom}`;

  chartIdSeed += 1;
  const gradientId = `trend-fill-${field}-${chartIdSeed}`;
  const valueSuffix = field === "effectiveness" || field === "qualityScore" ? "%" : "";
  const chipStep = values.length > 20 ? 3 : values.length > 12 ? 2 : 1;
  const xLabelStep = values.length > 18 ? 3 : values.length > 10 ? 2 : 1;
  return `
    <div class="trend-scroll${isScrollable ? " is-scrollable" : ""}">
      <svg
        class="trend-svg"
        viewBox="0 0 ${width} ${height}"
        style="${isScrollable ? `width:${width}px;height:${height}px;` : `width:100%;height:${height}px;`}"
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="Grafico de tendencia"
      >
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.35"></stop>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.02"></stop>
          </linearGradient>
        </defs>
        <path d="M ${padLeft} ${height - padBottom} L ${width - padRight} ${height - padBottom}" class="trend-axis"></path>
        <polygon points="${areaPoints}" fill="url(#${gradientId})"></polygon>
        <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${points.map((point, index) => {
          const shouldShowLabel = index === 0 || index === points.length - 1 || index % chipStep === 0;
          if (!shouldShowLabel) return "";
          const labelText = formatMetric(point.value, valueSuffix);
          const labelWidth = Math.max(28, (labelText.length * 6.2) + 12);
          const labelX = Math.max(
            padLeft,
            Math.min(point.x - (labelWidth / 2), (width - padRight) - labelWidth)
          );
          const labelY = Math.max(padTop + 2, point.y - 24);
          return `
            <g class="trend-point-chip">
              <rect
                x="${labelX.toFixed(2)}"
                y="${labelY.toFixed(2)}"
                width="${labelWidth.toFixed(2)}"
                height="18"
                rx="6"
                ry="6"
              ></rect>
              <text
                x="${(labelX + (labelWidth / 2)).toFixed(2)}"
                y="${(labelY + 12).toFixed(2)}"
                class="trend-point-label"
                text-anchor="middle"
              >${escapeHtml(labelText)}</text>
          </g>
        `;
      }).join("")}
      ${points.map((point) => `
        <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3.4" fill="${color}"></circle>
      `).join("")}
      ${points.map((point, index) => {
        const showXLabel = index === 0 || index === points.length - 1 || index % xLabelStep === 0;
        if (!showXLabel) return "";
        return `<text x="${point.x.toFixed(2)}" y="${(height - 10).toFixed(2)}" class="trend-x-label" text-anchor="middle">${escapeHtml(labels[index] || "--")}</text>`;
      }).join("")}
      </svg>
    </div>
  `;
}

function buildMiniBars(items, color) {
  const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1);
  const hasManyItems = items.length > 8;
  const gridClass = hasManyItems ? "bars-grid bars-grid-wide" : "bars-grid";
  const gridStyle = hasManyItems ? ` style="grid-template-columns: repeat(${items.length}, minmax(62px, 62px));"` : "";
  return `
    <div class="bars-scroll${hasManyItems ? " is-scrollable" : ""}">
      <div class="${gridClass}"${gridStyle}>
      ${items.map((item) => {
        const heightPercent = (Number(item.value || 0) / maxValue) * 100;
        return `
          <div class="bar-item" title="${escapeHtml(item.label)}: ${escapeHtml(formatMetric(item.value))}">
            <div class="bar-track">
              <span class="bar-fill" style="height:${heightPercent.toFixed(2)}%; background:${color};"></span>
            </div>
            <span class="bar-value">${escapeHtml(formatMetric(item.value))}</span>
            <span class="bar-label">${escapeHtml(item.label)}</span>
          </div>
        `;
      }).join("")}
      </div>
    </div>
  `;
}

function buildDeltaCard(label, value, delta, suffix) {
  const deltaValue = Number(delta || 0);
  const tone = deltaValue >= 0 ? "up" : "down";
  const deltaPrefix = deltaValue >= 0 ? "+" : "";
  return `
    <article class="visual-card">
      <p class="visual-label">${escapeHtml(label)}</p>
      <strong>${escapeHtml(formatMetric(value, suffix))}</strong>
      <span class="delta-pill ${tone}">${escapeHtml(`${deltaPrefix}${formatMetric(deltaValue, suffix)}`)}</span>
    </article>
  `;
}

function buildProgressVisual(label, percent) {
  const safe = clampPercent(percent);
  return `
    <article class="visual-card visual-progress">
      <p class="visual-label">${escapeHtml(label)}</p>
      <div class="progress-ring" style="--progress:${safe.toFixed(2)}%;">
        <span>${escapeHtml(formatMetric(safe, "%"))}</span>
      </div>
    </article>
  `;
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function shortDate(dateValue) {
  const normalized = normalizeDateKey(dateValue);
  if (!normalized) return "--";
  const [, month, day] = normalized.split("-");
  return `${day}/${month}`;
}

function getPrimaryViewRecord() {
  if (!canManage()) return state.myRecord;
  return state.adminSelectedRecord || state.myRecord;
}

function getOverviewViewRecord() {
  if (!canManage()) return state.myRecord;
  if (state.overviewSelectedUserId === "all") {
    return buildOperationAggregateRecord();
  }
  const selected = (state.operationRecords || []).find((record) => record?.userId === state.overviewSelectedUserId);
  return selected || state.adminSelectedRecord || state.myRecord;
}

function getSelectedOperatorName() {
  if (!canManage()) return "";
  const selected = state.operators.find((user) => user.id === state.adminSelectedUserId);
  return String(selected?.name || selected?.username || "").trim();
}

function getOverviewSelectedOperatorName() {
  if (!canManage()) return "";
  if (state.overviewSelectedUserId === "all") return "Todos os operadores";
  const selected = state.operators.find((user) => user.id === state.overviewSelectedUserId);
  return String(selected?.name || selected?.username || "").trim();
}

function buildOperationAggregateRecord() {
  const byDate = new Map();
  for (const record of state.operationRecords || []) {
    for (const entry of record?.entries || []) {
      const date = normalizeDateKey(entry?.date);
      if (!date) continue;
      const prev = byDate.get(date) || {
        date,
        productionTotal: 0,
        effectivenessSum: 0,
        qualitySum: 0,
        count: 0,
        updatedAt: "",
        updatedByName: "Gestor",
        updatedById: ""
      };
      prev.productionTotal += Number(entry?.productionTotal || 0);
      prev.effectivenessSum += Number(entry?.effectiveness || 0);
      prev.qualitySum += Number(entry?.qualityScore || 0);
      prev.count += 1;

      const currentUpdated = Date.parse(prev.updatedAt || "") || 0;
      const nextUpdated = Date.parse(entry?.updatedAt || "") || 0;
      if (nextUpdated >= currentUpdated) {
        prev.updatedAt = String(entry?.updatedAt || "");
        prev.updatedByName = String(entry?.updatedByName || "Gestor");
        prev.updatedById = String(entry?.updatedById || "");
      }
      byDate.set(date, prev);
    }
  }

  const entries = [...byDate.values()]
    .map((item) => ({
      date: item.date,
      productionTotal: item.productionTotal,
      effectiveness: item.count ? item.effectivenessSum / item.count : 0,
      qualityScore: item.count ? item.qualitySum / item.count : 0,
      updatedAt: item.updatedAt,
      updatedByName: item.updatedByName,
      updatedById: item.updatedById
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  if (!entries.length) return null;
  const latest = entries[entries.length - 1];
  return {
    userId: "all",
    userName: "Todos os operadores",
    username: "",
    entries,
    daysCount: entries.length,
    productionAverage: entries.reduce((sum, entry) => sum + entry.productionTotal, 0) / entries.length,
    productionTotal: latest.productionTotal,
    effectiveness: latest.effectiveness,
    qualityScore: latest.qualityScore,
    updatedAt: latest.updatedAt,
    updatedById: latest.updatedById,
    updatedByName: latest.updatedByName
  };
}

function renderMetricCard(metric) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(metric.label)}</span>
      <strong>${escapeHtml(formatMetric(metric.value, metric.suffix || ""))}</strong>
    </article>
  `;
}

function buildPerformanceMessage(entry) {
  if (!entry) {
    return {
      title: "Aguardando primeiro lancamento",
      copy: "Este espaco passa a trazer um resumo automatico assim que os resultados forem cadastrados.",
      badge: "Pendente"
    };
  }
  if (entry.qualityScore >= 90 && entry.effectiveness >= 35) {
    return {
      title: "Leitura positiva",
      copy: "Seu ultimo resultado mostra boa consistencia entre qualidade e conversao.",
      badge: "Em destaque"
    };
  }
  if (entry.qualityScore < 85) {
    return {
      title: "Atencao na qualidade",
      copy: "Vale revisar o atendimento recente para recuperar aderencia e seguranca na operacao.",
      badge: "Qualidade"
    };
  }
  return {
    title: "Espaco para ganhar tracao",
    copy: "Voce ja tem base registrada. Agora o foco e crescer producao e efetividade sem perder qualidade.",
    badge: "Evolucao"
  };
}

function emptyState(title, message) {
  return `
    <div class="empty-state">
      <div>
        <p class="eyebrow">${escapeHtml(title)}</p>
        <h3>${escapeHtml(message)}</h3>
      </div>
    </div>
  `;
}

function showLoginError(message) {
  elements.loginError.textContent = message;
  elements.loginError.classList.remove("hidden");
}

function clearLoginError() {
  elements.loginError.textContent = "";
  elements.loginError.classList.add("hidden");
}

function setUploadStatus(message, tone = "loading") {
  if (!elements.uploadStatus) return;
  const text = String(message || "").trim();
  elements.uploadStatus.classList.remove("hidden", "success", "error");

  if (!text) {
    elements.uploadStatus.textContent = "";
    elements.uploadStatus.classList.add("hidden");
    return;
  }

  elements.uploadStatus.textContent = text;
  if (tone === "success") elements.uploadStatus.classList.add("success");
  if (tone === "error") elements.uploadStatus.classList.add("error");
}

function setBusy(isBusy) {
  elements.body?.classList.toggle("booting", Boolean(isBusy));
  if (elements.bootLoader) elements.bootLoader.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function getInitials(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "OP";
  return `${parts[0][0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
}

function parseMetricInput(value, options = {}) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (options.percent && value > 0 && value <= 1) return value * 100;
    return value;
  }

  let normalized = String(value || "").trim();
  if (!normalized) return null;

  normalized = normalized.replace(/\s+/g, "");
  const hasPercent = normalized.includes("%");
  normalized = normalized.replace(/%/g, "");

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");
  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  normalized = normalized.replace(/[^0-9.-]/g, "");
  if (!normalized || normalized === "-" || normalized === ".") return null;
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return null;

  if (options.percent && (hasPercent || (numeric > 0 && numeric <= 1))) {
    return numeric * 100;
  }

  return numeric;
}

function normalizeOperationType(value) {
  const text = normalizeLooseText(value);
  if (text.includes("0800")) return "0800";
  if (text.includes("nuvidio")) return "nuvidio";
  return "nuvidio";
}

function calculateDailyTotalsByOperation({ operation, approved, reproved, pending, noAction }) {
  const approvedSafe = Number.isFinite(approved) ? Math.max(0, approved) : 0;
  const reprovedSafe = Number.isFinite(reproved) ? Math.max(0, reproved) : 0;
  const pendingSafe = Number.isFinite(pending) ? Math.max(0, pending) : 0;
  const noActionSafe = Number.isFinite(noAction) ? Math.max(0, noAction) : 0;
  const operationNormalized = normalizeOperationType(operation);
  const effectiveTotal = operationNormalized === "0800"
    ? approvedSafe + reprovedSafe + pendingSafe
    : approvedSafe + reprovedSafe;
  const total = effectiveTotal + noActionSafe;
  const effectiveness = total > 0 ? (effectiveTotal / total) * 100 : 0;
  return { operation: operationNormalized, total, effectiveness };
}

function syncAdminCalculatedMetrics() {
  const operation = normalizeOperationType(elements.adminOperation?.value || "nuvidio");
  syncAdminOperationFields(operation);
  const approved = parseMetricInput(elements.adminApproved?.value);
  const reproved = parseMetricInput(elements.adminReproved?.value);
  const pending = parseMetricInput(elements.adminPending?.value);
  const noAction = parseMetricInput(elements.adminNoAction?.value);

  const hasRequired =
    Number.isFinite(approved) &&
    Number.isFinite(reproved) &&
    Number.isFinite(noAction) &&
    (operation === "0800" ? Number.isFinite(pending) : true);

  if (!hasRequired) {
    if (elements.adminProduction) elements.adminProduction.value = "";
    if (elements.adminEffectiveness) elements.adminEffectiveness.value = "";
    return;
  }

  const { total, effectiveness } = calculateDailyTotalsByOperation({
    operation,
    approved,
    reproved,
    pending: Number.isFinite(pending) ? pending : 0,
    noAction
  });

  if (elements.adminProduction) elements.adminProduction.value = String(total);
  if (elements.adminEffectiveness) elements.adminEffectiveness.value = String(Number(effectiveness.toFixed(2)));
}

function syncAdminOperationFields(operationInput = null) {
  const operation = normalizeOperationType(operationInput ?? elements.adminOperation?.value ?? "nuvidio");
  const is0800 = operation === "0800";
  if (elements.adminPendingWrap) {
    elements.adminPendingWrap.classList.toggle("hidden", !is0800);
  }
  if (!is0800 && elements.adminPending) {
    elements.adminPending.value = "";
  }
}
function normalizeDateKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeSpreadsheetDate(value) {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel serial date (base 1899-12-30)
    const excelBase = new Date(Date.UTC(1899, 11, 30));
    const asDate = new Date(excelBase.getTime() + Math.floor(value) * 86400000);
    if (Number.isNaN(asDate.getTime())) return "";
    const year = asDate.getUTCFullYear();
    const month = String(asDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(asDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function toIsoDateSafe(yearInput, monthInput, dayInput) {
    const year = Number(yearInput);
    const month = Number(monthInput);
    const day = Number(dayInput);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return "";
    if (month < 1 || month > 12 || day < 1 || day > 31) return "";
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(parsed.getTime())) return "";
    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() + 1 !== month ||
      parsed.getUTCDate() !== day
    ) {
      return "";
    }
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const normalized = normalizeDateKey(value);
  if (normalized) return normalized;

  const text = String(value || "").trim();
  if (!text) return "";
  const noTime = text.split(/[ T]/)[0];

  const ddmmyyyy = noTime.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    return toIsoDateSafe(ddmmyyyy[3], ddmmyyyy[2], ddmmyyyy[1]);
  }

  const ddmmyy = noTime.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
  if (ddmmyy) {
    const shortYear = Number(ddmmyy[3]);
    const fullYear = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear;
    return toIsoDateSafe(fullYear, ddmmyy[2], ddmmyy[1]);
  }

  const yyyymmdd = noTime.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    return toIsoDateSafe(yyyymmdd[1], yyyymmdd[2], yyyymmdd[3]);
  }

  return "";
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer || new ArrayBuffer(0));
  const chunkSize = 32768;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function getDefaultResultDate() {
  const base = new Date();
  base.setDate(base.getDate() - 1);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMetric(value, suffix = "") {
  if (!Number.isFinite(value)) return `--${suffix}`;
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)}${suffix}`;
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hh = String(Math.floor(safe / 3600)).padStart(2, "0");
  const mm = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatDate(value) {
  const normalized = normalizeDateKey(value);
  if (!normalized) return "--";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

function formatMonthKey(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})$/);
  if (!match) return "--";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(Date.UTC(year, month - 1, 1));
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function formatDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(parsed);
}

function normalizeLooseText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findColumnIndex(header, aliases) {
  if (!Array.isArray(header) || !Array.isArray(aliases)) return -1;
  const normalizedAliases = aliases.map((alias) => normalizeLooseText(alias));
  for (let index = 0; index < header.length; index += 1) {
    const column = normalizeLooseText(header[index]);
    if (!column) continue;
    if (normalizedAliases.some((alias) => column === alias || column.includes(alias) || alias.includes(column))) {
      return index;
    }
  }
  return -1;
}
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

