const STORAGE_KEY = "pulse-kb-content-v1";
const META_KEY = "pulse-kb-meta-v1";
const THEME_KEY = "pulse-kb-theme-v1";
const SESSION_KEY = "pulse-kb-session-v1";
const USERS_KEY = "pulse-kb-users-v1";
const VIEW_KEY = "pulse-kb-view-v1";
const SELECTED_CONTENT_KEY = "pulse-kb-selected-content-v1";
const REMOTE_API_BASE = "/api";
const REMOTE_STATE_URL = `${REMOTE_API_BASE}/state`;
const REMOTE_USERS_URL = `${REMOTE_API_BASE}/users`;
const REMOTE_CONTENT_URL = `${REMOTE_API_BASE}/content`;
const REMOTE_NOTIFICATION_SEEN_URL = `${REMOTE_API_BASE}/notifications/seen`;
const REMOTE_SYNC_INTERVAL = 8000;
const APP_SCHEMA_VERSION = 2;
const DEFAULT_THEME = "dark";
const TEMP_PASSWORD = "Trocar@01";
const DEFAULT_PLATFORM_USER = {
  id: "default-admin-kr",
  name: "Administrador KR",
  username: "admin.kr",
  password: "gestor123",
  role: "gestor"
};
const ACCESS_LEVELS = {
  gestor: { role: "gestor", label: "Gestor", canEdit: true },
  operador: { role: "operador", label: "Operador", canEdit: false }
};

const REMOVED_USERNAMES = new Set(["joao.fonseca", "crislaine.costa"]);

const categories = [
  { id: "scripts", name: "Scripts de Atendimento", description: "Abordagens prontas para abertura, contorno de objecoes e encerramento.", icon: "\u{1F4DE}", tone: "success" },
  { id: "manuals", name: "Manuais e Procedimentos", description: "Passo a passo operacional para tratativas, sistemas e validacoes.", icon: "\u{1F4D8}", tone: "info" },
  { id: "alerts", name: "Informativos Importantes", description: "Mudancas urgentes de regra, alertas de operacao e comunicados internos.", icon: "\u26A0\uFE0F", tone: "alert" },
  { id: "faq", name: "Perguntas Frequentes", description: "Respostas curtas para duvidas recorrentes durante o atendimento.", icon: "\u2753", tone: "info" }
];

const types = [
  { id: "script", name: "Script" },
  { id: "manual", name: "Manual" },
  { id: "documento", name: "Documento Word/PDF" },
  { id: "informativo", name: "Informativo" },
  { id: "faq", name: "FAQ" }
];

const mockContent = [
  {
    id: crypto.randomUUID(),
    title: "Script de abertura para cartao consignado BMG",
    category: "scripts",
    type: "script",
    summary: "Abordagem inicial com validacao de dados e contextualizacao objetiva do contato.",
    tags: ["BMG", "Cartao", "Consignado"],
    keywords: ["abertura", "saudacao", "confirmacao", "dados", "cartao"],
    featured: true,
    urgent: false,
    allowCopy: true,
    helpful: { yes: 21, no: 2 },
    accessCount: 64,
    updatedAt: "2026-04-12",
    body: [
      "CALL OUT::success::Script pronto para leitura em voz alta durante os primeiros 30 segundos da chamada.",
      "Bom dia, meu nome e [NOME DO OPERADOR], falo em nome da central de relacionamento BMG.",
      "Para seguir com seguranca, confirme por favor seu nome completo e os tres primeiros digitos do CPF.",
      "- Identificar se o cliente ja possui o cartao ativo",
      "- Confirmar se deseja informacao, desbloqueio ou segunda via",
      "- Direcionar para a proxima tratativa sem pausas longas",
      "Finalize reforcando o beneficio principal e o proximo passo acordado."
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Procedimento de segunda via de boleto",
    category: "manuals",
    type: "manual",
    summary: "Fluxo operacional para localizar contrato, validar titularidade e reenviar boleto.",
    tags: ["Boleto", "Financeiro", "Emprestimo"],
    keywords: ["segunda via", "boleto", "reenviar", "contrato", "vencimento"],
    featured: false,
    urgent: false,
    allowCopy: false,
    helpful: { yes: 17, no: 1 },
    accessCount: 43,
    updatedAt: "2026-04-13",
    body: [
      "CALL OUT::info::Sempre confirme titularidade antes de informar valores ou codigo de barras.",
      "- Acesse o sistema de contratos e pesquise por CPF ou numero do contrato",
      "- Valide nome da mae, data de nascimento e telefone cadastrado",
      "- Confirme a parcela e a data de vencimento solicitada",
      "- Gere a segunda via e informe canal de envio disponivel",
      "Se o cliente estiver com atraso superior a 60 dias, transferir para a fila de negociacao especializada."
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Informativo urgente sobre bloqueio preventivo de senha",
    category: "alerts",
    type: "informativo",
    summary: "Nova regra para bloqueio preventivo quando houver tres tentativas invalidas de autenticacao.",
    tags: ["Senha", "Seguranca", "Urgente"],
    keywords: ["bloqueio", "senha", "seguranca", "tentativas", "autenticacao"],
    featured: true,
    urgent: true,
    allowCopy: false,
    helpful: { yes: 11, no: 0 },
    accessCount: 29,
    updatedAt: "2026-04-14",
    body: [
      "CALL OUT::alert::Vigencia imediata a partir de 14/04/2026 para todos os canais de atendimento.",
      "Clientes com tres tentativas invalidas consecutivas devem ter a senha bloqueada preventivamente.",
      "- Nao realizar desbloqueio manual sem validacao reforcada",
      "- Registrar o motivo no CRM com a tag Seguranca Preventiva",
      "- Orientar o cliente sobre prazo de regularizacao e canal oficial",
      "Escalar para mesa de apoio quando houver relato de fraude ou troca nao reconhecida."
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "FAQ de desbloqueio de cartao",
    category: "faq",
    type: "faq",
    summary: "Respostas curtas para duvidas comuns sobre desbloqueio, prazo e canais disponiveis.",
    tags: ["Cartao", "Desbloqueio", "FAQ"],
    keywords: ["desbloqueio", "prazo", "senha", "sms", "cartao"],
    featured: true,
    urgent: false,
    allowCopy: true,
    helpful: { yes: 31, no: 3 },
    accessCount: 58,
    updatedAt: "2026-04-11",
    body: [
      "Quanto tempo leva o desbloqueio? O desbloqueio ocorre em ate 30 minutos apos validacao concluida.",
      "Se o SMS nao chegar, confirme numero cadastrado, tente novo envio e registre tentativa no CRM.",
      "- Cartao virtual: desbloqueio imediato apos autenticacao",
      "- Cartao fisico: confirmar recebimento e dados de seguranca",
      "- Suspeita de fraude: interromper procedimento e escalar"
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Script de contorno para reclamacao de juros",
    category: "scripts",
    type: "script",
    summary: "Modelo de resposta para explicar composicao de juros sem gerar conflito com o cliente.",
    tags: ["Juros", "Negociacao", "Retencao"],
    keywords: ["juros", "reclamacao", "contorno", "negociacao", "retencao"],
    featured: false,
    urgent: false,
    allowCopy: true,
    helpful: { yes: 15, no: 2 },
    accessCount: 26,
    updatedAt: "2026-04-10",
    body: [
      "Entendo sua colocacao e vou te explicar de forma clara como esse valor foi composto.",
      "Os juros seguem a contratacao firmada e podem variar conforme atraso, encargos e data de pagamento.",
      "- Reforcar empatia antes de explicar valores",
      "- Evitar linguagem tecnica sem contexto",
      "- Oferecer simulacao de regularizacao quando aplicavel",
      "Finalize perguntando se o cliente deseja consultar melhor condicao de pagamento."
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Procedimento para atualizacao cadastral",
    category: "manuals",
    type: "manual",
    summary: "Checklist rapido para atualizar telefone, endereco e email do cliente com seguranca.",
    tags: ["Cadastro", "Dados", "Atualizacao"],
    keywords: ["cadastro", "email", "telefone", "endereco", "validacao"],
    featured: false,
    urgent: false,
    allowCopy: false,
    helpful: { yes: 13, no: 1 },
    accessCount: 22,
    updatedAt: "2026-04-09",
    body: [
      "- Confirmar autenticacao completa antes da alteracao",
      "- Atualizar um dado por vez e ler de volta para o cliente",
      "- Registrar protocolo e canal de origem",
      "CALL OUT::info::Emails com dominio temporario exigem dupla confirmacao.",
      "Se houver divergencia entre cadastro e documento, direcionar para retaguarda documental."
    ]
  }
];

const state = {
  app: "knowledge-base",
  schemaVersion: APP_SCHEMA_VERSION,
  query: "",
  section: "explorer",
  selectedContentId: null,
  filters: { categories: [], types: [], tags: [] },
  content: [],
  contentHydrated: false,
  meta: createDefaultMeta(),
  users: [DEFAULT_PLATFORM_USER],
  session: loadSession(),
  theme: DEFAULT_THEME
};

let remoteSyncTimer = null;
let presenceSyncTimer = null;
let remotePushInFlight = false;
let remotePushPromise = null;
let remotePullInFlight = false;
let remoteSyncPending = false;
let remoteChangeRevision = 0;
let remoteContentSignature = "";
let editorAttachments = [];
let pendingUrgentNotificationId = null;
let operationalQuery = "";
let operationalStatusFilter = "all";
let auditContentId = "";
let auditTabFilter = "seen";
let operationalUserId = "";
let livePanelTimer = null;
let lastDetailRenderKey = "";

const elements = {
  appShell: document.querySelector("#app-shell"),
  loginScreen: document.querySelector("#login-screen"),
  loginForm: document.querySelector("#login-form"),
  loginUsername: document.querySelector("#login-username"),
  loginPassword: document.querySelector("#login-password"),
  loginError: document.querySelector("#login-error"),
  globalSearch: document.querySelector("#global-search"),
  categoryCards: document.querySelector("#category-cards"),
  categoryFilters: document.querySelector("#category-filters"),
  typeFilters: document.querySelector("#type-filters"),
  tagFilters: document.querySelector("#tag-filters"),
  resultsList: document.querySelector("#results-list"),
  favoritesList: document.querySelector("#favorites-list"),
  activeFilters: document.querySelector("#active-filters"),
  recentUpdates: document.querySelector("#recent-updates"),
  mostAccessed: document.querySelector("#most-accessed"),
  historyPanel: document.querySelector("#history-panel"),
  heroStats: document.querySelector("#hero-stats"),
  adminList: document.querySelector("#admin-list"),
  usersList: document.querySelector("#users-list"),
  presenceList: document.querySelector("#presence-list"),
  operationalList: document.querySelector("#operational-list"),
  operationalSearch: document.querySelector("#operational-search"),
  operationalFilterOnline: document.querySelector("#operational-filter-online"),
  operationalFilterOffline: document.querySelector("#operational-filter-offline"),
  operationalUserModal: document.querySelector("#operational-user-modal"),
  operationalUserClose: document.querySelector("#operational-user-close"),
  operationalUserName: document.querySelector("#operational-user-name"),
  operationalUserStatus: document.querySelector("#operational-user-status"),
  operationalUserTime: document.querySelector("#operational-user-time"),
  operationalUserLastLogin: document.querySelector("#operational-user-last-login"),
  operationalUserForceLogout: document.querySelector("#operational-user-force-logout"),
  contentViewStats: document.querySelector("#content-view-stats"),
  contentAuditModal: document.querySelector("#content-audit-modal"),
    contentAuditTitle: document.querySelector("#content-audit-title"),
    contentAuditClose: document.querySelector("#content-audit-close"),
    contentAuditSeenCount: document.querySelector("#content-audit-seen-count"),
    contentAuditMissingCount: document.querySelector("#content-audit-missing-count"),
    contentAuditTabSeen: document.querySelector("#content-audit-tab-seen"),
    contentAuditTabMissing: document.querySelector("#content-audit-tab-missing"),
    contentAuditActiveLabel: document.querySelector("#content-audit-active-label"),
    contentAuditActiveList: document.querySelector("#content-audit-active-list"),
  themeToggle: document.querySelector("#theme-toggle"),
  notificationTrigger: document.querySelector("#notification-trigger"),
  notificationDropdown: document.querySelector("#notification-dropdown"),
  notificationBadge: document.querySelector("#notification-badge"),
  notificationSummary: document.querySelector("#notification-summary"),
  notificationList: document.querySelector("#notification-list"),
  profileTrigger: document.querySelector("#profile-trigger"),
  profileDropdown: document.querySelector("#profile-dropdown"),
  profileAvatar: document.querySelector("#profile-avatar"),
  logoutButton: document.querySelector("#logout-button"),
  resetPasswordButton: document.querySelector("#reset-password-button"),
  sessionName: document.querySelector("#session-name"),
  sessionRole: document.querySelector("#session-role"),
  sessionNameMenu: document.querySelector("#session-name-menu"),
  sessionRoleMenu: document.querySelector("#session-role-menu"),
  adminSection: document.querySelector("#admin"),
  globalFilterPanel: document.querySelector("#global-filter-panel"),
  urgentModal: document.querySelector("#urgent-modal"),
  urgentModalTitle: document.querySelector("#urgent-modal-title"),
  urgentModalText: document.querySelector("#urgent-modal-text"),
  urgentModalOpen: document.querySelector("#urgent-modal-open"),
  urgentModalClose: document.querySelector("#urgent-modal-close"),
  openContentCreate: document.querySelector("#open-content-create"),
  contentCreateMenu: document.querySelector("#content-create-menu"),
  contentEditorTitle: document.querySelector("#content-editor-title"),
  backFromContentEditor: document.querySelector("#back-from-content-editor"),
  contentViewTitle: document.querySelector("#content-view-title"),
  contentViewBody: document.querySelector("#content-view-body"),
  contentViewEdit: document.querySelector("#content-view-edit"),
  backFromContentView: document.querySelector("#back-from-content-view"),
  clearFilters: document.querySelector("#clear-filters"),
  toggleHistory: document.querySelector("#toggle-history"),
  contentForm: document.querySelector("#content-form"),
  userForm: document.querySelector("#user-form"),
  cancelUserEdit: document.querySelector("#cancel-user-edit"),
  cancelEdit: document.querySelector("#cancel-edit"),
  navLinks: Array.from(document.querySelectorAll(".nav-link")),
  sectionNodes: Array.from(document.querySelectorAll(".content-section")),
  template: document.querySelector("#result-template"),
  form: {
    id: document.querySelector("#content-id"),
    title: document.querySelector("#content-title"),
    category: document.querySelector("#content-category"),
    type: document.querySelector("#content-type"),
    summary: document.querySelector("#content-summary"),
    tags: document.querySelector("#content-tags"),
    keywords: document.querySelector("#content-keywords"),
    body: document.querySelector("#content-body"),
    attachment: document.querySelector("#content-attachment"),
    attachmentInfo: document.querySelector("#content-attachment-info"),
    featured: document.querySelector("#content-featured"),
    script: document.querySelector("#content-script"),
    urgent: document.querySelector("#content-urgent")
  },
  user: {
    id: document.querySelector("#user-id"),
    name: document.querySelector("#user-name"),
    username: document.querySelector("#user-username"),
    role: document.querySelector("#user-role"),
    password: document.querySelector("#user-password")
  }
};

init();

async function init() {
  applyTheme(state.theme || DEFAULT_THEME);
  state.session = loadSession();
  if (state.session?.theme) {
    state.theme = state.session.theme;
    applyTheme(state.session.theme);
  }
  ensureSessionUserInState();
  hydrateSelects();
  bindEvents();
  syncAuthView();
  renderAll();
  remoteContentSignature = getSharedContentSignature();
  startRemoteSync();
  startPresenceSync();
  startLivePanelSync();
  if (state.session) {
    ensureSessionUserInState();
    touchPresence();
    void saveState();
  }
  requestAnimationFrame(() => {
    document.body.classList.remove("booting");
  });

    try {
      await bootstrapRemoteState();
      state.session = loadSession();
      ensureSessionUserInState();
      restoreCurrentUserViewState();
      if (state.session?.theme) {
        state.theme = state.session.theme;
      }
      applyTheme(state.theme || DEFAULT_THEME);
      syncAuthView();
      renderAll();
      remoteContentSignature = getSharedContentSignature();
      void pullRemoteState(true);
    if (state.session) {
      touchPresence();
      void saveState();
    }
    } catch (error) {
      state.contentHydrated = true;
      renderAll();
      void pullRemoteState(true);
    }
  }

function getSharedContentSignature(source = state) {
  try {
    const normalizedContent = Array.isArray(source.content) ? source.content.map((item) => sanitizeContentForStorage(item)) : [];
    return JSON.stringify({
      app: source.app || "knowledge-base",
      schemaVersion: Number(source.schemaVersion || 0),
      content: normalizedContent,
      meta: source.meta || {},
      users: source.users || [],
      section: source.section || "",
      selectedContentId: source.selectedContentId || null,
      theme: source.theme || DEFAULT_THEME
    });
  } catch (error) {
    return "";
  }
}

function sanitizeUsers(users) {
  return (Array.isArray(users) ? users : []).filter((item) => {
    const username = normalizeUsername(item?.username);
    const name = normalizeUsername(item?.name);
    return !REMOVED_USERNAMES.has(username) && !REMOVED_USERNAMES.has(name);
  });
}

function ensureSessionUserInState() {
  if (!state.session?.id) return;
  state.users = Array.isArray(state.users) ? state.users : [];
  const exists = state.users.some((item) => item && item.id === state.session.id);
  if (exists) return;
  state.users.unshift({
    id: state.session.id,
    name: state.session.name || "Usuario",
    username: state.session.username || "",
    role: state.session.role || "operador",
    password: "",
    mustChangePassword: Boolean(state.session.mustChangePassword)
  });
}

function ensureUserRecordInState(user) {
  if (!user?.id) return;
  state.users = Array.isArray(state.users) ? state.users : [];
  const userIndex = state.users.findIndex((item) => item && item.id === user.id);
  const nextUser = {
    id: String(user.id),
    name: String(user.name || "Usuario"),
    username: String(user.username || ""),
    email: String(user.email || ""),
    role: String(user.role || "operador"),
    password: String(user.password || ""),
    mustChangePassword: Boolean(user.mustChangePassword),
    active: user.active !== false
  };
  if (userIndex >= 0) {
    state.users.splice(userIndex, 1, { ...state.users[userIndex], ...nextUser });
  } else {
    state.users.unshift(nextUser);
  }
}

function createDefaultMeta() {
  return {
    favorites: [],
    searchHistory: [],
    seenNotifications: {},
    alertedUrgentNotifications: {},
    activePresence: {},
    forcedLogouts: {},
    userViewState: {}
  };
}

function createDefaultSnapshot() {
  return {
    app: "knowledge-base",
    schemaVersion: APP_SCHEMA_VERSION,
    content: [],
    contentHydrated: false,
    meta: createDefaultMeta(),
    users: [DEFAULT_PLATFORM_USER],
    section: "explorer",
    selectedContentId: null,
    theme: DEFAULT_THEME
  };
}

async function bootstrapRemoteState() {
  const remoteState = await fetchRemoteState();
  const hasKnowledgeState =
    remoteState &&
    typeof remoteState === "object" &&
    (remoteState.app === "knowledge-base" || Array.isArray(remoteState.content) || remoteState.meta || remoteState.selectedContentId || remoteState.theme);
  if (!hasKnowledgeState) {
    const snapshot = createDefaultSnapshot();
    state.content = snapshot.content;
    state.meta = snapshot.meta;
    state.users = snapshot.users;
    state.section = snapshot.section;
    state.selectedContentId = snapshot.selectedContentId;
    state.theme = snapshot.theme;
    state.schemaVersion = snapshot.schemaVersion;
    state.contentHydrated = true;
    void pushRemoteState(true);
    return;
  }

  const needsReset = Number(remoteState.schemaVersion || 0) !== APP_SCHEMA_VERSION;
  const persistedUsers =
    Array.isArray(remoteState.users) && remoteState.users.length
      ? remoteState.users
      : [DEFAULT_PLATFORM_USER];
    state.schemaVersion = APP_SCHEMA_VERSION;
    state.content = needsReset ? [] : normalizeContentCollection(remoteState.content);
    state.contentHydrated = true;
    state.meta = normalizeMeta(remoteState.meta);
  state.users = sanitizeUsers(persistedUsers);
  state.section = typeof remoteState.section === "string" && remoteState.section ? remoteState.section : "explorer";
  state.selectedContentId = typeof remoteState.selectedContentId === "string" ? remoteState.selectedContentId : null;
  state.theme = remoteState.theme === "light" ? "light" : DEFAULT_THEME;
  restoreCurrentUserViewState();
  if (needsReset) {
    state.meta = createDefaultMeta();
    state.selectedContentId = null;
    state.section = "explorer";
    void pushRemoteState(true);
  }
}

async function fetchRemoteState() {
  try {
    const response = await fetch(REMOTE_STATE_URL, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    const remoteState = payload?.state && typeof payload.state === "object" ? payload.state : payload;
    if (!remoteState || typeof remoteState !== "object") return null;
    return remoteState;
  } catch (error) {
    return null;
  }
}

function normalizeMeta(value) {
  return {
    favorites: Array.isArray(value?.favorites) ? value.favorites : [],
    searchHistory: Array.isArray(value?.searchHistory) ? value.searchHistory : [],
    seenNotifications: value?.seenNotifications && typeof value.seenNotifications === "object" ? value.seenNotifications : {},
    alertedUrgentNotifications:
      value?.alertedUrgentNotifications && typeof value.alertedUrgentNotifications === "object"
        ? value.alertedUrgentNotifications
        : {},
    activePresence: value?.activePresence && typeof value.activePresence === "object" ? value.activePresence : {},
    forcedLogouts: value?.forcedLogouts && typeof value.forcedLogouts === "object" ? value.forcedLogouts : {},
    userViewState: value?.userViewState && typeof value.userViewState === "object" ? value.userViewState : {}
  };
}

function persistCurrentUserViewState() {
  if (!state.session?.id) return;
  state.meta.userViewState = state.meta.userViewState && typeof state.meta.userViewState === "object"
    ? state.meta.userViewState
    : {};
  state.meta.userViewState[state.session.id] = {
    section: state.section,
    selectedContentId: state.selectedContentId || null,
    theme: state.theme,
    updatedAt: new Date().toISOString()
  };
}

function restoreCurrentUserViewState() {
  if (!state.session?.id) return;
  const savedView = state.meta?.userViewState?.[state.session.id];
  if (!savedView || typeof savedView !== "object") return;

  const nextSection =
    typeof savedView.section === "string" && canAccessSection(savedView.section)
      ? savedView.section
      : state.section;
  const nextSelectedContentId =
    typeof savedView.selectedContentId === "string" && state.content.some((item) => item.id === savedView.selectedContentId)
      ? savedView.selectedContentId
      : null;
  const nextTheme = savedView.theme === "light" ? "light" : savedView.theme === "dark" ? "dark" : state.theme;

  state.section = nextSection;
  state.selectedContentId = nextSelectedContentId;
  state.theme = nextTheme;
}

function normalizeContentRecord(content) {
  if (!content || typeof content !== "object") return null;
  return {
    ...content,
    tags: Array.isArray(content.tags) ? content.tags : [],
    keywords: Array.isArray(content.keywords) ? content.keywords : [],
    body: Array.isArray(content.body) ? content.body : [],
    attachments: normalizeAttachments(content),
    viewStats: content.viewStats && typeof content.viewStats === "object" ? content.viewStats : {}
  };
}

function normalizeContentCollection(items) {
  return Array.isArray(items) ? items.map((item) => normalizeContentRecord(item)).filter(Boolean) : [];
}

function getCurrentPresenceState(extra = {}) {
  if (!state.session) return null;
  const now = new Date().toISOString();
  return {
    userId: state.session.id,
    name: state.session.name,
    username: state.session.username || "",
    role: state.session.role,
    section: state.section,
    contentId: extra.contentId || state.selectedContentId || "",
    lastSeenAt: now,
    updatedAt: now
  };
}

function touchPresence(extra = {}) {
  const presence = getCurrentPresenceState(extra);
  if (!presence) return null;
  state.meta.activePresence = state.meta.activePresence && typeof state.meta.activePresence === "object" ? state.meta.activePresence : {};
  const previous = state.meta.activePresence[presence.userId] || {};
  state.meta.activePresence[presence.userId] = {
    ...previous,
    ...presence,
    status: "online",
    firstSeenAt: previous.firstSeenAt || presence.lastSeenAt
  };
  return state.meta.activePresence[presence.userId];
}

function clearPresence(sessionId = state.session?.id || "") {
  if (!sessionId) return;
  if (!state.meta.activePresence || typeof state.meta.activePresence !== "object") return;
  const current = state.meta.activePresence[sessionId] || {};
  state.meta.activePresence[sessionId] = {
    ...current,
    status: "offline",
    lastSeenAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function startPresenceSync() {
  if (presenceSyncTimer) return;
  presenceSyncTimer = window.setInterval(() => {
    if (!state.session) return;
    touchPresence();
    saveState();
  }, 15000);

  window.addEventListener("focus", () => {
    if (!state.session) return;
    touchPresence();
    saveState();
  });

  window.addEventListener("pagehide", () => {
    const sessionId = state.session?.id;
    if (!sessionId) return;
    clearPresence(sessionId);
    try {
      navigator.sendBeacon(
        REMOTE_STATE_URL,
        new Blob([JSON.stringify({ state: buildPersistedState() })], { type: "application/json" })
      );
    } catch (error) {
      // ignore pagehide flush errors
      }
    });
  }

function startLivePanelSync() {
  if (livePanelTimer) return;
  livePanelTimer = window.setInterval(() => {
    if (!state.session) return;
    if (state.section === "operacional") {
      renderOperationalPanel();
      if (operationalUserId && elements.operationalUserModal && !elements.operationalUserModal.classList.contains("hidden")) {
        openOperationalUserModal(operationalUserId);
      }
    }
  }, 2000);
}

function normalizeViewStats(value) {
  return value && typeof value === "object" ? value : {};
}

function registerContentView(contentId) {
  if (!state.session || !contentId) return null;
  const item = state.content.find((content) => content.id === contentId);
  if (!item) return null;
  const now = new Date().toISOString();
  const currentStats = normalizeViewStats(item.viewStats);
  const previous = currentStats[state.session.id] || {};
  currentStats[state.session.id] = {
    userId: state.session.id,
    name: state.session.name,
    username: state.session.username || "",
    role: state.session.role,
    firstViewedAt: previous.firstViewedAt || now,
    lastViewedAt: now,
    count: Number(previous.count || 0) + 1,
    section: state.section
  };
  item.viewStats = currentStats;
  return currentStats[state.session.id];
}

function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!saved || typeof saved !== "object") return null;
    if (!saved.id || !saved.name || !saved.role) return null;
    return {
      id: String(saved.id),
      name: String(saved.name),
      role: String(saved.role),
      username: String(saved.username || ""),
      loginAt: String(saved.loginAt || new Date().toISOString()),
      theme: saved.theme === "light" ? "light" : saved.theme === "dark" ? "dark" : DEFAULT_THEME
    };
  } catch (error) {
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
  } catch (error) {
    // ignore session storage errors
  }
}

async function fetchRemoteUsers() {
  const response = await fetch(REMOTE_USERS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os usuarios do banco de dados.");
  }
  const payload = await response.json().catch(() => null);
  const users = Array.isArray(payload?.users) ? payload.users : [];
  state.users = sanitizeUsers(users);
  return state.users;
}

async function refreshUserFromRemote(userId) {
  if (!userId) return null;
  await fetchRemoteUsers();
  return state.users.find((item) => item.id === userId) || null;
}

function buildPersistedState() {
  const contentForStorage = state.content.map((item) => sanitizeContentForStorage(item));
  return {
    app: "knowledge-base",
    content: contentForStorage,
    meta: state.meta,
    users: state.users,
    section: state.section,
    selectedContentId: state.selectedContentId,
    theme: state.theme,
    schemaVersion: state.schemaVersion || APP_SCHEMA_VERSION
  };
}

function sanitizeAttachmentForStorage(attachment) {
  if (!attachment) return null;
  return {
    id: String(attachment.id || crypto.randomUUID()),
    name: String(attachment.name || ""),
    type: String(attachment.type || "application/octet-stream"),
    size: Number(attachment.size || 0),
    uploadedAt: String(attachment.uploadedAt || new Date().toISOString())
  };
}

function sanitizeContentForStorage(content) {
  return {
    ...content,
    attachments: normalizeAttachments(content).map(sanitizeAttachmentForStorage).filter(Boolean),
    attachment: null
  };
}

function saveState(options = {}) {
  const syncRemote = options.syncRemote !== false;
  const awaitRemote = options.awaitRemote === true;
  if (syncRemote) {
    remoteChangeRevision += 1;
    remoteSyncPending = true;
    const remotePromise = pushRemoteState({ keepalive: true });
    if (awaitRemote) {
      return remotePromise;
    }
    queueMicrotask(() => {
      void remotePromise;
    });
  }
  return Promise.resolve();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

async function saveAttachmentRecord(file) {
  const dataUrl = await readFileAsDataUrl(file);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
    dataUrl
  };
}

async function syncContentAttachments(contentId, attachments) {
  const payload = {
    contentId,
    attachments: Array.isArray(attachments) ? attachments : []
  };
  const response = await fetch(`${REMOTE_API_BASE}/attachments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error || "Nao foi possivel salvar os anexos.");
  }
  return response.json().catch(() => null);
}

function getAttachmentLabel(attachment) {
  if (!attachment) return "";
  const sizeKb = attachment.size ? Math.max(1, Math.round(attachment.size / 1024)) : 0;
  return `${attachment.name}${sizeKb ? ` • ${sizeKb} KB` : ""}`;
}

function normalizeAttachments(content) {
  if (!content) return [];
  if (Array.isArray(content.attachments) && content.attachments.length) return content.attachments;
  if (content.attachment) return [content.attachment];
  return [];
}

function updateAttachmentInfo(attachments) {
  if (!elements.attachmentInfo) return;
  if (!attachments || !attachments.length) {
    elements.attachmentInfo.textContent = "Nenhum arquivo selecionado.";
    return;
  }
  const names = attachments.map((item) => getAttachmentLabel(item)).join(", ");
  elements.attachmentInfo.textContent = `${attachments.length} arquivo(s): ${names}`;
}

function getAttachmentDownloadUrl(attachment) {
  return attachment?.url || attachment?.dataUrl || "";
}

function isPdfAttachment(attachment) {
  const type = String(attachment?.type || "").toLowerCase();
  return type.includes("pdf") || String(attachment?.name || "").toLowerCase().endsWith(".pdf");
}

function isExcelAttachment(attachment) {
  const type = String(attachment?.type || "").toLowerCase();
  const name = String(attachment?.name || "").toLowerCase();
  return type.includes("excel") || type.includes("spreadsheet") || name.endsWith(".xls") || name.endsWith(".xlsx");
}

function buildAttachmentMarkup(attachmentOrList) {
  const attachments = Array.isArray(attachmentOrList)
    ? attachmentOrList.filter(Boolean)
    : normalizeAttachments(attachmentOrList).filter(Boolean);
  if (!attachments.length) return "";
  return attachments.map((attachment, index) => {
    const label = escapeHtml(getAttachmentLabel(attachment));
    return `
      <div class="content-attachment-preview attachment-slot" data-attachment-index="${index}" data-attachment-id="${escapeHtml(attachment.id || "")}">
        <div class="content-attachment-preview-head">
          <div>
            <p class="eyebrow">${isPdfAttachment(attachment) ? "PDF anexado" : isExcelAttachment(attachment) ? "Planilha anexada" : "Documento anexado"}</p>
            <strong>${label}</strong>
            <p>${escapeHtml(attachment.type || "arquivo")}</p>
          </div>
          <div class="form-actions attachment-actions">
            <span class="attachment-action-placeholder">Carregando...</span>
          </div>
        </div>
        <div class="attachment-preview-body">
          <p class="spreadsheet-loading">Carregando prévia...</p>
        </div>
      </div>
    `;
  }).join("");
}

async function renderSpreadsheetPreviews(container) {
  const nodes = Array.from(container?.querySelectorAll("[data-spreadsheet-preview='1']") || []);
  if (!nodes.length) return;

  if (!window.XLSX) {
    nodes.forEach((node) => {
      const mount = node.querySelector(".spreadsheet-preview-body");
      if (mount) mount.innerHTML = `<p class="spreadsheet-loading">Prévia indisponível. Use Abrir ou Baixar.</p>`;
    });
    return;
  }

  for (const node of nodes) {
    const mount = node.querySelector(".spreadsheet-preview-body");
    const url = node.dataset.spreadsheetUrl || "";
    if (!mount || !url) continue;
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, blankrows: false });
      const sample = rows.slice(0, 8);
      if (!sample.length) {
        mount.innerHTML = `<p class="spreadsheet-loading">Planilha vazia.</p>`;
        continue;
      }
      const maxColumns = Math.min(6, Math.max(...sample.map((row) => row.length), 0));
      const table = sample.map((row, rowIndex) => {
        const cells = [];
        for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
          cells.push(`<td>${escapeHtml(String(row[columnIndex] ?? ""))}</td>`);
        }
        return `<tr>${cells.join("")}</tr>`;
      }).join("");
      mount.innerHTML = `
        <div class="spreadsheet-table-wrap">
          <table class="spreadsheet-table">
            <tbody>${table}</tbody>
          </table>
        </div>
      `;
    } catch (error) {
      mount.innerHTML = `<p class="spreadsheet-loading">Não foi possível carregar a prévia desta planilha.</p>`;
    }
  }
}

async function hydrateAttachmentPreviews(container) {
  const nodes = Array.from(container?.querySelectorAll(".attachment-slot") || []);
  if (!nodes.length) return;

  for (const node of nodes) {
    const mount = node.querySelector(".attachment-preview-body");
    const actionMount = node.querySelector(".attachment-actions");
    const attachmentId = node.dataset.attachmentId || "";
    const attachmentIndex = Number(node.dataset.attachmentIndex || 0);
    const selected = state.content.find((item) => item.id === state.selectedContentId);
    const attachments = normalizeAttachments(selected);
    const fallback = attachments[attachmentIndex] || null;
    const attachment = fallback || { id: attachmentId };
    const url = getAttachmentDownloadUrl(attachment);

    if (!mount) continue;
    if (!attachment || !url) {
      mount.innerHTML = `<p class="spreadsheet-loading">Não foi possível carregar este anexo.</p>`;
      if (actionMount) {
        actionMount.innerHTML = `<span class="attachment-action-placeholder">Sem acesso</span>`;
      }
      continue;
    }

    if (actionMount) {
      actionMount.innerHTML = `
        <a class="ghost-button" href="${url}" download="${escapeHtml(attachment.name)}">Baixar</a>
        <a class="primary-button" href="${url}" target="_blank" rel="noopener">Abrir</a>
      `;
    }

    if (isPdfAttachment(attachment)) {
      mount.innerHTML = `<iframe class="content-attachment-frame" src="${url}" title="${escapeHtml(attachment.name)}" loading="lazy"></iframe>`;
      continue;
    }

    if (isExcelAttachment(attachment) && window.XLSX && url) {
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, blankrows: false }).slice(0, 8);
        if (!rows.length) {
          mount.innerHTML = `<p class="spreadsheet-loading">Planilha vazia.</p>`;
          continue;
        }
        const maxColumns = Math.min(6, Math.max(...rows.map((row) => row.length), 0));
        const table = rows.map((row) => {
          const cells = [];
          for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
            cells.push(`<td>${escapeHtml(String(row[columnIndex] ?? ""))}</td>`);
          }
          return `<tr>${cells.join("")}</tr>`;
        }).join("");
        mount.innerHTML = `
          <div class="spreadsheet-table-wrap">
            <table class="spreadsheet-table">
              <tbody>${table}</tbody>
            </table>
          </div>
        `;
        continue;
      } catch (error) {
        mount.innerHTML = `<p class="spreadsheet-loading">Não foi possível carregar a prévia desta planilha.</p>`;
        continue;
      }
    }

    mount.innerHTML = `
      <div class="content-attachment-card">
        <div>
          <p class="eyebrow">Arquivo anexado</p>
          <strong>${escapeHtml(getAttachmentLabel(attachment))}</strong>
          <p>${escapeHtml(attachment.type || "arquivo")}</p>
        </div>
      </div>
    `;
  }
}

async function pushRemoteState(options = {}) {
  if (remotePushPromise) return remotePushPromise;
  remotePushInFlight = true;
  const revisionAtStart = remoteChangeRevision;
  remotePushPromise = (async () => {
    try {
      await fetch(REMOTE_STATE_URL, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state: buildPersistedState() }),
        keepalive: Boolean(options.keepalive)
      });
      if (revisionAtStart === remoteChangeRevision) {
        remoteContentSignature = getSharedContentSignature();
        remoteSyncPending = false;
      } else {
        remoteSyncPending = true;
      }
    } catch (error) {
      // keep working offline/local if the remote endpoint is unavailable
    } finally {
      remotePushInFlight = false;
      remotePushPromise = null;
      if (remoteSyncPending && revisionAtStart !== remoteChangeRevision) {
        void pushRemoteState();
      }
    }
  })();
  return remotePushPromise;
}

async function pullRemoteState(silent = false) {
  if (remotePullInFlight || remoteSyncPending) return false;
  remotePullInFlight = true;
  try {
    const response = await fetch(REMOTE_STATE_URL, { cache: "no-store" });
    if (!response.ok) return false;
    const payload = await response.json();
    const remoteState = payload?.state && typeof payload.state === "object" ? payload.state : payload;
    if (
      !remoteState ||
      typeof remoteState !== "object" ||
      (remoteState.app !== "knowledge-base" && !Array.isArray(remoteState.content))
    ) {
      return false;
    }

    const nextSignature = getSharedContentSignature(remoteState);
    const usersChanged =
      Array.isArray(remoteState.users) &&
      JSON.stringify(sanitizeUsers(remoteState.users)) !== JSON.stringify(sanitizeUsers(state.users));

    if ((!nextSignature || nextSignature === remoteContentSignature) && !usersChanged) {
      return false;
    }

      if (Array.isArray(remoteState.content)) {
        state.content = normalizeContentCollection(remoteState.content);
        state.contentHydrated = true;
      }
    state.meta = normalizeMeta(remoteState.meta);
    if (Array.isArray(remoteState.users)) {
      state.users = sanitizeUsers(remoteState.users);
    }
    restoreCurrentUserViewState();
    if (state.session?.theme) {
      state.theme = state.session.theme;
    }
    applyTheme(state.theme || DEFAULT_THEME);
    remoteContentSignature = nextSignature;
    saveState({ syncRemote: false });
    if (maybeHandleForcedLogout()) {
      return true;
    }
    renderAll();
    return true;
    } catch (error) {
      state.contentHydrated = true;
      if (!silent) {
        // ignore remote sync failures
      }
    return false;
  } finally {
    remotePullInFlight = false;
  }
}

function startRemoteSync() {
  if (remoteSyncTimer) return;
  remoteSyncTimer = window.setInterval(() => {
    if (!state.session) return;
    if (remoteSyncPending) {
      void pushRemoteState();
      return;
    }
    void pullRemoteState(true);
  }, REMOTE_SYNC_INTERVAL);

  window.addEventListener("focus", () => {
    if (state.session) {
      if (remoteSyncPending) {
        void pushRemoteState({ keepalive: true });
        return;
      }
      void pullRemoteState(true);
    }
  });

  window.addEventListener("pagehide", () => {
    if (!remoteSyncPending) return;
    try {
      navigator.sendBeacon(
        REMOTE_STATE_URL,
        new Blob([JSON.stringify({ state: buildPersistedState() })], { type: "application/json" })
      );
    } catch (error) {
      // ignore pagehide flush errors
    }
  });
}

function hydrateSelects() {
  elements.form.category.innerHTML = categories.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  elements.form.type.innerHTML = types.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.notificationTrigger.addEventListener("click", toggleNotificationMenu);
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.resetPasswordButton.addEventListener("click", handleResetPassword);
  elements.profileTrigger.addEventListener("click", toggleProfileMenu);
  elements.urgentModalClose.addEventListener("click", closeUrgentModal);
  elements.urgentModalOpen.addEventListener("click", openUrgentNotification);
    elements.contentAuditClose?.addEventListener("click", closeContentAuditModal);
    elements.contentAuditModal?.addEventListener("click", (event) => {
      if (event.target === elements.contentAuditModal) {
        closeContentAuditModal();
      }
    });
    elements.contentAuditSeenCount?.addEventListener("click", () => setContentAuditTab("seen"));
    elements.contentAuditMissingCount?.addEventListener("click", () => setContentAuditTab("missing"));
    elements.contentAuditTabSeen?.addEventListener("click", () => setContentAuditTab("seen"));
    elements.contentAuditTabMissing?.addEventListener("click", () => setContentAuditTab("missing"));
  elements.operationalUserClose?.addEventListener("click", closeOperationalUserModal);
  elements.operationalUserModal?.addEventListener("click", (event) => {
    if (event.target === elements.operationalUserModal) {
      closeOperationalUserModal();
    }
  });
  elements.operationalFilterOnline?.addEventListener("click", () => {
    operationalStatusFilter = operationalStatusFilter === "online" ? "all" : "online";
    renderOperationalPanel();
  });
  elements.operationalFilterOffline?.addEventListener("click", () => {
    operationalStatusFilter = operationalStatusFilter === "offline" ? "all" : "offline";
    renderOperationalPanel();
  });
  elements.operationalUserForceLogout?.addEventListener("click", handleOperationalForceLogout);
  elements.operationalSearch?.addEventListener("input", (event) => {
    operationalQuery = String(event.target.value || "").trim();
    renderOperationalPanel();
  });
  elements.userForm.addEventListener("submit", handleUserSubmit);
  elements.cancelUserEdit.addEventListener("click", resetUserForm);
  elements.openContentCreate?.addEventListener("click", (event) => {
    event.stopPropagation();
    elements.contentCreateMenu?.classList.toggle("hidden");
  });
  elements.backFromContentEditor.addEventListener("click", closeContentModal);
  elements.backFromContentView.addEventListener("click", closeContentViewModal);
  elements.contentViewEdit.addEventListener("click", () => {
    const contentId = elements.contentViewBody.dataset.contentId;
    if (contentId) populateForm(contentId);
  });

  elements.globalSearch.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    if (state.query.length >= 2) saveSearch(state.query);
    if (state.section !== "explorer") setSection("explorer");
    renderAll();
  });

  elements.clearFilters.addEventListener("click", () => {
    state.filters = { categories: [], types: [], tags: [] };
    renderAll();
  });

  elements.toggleHistory.addEventListener("click", () => {
    elements.historyPanel.classList.toggle("hidden");
    renderHistory();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".profile-menu")) {
      closeProfileMenu();
    }
    if (!event.target.closest(".notification-menu")) {
      closeNotificationMenu();
    }
    if (!event.target.closest("#open-content-create") && !event.target.closest("#content-create-menu")) {
      elements.contentCreateMenu.classList.add("hidden");
    }
  });

  elements.navLinks.forEach((button) => {
    button.addEventListener("click", () => setSection(button.dataset.section));
  });

  elements.contentForm.addEventListener("submit", handleContentSubmit);
  elements.form.attachment?.addEventListener("change", () => {
    editorAttachments = Array.from(elements.form.attachment.files || []);
    updateAttachmentInfo(editorAttachments);
  });
  elements.cancelEdit.addEventListener("click", () => {
    resetForm();
    closeContentModal();
  });

  document.querySelectorAll("[data-create-kind]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openCreateContentModal(button.dataset.createKind);
    });
  });
}

function setSection(sectionId) {
  if (!canAccessSection(sectionId)) {
    sectionId = "explorer";
  }
  state.section = sectionId;
  persistCurrentUserViewState();
  if (state.session) {
    touchPresence();
  }
  saveState();
  elements.navLinks.forEach((item) => item.classList.toggle("active", item.dataset.section === sectionId));
  elements.sectionNodes.forEach((section) => section.classList.toggle("active", section.id === sectionId));
    elements.globalFilterPanel?.classList.toggle("hidden", ["admin", "operacional"].includes(sectionId));
  renderAll();
}

function syncAuthView() {
  const loggedIn = Boolean(state.session);
  elements.loginScreen.classList.toggle("hidden", loggedIn);
  elements.appShell.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) {
    return;
  }

  const profile = ACCESS_LEVELS[state.session.role] || { label: state.session.role || "Usuario" };
  elements.sessionName.textContent = state.session.name;
  elements.sessionRole.textContent = profile.label;
  elements.sessionNameMenu.textContent = state.session.name;
  elements.sessionRoleMenu.textContent = profile.label;
  elements.profileAvatar.textContent = getInitials(state.session.name);
  elements.adminSection.classList.toggle("hidden", !canManageContent());

  elements.navLinks.forEach((button) => {
    const allowed = canAccessSection(button.dataset.section);
    button.classList.toggle("hidden", !allowed);
  });
  elements.globalFilterPanel?.classList.toggle("hidden", ["admin", "operacional"].includes(state.section));

  if (!canAccessSection(state.section)) {
    state.section = "explorer";
  }
  elements.navLinks.forEach((item) => item.classList.toggle("active", item.dataset.section === state.section));
  elements.sectionNodes.forEach((section) => section.classList.toggle("active", section.id === state.section));
  renderNotifications();
}

function toggleProfileMenu() {
  const isOpen = !elements.profileDropdown.classList.contains("hidden");
  elements.profileDropdown.classList.toggle("hidden", isOpen);
  elements.profileTrigger.setAttribute("aria-expanded", String(!isOpen));
}

function closeProfileMenu() {
  elements.profileDropdown.classList.add("hidden");
  elements.profileTrigger.setAttribute("aria-expanded", "false");
}

function toggleNotificationMenu() {
  const isOpen = !elements.notificationDropdown.classList.contains("hidden");
  elements.notificationDropdown.classList.toggle("hidden", isOpen);
  elements.notificationTrigger.setAttribute("aria-expanded", String(!isOpen));
}

function closeNotificationMenu() {
  elements.notificationDropdown.classList.add("hidden");
  elements.notificationTrigger.setAttribute("aria-expanded", "false");
}

function canManageContent() {
  return state.session && ACCESS_LEVELS[state.session.role]?.canEdit;
}

function canAccessSection(sectionId) {
  if (!state.session) return false;
  if (sectionId === "content-view-screen") return true;
  if (["admin", "operacional", "content-editor-screen"].includes(sectionId)) return canManageContent();
  return ["dashboard", "explorer", "favorites"].includes(sectionId);
}

async function promptForPasswordChange(userId, reasonLabel) {
  const newPassword = window.prompt(`Precisa ${reasonLabel}. Digite a nova senha:`);
  if (!newPassword || !newPassword.trim()) {
    return false;
  }

  const userIndex = state.users.findIndex((item) => item.id === userId);
  if (userIndex < 0) return false;

  const nextPassword = newPassword.trim();
  state.users[userIndex].password = nextPassword;
  state.users[userIndex].mustChangePassword = false;
  if (state.session?.id === userId) {
    state.session = { ...state.session, password: nextPassword };
    saveSession(state.session);
  }
  let directUpdateSucceeded = false;
  try {
    const response = await fetch(`${REMOTE_API_BASE}/users/password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, newPassword: nextPassword })
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.ok) {
      directUpdateSucceeded = true;
    }
    } catch (error) {
      directUpdateSucceeded = false;
    }

  if (!directUpdateSucceeded) {
    await saveState({ awaitRemote: true });
    await pullRemoteState(true);
    const refreshedUser = await refreshUserFromRemote(userId);
    if (!refreshedUser || String(refreshedUser.password || "") !== nextPassword || refreshedUser.mustChangePassword) {
      throw new Error("Nao foi possivel alterar a senha no banco de dados.");
    }
    ensureUserRecordInState(refreshedUser);
    return refreshedUser;
  }

  void saveState();
  void pullRemoteState(true);
  return {
    ...state.users[userIndex],
    password: nextPassword,
    mustChangePassword: false
  };
}

async function forceFirstLoginPasswordChange(user) {
  const refreshedUser = await promptForPasswordChange(user.id, "trocar a senha no primeiro acesso");
  if (!refreshedUser) {
    throw new Error("Voce precisa trocar a senha no primeiro acesso.");
  }
  return refreshedUser;
}

async function handleLogin(event) {
  event.preventDefault();
  const username = normalizeUsername(elements.loginUsername.value);
  const password = elements.loginPassword.value;
  if (!username || !password) {
    elements.loginError.textContent = "Campo obrigatório.";
    elements.loginError.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(`${REMOTE_API_BASE}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload.user) {
      throw new Error(payload?.error || "Usuario ou senha invalidos.");
    }

    let user = payload.user;
    ensureUserRecordInState(user);

    if (user.mustChangePassword || String(password) === TEMP_PASSWORD) {
      user = await forceFirstLoginPasswordChange(user);
    } else {
      const refreshedUser = await refreshUserFromRemote(user.id).catch(() => null);
      if (refreshedUser) {
        user = { ...refreshedUser };
      }
    }

    elements.loginError.classList.add("hidden");
      state.session = {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username,
        mustChangePassword: Boolean(user.mustChangePassword),
        loginAt: new Date().toISOString(),
        theme: state.theme || DEFAULT_THEME
      };
    ensureSessionUserInState();
    saveSession(state.session);
    touchPresence({ contentId: state.selectedContentId || "" });
    void saveState();
    void pullRemoteState(true);
    requestDesktopNotificationPermission();
    syncAuthView();
    setSection("explorer");
  } catch (error) {
    elements.loginError.textContent = String(error?.message || "Usuario ou senha invalidos.");
    elements.loginError.classList.remove("hidden");
  }
}

function handleLogout() {
  clearPresence(state.session?.id || "");
  saveState();
  state.session = null;
  saveSession(null);
  elements.loginForm.reset();
  elements.loginError.classList.add("hidden");
  closeUrgentModal();
  closeNotificationMenu();
  closeProfileMenu();
  syncAuthView();
}

function maybeHandleForcedLogout() {
  if (!state.session?.id) return false;
  const forcedLogouts = state.meta?.forcedLogouts && typeof state.meta.forcedLogouts === "object"
    ? state.meta.forcedLogouts
    : {};
  const forcedAt = forcedLogouts[state.session.id];
  if (!forcedAt) return false;
  const forcedAtMs = Date.parse(forcedAt);
  const loginAtMs = Date.parse(state.session.loginAt || "");
  if (Number.isFinite(forcedAtMs) && (!Number.isFinite(loginAtMs) || forcedAtMs >= loginAtMs)) {
    clearPresence(state.session.id);
    state.session = null;
    saveSession(null);
    elements.loginForm?.reset();
    elements.loginError.textContent = "Sua sessão foi encerrada pelo gestor.";
    elements.loginError.classList.remove("hidden");
    closeUrgentModal();
    closeNotificationMenu();
    closeProfileMenu();
    closeOperationalUserModal();
    syncAuthView();
    return true;
  }
  return false;
}

async function handleResetPassword() {
  if (!state.session) return;

  const updated = await promptForPasswordChange(state.session.id, "alterar a senha");
  if (!updated) return;
  closeProfileMenu();
  window.alert("Senha atualizada com sucesso.");
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  state.theme = nextTheme;
  persistCurrentUserViewState();
  if (state.session) {
    state.session = { ...state.session, theme: nextTheme };
    saveSession(state.session);
  }
  document.body.setAttribute("data-theme", nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
}

function requestDesktopNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {
      // ignore permission errors
    });
  }
}

async function ensureDesktopNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch (error) {
    return false;
  }
}

async function toggleTheme() {
  const nextTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  await saveState({ awaitRemote: true });
}

function renderAll() {
  if (!state.session) {
    return;
  }
  renderHeroStats();
  renderCategoryCards();
  renderFilterGroups();
  renderResults();
  renderFavorites();
  renderDetail();
  renderMostAccessed();
  renderRecentUpdates();
  renderHistory();
  renderAdminList();
  renderUsersList();
  renderOperationalPanel();
  renderNotifications();
  maybeShowUrgentModal();
  updateSummary();
}

function getNotificationItems() {
  return state.content
    .filter((item) => item.urgent || item.type === "informativo" || item.category === "alerts")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getSeenNotificationIds() {
  if (!state.session) return [];
  return state.meta.seenNotifications[state.session.id] || [];
}

function getUnreadNotifications() {
  const seenIds = new Set(getSeenNotificationIds());
  return getNotificationItems().filter((item) => !seenIds.has(item.id));
}

function renderNotifications() {
  if (!state.session) return;

  const notifications = getNotificationItems();
  const unread = getUnreadNotifications();

  elements.notificationBadge.textContent = String(unread.length);
  elements.notificationBadge.classList.toggle("hidden", unread.length === 0);
  elements.notificationSummary.textContent = unread.length
    ? `${unread.length} novo${unread.length === 1 ? "" : "s"} comunicado${unread.length === 1 ? "" : "s"}`
    : "Nenhum comunicado novo";

  if (!notifications.length) {
    elements.notificationList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Sem comunicados</p><h3>Nenhum informativo cadastrado ate o momento.</h3></div></div>`;
    return;
  }

    elements.notificationList.innerHTML = notifications
      .slice(0, 6)
      .map((item) => `
        <article class="notification-item ${item.urgent ? "urgent" : ""}" data-notification-open="${item.id}">
          ${item.urgent ? '<span class="notification-item-flag">URGENTE!!</span>' : ""}
          <strong>${item.title}</strong>
          <p>${item.summary}</p>
          <span class="reading-time">Postado em ${formatDateTime(item.postedAt || item.updatedAt)}</span>
        </article>
      `)
      .join("");

  document.querySelectorAll("[data-notification-open]").forEach((node) => {
    node.addEventListener("click", () => {
      openDetail(node.dataset.notificationOpen);
      setSection("explorer");
      closeNotificationMenu();
    });
  });
}

function markNotificationsAsSeen() {
  if (!state.session) return;
  const allIds = getNotificationItems().map((item) => item.id);
  state.meta.seenNotifications[state.session.id] = allIds;
  state.meta.alertedUrgentNotifications[state.session.id] = allIds;
  saveState();
  renderNotifications();
}

async function markNotificationAsSeen(contentId) {
    if (!state.session || !contentId) return false;
    const seenIds = new Set(state.meta.seenNotifications[state.session.id] || []);
    const alertedIds = new Set(state.meta.alertedUrgentNotifications[state.session.id] || []);
    seenIds.add(contentId);
    alertedIds.add(contentId);
    state.meta.seenNotifications[state.session.id] = [...seenIds];
  state.meta.alertedUrgentNotifications[state.session.id] = [...alertedIds];
  saveState();
  renderNotifications();
  try {
    const response = await fetch(REMOTE_NOTIFICATION_SEEN_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: state.session.id, contentId })
    });
      if (!response.ok) {
        throw new Error("Falha ao gravar o visto da notificação.");
      }
      return true;
    } catch (error) {
      return false;
    }
  }

function getUrgentUnreadNotification() {
  return getUnreadNotifications().find((item) => item.urgent);
}

function maybeShowUrgentModal() {
  const urgent = getUrgentUnreadNotification();
  if (!urgent) {
    closeUrgentModal();
    return;
  }

  elements.urgentModal.dataset.contentId = urgent.id;
  elements.urgentModalTitle.textContent = urgent.title;
  elements.urgentModalText.textContent = urgent.summary;
  elements.urgentModal.classList.remove("hidden");
  if (urgent.id !== pendingUrgentNotificationId) {
    void maybeShowDesktopUrgentNotification(urgent);
  }
}

function closeUrgentModal() {
  elements.urgentModal.classList.add("hidden");
}

async function openUrgentNotification() {
    const contentId = elements.urgentModal.dataset.contentId;
    if (!contentId) return;
    const marked = await markNotificationAsSeen(contentId);
    if (!marked) {
      showToast("Nao consegui salvar o visto no banco. Tente novamente.");
      return;
    }
    pendingUrgentNotificationId = null;
    closeUrgentModal();
    openDetail(contentId);
    setSection("explorer");
  }

function getAlertedUrgentIds() {
  if (!state.session) return [];
  return state.meta.alertedUrgentNotifications[state.session.id] || [];
}

async function maybeShowDesktopUrgentNotification(item, force = false) {
  if (!state.session || !item || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") {
    const granted = await ensureDesktopNotificationPermission();
    if (!granted) return false;
  }

  const alertedIds = new Set(getAlertedUrgentIds());
  if (!force && alertedIds.has(item.id)) return false;

  await new Promise((resolve) => window.setTimeout(resolve, 60));
  const notification = new Notification("Urgente!! BASE CONHECIMENTO KR", {
    body: item.title,
    tag: `urgent-${item.id}`,
    requireInteraction: true,
    icon: "logos_KR-02.png",
    badge: "logos_KR-02.png"
  });

      notification.onclick = () => {
        window.focus();
        openDetail(item.id);
        setSection("explorer");
        void markNotificationAsSeen(item.id);
        closeUrgentModal();
        notification.close();
      };

  state.meta.alertedUrgentNotifications[state.session.id] = [...alertedIds, item.id];
  saveState();
  return true;
}

function renderHeroStats() {
  const metrics = [
    { label: "Conteudos ativos", value: state.content.length },
    { label: "Categorias", value: categories.length },
    { label: "Favoritos salvos", value: state.meta.favorites.length }
  ];

  elements.heroStats.innerHTML = metrics
    .map((item) => `<article class="metric-card"><span>${item.label}</span><strong>${item.value}</strong></article>`)
    .join("");
}

function renderCategoryCards() {
  elements.categoryCards.innerHTML = categories
    .map((category) => {
      const count = state.content.filter((item) => item.category === category.id).length;
      return `
        <button class="category-card ${category.tone}" type="button" data-category-card="${category.id}">
          <div class="category-icon">${category.icon}</div>
          <h4>${category.name}</h4>
          <p>${category.description}</p>
          <strong>${count} conteudos</strong>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll("[data-category-card]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleFilter("categories", button.dataset.categoryCard);
      setSection("explorer");
    });
  });
}

function renderFilterGroups() {
  renderChips(elements.categoryFilters, categories, "categories");
  renderChips(elements.typeFilters, types, "types");
  const tags = Array.from(new Set(state.content.flatMap((item) => item.tags))).sort().map((tag) => ({ id: tag, name: tag }));
  renderChips(elements.tagFilters, tags, "tags");
  renderActiveFilters();
}

function renderChips(container, items, filterKey) {
  container.innerHTML = items
    .map((item) => `<button class="chip ${state.filters[filterKey].includes(item.id) ? "active" : ""}" type="button" data-filter-key="${filterKey}" data-filter-value="${item.id}">${item.name}</button>`)
    .join("");

  container.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => toggleFilter(button.dataset.filterKey, button.dataset.filterValue));
  });
}

function toggleFilter(filterKey, value) {
  const current = state.filters[filterKey];
  state.filters[filterKey] = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  renderAll();
}

function getFilteredContent() {
    const query = normalize(state.query);
    const filtered = state.content
      .filter((item) => {
        const byCategory = !state.filters.categories.length || state.filters.categories.includes(item.category);
        const byType = !state.filters.types.length || state.filters.types.includes(item.type);
        const byTag = !state.filters.tags.length || state.filters.tags.some((tag) => item.tags.includes(tag));
        if (!query) return byCategory && byType && byTag;

        const haystack = [item.title, item.summary, item.tags.join(" "), item.keywords.join(" "), item.body.join(" ")].join(" ").toLowerCase();
        return byCategory && byType && byTag && haystack.includes(query);
      });

    if (!query) {
      return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return filtered.sort((a, b) => getSearchScore(b, query) - getSearchScore(a, query) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }

function getSearchScore(item, query) {
  if (!query) return item.accessCount;
  let score = 0;
  if (normalize(item.title).includes(query)) score += 8;
  if (normalize(item.summary).includes(query)) score += 5;
  if (item.tags.some((tag) => normalize(tag).includes(query))) score += 4;
  if (item.keywords.some((keyword) => normalize(keyword).includes(query))) score += 3;
  if (normalize(item.body.join(" ")).includes(query)) score += 2;
  if (item.featured) score += 1;
  return score;
}

function renderResults() {
    if (!state.contentHydrated) {
      elements.resultsList.innerHTML = `
        <div class="results-loading-card" aria-live="polite" aria-busy="true">
          <span class="results-loading-spinner" aria-hidden="true"></span>
          <div class="results-loading-copy">
            <p class="eyebrow">Carregando</p>
            <h3>Buscando os posts mais recentes...</h3>
            <p>Aguarde um instante enquanto sincronizo o conteudo com o banco.</p>
          </div>
        </div>
      `;
      return;
    }
    const results = getFilteredContent();
  if (!results.length) {
    elements.resultsList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Nenhum resultado</p><h3>Ajuste os filtros ou refine a busca.</h3></div></div>`;
    return;
  }

  elements.resultsList.innerHTML = "";
  results.forEach((item) => {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    node.querySelector("h4").innerHTML = highlight(item.title, state.query);
    node.querySelector(".result-summary-text").textContent = item.summary;
    node.querySelector(".result-snippet").innerHTML = getSnippet(item);
    node.querySelector(".result-badges").innerHTML = `
      <span class="badge ${item.type}">${getTypeName(item.type)}</span>
      <span class="badge manual">${getCategoryName(item.category)}</span>
      ${item.featured ? '<span class="badge informativo">Destaque</span>' : ""}
    `;
    node.querySelector(".tag-row").innerHTML = item.tags.slice(0, 4).map((tag) => `<span class="chip">${tag}</span>`).join("");

    const favoriteButton = node.querySelector(".favorite-toggle");
    favoriteButton.innerHTML = isFavorite(item.id) ? "&#9733;" : "&#9734;";
    favoriteButton.classList.toggle("active", isFavorite(item.id));
    favoriteButton.addEventListener("click", () => {
      toggleFavorite(item.id);
      renderAll();
    });

    const auditButton = node.querySelector(".audit-toggle");
    if (auditButton) {
      auditButton.classList.toggle("hidden", !canManageContent());
      auditButton.addEventListener("click", () => openContentAuditModal(item.id));
    }

    node.querySelector(".open-detail").addEventListener("click", () => openDetail(item.id));
    node.addEventListener("click", (event) => {
      if (!event.target.closest("button")) openDetail(item.id);
    });

    elements.resultsList.appendChild(node);
  });
}

function renderDetail() {
  const selected = state.content.find((item) => item.id === state.selectedContentId);
  if (!selected) {
    lastDetailRenderKey = "";
    delete elements.contentViewBody.dataset.contentId;
    elements.contentViewBody.innerHTML = `<div class="empty-detail"><div><p class="eyebrow">Conteudo</p><h3>Selecione um item para visualizar os detalhes.</h3><p>Use a busca e os filtros para abrir um artigo da base.</p></div></div>`;
    return;
  }

  const attachmentSignature = normalizeAttachments(selected)
    .map((attachment) => [attachment.id || "", attachment.name || "", attachment.type || "", attachment.size || 0, attachment.uploadedAt || ""].join("|"))
    .join("~");
  const detailRenderKey = JSON.stringify({
    id: selected.id,
    updatedAt: selected.updatedAt || "",
    title: selected.title || "",
    summary: selected.summary || "",
    body: Array.isArray(selected.body) ? selected.body : [],
    tags: Array.isArray(selected.tags) ? selected.tags : [],
    type: selected.type || "",
    category: selected.category || "",
    allowCopy: Boolean(selected.allowCopy),
    featured: Boolean(selected.featured),
    favorite: isFavorite(selected.id),
    query: state.query || "",
    canManage: canManageContent(),
    attachmentSignature
  });

  if (
    lastDetailRenderKey === detailRenderKey &&
    elements.contentViewBody.dataset.contentId === selected.id
  ) {
    return;
  }

  lastDetailRenderKey = detailRenderKey;

  elements.contentViewBody.dataset.contentId = selected.id;

  const bodyLines = Array.isArray(selected.body) ? selected.body : [];
  const bodyHtml = bodyLines.length ? bodyLines.map((line) => {
    if (line.startsWith("CALL OUT::")) {
      const [, tone, text] = line.split("::");
      return `<div class="callout ${tone}">${highlight(text, state.query)}</div>`;
    }
    if (line.startsWith("- ")) return `<li>${highlight(line.slice(2), state.query)}</li>`;
    return `<p>${highlight(line, state.query)}</p>`;
  }).join("") : `<p>${escapeHtml(selected.summary || "Documento sem texto adicional.")}</p>`;

  const wrappedBody = bodyHtml.includes("<li>") ? bodyHtml.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`) : bodyHtml;
  const attachmentHtml = buildAttachmentMarkup(normalizeAttachments(selected));

  elements.contentViewTitle.textContent = selected.title;
  elements.contentViewBody.innerHTML = `
    <div class="detail-view">
      <div>
        <div class="result-badges">
          <span class="badge ${selected.type}">${getTypeName(selected.type)}</span>
          <span class="badge manual">${getCategoryName(selected.category)}</span>
          ${selected.featured ? '<span class="badge informativo">Destaque</span>' : ""}
        </div>
        <h3>${selected.title}</h3>
      </div>
      <div class="detail-meta">
        <span class="reading-time">${estimateReadingTime(bodyLines.join(" "))}</span>
        <span class="mono">Atualizado em ${formatDate(selected.updatedAt)}</span>
      </div>
      <div class="tag-row">${selected.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}</div>
      ${attachmentHtml}
      <div class="detail-actions">
        <button class="primary-button" type="button" id="detail-favorite">${isFavorite(selected.id) ? "Remover dos favoritos" : "Salvar nos favoritos"}</button>
        ${selected.allowCopy ? `<button class="ghost-button" type="button" id="copy-content">Copiar conteudo</button>` : ""}
      </div>
      <div class="detail-body">${wrappedBody}</div>
    </div>
  `;

  document.querySelector("#detail-favorite").addEventListener("click", () => {
    toggleFavorite(selected.id);
    renderAll();
  });

  const copyButton = document.querySelector("#copy-content");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(selected.body.join("\n"));
      copyButton.textContent = "Conteudo copiado";
      setTimeout(() => { copyButton.textContent = "Copiar conteudo"; }, 1600);
    });
  }

  void hydrateAttachmentPreviews(elements.contentViewBody);
}

function renderFavorites() {
  const favorites = state.content.filter((item) => isFavorite(item.id));
  elements.favoritesList.innerHTML = favorites.length
      ? favorites.map((item) => `
          <article class="list-item">
            <div class="list-item-top">
              <strong>${item.title}</strong>
              <div class="result-actions">
                ${canManageContent() ? `<button class="ghost-button audit-toggle" type="button" data-audit-view-favorite="${item.id}" aria-label="Ver audiência">👁</button>` : ""}
                <button class="text-button" type="button" data-open-favorite="${item.id}">Abrir</button>
              </div>
            </div>
            <p>${item.summary}</p>
            <div class="tag-row">${item.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}</div>
          </article>
        `).join("")
    : `<div class="empty-state"><div><p class="eyebrow">Sem favoritos</p><h3>Salve os conteudos mais usados para acesso instantaneo.</h3></div></div>`;

    document.querySelectorAll("[data-open-favorite]").forEach((button) => {
      button.addEventListener("click", () => {
        openDetail(button.dataset.openFavorite);
      });
    });

    document.querySelectorAll("[data-audit-view-favorite]").forEach((button) => {
      button.addEventListener("click", () => openContentAuditModal(button.dataset.auditViewFavorite));
    });
  }

function renderMostAccessed() {
  const items = [...state.content].sort((a, b) => b.accessCount - a.accessCount).slice(0, 5);
  elements.mostAccessed.innerHTML = items.map((item, index) => `
    <article class="list-item">
      <div class="list-item-top">
        <strong>${index + 1}. ${item.title}</strong>
        <span class="mono">${item.accessCount} acessos</span>
      </div>
      <p>${item.summary}</p>
    </article>
  `).join("");
}

function renderRecentUpdates() {
  const items = [...state.content].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  elements.recentUpdates.innerHTML = items.map((item) => `
    <article class="list-item">
      <div class="list-item-top">
        <strong>${item.title}</strong>
        <span class="mono">${formatDate(item.updatedAt)}</span>
      </div>
      <p>${item.summary}</p>
    </article>
  `).join("");
}

function renderHistory() {
  elements.historyPanel.innerHTML = state.meta.searchHistory.length
    ? `
      <div class="section-head">
        <div>
          <p class="eyebrow">Historico</p>
          <h3>Ultimas buscas</h3>
        </div>
        <button class="text-button" type="button" id="clear-history">Limpar historico</button>
      </div>
      <div class="tag-row">
        ${state.meta.searchHistory.map((term) => `<button class="chip" type="button" data-history-term="${term}">${term}</button>`).join("")}
      </div>
    `
    : `<p class="eyebrow">Nenhuma busca recente registrada.</p>`;

  document.querySelector("#clear-history")?.addEventListener("click", () => {
    state.meta.searchHistory = [];
    saveState();
    renderHistory();
  });

  document.querySelectorAll("[data-history-term]").forEach((button) => {
    button.addEventListener("click", () => {
      state.query = button.dataset.historyTerm;
      elements.globalSearch.value = state.query;
      setSection("explorer");
      renderAll();
    });
  });
}

function renderAdminList() {
  if (!canManageContent()) {
    elements.adminList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Acesso restrito</p><h3>Somente Gestor pode editar ou excluir conteudos.</h3></div></div>`;
    return;
  }
  const sorted = [...state.content].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    elements.adminList.innerHTML = sorted.map((item) => `
      <article class="admin-item">
        <div class="admin-item-top">
          <div>
            <strong>${item.title}</strong>
            <p>${getCategoryName(item.category)} • ${getTypeName(item.type)}</p>
          </div>
          <div class="admin-item-actions">
            <button class="ghost-button" type="button" data-view-content="${item.id}">Visualizar</button>
            <button class="ghost-button" type="button" data-edit="${item.id}">Editar</button>
            <button class="ghost-button" type="button" data-delete="${item.id}">Excluir</button>
          </div>
        </div>
      <p>${item.summary}</p>
    </article>
  `).join("");

    document.querySelectorAll("[data-view-content]").forEach((button) => button.addEventListener("click", () => openContentViewModal(button.dataset.viewContent)));
    document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => populateForm(button.dataset.edit)));
    document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => removeContent(button.dataset.delete)));
  }

function renderUsersList() {
  if (!canManageContent()) {
    elements.usersList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Acesso restrito</p><h3>Somente Gestor pode gerenciar usuarios.</h3></div></div>`;
    return;
  }

  elements.usersList.innerHTML = state.users
    .map((user) => `
      <article class="admin-item">
        <div class="admin-item-top">
          <div>
            <strong>${user.name}</strong>
            <p>${user.username} • ${ACCESS_LEVELS[user.role].label}</p>
          </div>
          <div class="admin-item-actions">
            <button class="ghost-button" type="button" data-user-edit="${user.id}">Editar</button>
            ${state.session?.id !== user.id ? `<button class="ghost-button" type="button" data-user-delete="${user.id}">Excluir</button>` : ""}
          </div>
        </div>
      </article>
    `)
    .join("");

  document.querySelectorAll("[data-user-edit]").forEach((button) => {
    button.addEventListener("click", () => populateUserForm(button.dataset.userEdit));
  });

  document.querySelectorAll("[data-user-delete]").forEach((button) => {
    button.addEventListener("click", () => removeUser(button.dataset.userDelete));
  });
}

function getSectionLabel(sectionId) {
  const labels = {
    dashboard: "Dashboard",
    explorer: "Explorar conteúdos",
    favorites: "Favoritos",
    admin: "Área administrativa",
    operacional: "Painel Operacional",
    "content-view-screen": "Visualização",
    "content-editor-screen": "Editor de conteúdo"
  };
  return labels[sectionId] || sectionId || "Não informado";
}

function formatDateTime(dateValue) {
  if (!dateValue) return "Não informado";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return "0m";
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || !parts.length) parts.push(`${minutes}m`);
  return parts.join(" ");
}

function getPresenceSnapshot(userId) {
  const ledger = state.meta.activePresence && typeof state.meta.activePresence === "object" ? state.meta.activePresence : {};
  return ledger[userId] || null;
}

function getPresenceStatus(userId) {
  const entry = getPresenceSnapshot(userId);
  const lastSeen = Date.parse(entry?.lastSeenAt || entry?.updatedAt || "");
  const isRecent = Number.isFinite(lastSeen) && Date.now() - lastSeen <= 60000;
  const isOnline = Boolean(entry && entry.status !== "offline" && isRecent);
  return {
    entry,
    isOnline,
    firstSeenAt: entry?.firstSeenAt || entry?.lastSeenAt || "",
    lastSeenAt: entry?.lastSeenAt || entry?.updatedAt || "",
    offlineSince: entry?.status === "offline" ? entry?.lastSeenAt || entry?.updatedAt || "" : isRecent ? "" : entry?.lastSeenAt || entry?.updatedAt || ""
  };
}

function getPresenceEntries() {
  const now = Date.now();
  const threshold = 60000;
  ensureSessionUserInState();
  const users = Array.isArray(state.users) ? [...state.users] : [];
  if (state.session?.id && !users.some((user) => user?.id === state.session.id)) {
    users.unshift({
      id: state.session.id,
      name: state.session.name || "Usuario",
      username: state.session.username || "",
      role: state.session.role || "operador"
    });
  }
  return users
    .map((user) => {
      const snapshot = getPresenceSnapshot(user.id) || (state.session?.id === user.id
        ? {
            userId: state.session.id,
            name: state.session.name || "Usuario",
            username: state.session.username || "",
            role: state.session.role || "operador",
            section: state.section || "explorer",
            lastSeenAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            firstSeenAt: new Date().toISOString(),
            status: "online"
          }
        : null);
      const lastSeenSource = snapshot?.lastSeenAt || snapshot?.updatedAt || snapshot?.firstSeenAt || "";
      const firstSeenSource = snapshot?.firstSeenAt || snapshot?.lastSeenAt || snapshot?.updatedAt || "";
      const lastSeen = Date.parse(lastSeenSource);
      const firstSeen = Date.parse(firstSeenSource);
      const isRecent = Number.isFinite(lastSeen) && now - lastSeen <= threshold;
      const isOnline = Boolean(snapshot && snapshot.status !== "offline" && isRecent);
      return {
        user,
        snapshot,
        isOnline,
        firstSeenAt: Number.isFinite(firstSeen) ? firstSeen : 0,
        lastSeenAt: Number.isFinite(lastSeen) ? lastSeen : 0,
        hasPresence: Boolean(snapshot)
      };
    })
    .sort((a, b) => Number(b.isOnline) - Number(a.isOnline) || b.lastSeenAt - a.lastSeenAt || a.user.name.localeCompare(b.user.name));
}

function renderPresencePanel() {
  if (!elements.presenceList) return;
  if (!canManageContent()) {
    elements.presenceList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Acesso restrito</p><h3>Somente Gestor pode ver o painel ao vivo.</h3></div></div>`;
    return;
  }

    const entries = getPresenceEntries();
    if (!entries.length) {
      elements.presenceList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Sem atividade</p><h3>Nenhum usuário cadastrado.</h3></div></div>`;
      return;
    }

    const onlineCount = entries.filter((entry) => entry.isOnline).length;
    const offlineCount = entries.length - onlineCount;

    elements.presenceList.innerHTML = `
      <div class="presence-summary">
        <span class="presence-pill online">${onlineCount} online</span>
        <span class="presence-pill offline">${offlineCount} offline</span>
      </div>
      <div class="presence-grid">
        ${entries
          .map((entry) => {
            const roleLabel = ACCESS_LEVELS[entry.user.role]?.label || entry.user.role || "Usuario";
            const snapshot = entry.snapshot || {};
            const contentTitle = snapshot.contentId ? state.content.find((item) => item.id === snapshot.contentId)?.title || "" : "";
            const onlineDuration = entry.isOnline
              ? formatDuration(Date.now() - (entry.firstSeenAt || Date.now()))
              : "";
            const offlineDuration = !entry.isOnline
              ? snapshot?.lastSeenAt || snapshot?.firstSeenAt || snapshot?.updatedAt
                ? formatDuration(Date.now() - (entry.lastSeenAt || entry.firstSeenAt || Date.now()))
                : "Nunca entrou"
              : "";
            const lastActivityText = snapshot?.lastSeenAt || snapshot?.updatedAt || snapshot?.firstSeenAt
              ? formatDateTime(snapshot.lastSeenAt || snapshot.updatedAt || snapshot.firstSeenAt || "")
              : "Nunca entrou";
            return `
              <article class="admin-item presence-card ${entry.isOnline ? "presence-online" : "presence-offline"}">
                <div class="admin-item-top">
                  <div>
                    <strong>${escapeHtml(entry.user.name || "Usuário")}</strong>
                    <p>${escapeHtml(entry.user.username || "")} • ${escapeHtml(roleLabel)}</p>
                  </div>
                  <span class="badge ${entry.isOnline ? "script" : "manual"}">${entry.isOnline ? "Online" : "Offline"}</span>
                </div>
                <p>Seção atual: ${escapeHtml(getSectionLabel(snapshot.section || state.section))}</p>
                ${contentTitle ? `<p>Conteúdo aberto: ${escapeHtml(contentTitle)}</p>` : ""}
                <div class="presence-times">
                  <span>${entry.isOnline ? "Online há" : "Offline há"} ${escapeHtml(entry.isOnline ? onlineDuration : offlineDuration)}</span>
                  <span>Última atividade: ${escapeHtml(lastActivityText)}</span>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

function renderOperationalPanel() {
  if (!elements.operationalList) return;
  if (!canManageContent()) {
    elements.operationalList.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Acesso restrito</p><h3>Somente Gestor pode ver o painel operacional.</h3></div></div>`;
    return;
  }

  const allEntries = getPresenceEntries();
  const entries = allEntries.filter((entry) => {
    if (operationalStatusFilter === "online" && !entry.isOnline) return false;
    if (operationalStatusFilter === "offline" && entry.isOnline) return false;
    if (!operationalQuery) return true;
    const search = normalizeUsername(entry.user.name);
    return search.includes(normalizeUsername(operationalQuery));
  });

  const onlineCount = allEntries.filter((entry) => entry.isOnline).length;
  const offlineCount = allEntries.length - onlineCount;

  if (elements.operationalFilterOnline) {
    elements.operationalFilterOnline.classList.toggle("active", operationalStatusFilter === "online");
    elements.operationalFilterOnline.setAttribute("aria-pressed", operationalStatusFilter === "online" ? "true" : "false");
  }
  if (elements.operationalFilterOffline) {
    elements.operationalFilterOffline.classList.toggle("active", operationalStatusFilter === "offline");
    elements.operationalFilterOffline.setAttribute("aria-pressed", operationalStatusFilter === "offline" ? "true" : "false");
  }

  elements.operationalList.innerHTML = `
    <div class="presence-summary operational-summary">
      <span class="presence-pill online">${onlineCount} online</span>
      <span class="presence-pill offline">${offlineCount} offline</span>
    </div>
    <div class="operational-user-list">
      ${entries.length
        ? entries.map((entry) => `
          <button class="operational-user-chip ${entry.isOnline ? "presence-online" : "presence-offline"}" type="button" data-operational-user="${entry.user.id}">
            <span class="operational-user-name">${escapeHtml(entry.user.name || "Usuário")}</span>
          </button>
        `).join("")
        : `<div class="empty-state"><div><h3>Nenhum usuário encontrado.</h3></div></div>`}
    </div>
  `;

  document.querySelectorAll("[data-operational-user]").forEach((button) => {
    button.addEventListener("click", () => openOperationalUserModal(button.dataset.operationalUser));
  });
}

function openOperationalUserModal(userId) {
  if (!canManageContent()) return;
  const entry = getPresenceEntries().find((item) => item.user.id === userId);
  if (!entry) return;
  operationalUserId = userId;
  const snapshot = entry.snapshot || {};
  const lastLoginSource = snapshot.lastSeenAt || snapshot.updatedAt || snapshot.firstSeenAt || "";
  const lastLoginText = lastLoginSource ? formatDateTime(lastLoginSource) : "Nunca entrou";
  const elapsed = entry.isOnline
    ? formatDuration(Date.now() - (entry.firstSeenAt || Date.now()))
    : snapshot?.lastSeenAt || snapshot?.firstSeenAt || snapshot?.updatedAt
      ? formatDuration(Date.now() - (entry.lastSeenAt || entry.firstSeenAt || Date.now()))
      : "Nunca entrou";

  elements.operationalUserName.textContent = entry.user.name || "Usuário";
  elements.operationalUserStatus.textContent = entry.isOnline ? "Online" : "Offline";
  elements.operationalUserStatus.classList.toggle("online", entry.isOnline);
  elements.operationalUserStatus.classList.toggle("offline", !entry.isOnline);
  elements.operationalUserTime.textContent = entry.isOnline ? `Online há ${elapsed}` : `Offline há ${elapsed}`;
  if (elements.operationalUserForceLogout) {
    elements.operationalUserForceLogout.textContent = state.session?.id === userId ? "Deslogar minha sessão" : "Deslogar usuário";
  }
  elements.operationalUserLastLogin.innerHTML = `
    <p class="mono">Status: ${entry.isOnline ? "Online" : "Offline"}</p>
    <p class="mono">Último login: ${escapeHtml(lastLoginText)}</p>
  `;
  elements.operationalUserModal.classList.remove("hidden");
}

function closeOperationalUserModal() {
  operationalUserId = "";
  elements.operationalUserModal.classList.add("hidden");
}

async function handleOperationalForceLogout() {
  if (!canManageContent() || !operationalUserId) return;
  const entry = getPresenceEntries().find((item) => item.user.id === operationalUserId);
  if (!entry) return;
  const targetName = entry.user.name || "Usuário";
  const confirmed = window.confirm(`Deseja deslogar ${targetName} da plataforma agora?`);
  if (!confirmed) return;

  state.meta.forcedLogouts = state.meta.forcedLogouts && typeof state.meta.forcedLogouts === "object"
    ? state.meta.forcedLogouts
    : {};
  state.meta.forcedLogouts[operationalUserId] = new Date().toISOString();
  clearPresence(operationalUserId);
  await saveState({ awaitRemote: true });

  if (state.session?.id === operationalUserId) {
    handleLogout();
    return;
  }

  closeOperationalUserModal();
  renderOperationalPanel();
  window.alert(`${targetName} foi deslogado da plataforma.`);
}

function renderContentAuditModal(contentId) {
  if (!elements.contentAuditModal) return;
  const item = state.content.find((content) => content.id === contentId);
  if (!item) return;
  const viewers = Object.values(item.viewStats || {})
    .filter((viewer) => viewer && viewer.userId)
    .sort((a, b) => Date.parse(b.lastViewedAt || 0) - Date.parse(a.lastViewedAt || 0));
  const viewerIds = new Set(viewers.map((viewer) => viewer.userId));
  const unseen = state.users.filter((user) => !viewerIds.has(user.id));
  const activeList = auditTabFilter === "seen" ? viewers : unseen;
  const activeLabel = auditTabFilter === "seen" ? "Já visualizaram" : "Ainda não visualizaram";

  elements.contentAuditTitle.textContent = item.title;
  elements.contentAuditSeenCount.textContent = `${viewers.length} visualizaram`;
  elements.contentAuditMissingCount.textContent = `${unseen.length} não visualizaram`;
  elements.contentAuditTabSeen?.classList.toggle("active", auditTabFilter === "seen");
  elements.contentAuditTabMissing?.classList.toggle("active", auditTabFilter === "missing");
  elements.contentAuditSeenCount?.classList.toggle("active", auditTabFilter === "seen");
  elements.contentAuditMissingCount?.classList.toggle("active", auditTabFilter === "missing");
  if (elements.contentAuditActiveLabel) {
    elements.contentAuditActiveLabel.textContent = activeLabel;
  }

  if (elements.contentAuditActiveList) {
    elements.contentAuditActiveList.innerHTML = activeList.length
      ? activeList.map((viewer) => {
          const isViewer = Boolean(viewer.userId);
          const title = isViewer ? (viewer.name || viewer.username || "Usuário") : (viewer.name || "Usuário");
          const subtitle = isViewer ? (viewer.username || "") : (viewer.username || "");
          const extra = isViewer
            ? `<span class="mono">Última leitura: ${escapeHtml(formatDateTime(viewer.lastViewedAt || viewer.firstViewedAt || ""))}</span>`
            : `<span class="mono">Ainda não abriu</span>`;
          return `
            <article class="audit-card ${isViewer ? "" : "muted"}">
              <strong>${escapeHtml(title)}</strong>
              <p>${escapeHtml(subtitle)}</p>
              ${extra}
            </article>
          `;
        }).join("")
      : `<div class="empty-state"><div><h3>${auditTabFilter === "seen" ? "Ninguém visualizou ainda." : "Todos já visualizaram."}</h3></div></div>`;
  }
}

function openContentAuditModal(contentId) {
  if (!canManageContent()) return;
  auditContentId = contentId;
  auditTabFilter = "seen";
  renderContentAuditModal(contentId);
  elements.contentAuditModal.classList.remove("hidden");
}

function closeContentAuditModal() {
  auditContentId = "";
  elements.contentAuditModal.classList.add("hidden");
}

function setContentAuditTab(tab) {
  auditTabFilter = tab === "missing" ? "missing" : "seen";
  if (auditContentId) {
    renderContentAuditModal(auditContentId);
  }
}

function renderContentViewStats() {
  if (!elements.contentViewStats) return;
  if (!canManageContent()) {
    elements.contentViewStats.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Acesso restrito</p><h3>Somente Gestor pode ver as leituras por orientação.</h3></div></div>`;
    return;
  }

  const items = [...state.content]
    .map((item) => {
      const viewers = Object.values(item.viewStats || {})
        .filter((viewer) => viewer && viewer.userId)
        .sort((a, b) => Date.parse(b.lastViewedAt || 0) - Date.parse(a.lastViewedAt || 0));
      return { item, viewers };
    })
    .filter(({ viewers }) => viewers.length > 0)
    .sort((a, b) => {
      const left = Date.parse(a.viewers[0]?.lastViewedAt || a.item.updatedAt || 0);
      const right = Date.parse(b.viewers[0]?.lastViewedAt || b.item.updatedAt || 0);
      return right - left;
    });

  if (!items.length) {
    elements.contentViewStats.innerHTML = `<div class="empty-state"><div><p class="eyebrow">Sem leituras</p><h3>Nenhuma orientação foi visualizada ainda.</h3></div></div>`;
    return;
  }

  elements.contentViewStats.innerHTML = items
      .slice(0, 8)
      .map(({ item, viewers }) => {
        const viewerNames = viewers.slice(0, 4).map((viewer) => viewer.name || viewer.username || "Usuário").join(" • ");
        const latestViewer = viewers[0];
        const viewerDetails = viewers
          .slice(0, 5)
          .map((viewer) => {
            const label = viewer.name || viewer.username || "Usuário";
            const seenAt = formatDateTime(viewer.lastViewedAt || viewer.firstViewedAt || "");
            return `<li><strong>${escapeHtml(label)}</strong><span>${escapeHtml(seenAt)}</span></li>`;
          })
          .join("");
        return `
          <article class="admin-item">
            <div class="admin-item-top">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(getCategoryName(item.category))} • ${viewers.length} visualização(ões)</p>
              </div>
              <span class="badge manual">${viewers.length}</span>
            </div>
            <p>${escapeHtml(viewerNames || "Sem leitores recentes.")}</p>
            <p class="mono">
              Última leitura: ${escapeHtml(formatDateTime(latestViewer?.lastViewedAt || item.updatedAt))}
            </p>
            <ul class="viewer-log">
              ${viewerDetails}
            </ul>
          </article>
        `;
      })
      .join("");
  }

function renderActiveFilters() {
  const pills = [
    ...state.filters.categories.map((value) => getCategoryName(value)),
    ...state.filters.types.map((value) => getTypeName(value)),
    ...state.filters.tags
  ];
  elements.activeFilters.innerHTML = pills.length ? pills.map((pill) => `<span class="filter-pill">${pill}</span>`).join("") : `<span class="filter-pill">Sem filtros adicionais</span>`;
}

function updateSummary() {
  // summary removed from top bar by design
}

function openDetail(contentId) {
  const item = state.content.find((content) => content.id === contentId);
  if (!item) return;
  state.selectedContentId = contentId;
  persistCurrentUserViewState();
  item.accessCount += 1;
  registerContentView(contentId);
  void markNotificationAsSeen(contentId);
  touchPresence({ contentId });
  saveState();
  renderDetail();
  setSection("content-view-screen");
}

function toggleFavorite(contentId) {
  state.meta.favorites = isFavorite(contentId) ? state.meta.favorites.filter((id) => id !== contentId) : [...state.meta.favorites, contentId];
  saveState();
}

function isFavorite(contentId) {
  return state.meta.favorites.includes(contentId);
}

function registerFeedback(contentId, vote) {
  const content = state.content.find((item) => item.id === contentId);
  if (!content) return;
  content.helpful[vote] += 1;
  saveState();
  renderAll();
}

async function handleContentSubmit(event) {
  event.preventDefault();
  if (!canManageContent()) {
    return;
  }
  try {
    const existingIndex = state.content.findIndex((item) => item.id === elements.form.id.value);
    const existingAttachments = existingIndex >= 0 ? normalizeAttachments(state.content[existingIndex]) : [];
    const selectedFiles = Array.from(elements.form.attachment?.files || []);
    const nextAttachments = selectedFiles.length
      ? await Promise.all(selectedFiles.map((file) => saveAttachmentRecord(file)))
      : existingAttachments;
    const rawBody = elements.form.body.value.trim();
      const payload = {
        id: elements.form.id.value || crypto.randomUUID(),
        title: elements.form.title.value.trim(),
        category: elements.form.category.value,
        type: elements.form.type.value,
      summary: elements.form.summary.value.trim(),
      tags: splitCSV(elements.form.tags.value),
      keywords: splitCSV(elements.form.keywords.value),
      body: rawBody ? parseBody(rawBody) : [],
      attachments: nextAttachments,
      attachment: nextAttachments[0] || null,
        featured: elements.form.featured.checked,
        urgent: elements.form.urgent.checked,
        allowCopy: elements.form.script.checked,
        postedAt: existingIndex >= 0 ? state.content[existingIndex].postedAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        helpful: { yes: 0, no: 0 },
        accessCount: 0,
        viewStats: existingIndex >= 0 ? state.content[existingIndex].viewStats || {} : {}
      };
    const desktopPermissionPromise = payload.urgent ? ensureDesktopNotificationPermission() : Promise.resolve(false);
    if (!payload.summary || (!payload.body.length && !payload.attachments.length)) {
      alert("Preencha um resumo e envie texto ou anexe ao menos um documento.");
      return;
    }

      if (existingIndex >= 0) {
        payload.helpful = state.content[existingIndex].helpful;
        payload.accessCount = state.content[existingIndex].accessCount;
        state.content.splice(existingIndex, 1, payload);
      } else {
      state.content.unshift(payload);
    }

    pendingUrgentNotificationId = payload.urgent ? payload.id : null;
    remoteChangeRevision += 1;
    remoteSyncPending = true;
    renderAll();
    const contentResponse = await fetch(REMOTE_CONTENT_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const contentResult = await contentResponse.json().catch(() => null);
    if (!contentResponse.ok || !contentResult?.ok) {
      throw new Error(contentResult?.error || "Nao foi possivel salvar o conteudo.");
    }

    let attachmentSyncError = null;
    try {
      await syncContentAttachments(payload.id, nextAttachments);
    } catch (attachmentError) {
      attachmentSyncError = attachmentError;
    }

    await saveState({ awaitRemote: true });
    resetForm();
    closeContentModal();
    renderAll();
    if (payload.urgent) {
      await desktopPermissionPromise;
      await maybeShowDesktopUrgentNotification(payload, true);
      pendingUrgentNotificationId = null;
    }
    setSection("admin");
    if (attachmentSyncError) {
      alert("O conteudo foi salvo, mas os anexos nao puderam ser sincronizados agora. Tente novamente com arquivos menores.");
    }
  } catch (error) {
    alert(error?.message || "Nao foi possivel salvar os anexos. Tente novamente com arquivos menores.");
  }
}

function openCreateContentModal(kind = "") {
  if (!canManageContent()) return;
  resetForm();
  applyCreateTemplate(kind);
  elements.contentCreateMenu.classList.add("hidden");
  elements.contentEditorTitle.textContent = "Novo conteudo";
  setSection("content-editor-screen");
}

function closeContentModal() {
  setSection("admin");
}

function openContentViewModal(contentId) {
  const item = state.content.find((content) => content.id === contentId);
  if (!item) return;
  state.selectedContentId = contentId;
  persistCurrentUserViewState();
  elements.contentViewBody.dataset.contentId = item.id;
  elements.contentViewTitle.textContent = item.title;
  registerContentView(contentId);
  void markNotificationAsSeen(contentId);
  touchPresence({ contentId });
  const attachment = buildAttachmentMarkup(normalizeAttachments(item));
  const bodyLines = Array.isArray(item.body) ? item.body : [];
  const bodyMarkup = bodyLines.length
    ? bodyLines.map((block) => {
        if (block.startsWith("CALL OUT::")) {
          const [, tone, text] = block.split("::");
          return `<div class="callout ${tone}">${escapeHtml(text)}</div>`;
        }
        if (block.startsWith("- ")) return `<li>${escapeHtml(block.slice(2))}</li>`;
        return `<p>${escapeHtml(block)}</p>`;
      }).join("")
    : `<p>${escapeHtml(item.summary || "Documento sem texto adicional.")}</p>`;
  const wrappedBody = bodyMarkup.includes("<li>") ? bodyMarkup.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`) : bodyMarkup;
  elements.contentViewBody.innerHTML = `
    <div class="content-view-meta">
      <span class="filter-pill">${getCategoryName(item.category)}</span>
      <span class="filter-pill">${getTypeName(item.type)}</span>
      <span class="filter-pill">${formatDate(item.updatedAt)}</span>
    </div>
    <p class="content-view-summary">${escapeHtml(item.summary)}</p>
    <div class="tag-row">${(item.tags || []).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
    ${attachment}
    <div class="content-view-copy">
      ${wrappedBody}
    </div>
  `;
  elements.contentViewEdit.classList.toggle("hidden", !canManageContent());
  setSection("content-view-screen");
  void hydrateAttachmentPreviews(elements.contentViewBody);
}

function closeContentViewModal() {
  lastDetailRenderKey = "";
  delete elements.contentViewBody.dataset.contentId;
  state.selectedContentId = null;
  persistCurrentUserViewState();
  saveState({ syncRemote: false });
  setSection("explorer");
}

function populateForm(contentId) {
  if (!canManageContent()) {
    return;
  }
  const item = state.content.find((content) => content.id === contentId);
  if (!item) return;
  elements.form.id.value = item.id;
  elements.form.title.value = item.title;
  elements.form.category.value = item.category;
  elements.form.type.value = item.type;
  elements.form.summary.value = item.summary;
  elements.form.tags.value = item.tags.join(", ");
  elements.form.keywords.value = item.keywords.join(", ");
  elements.form.body.value = item.body.join("\n\n");
  elements.form.featured.checked = item.featured;
  elements.form.script.checked = item.allowCopy;
  elements.form.urgent.checked = Boolean(item.urgent);
  editorAttachments = normalizeAttachments(item);
  updateAttachmentInfo(editorAttachments);
  elements.contentEditorTitle.textContent = "Editar conteudo";
  setSection("content-editor-screen");
}

function resetForm() {
  elements.contentForm.reset();
  elements.form.id.value = "";
  editorAttachments = [];
  updateAttachmentInfo(editorAttachments);
  elements.contentEditorTitle.textContent = "Novo conteudo";
}

function applyCreateTemplate(kind) {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  if (normalizedKind === "aviso") {
    elements.form.category.value = "alerts";
    elements.form.type.value = "informativo";
    return;
  }

  if (normalizedKind === "documento") {
    elements.form.category.value = "manuals";
    elements.form.type.value = "documento";
    return;
  }

  if (normalizedKind === "procedimento") {
    elements.form.category.value = "manuals";
    elements.form.type.value = "manual";
  }
}

async function handleUserSubmit(event) {
  event.preventDefault();
  if (!canManageContent()) return;

  const existingIndex = state.users.findIndex((item) => item.id === elements.user.id.value);
  const existingUser = existingIndex >= 0 ? state.users[existingIndex] : null;

  const payload = {
    id: elements.user.id.value || crypto.randomUUID(),
    name: elements.user.name.value.trim(),
    username: normalizeUsername(elements.user.username.value),
    role: elements.user.role.value,
    password: existingUser?.password || TEMP_PASSWORD,
    mustChangePassword: existingUser ? Boolean(existingUser.mustChangePassword) : true
  };

  if (!payload.name || !payload.username) {
    return;
  }

  const duplicated = state.users.find((item) => item.username === payload.username && item.id !== payload.id);
  if (duplicated) {
    alert("Ja existe um usuario com esse login.");
    return;
  }

  const response = await fetch(REMOTE_USERS_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    alert(result?.error || "Nao foi possivel salvar o usuario.");
    return;
  }

  if (Array.isArray(result.users)) {
    state.users = sanitizeUsers(result.users);
  } else if (existingIndex >= 0) {
    state.users.splice(existingIndex, 1, payload);
  } else {
    state.users.unshift(payload);
  }

  if (state.session?.id === payload.id) {
    state.session = { ...state.session, role: payload.role, username: payload.username };
    saveSession(state.session);
  }

  await saveState({ awaitRemote: true });
  resetUserForm();
  syncAuthView();
  renderAll();
}

function populateUserForm(userId) {
  if (!canManageContent()) return;
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  elements.user.id.value = user.id;
  elements.user.name.value = user.name;
  elements.user.username.value = user.username;
  elements.user.role.value = user.role;
  elements.user.password.value = user.password;
}

function resetUserForm() {
  elements.userForm.reset();
  elements.user.id.value = "";
}

function removeUser(userId) {
  if (!canManageContent()) return;
  state.users = state.users.filter((item) => item.id !== userId);
  void saveState();
  renderAll();
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "US";
}

async function removeContent(contentId) {
  if (!canManageContent()) {
    return;
  }
  const response = await fetch(`${REMOTE_CONTENT_URL}/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentId })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Nao foi possivel excluir o conteudo.");
  }
  const wasSelected = state.selectedContentId === contentId;
  state.content = state.content.filter((item) => item.id !== contentId);
  state.meta.favorites = state.meta.favorites.filter((id) => id !== contentId);
  if (wasSelected) {
    state.selectedContentId = null;
    lastDetailRenderKey = "";
  }
  await saveState({ awaitRemote: true });
  renderAll();
}

function saveSearch(term) {
  const cleaned = term.trim();
  if (!cleaned) return;
  state.meta.searchHistory = [cleaned, ...state.meta.searchHistory.filter((item) => item !== cleaned)].slice(0, 8);
  saveState();
}

function splitCSV(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseBody(value) {
  return value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

function getSnippet(item) {
  const source = item.body.join(" ");
  if (!state.query) return `${escapeHtml(source.slice(0, 140))}...`;
  const normalizedSource = normalize(source);
  const index = normalizedSource.indexOf(normalize(state.query));
  if (index < 0) return `${escapeHtml(source.slice(0, 140))}...`;
  const start = Math.max(0, index - 40);
  const end = Math.min(source.length, index + state.query.length + 80);
  return `...${highlight(source.slice(start, end), state.query)}...`;
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escapeHtml(text).replace(new RegExp(`(${safeQuery})`, "gi"), "<mark>$1</mark>");
}

function normalize(text) {
  return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

function formatDate(dateString) {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "Não informado";
  }
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}

function estimateReadingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min de leitura`;
}

function getCategoryName(categoryId) {
  return categories.find((item) => item.id === categoryId)?.name || categoryId;
}

function getTypeName(typeId) {
  return types.find((item) => item.id === typeId)?.name || typeId;
}


