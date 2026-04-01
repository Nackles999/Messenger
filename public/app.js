const TOKEN_KEY = "friends_messenger_token";
const REACTIONS = ["\uD83D\uDC4D", "\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDD25", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDC4F"];
const EMOJI_PICKER_MODULE_PATH = "/vendor/emoji-button.js?v=20260331c";
const EMOJI_PICKER_CATEGORIES = ["smileys", "people", "animals", "food", "activities", "travel", "objects", "symbols", "flags"];
const EMOJI_CATEGORY_SEARCH_ALIASES = {
  smileys: ["смайл", "смайлик", "улыбка", "эмоция", "эмоции", "лицо"],
  people: ["люди", "человек", "тело", "жест", "рука", "руки"],
  animals: ["животные", "животное", "природа", "птица", "рыба"],
  food: ["еда", "напиток", "напитки", "фрукты", "овощи"],
  activities: ["активности", "спорт", "игра", "игры", "праздник"],
  travel: ["путешествия", "транспорт", "поездка", "места", "город"],
  objects: ["объекты", "предмет", "предметы", "инструмент", "вещь"],
  symbols: ["символы", "символ", "знак", "знаки"],
  flags: ["флаги", "флаг", "страна", "страны"],
};
const EMOJI_SEARCH_ALIASES = {
  "😀": ["улыбка", "смайлик", "радость"],
  "😃": ["улыбка", "смайлик", "радость"],
  "😄": ["улыбка", "радость", "счастье"],
  "😁": ["улыбка", "радость", "счастье"],
  "🙂": ["улыбка", "спокойствие"],
  "😊": ["улыбка", "смущение", "радость"],
  "😂": ["смех", "слезы", "смешно"],
  "🤣": ["смех", "ржу", "смешно"],
  "😉": ["подмигивание", "подмигнуть"],
  "😍": ["любовь", "влюблен", "сердечки"],
  "😘": ["поцелуй", "любовь"],
  "😎": ["круто", "очки", "класс"],
  "🤔": ["думать", "думаю", "вопрос"],
  "😭": ["плач", "слезы", "грусть"],
  "😢": ["грусть", "слезы", "печаль"],
  "😡": ["злость", "сердитый", "гнев"],
  "🥳": ["праздник", "вечеринка", "ура"],
  "❤️": ["сердце", "любовь"],
  "💙": ["сердце", "любовь"],
  "💚": ["сердце", "любовь"],
  "💛": ["сердце", "любовь"],
  "💜": ["сердце", "любовь"],
  "🔥": ["огонь", "жар", "круто"],
  "✨": ["искры", "блеск", "магия"],
  "⭐": ["звезда"],
  "🌟": ["звезда", "сияние"],
  "👍": ["лайк", "палец вверх", "ок"],
  "👎": ["дизлайк", "палец вниз"],
  "👌": ["ок", "хорошо"],
  "🙏": ["спасибо", "пожалуйста", "молитва"],
  "👏": ["аплодисменты", "хлопки"],
  "🎉": ["праздник", "салют", "конфетти"],
  "🎁": ["подарок"],
  "🚀": ["ракета", "запуск"],
  "⚽": ["футбол", "мяч"],
  "🍕": ["пицца"],
  "🍔": ["бургер"],
  "📎": ["скрепка", "вложение"],
  "📄": ["документ", "файл"],
  "📷": ["камера", "фотоаппарат"],
  "📸": ["фото", "снимок"],
  "🍄": ["гриб", "мухомор"],
};
const CHAT_SELECTION_HINT_TEXT = "Выберите, кому хотели бы написать";

const FALLBACK_SYNC_INTERVAL_MS = 5000;
const READ_ACK_DELAY_MS = 350;
const MESSAGE_SERIES_GAP_MS = 10 * 60 * 1000;
const MESSAGE_LONG_PRESS_MS = 450;
const MESSAGE_LONG_PRESS_MOVE_THRESHOLD_PX = 8;
const CHAT_SEARCH_PAGE_LIMIT = 30;
const SIDEBAR_SEARCH_MIN_LEN = 2;
const SIDEBAR_SEARCH_DEBOUNCE_MS = 220;
const SIDEBAR_SEARCH_USER_LIMIT = 8;
const SIDEBAR_SEARCH_GROUP_LIMIT = 8;
const MAX_AVATAR_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_AVATAR_DATA_URL_CHARS = 2800000;
const AVATAR_MAX_SIDE = 768;
const MAX_ATTACHMENT_BYTES = 12 * 1024 * 1024;
const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const bootScreen = document.getElementById("boot-screen");
const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app-screen");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const authForm = document.getElementById("auth-form");
const usernameInput = document.getElementById("username-input");
const displayNameRow = document.getElementById("display-name-row");
const displayNameInput = document.getElementById("display-name-input");
const passwordInput = document.getElementById("password-input");
const inviteKeyRow = document.getElementById("invite-key-row");
const inviteKeyInput = document.getElementById("invite-key-input");
const authSubmit = document.getElementById("auth-submit");
const authError = document.getElementById("auth-error");
const authSubtitle = document.getElementById("auth-subtitle");
const authSwitchBtn = document.getElementById("auth-switch-btn");
const usernameError = document.getElementById("username-error");
const displayNameError = document.getElementById("display-name-error");
const passwordError = document.getElementById("password-error");
const inviteKeyError = document.getElementById("invite-key-error");
const passwordToggleBtn = document.getElementById("password-toggle-btn");
const inviteKeyToggleBtn = document.getElementById("invite-key-toggle-btn");

const meDisplay = document.getElementById("me-display");
const meAvatar = document.getElementById("me-avatar");
const meUsername = document.getElementById("me-username");
const meProfileCard = document.getElementById("me-profile-card");
const socketState = document.getElementById("socket-state");
const logoutBtn = document.getElementById("logout-btn");
const newChatBtn = document.getElementById("new-chat-btn");
const createMenu = document.getElementById("create-menu");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchFeedback = document.getElementById("search-feedback");
const sidebarSearchResults = document.getElementById("sidebar-search-results");
const archiveToggleBtn = document.getElementById("archive-toggle-btn");

const globalSearchForm = document.getElementById("global-search-form");
const globalSearchInput = document.getElementById("global-search-input");
const globalSearchState = document.getElementById("global-search-state");
const globalSearchResults = document.getElementById("global-search-results");

const chatListState = document.getElementById("chat-list-state");
const chatList = document.getElementById("chat-list");
const chatHeaderMain = document.getElementById("chat-header-main");
const chatHeaderAvatar = document.getElementById("chat-header-avatar");
const mobileChatBackBtn = document.getElementById("mobile-chat-back-btn");
const chatTitle = document.getElementById("chat-title");
const chatMeta = document.getElementById("chat-meta");
const chatPanelRoot = document.querySelector(".chat-panel");

const chatPinBtn = document.getElementById("chat-pin-btn");
const chatMuteBtn = document.getElementById("chat-mute-btn");
const chatArchiveBtn = document.getElementById("chat-archive-btn");
const groupInfoBtn = document.getElementById("group-info-btn");
const groupLeaveBtn = document.getElementById("group-leave-btn");

const chatSearchForm = document.getElementById("chat-search-form");
const chatSearchInput = document.getElementById("chat-search-input");
const chatSearchResults = document.getElementById("chat-search-results");
const chatSearchClearBtn = document.getElementById("chat-search-clear-btn");

const messagesFrame = document.getElementById("messages-frame");
const chatDropOverlay = document.getElementById("chat-drop-overlay");
const messagesState = document.getElementById("messages-state");
const messagesRoot = document.getElementById("messages");
const replyBox = document.getElementById("reply-box");
const replyLabel = document.getElementById("reply-label");
const replyCancelBtn = document.getElementById("reply-cancel-btn");
const composer = document.getElementById("composer");
const composerAttachmentPreview = document.getElementById("composer-attachment-preview");
const composerAttachBtn = document.getElementById("composer-attach-btn");
const composerEmojiBtn = document.getElementById("composer-emoji-btn");
const composerAttachMenu = document.getElementById("composer-attach-menu");
const composerAttachPhotoBtn = document.getElementById("composer-attach-photo-btn");
const composerAttachDocBtn = document.getElementById("composer-attach-doc-btn");
const composerPhotoInput = document.getElementById("composer-photo-input");
const composerDocInput = document.getElementById("composer-doc-input");
const composerInput = document.getElementById("composer-input");
const composerSubmitBtn = composer.querySelector("button[type='submit']");

const uiOverlay = document.getElementById("ui-overlay");
const groupPanel = document.getElementById("group-panel");
const groupPanelCloseBtn = document.getElementById("group-panel-close-btn");
const groupPanelTitle = document.getElementById("group-panel-title");
const groupPanelMeta = document.getElementById("group-panel-meta");
const groupPanelFeedback = document.getElementById("group-panel-feedback");
const groupRenameForm = document.getElementById("group-rename-form");
const groupRenameInput = document.getElementById("group-rename-input");
const groupRenameSubmitBtn = document.getElementById("group-rename-submit-btn");
const groupMembersCount = document.getElementById("group-members-count");
const groupMembersList = document.getElementById("group-members-list");
const groupMembersState = document.getElementById("group-members-state");
const groupAddOpenBtn = document.getElementById("group-add-open-btn");
const groupAddModal = document.getElementById("group-add-modal");
const groupAddModalCloseBtn = document.getElementById("group-add-modal-close-btn");
const groupAddModalSearchForm = document.getElementById("group-add-modal-search-form");
const groupAddModalInput = document.getElementById("group-add-modal-input");
const groupAddModalState = document.getElementById("group-add-modal-state");
const groupAddModalFeedback = document.getElementById("group-add-modal-feedback");
const groupAddRecentCount = document.getElementById("group-add-recent-count");
const groupAddResultsCount = document.getElementById("group-add-results-count");
const groupAddModalRecentList = document.getElementById("group-add-modal-recent-list");
const groupAddModalResultsList = document.getElementById("group-add-modal-results-list");
const groupAddModalSelected = document.getElementById("group-add-modal-selected");
const groupAddModalCancelBtn = document.getElementById("group-add-modal-cancel-btn");
const groupAddModalSubmitBtn = document.getElementById("group-add-modal-submit-btn");

const profilePanel = document.getElementById("profile-panel");
const profilePanelCloseBtn = document.getElementById("profile-panel-close-btn");
const profilePanelFeedback = document.getElementById("profile-panel-feedback");
const profilePanelAvatar = document.getElementById("profile-panel-avatar");
const profileAvatarFileInput = document.getElementById("profile-avatar-file-input");
const profileAvatarEditActions = document.getElementById("profile-avatar-edit-actions");
const profileAvatarChangeBtn = document.getElementById("profile-avatar-change-btn");
const profileAvatarResetBtn = document.getElementById("profile-avatar-reset-btn");
const profileViewMode = document.getElementById("profile-view-mode");
const profileViewDisplay = document.getElementById("profile-view-display");
const profileViewUsername = document.getElementById("profile-view-username");
const profileViewStatus = document.getElementById("profile-view-status");
const profileViewBio = document.getElementById("profile-view-bio");
const profileEditBtn = document.getElementById("profile-edit-btn");
const profileEditForm = document.getElementById("profile-edit-form");
const profileDisplayInput = document.getElementById("profile-display-input");
const profileUsernameInput = document.getElementById("profile-username-input");
const profileBioInput = document.getElementById("profile-bio-input");
const profileEditError = document.getElementById("profile-edit-error");
const profileEditCancelBtn = document.getElementById("profile-edit-cancel-btn");
const profileEditSaveBtn = document.getElementById("profile-edit-save-btn");
const profilePanelLogoutBtn = document.getElementById("profile-panel-logout-btn");

const contactPanel = document.getElementById("contact-panel");
const contactPanelCloseBtn = document.getElementById("contact-panel-close-btn");
const contactPanelFeedback = document.getElementById("contact-panel-feedback");
const contactPanelAvatar = document.getElementById("contact-panel-avatar");
const contactPanelDisplay = document.getElementById("contact-panel-display");
const contactPanelUsername = document.getElementById("contact-panel-username");
const contactPanelStatus = document.getElementById("contact-panel-status");
const contactPanelBio = document.getElementById("contact-panel-bio");
const contactPanelSearchBtn = document.getElementById("contact-panel-search-btn");
const contactPanelMuteBtn = document.getElementById("contact-panel-mute-btn");
const contactPanelBlockBtn = document.getElementById("contact-panel-block-btn");

const createGroupModal = document.getElementById("create-group-modal");
const createGroupCloseBtn = document.getElementById("create-group-close-btn");
const createTabDirectBtn = document.getElementById("create-tab-direct-btn");
const createTabGroupBtn = document.getElementById("create-tab-group-btn");
const createDirectView = document.getElementById("create-direct-view");
const createGroupView = document.getElementById("create-group-view");
const createDirectSearchInput = document.getElementById("create-direct-search-input");
const createDirectState = document.getElementById("create-direct-state");
const createDirectRecentList = document.getElementById("create-direct-recent-list");
const createDirectResults = document.getElementById("create-direct-results");
const createGroupStepUsers = document.getElementById("create-group-step-users");
const createGroupStepTitle = document.getElementById("create-group-step-title");
const createGroupTitleInput = document.getElementById("create-group-title-input");
const createGroupSearchInput = document.getElementById("create-group-search-input");
const createGroupSearchState = document.getElementById("create-group-search-state");
const createGroupRecentList = document.getElementById("create-group-recent-list");
const createGroupSearchResults = document.getElementById("create-group-search-results");
const createGroupSelected = document.getElementById("create-group-selected");
const createGroupMembersPreview = document.getElementById("create-group-members-preview");
const createGroupFeedback = document.getElementById("create-group-feedback");
const createGroupCancelBtn = document.getElementById("create-group-cancel-btn");
const createGroupBackBtn = document.getElementById("create-group-back-btn");
const createGroupNextBtn = document.getElementById("create-group-next-btn");
const createGroupSubmitBtn = document.getElementById("create-group-submit-btn");

const confirmModal = document.getElementById("confirm-modal");
const confirmModalText = document.getElementById("confirm-modal-text");
const confirmModalCancelBtn = document.getElementById("confirm-modal-cancel-btn");
const confirmModalAcceptBtn = document.getElementById("confirm-modal-accept-btn");

const messageEditModal = document.getElementById("message-edit-modal");
const messageEditForm = document.getElementById("message-edit-form");
const messageEditInput = document.getElementById("message-edit-input");
const messageEditFeedback = document.getElementById("message-edit-feedback");
const messageEditCloseBtn = document.getElementById("message-edit-close-btn");
const messageEditCancelBtn = document.getElementById("message-edit-cancel-btn");
const messageEditSaveBtn = document.getElementById("message-edit-save-btn");

const messageForwardModal = document.getElementById("message-forward-modal");
const messageForwardPreview = document.getElementById("message-forward-preview");
const messageForwardSearchInput = document.getElementById("message-forward-search-input");
const messageForwardFeedback = document.getElementById("message-forward-feedback");
const messageForwardList = document.getElementById("message-forward-list");
const messageForwardCloseBtn = document.getElementById("message-forward-close-btn");
const messageForwardCancelBtn = document.getElementById("message-forward-cancel-btn");
const messageForwardSendBtn = document.getElementById("message-forward-send-btn");

let mode = "login";
let token = localStorage.getItem(TOKEN_KEY) || "";
let me = null;
let chats = [];
let activeChatId = null;
let activeMessages = [];
let showArchived = false;
let replyTarget = null;
let ws = null;
let reconnectTimer = null;
let manualDisconnect = false;
let pendingJumpMessageId = null;
let chatsRequestSeq = 0;
let messagesRequestSeq = 0;
let chatsRefreshTimer = null;
let messagesRefreshTimer = null;
let fallbackSyncTimer = null;
let fallbackSyncInFlight = false;
let readAckTimer = null;
let pendingReadAckChatId = null;
let chatSearchRequestSeq = 0;
let chatSearchQuery = "";
let chatSearchOffset = 0;
let chatSearchTotal = 0;
let chatSearchHasMore = false;
let chatSearchItems = [];
let sidebarSearchRequestSeq = 0;
let sidebarSearchTimer = null;
let sidebarSearchQuery = "";
let sidebarSearchEntries = [];
let sidebarSearchActiveIndex = -1;
let sidebarSearchOpening = false;
let sendingMessage = false;
let chatDragDepth = 0;
let messagesStateAutoHideTimer = null;
let messagesStateFadeTimer = null;
let messagesStateVersion = 0;
let composerAttachmentDraft = null;
let groupPanelChatId = null;
let groupMembersCache = [];
let groupAddRecentUsers = [];
let groupAddSearchUsers = [];
let groupAddSelectedUsers = [];
let groupAddSearchSeq = 0;
let groupAddSearchTimer = null;
let groupAddSubmitting = false;
let createGroupSelectedUsers = [];
let createFlowMode = "direct";
let createGroupStep = "users";
let createRecentUsers = [];
let createDirectSearchSeq = 0;
let createGroupSearchSeq = 0;
let createDirectSearchTimer = null;
let createGroupSearchTimer = null;
let creatingGroupInFlight = false;
let confirmResolve = null;
let editingMessageId = null;
let forwardingMessage = null;
let forwardingInFlight = false;
let forwardSelectedChatIds = new Set();
let forwardCandidates = [];
let profileEditMode = false;
let profileSaving = false;
let profileAvatarDraft = "";
let profileAvatarChanged = false;
let authSubmitting = false;
let keepChatDeselected = false;
let emojiButtonCtor = null;
let emojiPickerLoadPromise = null;
let localizedEmojiDataPromise = null;
let composerEmojiPickerInstance = null;
let reactionEmojiPickerInstance = null;
let reactionPickerTarget = null;
let reactionPickerTrigger = null;
let reactionPickerHostMessage = null;
let messageLongPressState = null;
let messagePopoverHost = null;
let messagePopoverDismissGuardUntil = 0;
const PHONE_LAYOUT_QUERY = window.matchMedia("(max-width: 767px)");
const TABLET_LAYOUT_QUERY = window.matchMedia("(min-width: 768px) and (max-width: 1024px)");
let isPhoneLayoutViewport = PHONE_LAYOUT_QUERY.matches;
let isTabletLayoutViewport = TABLET_LAYOUT_QUERY.matches;
const EDGE_BACK_SWIPE_START_MAX_X = 18;
const EDGE_BACK_SWIPE_TRIGGER_PX = 108;
const EDGE_BACK_SWIPE_MAX_VERTICAL_PX = 24;
const EDGE_BACK_SWIPE_LOCK_PX = 28;
let edgeBackSwipeState = null;
let chatChromeSyncFrame = 0;
let chatChromeSyncNeedsViewportRefresh = false;
let chatChromeSyncPreserveBottom = false;
let preserveBottomOnNextResponsiveSync = false;
let composerLayoutObserver = null;

function getViewportMetrics() {
  const visualViewport = window.visualViewport;
  const layoutViewportHeight = Math.max(
    0,
    Number(window.innerHeight) || 0,
  );
  const viewportHeight = Math.max(
    0,
    Number(visualViewport?.height) || layoutViewportHeight,
  );
  const viewportOffsetTop = Math.max(0, Number(visualViewport?.offsetTop) || 0);
  const viewportBottomInset = Math.max(
    0,
    Math.round(layoutViewportHeight - (viewportHeight + viewportOffsetTop)),
  );

  return {
    visualViewport,
    layoutViewportHeight,
    viewportHeight,
    viewportOffsetTop,
    viewportBottomInset,
  };
}

function isTextInputLikeElement(node) {
  return Boolean(
    node instanceof Element
    && node.matches("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']"),
  );
}

function isAppTextInputFocused() {
  const activeElement = document.activeElement;
  return Boolean(
    activeElement
    && appScreen
    && appScreen.contains(activeElement)
    && isTextInputLikeElement(activeElement),
  );
}

function isPhoneKeyboardOpen(metrics = getViewportMetrics()) {
  return Boolean(
    isPhoneLayout()
    && isAppTextInputFocused()
    && metrics.viewportBottomInset > 88,
  );
}

function syncViewportHeightVariable() {
  const metrics = getViewportMetrics();
  const viewportHeight = Math.max(
    320,
    isPhoneLayout()
      ? (
        isPhoneKeyboardOpen(metrics)
          ? metrics.viewportHeight || metrics.layoutViewportHeight || 0
          : metrics.layoutViewportHeight || metrics.viewportHeight || 0
      )
      : metrics.viewportHeight || metrics.layoutViewportHeight || 0,
  );
  document.documentElement.style.setProperty("--app-vh", `${viewportHeight * 0.01}px`);
}

function isElementRendered(node) {
  return Boolean(node && !node.classList.contains("hidden"));
}

function measureOuterHeight(node) {
  if (!isElementRendered(node)) return 0;
  const rect = node.getBoundingClientRect();
  const styles = window.getComputedStyle(node);
  const marginTop = Number.parseFloat(styles.marginTop || "0") || 0;
  const marginBottom = Number.parseFloat(styles.marginBottom || "0") || 0;
  return Math.max(0, Math.round(rect.height + marginTop + marginBottom));
}

function isMessagesNearBottom(threshold = 120) {
  if (!messagesRoot || messagesRoot.classList.contains("hidden")) return false;
  return messagesRoot.scrollHeight - messagesRoot.scrollTop - messagesRoot.clientHeight < threshold;
}

function isComposerInputFocused() {
  const activeElement = document.activeElement;
  return Boolean(
    activeElement
    && composer
    && composer.contains(activeElement)
    && isTextInputLikeElement(activeElement),
  );
}

function resetPhoneViewportScroll() {
  if (!isPhoneLayout() || !document.body.classList.contains("app-active")) return;
  if (typeof window.scrollTo === "function") {
    window.scrollTo(0, 0);
  }
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function syncChatBottomLayoutMetrics({ preserveBottom = false } = {}) {
  const replyHeight = measureOuterHeight(replyBox);
  const composerHeight = measureOuterHeight(composer);
  const bottomStackHeight = replyHeight + composerHeight;

  if (chatPanelRoot) {
    chatPanelRoot.style.setProperty("--chat-reply-height", `${replyHeight}px`);
    chatPanelRoot.style.setProperty("--chat-composer-height", `${composerHeight}px`);
    chatPanelRoot.style.setProperty("--chat-bottom-stack-height", `${bottomStackHeight}px`);
  }

  document.documentElement.style.setProperty("--chat-reply-height", `${replyHeight}px`);
  document.documentElement.style.setProperty("--chat-composer-height", `${composerHeight}px`);
  document.documentElement.style.setProperty("--chat-bottom-stack-height", `${bottomStackHeight}px`);

  const metrics = getViewportMetrics();
  const viewportBottomInset = metrics.viewportBottomInset;

  document.documentElement.style.setProperty("--visual-viewport-bottom-inset", `${viewportBottomInset}px`);

  const keyboardOpen = isPhoneKeyboardOpen(metrics);
  document.documentElement.classList.toggle("keyboard-open", keyboardOpen);
  document.body.classList.toggle("keyboard-open", keyboardOpen);
  if (appScreen) {
    appScreen.classList.toggle("is-keyboard-open", keyboardOpen);
    appScreen.dataset.keyboardState = keyboardOpen ? "open" : "closed";
  }

  if (isPhoneLayout() && (keyboardOpen || isAppTextInputFocused())) {
    resetPhoneViewportScroll();
  }

  if (preserveBottom && messagesRoot && !messagesRoot.classList.contains("hidden")) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesRoot.scrollTop = messagesRoot.scrollHeight;
      });
    });
  }
}

function scheduleChatChromeSync({ refreshViewport = false, preserveBottom = false } = {}) {
  chatChromeSyncNeedsViewportRefresh = chatChromeSyncNeedsViewportRefresh || refreshViewport;
  chatChromeSyncPreserveBottom = chatChromeSyncPreserveBottom || preserveBottom;

  if (chatChromeSyncFrame) return;
  chatChromeSyncFrame = requestAnimationFrame(() => {
    chatChromeSyncFrame = 0;
    const shouldRefreshViewport = chatChromeSyncNeedsViewportRefresh;
    const shouldPreserveBottom = chatChromeSyncPreserveBottom;
    chatChromeSyncNeedsViewportRefresh = false;
    chatChromeSyncPreserveBottom = false;

    if (shouldRefreshViewport) {
      preserveBottomOnNextResponsiveSync = shouldPreserveBottom;
      syncViewportHeightVariable();
      syncResponsiveLayoutState();
      return;
    }

    syncChatBottomLayoutMetrics({ preserveBottom: shouldPreserveBottom });
    if (composerEmojiPickerInstance?.isPickerVisible()) {
      updateMobileComposerEmojiLayout();
    }
  });
}

function initComposerLayoutObserver() {
  if (composerLayoutObserver || typeof ResizeObserver !== "function") return;
  composerLayoutObserver = new ResizeObserver(() => {
    scheduleChatChromeSync({ preserveBottom: isMessagesNearBottom(140) });
  });
  [replyBox, composer, composerAttachmentPreview, chatPanelRoot].forEach((node) => {
    if (node) {
      composerLayoutObserver.observe(node);
    }
  });
}

function clearResponsiveShellClasses() {
  if (!appScreen) return;
  appScreen.classList.remove(
    "is-phone-layout",
    "is-mobile-layout",
    "is-tablet-layout",
    "is-desktop-layout",
    "is-mobile-chat-open",
    "is-mobile-list-open",
  );
  delete appScreen.dataset.layoutMode;
  delete appScreen.dataset.shellState;
}

function getResponsiveLayoutMode() {
  if (isPhoneLayoutViewport) return "phone";
  if (isTabletLayoutViewport) return "tablet";
  return "desktop";
}

function syncResponsiveLayoutState() {
  isPhoneLayoutViewport = PHONE_LAYOUT_QUERY.matches;
  isTabletLayoutViewport = TABLET_LAYOUT_QUERY.matches;
  if (!appScreen) return;
  const preserveBottom = preserveBottomOnNextResponsiveSync;
  preserveBottomOnNextResponsiveSync = false;

  const hasActiveChat = Boolean(activeChatId);
  const layoutMode = getResponsiveLayoutMode();
  const shellState = layoutMode === "phone" ? (hasActiveChat ? "phone-chat" : "phone-list") : layoutMode;

  clearResponsiveShellClasses();
  appScreen.dataset.layoutMode = layoutMode;
  appScreen.dataset.shellState = shellState;

  if (layoutMode === "phone") {
    appScreen.classList.add("is-phone-layout", "is-mobile-layout");
    appScreen.classList.add(hasActiveChat ? "is-mobile-chat-open" : "is-mobile-list-open");
  } else if (layoutMode === "tablet") {
    appScreen.classList.add("is-tablet-layout");
  } else {
    appScreen.classList.add("is-desktop-layout");
  }

  syncChatBoundNavigationLayers();

  if (mobileChatBackBtn) {
    const showBack = layoutMode === "phone" && hasActiveChat;
    mobileChatBackBtn.classList.toggle("hidden", !showBack);
    mobileChatBackBtn.disabled = !showBack;
  }

  syncChatBottomLayoutMetrics({ preserveBottom });

  if (layoutMode !== "phone") {
    clearMobileComposerEmojiLayout();
    resetEdgeBackSwipeState();
    return;
  }

  if (composerEmojiPickerInstance?.isPickerVisible()) {
    requestAnimationFrame(() => {
      updateMobileComposerEmojiLayout();
    });
  }
}

function isPhoneLayout() {
  return Boolean(isPhoneLayoutViewport);
}

function isTabletLayout() {
  return Boolean(isTabletLayoutViewport);
}

function getMobileComposerEmojiWrapper() {
  const wrappers = Array.from(document.querySelectorAll(".emoji-picker__wrapper"));
  if (!wrappers.length) return null;
  return (
    wrappers.find((node) => node.classList.contains("mobile-composer-emoji-picker"))
    || wrappers.find((node) => node.style.display !== "none")
    || wrappers[0]
  );
}

function clearMobileComposerEmojiLayout() {
  document.body.classList.remove("mobile-emoji-open");
  const wrapper = getMobileComposerEmojiWrapper() || document.querySelector(".emoji-picker__wrapper.mobile-composer-emoji-picker");
  if (!wrapper) return;
  wrapper.classList.remove("mobile-composer-emoji-picker");
  wrapper.style.removeProperty("--mobile-emoji-bottom");
  wrapper.style.removeProperty("--mobile-emoji-max-height");
}

function updateMobileComposerEmojiLayout() {
  if (!isPhoneLayout() || !composerEmojiPickerInstance?.isPickerVisible() || !composer || composer.classList.contains("hidden")) {
    clearMobileComposerEmojiLayout();
    return;
  }

  const wrapper = getMobileComposerEmojiWrapper();
  if (!wrapper) return;

  const visualViewport = window.visualViewport;
  const viewportHeight = Math.max(
    260,
    Number(visualViewport?.height) || Number(window.innerHeight) || 0,
  );
  const viewportTop = Math.max(0, Number(visualViewport?.offsetTop) || 0);
  const viewportBottom = viewportTop + viewportHeight;
  const composerRect = composer.getBoundingClientRect();
  const replyRect = isElementRendered(replyBox) ? replyBox.getBoundingClientRect() : null;
  const stackTop = replyRect ? Math.min(replyRect.top, composerRect.top) : composerRect.top;
  const rawBottomOffset = viewportBottom - stackTop + 6;
  const bottomOffset = Math.max(8, Math.min(rawBottomOffset, viewportHeight - 150));
  const availableHeight = Math.max(160, viewportHeight - bottomOffset - 8);
  const targetBottomSheetHeight = Math.round(viewportHeight * 0.46);
  const maxHeight = Math.max(172, Math.min(availableHeight, targetBottomSheetHeight));

  wrapper.classList.add("mobile-composer-emoji-picker");
  wrapper.style.setProperty("--mobile-emoji-bottom", `${Math.round(bottomOffset)}px`);
  wrapper.style.setProperty("--mobile-emoji-max-height", `${Math.round(maxHeight)}px`);
  document.body.classList.add("mobile-emoji-open");
}

function isEdgeBackSwipeAllowed(event) {
  if (!isPhoneLayout() || !activeChatId || isAnyPanelOpen()) return false;
  if (!event || !event.touches || event.touches.length !== 1) return false;
  const touch = event.touches[0];
  if (!touch || touch.clientX > EDGE_BACK_SWIPE_START_MAX_X) return false;
  const target = event.target;
  if (!(target instanceof Element)) return false;
  if (target.closest("#messages")) return false;
  if (target.closest("input, textarea, select, button, a, [role='button'], .msg-action-wrap, .reactions, .reply-preview, .forwarded-head")) {
    return false;
  }
  return true;
}

function resetEdgeBackSwipeState() {
  edgeBackSwipeState = null;
}

function handleEdgeBackSwipeTouchStart(event) {
  if (!isEdgeBackSwipeAllowed(event)) {
    resetEdgeBackSwipeState();
    return;
  }
  const touch = event.touches[0];
  edgeBackSwipeState = {
    startX: Number(touch.clientX) || 0,
    startY: Number(touch.clientY) || 0,
    swiping: false,
    triggered: false,
  };
}

function handleEdgeBackSwipeTouchMove(event) {
  const state = edgeBackSwipeState;
  if (!state || state.triggered || !event || !event.touches || event.touches.length !== 1) return;
  if (!isPhoneLayout() || !activeChatId || isAnyPanelOpen()) {
    resetEdgeBackSwipeState();
    return;
  }

  const touch = event.touches[0];
  const deltaX = (Number(touch.clientX) || 0) - state.startX;
  const deltaY = (Number(touch.clientY) || 0) - state.startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (deltaX < -8) {
    resetEdgeBackSwipeState();
    return;
  }
  if (absY > EDGE_BACK_SWIPE_MAX_VERTICAL_PX) {
    resetEdgeBackSwipeState();
    return;
  }
  if (absY > 10 && absY > absX * 0.6) {
    resetEdgeBackSwipeState();
    return;
  }
  if (absX < EDGE_BACK_SWIPE_LOCK_PX) {
    return;
  }
  if (absX < absY * 2.5) {
    resetEdgeBackSwipeState();
    return;
  }

  state.swiping = true;
  event.preventDefault();

  if (deltaX >= EDGE_BACK_SWIPE_TRIGGER_PX && absY <= EDGE_BACK_SWIPE_MAX_VERTICAL_PX) {
    state.triggered = true;
    event.preventDefault();
    handlePhoneBackNavigation();
    resetEdgeBackSwipeState();
  }
}

function handleEdgeBackSwipeTouchEnd() {
  resetEdgeBackSwipeState();
}

function buildAvatarPlaceholder(seed) {
  const key = encodeURIComponent(String(seed || "U").slice(0, 16));
  return `https://api.dicebear.com/9.x/initials/svg?seed=${key}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function setAuthFieldError(node, text = "") {
  if (!node) return;
  node.textContent = text;
}

function clearAuthFieldErrors() {
  setAuthFieldError(usernameError);
  setAuthFieldError(displayNameError);
  setAuthFieldError(passwordError);
  setAuthFieldError(inviteKeyError);
}

function setPasswordVisibility(input, toggleButton, visible) {
  if (!input || !toggleButton) return;
  input.type = visible ? "text" : "password";
  toggleButton.textContent = visible ? "Скрыть" : "Показать";
  toggleButton.setAttribute("aria-label", visible ? "Скрыть пароль" : "Показать пароль");
}

function getAuthValues() {
  return {
    username: String(usernameInput?.value || "").trim(),
    displayName: String(displayNameInput?.value || "").trim(),
    password: String(passwordInput?.value || ""),
    inviteKey: String(inviteKeyInput?.value || "").trim(),
  };
}

function validateAuthForm({ silent = false } = {}) {
  const { username, displayName, password, inviteKey } = getAuthValues();
  let valid = true;
  if (!silent) {
    clearAuthFieldErrors();
  }

  if (username.length < 3) {
    if (!silent) setAuthFieldError(usernameError, "Минимум 3 символа.");
    valid = false;
  } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    if (!silent) setAuthFieldError(usernameError, "Только буквы, цифры и _.-");
    valid = false;
  }

  if (password.length < 6) {
    if (!silent) setAuthFieldError(passwordError, "Минимум 6 символов.");
    valid = false;
  }

  if (mode === "register") {
    if (displayName.length > 48) {
      if (!silent) setAuthFieldError(displayNameError, "Не более 48 символов.");
      valid = false;
    }
    if (!inviteKey) {
      if (!silent) setAuthFieldError(inviteKeyError, "Введите ключ приглашения.");
      valid = false;
    }
  }

  return valid;
}

function syncAuthFormState() {
  const isRegister = mode === "register";
  const draftValid = validateAuthForm({ silent: true });
  const canSubmit = draftValid && !authSubmitting;

  if (authSubmit) {
    const idleText = isRegister ? "Создать аккаунт" : "Войти";
    const loadingText = isRegister ? "Создание..." : "Вход...";
    authSubmit.textContent = authSubmitting ? loadingText : idleText;
    authSubmit.disabled = !canSubmit;
  }

  if (authForm) {
    authForm.classList.toggle("is-loading", authSubmitting);
  }

  [usernameInput, displayNameInput, passwordInput, inviteKeyInput, tabLogin, tabRegister, authSwitchBtn].forEach((node) => {
    if (!node) return;
    node.disabled = authSubmitting;
  });

  if (passwordToggleBtn) {
    passwordToggleBtn.disabled = authSubmitting;
  }
  if (inviteKeyToggleBtn) {
    inviteKeyToggleBtn.disabled = authSubmitting;
  }
}

function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === "register";
  tabLogin.classList.toggle("active", !isRegister);
  tabRegister.classList.toggle("active", isRegister);
  displayNameRow.classList.toggle("hidden", !isRegister);
  inviteKeyRow.classList.toggle("hidden", !isRegister);
  if (authSubtitle) {
    authSubtitle.textContent = isRegister
      ? "Создайте аккаунт по приглашению и подключайтесь к своим."
      : "Закрытый чат для личных и групповых переписок.";
  }
  if (authSwitchBtn) {
    authSwitchBtn.textContent = isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться";
  }
  setPasswordVisibility(passwordInput, passwordToggleBtn, false);
  setPasswordVisibility(inviteKeyInput, inviteKeyToggleBtn, false);
  clearAuthFieldErrors();
  authError.textContent = "";
  syncAuthFormState();
}

function setSocketState(text) {
  socketState.textContent = text;
  socketState.classList.remove("is-online", "is-pending", "is-offline");
  if (text.includes("В сети")) {
    socketState.classList.add("is-online");
  } else if (text.includes("Подключение") || text.includes("Переподключение")) {
    socketState.classList.add("is-pending");
  } else {
    socketState.classList.add("is-offline");
  }
  if (profileViewStatus && !profilePanel.classList.contains("hidden")) {
    profileViewStatus.textContent = text;
  }
}

function applyMyProfile(user) {
  meDisplay.textContent = user?.displayName || user?.username || "";
  meUsername.textContent = user?.username ? `@${user.username}` : "";
  meAvatar.src = user?.avatar || buildAvatarPlaceholder(user?.username || "ME");
  meAvatar.alt = meDisplay.textContent || "Профиль";
  if (profilePanel && !profilePanel.classList.contains("hidden")) {
    renderProfilePanel();
  }
}

function showBootScreen() {
  document.documentElement.classList.remove("app-active");
  document.body.classList.remove("app-active");
  if (bootScreen) bootScreen.classList.remove("hidden");
  authScreen.classList.add("hidden");
  appScreen.classList.add("hidden");
}

function hideBootScreen() {
  if (bootScreen) bootScreen.classList.add("hidden");
}

function showAuth() {
  document.documentElement.classList.remove("app-active");
  document.documentElement.classList.remove("keyboard-open");
  document.body.classList.remove("app-active");
  document.body.classList.remove("keyboard-open");
  appScreen.classList.add("hidden");
  appScreen.classList.remove("is-keyboard-open");
  delete appScreen.dataset.keyboardState;
  authScreen.classList.remove("hidden");
  clearResponsiveShellClasses();
  clearMobileComposerEmojiLayout();
  document.documentElement.style.setProperty("--chat-bottom-stack-height", "0px");
  if (chatPanelRoot) {
    chatPanelRoot.style.setProperty("--chat-bottom-stack-height", "0px");
  }
  hideBootScreen();
  syncAuthFormState();
  if (usernameInput) {
    setTimeout(() => {
      usernameInput.focus();
      usernameInput.setSelectionRange(usernameInput.value.length, usernameInput.value.length);
    }, 0);
  }
}

function showApp() {
  document.documentElement.classList.add("app-active");
  document.body.classList.add("app-active");
  resetPhoneViewportScroll();
  authScreen.classList.add("hidden");
  hideBootScreen();
  initComposerLayoutObserver();
  syncViewportHeightVariable();
  syncResponsiveLayoutState();
  appScreen.classList.remove("hidden");
  requestAnimationFrame(() => {
    scheduleChatChromeSync({ refreshViewport: true, preserveBottom: isMessagesNearBottom(140) });
  });
}

function clearMessagesState(text, kind = "info") {
  if (messagesStateAutoHideTimer) {
    clearTimeout(messagesStateAutoHideTimer);
    messagesStateAutoHideTimer = null;
  }
  if (messagesStateFadeTimer) {
    clearTimeout(messagesStateFadeTimer);
    messagesStateFadeTimer = null;
  }
  messagesStateVersion += 1;

  if (!text) {
    messagesState.classList.add("hidden");
    messagesState.classList.remove("is-info", "is-loading", "is-empty", "is-error", "is-chat-hint", "is-fading-out");
    messagesState.innerHTML = "";
    return;
  }

  const icons = {
    info: "\u2139",
    loading: "\u23F3",
    empty: "\uD83D\uDCAC",
    error: "\u26A0",
  };

  const titles = {
    info: "Информация",
    loading: "Загрузка",
    empty: "Пока пусто",
    error: "Ошибка",
  };

  const isChatHint = kind === "empty" && String(text || "").trim() === CHAT_SELECTION_HINT_TEXT;
  messagesState.classList.remove("hidden", "is-info", "is-loading", "is-empty", "is-error", "is-chat-hint", "is-fading-out");
  messagesState.classList.add(`is-${kind}`);
  if (isChatHint) {
    messagesState.classList.add("is-chat-hint");
    messagesState.innerHTML = `<p class="state-chat-hint">${escapeHtml(text)}</p>`;
    return;
  }
  messagesState.innerHTML = `
    <span class="state-icon">${icons[kind] || icons.info}</span>
    <div class="state-content">
      <p class="state-title">${titles[kind] || titles.info}</p>
      <p class="state-helper">${escapeHtml(text)}</p>
    </div>
  `;
}

function fadeOutInfoMessagesState(versionAtSchedule) {
  if (messagesStateVersion !== versionAtSchedule) return;
  if (!messagesState.classList.contains("is-info")) return;
  messagesState.classList.add("is-fading-out");

  messagesStateFadeTimer = setTimeout(() => {
    messagesStateFadeTimer = null;
    if (messagesStateVersion !== versionAtSchedule) return;
    if (!messagesState.classList.contains("is-info")) return;
    clearMessagesState("");
  }, 180);
}

function showTransientMessagesInfo(text, timeoutMs = 2200) {
  clearMessagesState(text, "info");
  const versionAtSchedule = messagesStateVersion;
  messagesStateAutoHideTimer = setTimeout(() => {
    messagesStateAutoHideTimer = null;
    if (messagesStateVersion !== versionAtSchedule) return;
    if (!messagesState.classList.contains("is-info")) return;
    fadeOutInfoMessagesState(versionAtSchedule);
  }, timeoutMs);
}

function showChatSelectionHintState() {
  messagesRoot.classList.add("hidden");
  clearMessagesState(CHAT_SELECTION_HINT_TEXT, "empty");
}

function isElementVisible(node) {
  return Boolean(node && !node.classList.contains("hidden"));
}

function isCreateMenuOpen() {
  return isElementVisible(createMenu);
}

function isSidebarSearchLayerOpen() {
  return Boolean(
    searchInput === document.activeElement
    || (searchInput && String(searchInput.value || "").trim())
    || isElementVisible(sidebarSearchResults)
  );
}

function isChatSearchLayerOpen() {
  return Boolean(
    chatSearchInput === document.activeElement
    || (chatSearchInput && String(chatSearchInput.value || "").trim())
    || isElementVisible(chatSearchResults)
  );
}

function isComposerEmojiPickerOpen() {
  return Boolean(composerEmojiPickerInstance?.isPickerVisible());
}

function isComposerAttachMenuOpen() {
  return isElementVisible(composerAttachMenu);
}

function isMessagePopoverLayerOpen() {
  return Boolean(
    messageLongPressState
    || reactionEmojiPickerInstance?.isPickerVisible()
    || document.querySelector(".msg-popover:not(.hidden), .msg-action-btn.active, .msg.action-menu-open")
  );
}

function isChatDropOverlayOpen() {
  return Boolean(chatDragDepth > 0 || isElementVisible(chatDropOverlay));
}

function syncChatBoundNavigationLayers() {
  const chat = getActiveChat();
  const activeGroupChatId = chat && chat.type === "group" ? Number(chat.id) : null;

  if (isElementVisible(groupAddModal) && (!activeGroupChatId || Number(groupPanelChatId) !== activeGroupChatId)) {
    closeGroupAddModal();
  }

  if (isElementVisible(groupPanel) && (!activeGroupChatId || Number(groupPanelChatId) !== activeGroupChatId)) {
    closeGroupPanel();
  }

  if (isElementVisible(contactPanel) && (!chat || chat.type !== "direct")) {
    closeContactPanel();
  }
}

function closeTopPanelNavigationLayer() {
  if (isElementVisible(confirmModal)) {
    closeConfirmModal(false);
    return "confirm";
  }
  if (isElementVisible(messageForwardModal)) {
    closeMessageForwardModal();
    return "forward";
  }
  if (isElementVisible(messageEditModal)) {
    closeMessageEditModal();
    return "edit";
  }
  if (isElementVisible(groupAddModal)) {
    closeGroupAddModal();
    return "group-add";
  }
  if (isElementVisible(createGroupModal)) {
    closeCreateGroupModal();
    return "create-flow";
  }
  if (isElementVisible(contactPanel)) {
    closeContactPanel();
    return "contact-panel";
  }
  if (isElementVisible(profilePanel)) {
    closeProfilePanel();
    return "profile-panel";
  }
  if (isElementVisible(groupPanel)) {
    closeGroupPanel();
    return "group-panel";
  }
  return "";
}

function closeTopSearchNavigationLayer() {
  if (isChatSearchLayerOpen()) {
    clearChatSearch({ clearInput: true });
    return "chat-search";
  }
  if (isSidebarSearchLayerOpen()) {
    closeSidebarSearch({ clearInput: true });
    return "sidebar-search";
  }
  return "";
}

function closeTopTransientInteractionLayer() {
  if (isCreateMenuOpen()) {
    closeCreateMenu();
    return "create-menu";
  }
  if (isComposerAttachMenuOpen()) {
    closeComposerAttachMenu();
    return "composer-attach";
  }
  if (isComposerEmojiPickerOpen()) {
    closeComposerEmojiPicker();
    return "composer-emoji";
  }
  if (isMessagePopoverLayerOpen()) {
    clearMessageLongPressState();
    closeMessagePopovers();
    return "message-popover";
  }
  if (isChatDropOverlayOpen()) {
    resetChatDropOverlayState();
    return "chat-drop";
  }
  return "";
}

function clearActiveChatSelection() {
  const hadActiveChat = Boolean(activeChatId);
  if (!hadActiveChat) return false;
  resetChatDropOverlayState();
  clearMessageLongPressState();
  closeMessagePopovers();
  closeComposerEmojiPicker();
  closeComposerAttachMenu();
  resetEdgeBackSwipeState();
  activeChatId = null;
  keepChatDeselected = true;
  activeMessages = [];
  setReplyTarget(null);
  clearChatSearch({ clearInput: true });
  syncChatBoundNavigationLayers();
  renderChatList();
  renderChatHeader();
  renderMessages([]);
  showChatSelectionHintState();
  syncComposerState();
  sendWsEvent({ type: "presence:clear_active_chat" });
  return true;
}

function deselectActiveChatByEsc() {
  return clearActiveChatSelection();
}

function handlePhoneBackNavigation() {
  if (closeTopPanelNavigationLayer()) return true;
  if (closeTopSearchNavigationLayer()) return true;
  if (closeTopTransientInteractionLayer()) return true;
  if (!isPhoneLayout()) return false;
  return clearActiveChatSelection();
}

function handleEscapeNavigation() {
  if (closeTopPanelNavigationLayer()) return true;
  if (closeTopSearchNavigationLayer()) return true;
  if (closeTopTransientInteractionLayer()) return true;
  return clearActiveChatSelection();
}

function timeLabel(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const day = date.toLocaleDateString([], { month: "short", day: "numeric" });
  const clock = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${clock}`;
}

function messageTimeLabel(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

function formatShortClock(date) {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatMinutesAgoRu(minutes) {
  const value = Math.max(1, Number(minutes) || 1);
  const mod10 = value % 10;
  const mod100 = value % 100;
  let suffix = "минут";
  if (mod10 === 1 && mod100 !== 11) {
    suffix = "минуту";
  } else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    suffix = "минуты";
  }
  return `Был в сети ${value} ${suffix} назад`;
}

function formatLastSeenStatus(presenceLike) {
  const isOnline = Boolean(presenceLike?.isOnline ?? presenceLike?.online);
  if (isOnline) {
    return "В сети";
  }

  const rawLastSeenAt = presenceLike?.lastSeenAt;
  if (!rawLastSeenAt) {
    return "Не в сети";
  }

  const lastSeenDate = new Date(rawLastSeenAt);
  if (Number.isNaN(lastSeenDate.getTime())) {
    return "Не в сети";
  }

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - lastSeenDate.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMs < 60 * 1000) {
    return "Был в сети только что";
  }

  if (isSameCalendarDay(lastSeenDate, now)) {
    if (diffMinutes < 60) {
      const minutes = Math.max(1, diffMinutes);
      return formatMinutesAgoRu(minutes);
    }
    return `Был в сети сегодня в ${formatShortClock(lastSeenDate)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(lastSeenDate, yesterday)) {
    return `Был в сети вчера в ${formatShortClock(lastSeenDate)}`;
  }

  const datePart = lastSeenDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `Был в сети ${datePart} в ${formatShortClock(lastSeenDate)}`;
}

function messageDayKey(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateSeparatorLabel(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(date, today)) return "Сегодня";
  if (sameDay(date, yesterday)) return "Вчера";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function messageStatusCheckCount(status) {
  if (!status) return 0;
  return status === "read" ? 2 : 1;
}

function renderStatusChecksHtml(status, className) {
  const count = messageStatusCheckCount(status);
  if (!count) return "";

  const title = status === "read" ? "Прочитано" : "Отправлено";
  const marks = Array.from({ length: count }, (_, index) => {
    const secondClass = index === 1 ? " second" : "";
    return `<span class="${className}-mark${secondClass}" aria-hidden="true"></span>`;
  }).join("");

  return `<span class="${className}${status === "read" ? " is-read" : ""} count-${count}" title="${title}" aria-label="${title}">${marks}</span>`;
}

function createStatusChecksNode(status, className) {
  const count = messageStatusCheckCount(status);
  if (!count) return null;

  const title = status === "read" ? "Прочитано" : "Отправлено";
  const node = document.createElement("span");
  node.className = `${className}${status === "read" ? " is-read" : ""} count-${count}`;
  node.title = title;
  node.setAttribute("aria-label", title);

  for (let i = 0; i < count; i += 1) {
    const mark = document.createElement("span");
    mark.className = `${className}-mark${i === 1 ? " second" : ""}`;
    mark.setAttribute("aria-hidden", "true");
    node.appendChild(mark);
  }

  return node;
}

function roleLabel(role) {
  const labels = {
    owner: "владелец",
    admin: "админ",
    member: "участник",
  };
  return labels[role] || role || "";
}

function normalizeUserSearchQuery(raw) {
  return String(raw || "").trim().replace(/^@+/, "");
}

function normalizeSearchText(raw) {
  return String(raw || "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

function splitSearchTokens(normalizedValue) {
  return String(normalizedValue || "")
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function textMatchesSearch(rawValue, normalizedQuery, queryTokens) {
  const target = normalizeSearchText(rawValue);
  if (!target) return false;
  if (target.includes(normalizedQuery)) return true;
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => target.includes(token));
  }
  return false;
}

function scoreChatSearch(chat, normalizedQuery, queryTokens) {
  const title = String(chat?.title || "");
  const peerUsername = String(chat?.peer?.username || "");
  const peerDisplayName = String(chat?.peer?.displayName || "");

  const titleNorm = normalizeSearchText(title);
  const usernameNorm = normalizeSearchText(peerUsername);
  const displayNorm = normalizeSearchText(peerDisplayName);

  let score = 0;
  if (chat?.type === "direct" && usernameNorm === normalizedQuery) score = Math.max(score, 130);
  if (chat?.type === "direct" && displayNorm && displayNorm === normalizedQuery) score = Math.max(score, 122);
  if (titleNorm === normalizedQuery) score = Math.max(score, 116);
  if (chat?.type === "direct" && usernameNorm.startsWith(normalizedQuery)) score = Math.max(score, 104);
  if (chat?.type === "direct" && displayNorm && displayNorm.startsWith(normalizedQuery)) score = Math.max(score, 98);
  if (titleNorm.startsWith(normalizedQuery)) score = Math.max(score, 92);
  if (textMatchesSearch(usernameNorm, normalizedQuery, queryTokens)) score = Math.max(score, 82);
  if (textMatchesSearch(displayNorm, normalizedQuery, queryTokens)) score = Math.max(score, 76);
  if (textMatchesSearch(titleNorm, normalizedQuery, queryTokens)) score = Math.max(score, 70);

  return score;
}

function pickBestUserMatch(users, normalizedQuery, queryTokens) {
  if (!Array.isArray(users) || !users.length) return null;
  const ranked = users
    .map((user) => {
      const usernameNorm = normalizeSearchText(user?.username || "");
      const displayNorm = normalizeSearchText(user?.displayName || "");
      let score = 0;
      if (usernameNorm === normalizedQuery) score = Math.max(score, 130);
      if (displayNorm && displayNorm === normalizedQuery) score = Math.max(score, 122);
      if (usernameNorm.startsWith(normalizedQuery)) score = Math.max(score, 104);
      if (displayNorm && displayNorm.startsWith(normalizedQuery)) score = Math.max(score, 98);
      if (textMatchesSearch(usernameNorm, normalizedQuery, queryTokens)) score = Math.max(score, 82);
      if (textMatchesSearch(displayNorm, normalizedQuery, queryTokens)) score = Math.max(score, 76);
      return { user, score };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return String(a.user?.username || "").localeCompare(String(b.user?.username || ""), "ru-RU", { sensitivity: "base" });
    });
  return ranked[0]?.user || null;
}

function membersLabel(countRaw) {
  const count = Math.max(0, Number(countRaw) || 0);
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} участник`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${count} участника`;
  return `${count} участников`;
}

function setSidebarSearchFeedback(text = "") {
  if (!searchFeedback) return;
  searchFeedback.textContent = text;
}

function clearSidebarSearchTimer() {
  if (!sidebarSearchTimer) return;
  clearTimeout(sidebarSearchTimer);
  sidebarSearchTimer = null;
}

function clearSidebarSearchResults({ hide = true } = {}) {
  if (!sidebarSearchResults) return;
  sidebarSearchResults.innerHTML = "";
  if (hide) {
    sidebarSearchResults.classList.add("hidden");
  } else {
    sidebarSearchResults.classList.remove("hidden");
  }
  sidebarSearchEntries = [];
  sidebarSearchActiveIndex = -1;
}

function closeSidebarSearch({ clearInput = false, keepFeedback = false } = {}) {
  clearSidebarSearchTimer();
  sidebarSearchRequestSeq += 1;
  sidebarSearchQuery = "";
  clearSidebarSearchResults({ hide: true });
  if (clearInput && searchInput) {
    searchInput.value = "";
  }
  if (!keepFeedback) {
    setSidebarSearchFeedback("");
  }
}

function renderSidebarSearchState(text, kind = "hint") {
  if (!sidebarSearchResults) return;
  clearSidebarSearchResults({ hide: false });
  sidebarSearchResults.innerHTML = `<div class="sidebar-search-state is-${escapeHtml(kind)}">${escapeHtml(text)}</div>`;
}

function showSidebarSearchHint() {
  const query = String(searchInput?.value || "").trim();
  if (!query.length) {
    renderSidebarSearchState("Начните вводить имя или название группы", "hint");
    return;
  }
  if (query.length < SIDEBAR_SEARCH_MIN_LEN) {
    renderSidebarSearchState(`Введите минимум ${SIDEBAR_SEARCH_MIN_LEN} символа`, "hint");
  }
}

function syncSidebarSearchActiveEntry() {
  if (!sidebarSearchResults) return;
  const items = sidebarSearchResults.querySelectorAll(".sidebar-search-item");
  items.forEach((node) => {
    const idx = Number(node.dataset.index);
    node.classList.toggle("keyboard-active", Number.isInteger(idx) && idx === sidebarSearchActiveIndex);
  });
  const activeNode = sidebarSearchResults.querySelector(`.sidebar-search-item[data-index="${sidebarSearchActiveIndex}"]`);
  if (activeNode && typeof activeNode.scrollIntoView === "function") {
    activeNode.scrollIntoView({ block: "nearest" });
  }
}

function setSidebarSearchActiveIndex(nextIndex) {
  if (!sidebarSearchEntries.length) {
    sidebarSearchActiveIndex = -1;
    syncSidebarSearchActiveEntry();
    return;
  }
  if (!Number.isInteger(nextIndex)) {
    sidebarSearchActiveIndex = 0;
    syncSidebarSearchActiveEntry();
    return;
  }
  const size = sidebarSearchEntries.length;
  const normalized = ((nextIndex % size) + size) % size;
  sidebarSearchActiveIndex = normalized;
  syncSidebarSearchActiveEntry();
}

function appendSidebarSearchSection(container, title) {
  const section = document.createElement("section");
  section.className = "sidebar-search-section";
  section.innerHTML = `<div class="sidebar-search-section-title">${escapeHtml(title)}</div>`;
  container.appendChild(section);
  return section;
}

function buildSidebarSearchUserRow(user, index) {
  const username = String(user?.username || "").trim();
  if (!username) return null;
  const displayName = String(user?.displayName || username).trim() || username;
  const row = document.createElement("button");
  row.type = "button";
  row.className = "create-user-item sidebar-search-item";
  row.dataset.index = String(index);
  row.innerHTML = `
    <img class="create-user-avatar" src="${escapeHtml(user.avatar || buildAvatarPlaceholder(username))}" alt="${escapeHtml(displayName)}" />
    <div class="create-user-meta">
      <div class="create-user-name">${escapeHtml(displayName)}</div>
      <div class="create-user-username">@${escapeHtml(username)}</div>
    </div>
    <span class="create-user-action">Открыть</span>
  `;
  row.addEventListener("mouseenter", () => {
    setSidebarSearchActiveIndex(index);
  });
  row.addEventListener("click", async () => {
    await openSidebarSearchEntry(index);
  });
  return row;
}

function buildSidebarSearchGroupRow(group, index) {
  const id = Number(group?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  const title = String(group?.title || "").trim() || "Группа без названия";
  const row = document.createElement("button");
  row.type = "button";
  row.className = "create-user-item sidebar-search-item group";
  row.dataset.index = String(index);
  const secondaryBits = [membersLabel(group?.memberCount)];
  if (group?.archived) {
    secondaryBits.push("архив");
  }
  row.innerHTML = `
    <img class="create-user-avatar" src="${escapeHtml(group.avatar || buildAvatarPlaceholder(title))}" alt="${escapeHtml(title)}" />
    <div class="create-user-meta">
      <div class="create-user-name">${escapeHtml(title)}</div>
      <div class="create-user-username">${escapeHtml(secondaryBits.join(" • "))}</div>
    </div>
    <span class="create-user-action">Группа</span>
  `;
  row.addEventListener("mouseenter", () => {
    setSidebarSearchActiveIndex(index);
  });
  row.addEventListener("click", async () => {
    await openSidebarSearchEntry(index);
  });
  return row;
}

function renderSidebarSearchResultsPayload(payload, query) {
  if (!sidebarSearchResults) return;
  clearSidebarSearchResults({ hide: false });

  const users = Array.isArray(payload?.users) ? payload.users : [];
  const groups = Array.isArray(payload?.groups) ? payload.groups : [];
  const entries = [];

  if (!users.length && !groups.length) {
    renderSidebarSearchState(`По запросу «${query}» ничего не найдено`, "empty");
    return;
  }

  if (users.length) {
    const section = appendSidebarSearchSection(sidebarSearchResults, "Люди");
    const list = document.createElement("div");
    list.className = "create-user-list sidebar-search-list";
    users.forEach((user) => {
      const row = buildSidebarSearchUserRow(user, entries.length);
      if (!row) return;
      list.appendChild(row);
      entries.push({ kind: "user", user });
    });
    section.appendChild(list);
  }

  if (groups.length) {
    const section = appendSidebarSearchSection(sidebarSearchResults, "Группы");
    const list = document.createElement("div");
    list.className = "create-user-list sidebar-search-list";
    groups.forEach((group) => {
      const row = buildSidebarSearchGroupRow(group, entries.length);
      if (!row) return;
      list.appendChild(row);
      entries.push({ kind: "group", group });
    });
    section.appendChild(list);
  }

  sidebarSearchEntries = entries;
  setSidebarSearchActiveIndex(entries.length ? 0 : -1);
}

async function resolveGroupChatFromSidebarSearch(group) {
  const targetId = Number(group?.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    throw new Error("Группа недоступна");
  }

  const archivedHint = typeof group?.archived === "boolean" ? Boolean(group.archived) : null;
  let found = chats.find((chat) => Number(chat?.id) === targetId);
  if (found) return found;

  if (archivedHint !== null && showArchived !== archivedHint) {
    showArchived = archivedHint;
    setArchiveToggleLabel();
  }

  await loadChats(true);
  found = chats.find((chat) => Number(chat?.id) === targetId);
  if (found) return found;

  if (archivedHint === null) {
    showArchived = !showArchived;
    setArchiveToggleLabel();
    await loadChats(true);
    found = chats.find((chat) => Number(chat?.id) === targetId);
    if (found) return found;
  }

  throw new Error("Чат из результатов поиска не найден");
}

async function openSidebarSearchEntry(index) {
  const safeIndex = Number(index);
  const entry = Number.isInteger(safeIndex) ? sidebarSearchEntries[safeIndex] : null;
  if (!entry || sidebarSearchOpening) return;

  sidebarSearchOpening = true;
  try {
    if (entry.kind === "group") {
      const resolved = await resolveGroupChatFromSidebarSearch(entry.group);
      await openChat(resolved.id);
    } else {
      const username = String(entry?.user?.username || "").trim();
      if (!username) throw new Error("Пользователь недоступен");
      await openDirectChatByUsername(username);
    }

    closeSidebarSearch({ clearInput: true, keepFeedback: false });
  } catch (error) {
    setSidebarSearchFeedback(error.message || "Не удалось открыть результат поиска");
  } finally {
    sidebarSearchOpening = false;
  }
}

async function runSidebarSearch(query, { openFirst = false } = {}) {
  const q = String(query || "").trim();
  if (!q.length) {
    showSidebarSearchHint();
    return;
  }
  if (q.length < SIDEBAR_SEARCH_MIN_LEN) {
    showSidebarSearchHint();
    return;
  }

  clearSidebarSearchTimer();
  const seq = ++sidebarSearchRequestSeq;
  sidebarSearchQuery = q;
  renderSidebarSearchState("Поиск...", "loading");
  setSidebarSearchFeedback("");

  try {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("userLimit", String(SIDEBAR_SEARCH_USER_LIMIT));
    params.set("groupLimit", String(SIDEBAR_SEARCH_GROUP_LIMIT));
    const result = await api(`/api/sidebar-search?${params.toString()}`, { auth: true });
    if (seq !== sidebarSearchRequestSeq) return;
    if (String(searchInput?.value || "").trim() !== q) return;
    renderSidebarSearchResultsPayload(result, q);
    if (openFirst && sidebarSearchEntries.length) {
      await openSidebarSearchEntry(sidebarSearchActiveIndex >= 0 ? sidebarSearchActiveIndex : 0);
    }
  } catch (error) {
    if (seq !== sidebarSearchRequestSeq) return;
    renderSidebarSearchState(error.message || "Ошибка поиска", "error");
  }
}

function scheduleSidebarSearch(query) {
  clearSidebarSearchTimer();
  const q = String(query || "").trim();
  if (!q || q.length < SIDEBAR_SEARCH_MIN_LEN) {
    showSidebarSearchHint();
    return;
  }
  sidebarSearchTimer = setTimeout(() => {
    runSidebarSearch(q);
  }, SIDEBAR_SEARCH_DEBOUNCE_MS);
}

function getChatSortTime(chat) {
  return chat?.lastMessage?.createdAt || chat?.createdAt || "";
}

function sortChatsByRecent(a, b) {
  if (Boolean(a?.pinned) !== Boolean(b?.pinned)) return a?.pinned ? -1 : 1;
  const byTime = getChatSortTime(b).localeCompare(getChatSortTime(a));
  if (byTime !== 0) return byTime;
  return Number(b?.id || 0) - Number(a?.id || 0);
}

function isEmojiOnlyText(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  const compact = value.replace(/\s+/g, "");
  if (!compact) return false;
  const stripped = compact.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "");
  if (stripped.length !== 0) return false;
  const emojiCount = [...compact.matchAll(/[\p{Extended_Pictographic}]/gu)].length;
  return emojiCount > 0 && emojiCount <= 3;
}

function parseLegacyForwardFallbackText(rawText) {
  const source = String(rawText || "");
  const match = source.match(/^Переслано от\s+(.+?)\r?\n([\s\S]+)$/u);
  if (!match) return null;
  const senderLine = String(match[1] || "").trim();
  const text = String(match[2] || "").trim();
  if (!senderLine || !text) return null;

  const bothMatch = senderLine.match(/^(.+?)\s+@([A-Za-z0-9_]{3,32})$/);
  if (bothMatch) {
    return {
      senderName: String(bothMatch[1] || "").trim(),
      senderUsername: String(bothMatch[2] || "").trim(),
      text,
    };
  }

  const usernameOnlyMatch = senderLine.match(/^@([A-Za-z0-9_]{3,32})$/);
  if (usernameOnlyMatch) {
    return {
      senderName: "",
      senderUsername: String(usernameOnlyMatch[1] || "").trim(),
      text,
    };
  }

  return { senderName: senderLine, senderUsername: null, text };
}

function insertTextAtCursor(input, text) {
  const start = Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length;
  const end = Number.isInteger(input.selectionEnd) ? input.selectionEnd : input.value.length;
  const source = input.value || "";
  input.value = `${source.slice(0, start)}${text}${source.slice(end)}`;
  const nextPos = start + text.length;
  input.focus();
  input.setSelectionRange(nextPos, nextPos);
}

function isInsideEmojiPicker(target) {
  return target instanceof Element && Boolean(target.closest(".emoji-picker__wrapper"));
}

function getEmojiPickerI18n() {
  return {
    search: "Поиск эмодзи...",
    notFound: "Ничего не найдено",
    categories: {
      recents: "Недавние",
      smileys: "Смайлы и эмоции",
      people: "Люди и тело",
      animals: "Животные и природа",
      food: "Еда и напитки",
      activities: "Активности",
      travel: "Путешествия и места",
      objects: "Объекты",
      symbols: "Символы",
      flags: "Флаги",
      custom: "Другое",
    },
  };
}

function buildEmojiSearchTerms(emojiEntry, categories = []) {
  const categoryKey = categories[Number(emojiEntry?.category)] || "";
  const categoryAliases = EMOJI_CATEGORY_SEARCH_ALIASES[categoryKey] || [];
  const emojiAliases = EMOJI_SEARCH_ALIASES[String(emojiEntry?.emoji || "")] || [];
  const terms = [
    String(emojiEntry?.searchTerms || ""),
    String(emojiEntry?.name || ""),
    ...categoryAliases,
    ...emojiAliases,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(terms)).join(" ");
}

async function getLocalizedEmojiData(EmojiButtonCtor) {
  if (localizedEmojiDataPromise) return localizedEmojiDataPromise;

  localizedEmojiDataPromise = Promise.resolve().then(() => {
    if (composerEmojiPickerInstance?.options?.emojiData?.emoji?.[0]?.searchTerms) {
      return composerEmojiPickerInstance.options.emojiData;
    }

    const probeRoot = document.createElement("div");
    const probePicker = new EmojiButtonCtor({
      rootElement: probeRoot,
      autoHide: false,
      autoFocusSearch: false,
      showAnimation: false,
      showPreview: false,
      showSearch: false,
      showCategoryButtons: false,
    });

    const baseData = probePicker?.options?.emojiData;
    if (typeof probePicker?.destroyPicker === "function") {
      probePicker.destroyPicker();
    }

    if (!baseData?.emoji || !Array.isArray(baseData.emoji)) {
      return null;
    }

    const categories = Array.isArray(baseData.categories)
      ? [...baseData.categories]
      : [...EMOJI_PICKER_CATEGORIES];

    return {
      ...baseData,
      categories,
      emoji: baseData.emoji.map((emojiEntry) => ({
        ...emojiEntry,
        searchTerms: buildEmojiSearchTerms(emojiEntry, categories),
      })),
    };
  }).catch((error) => {
    localizedEmojiDataPromise = null;
    console.warn("Failed to prepare localized emoji data", error);
    return null;
  });

  return localizedEmojiDataPromise;
}

function getBaseEmojiPickerOptions(overrides = {}) {
  const baseStyleProperties = {
    "--font": '"Segoe UI", "Segoe UI Emoji", "Apple Color Emoji", sans-serif',
    "--font-size": "14px",
    "--border-color": "#d4dff0",
    "--background-color": "#ffffff",
    "--text-color": "#243955",
    "--secondary-text-color": "#748aa5",
    "--hover-color": "#edf3fc",
    "--search-focus-border-color": "#7ea2db",
    "--search-icon-color": "#9caec8",
    "--category-button-color": "#748aa5",
    "--category-button-active-color": "#3f77cf",
    "--focus-indicator-color": "#7fa3d8",
    "--category-border-bottom-size": "3px",
    "--emoji-size": "1.45em",
  };

  return {
    theme: "light",
    autoHide: true,
    autoFocusSearch: !isPhoneLayout(),
    showAnimation: true,
    showPreview: true,
    showSearch: true,
    showRecents: true,
    showVariants: true,
    showCategoryButtons: true,
    recentsCount: 60,
    emojiVersion: "12.1",
    categories: EMOJI_PICKER_CATEGORIES,
    i18n: getEmojiPickerI18n(),
    zIndex: 120,
    rows: 6,
    emojisPerRow: 8,
    styleProperties: {
      ...baseStyleProperties,
      ...(overrides.styleProperties || {}),
    },
    ...overrides,
  };
}

async function loadEmojiButtonCtor() {
  if (emojiButtonCtor) return emojiButtonCtor;

  if (!emojiPickerLoadPromise) {
    emojiPickerLoadPromise = import(EMOJI_PICKER_MODULE_PATH)
      .then((module) => {
        if (typeof module?.EmojiButton !== "function") {
          throw new Error("EmojiButton export missing");
        }
        emojiButtonCtor = module.EmojiButton;
        return emojiButtonCtor;
      })
      .catch((error) => {
        emojiPickerLoadPromise = null;
        throw error;
      });
  }

  return emojiPickerLoadPromise;
}

async function toggleReactionForMessage(messageId, conversationId, emoji) {
  if (!messageId || !emoji) return;
  try {
    await api(`/api/messages/${messageId}/reactions`, {
      method: "POST",
      auth: true,
      body: { emoji },
    });
    if (conversationId) {
      scheduleMessagesRefresh(conversationId);
    }
    scheduleChatsRefresh();
  } catch (error) {
    clearMessagesState(error.message, "error");
  }
}

function closeReactionEmojiPicker() {
  if (reactionEmojiPickerInstance?.isPickerVisible()) {
    reactionEmojiPickerInstance.hidePicker();
    return;
  }
  if (reactionPickerHostMessage) {
    reactionPickerHostMessage.classList.remove("reaction-picker-open");
  }
  reactionPickerHostMessage = null;
  if (reactionPickerTrigger) {
    reactionPickerTrigger.classList.remove("active");
  }
  reactionPickerTrigger = null;
  reactionPickerTarget = null;
}

async function ensureEmojiPickersReady() {
  if (composerEmojiPickerInstance && reactionEmojiPickerInstance) return;
  const EmojiButton = await loadEmojiButtonCtor();

  if (!composerEmojiPickerInstance) {
    composerEmojiPickerInstance = new EmojiButton(
      getBaseEmojiPickerOptions({
        position: "top-start",
      }),
    );
    composerEmojiPickerInstance.on("emoji", (selection) => {
      if (!selection?.emoji || composerInput.disabled) return;
      insertTextAtCursor(composerInput, selection.emoji);
    });
    composerEmojiPickerInstance.on("hidden", () => {
      composerEmojiBtn?.classList.remove("active");
      clearMobileComposerEmojiLayout();
    });
  }

  if (!reactionEmojiPickerInstance) {
    reactionEmojiPickerInstance = new EmojiButton(
      getBaseEmojiPickerOptions({
        position: "top-start",
        showPreview: false,
        rows: 5,
        autoFocusSearch: false,
      }),
    );
    reactionEmojiPickerInstance.on("emoji", async (selection) => {
      const target = reactionPickerTarget
        ? { ...reactionPickerTarget }
        : null;
      closeReactionEmojiPicker();
      if (!selection?.emoji || !target?.messageId) return;
      await toggleReactionForMessage(target.messageId, target.conversationId, selection.emoji);
    });
    reactionEmojiPickerInstance.on("hidden", () => {
      if (reactionPickerHostMessage) {
        reactionPickerHostMessage.classList.remove("reaction-picker-open");
      }
      reactionPickerHostMessage = null;
      if (reactionPickerTrigger) {
        reactionPickerTrigger.classList.remove("active");
      }
      reactionPickerTrigger = null;
      reactionPickerTarget = null;
    });
  }
}

async function openReactionEmojiPicker({ messageId, conversationId, trigger } = {}) {
  if (!messageId || !trigger) return;
  try {
    await ensureEmojiPickersReady();
  } catch {
    clearMessagesState("Не удалось загрузить emoji picker", "error");
    return;
  }

  const pickerVisible = reactionEmojiPickerInstance?.isPickerVisible();
  const isSameTarget =
    pickerVisible &&
    reactionPickerTarget?.messageId === messageId &&
    reactionPickerTrigger === trigger;

  closeMessagePopovers({ keepReactionPicker: true });

  if (isSameTarget) {
    closeReactionEmojiPicker();
    return;
  }

  if (reactionPickerTrigger && reactionPickerTrigger !== trigger) {
    reactionPickerTrigger.classList.remove("active");
  }
  reactionPickerTarget = { messageId, conversationId };
  reactionPickerTrigger = trigger;
  reactionPickerTrigger.classList.add("active");
  reactionPickerHostMessage = trigger.closest(".msg");
  if (reactionPickerHostMessage) {
    reactionPickerHostMessage.classList.add("reaction-picker-open");
  }
  reactionEmojiPickerInstance.showPicker(trigger);
}

function setArchiveToggleLabel() {
  archiveToggleBtn.textContent = showArchived ? "Основные" : "Архив";
  archiveToggleBtn.classList.toggle("active", showArchived);
}

function isAnyPanelOpen() {
  return [groupPanel, groupAddModal, profilePanel, contactPanel, createGroupModal, confirmModal, messageEditModal, messageForwardModal].some(
    (node) => node && !node.classList.contains("hidden")
  );
}

function syncOverlayVisibility() {
  uiOverlay.classList.toggle("hidden", !isAnyPanelOpen());
}

function setProfilePanelFeedback(text = "", kind = "") {
  if (!profilePanelFeedback) return;
  profilePanelFeedback.textContent = text;
  profilePanelFeedback.className = "profile-panel-feedback";
  if (kind) {
    profilePanelFeedback.classList.add(`is-${kind}`);
  }
}

function setProfileEditError(text = "") {
  if (!profileEditError) return;
  profileEditError.textContent = text;
}

function syncProfileEditButtons() {
  const locked = profileSaving;
  const editable = profileEditMode && !locked;

  if (profileDisplayInput) profileDisplayInput.disabled = !editable;
  if (profileUsernameInput) profileUsernameInput.disabled = !editable;
  if (profileBioInput) profileBioInput.disabled = !editable;
  if (profileAvatarChangeBtn) profileAvatarChangeBtn.disabled = !editable;
  if (profileAvatarResetBtn) profileAvatarResetBtn.disabled = !editable;
  if (profileEditCancelBtn) profileEditCancelBtn.disabled = locked;
  if (profileEditSaveBtn) {
    profileEditSaveBtn.disabled = locked;
    profileEditSaveBtn.textContent = locked ? "Сохранение..." : "Сохранить";
  }
  if (profileEditBtn) profileEditBtn.disabled = locked;
}

function normalizeProfileUsername(raw) {
  return String(raw || "").trim().replace(/^@+/, "");
}

function getProfileAvatarForRender() {
  if (profileEditMode) {
    return profileAvatarDraft || buildAvatarPlaceholder(me?.username || "ME");
  }
  return me?.avatar || buildAvatarPlaceholder(me?.username || "ME");
}

function fillProfileEditFormFromMe() {
  if (!me) return;
  if (profileDisplayInput) profileDisplayInput.value = me.displayName || me.username || "";
  if (profileUsernameInput) profileUsernameInput.value = me.username || "";
  if (profileBioInput) profileBioInput.value = String(me.bio || "");
}

function renderProfilePanel() {
  if (!me) return;
  const displayName = me.displayName || me.username || "Пользователь";
  const username = me.username || "";
  const bio = String(me.bio || "").trim();
  const status = socketState?.textContent || "Не в сети";

  if (profilePanelAvatar) {
    profilePanelAvatar.src = getProfileAvatarForRender();
    profilePanelAvatar.alt = displayName;
  }
  if (profileViewDisplay) profileViewDisplay.textContent = displayName;
  if (profileViewUsername) profileViewUsername.textContent = username ? `@${username}` : "";
  if (profileViewStatus) profileViewStatus.textContent = status;
  if (profileViewBio) {
    profileViewBio.textContent = bio || "Пока без описания.";
    profileViewBio.classList.toggle("muted", !bio);
  }
}

function setProfileEditMode(nextMode, { focus = true } = {}) {
  profileEditMode = Boolean(nextMode);
  if (profileViewMode) profileViewMode.classList.toggle("hidden", profileEditMode);
  if (profileEditForm) profileEditForm.classList.toggle("hidden", !profileEditMode);
  if (profileAvatarEditActions) profileAvatarEditActions.classList.toggle("hidden", !profileEditMode);

  if (profileEditMode) {
    profileAvatarDraft = me?.avatar || "";
    profileAvatarChanged = false;
    fillProfileEditFormFromMe();
    setProfileEditError("");
    if (profileAvatarFileInput) profileAvatarFileInput.value = "";
  } else {
    profileAvatarDraft = "";
    profileAvatarChanged = false;
    profileSaving = false;
    setProfileEditError("");
    if (profileAvatarFileInput) profileAvatarFileInput.value = "";
  }

  renderProfilePanel();
  syncProfileEditButtons();

  if (profileEditMode && focus && profileDisplayInput) {
    profileDisplayInput.focus();
    profileDisplayInput.setSelectionRange(profileDisplayInput.value.length, profileDisplayInput.value.length);
  }
}

function closeProfilePanel() {
  profilePanel.classList.add("hidden");
  profilePanel.setAttribute("aria-hidden", "true");
  setProfilePanelFeedback("");
  setProfileEditMode(false, { focus: false });
  syncOverlayVisibility();
}

function openProfilePanel() {
  if (!me) return;
  if (!groupPanel.classList.contains("hidden")) {
    closeGroupPanel();
  }
  if (contactPanel && !contactPanel.classList.contains("hidden")) {
    closeContactPanel();
  }
  setProfilePanelFeedback("");
  setProfileEditMode(false, { focus: false });
  profilePanel.classList.remove("hidden");
  profilePanel.setAttribute("aria-hidden", "false");
  renderProfilePanel();
  openOverlay();
}

function setContactPanelFeedback(text = "", kind = "") {
  if (!contactPanelFeedback) return;
  contactPanelFeedback.textContent = text;
  contactPanelFeedback.className = "profile-panel-feedback";
  if (kind) {
    contactPanelFeedback.classList.add(`is-${kind}`);
  }
}

function getDirectContactStatus(chat) {
  if (!chat || chat.type !== "direct" || !chat.peer) {
    return "Не в сети";
  }
  return formatLastSeenStatus(chat.peer);
}

function renderContactPanel() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "direct" || !chat.peer) {
    closeContactPanel();
    return;
  }
  const peer = chat.peer;
  const displayName = peer.displayName || peer.username || "Пользователь";
  const username = peer.username ? `@${peer.username}` : "";
  const bio = String(peer.bio || "").trim();
  const status = getDirectContactStatus(chat);

  if (contactPanelAvatar) {
    contactPanelAvatar.src = peer.avatar || buildAvatarPlaceholder(peer.username || peer.displayName || "U");
    contactPanelAvatar.alt = displayName;
  }
  if (contactPanelDisplay) contactPanelDisplay.textContent = displayName;
  if (contactPanelUsername) contactPanelUsername.textContent = username;
  if (contactPanelStatus) contactPanelStatus.textContent = status;
  if (contactPanelBio) {
    contactPanelBio.textContent = bio || "Пока без описания.";
    contactPanelBio.classList.toggle("muted", !bio);
  }
  if (contactPanelMuteBtn) {
    contactPanelMuteBtn.textContent = chat.muted ? "Включить звук" : "Без звука";
  }
  if (contactPanelBlockBtn) {
    contactPanelBlockBtn.disabled = true;
    contactPanelBlockBtn.title = "Функция блокировки появится позже";
  }
}

function openContactPanel() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "direct" || !contactPanel) return;
  if (!groupPanel.classList.contains("hidden")) {
    closeGroupPanel();
  }
  if (!profilePanel.classList.contains("hidden")) {
    closeProfilePanel();
  }
  setContactPanelFeedback("");
  contactPanel.classList.remove("hidden");
  contactPanel.setAttribute("aria-hidden", "false");
  renderContactPanel();
  openOverlay();
}

function closeContactPanel() {
  if (!contactPanel) return;
  contactPanel.classList.add("hidden");
  contactPanel.setAttribute("aria-hidden", "true");
  setContactPanelFeedback("");
  syncOverlayVisibility();
}

function validateProfileDraft({ displayName, username, bio }) {
  const cleanDisplayName = String(displayName || "").trim();
  const cleanUsername = normalizeProfileUsername(username);
  const cleanBio = String(bio || "").trim();

  if (!cleanDisplayName) {
    return { error: "Имя не может быть пустым." };
  }
  if (cleanUsername.length < 3) {
    return { error: "Username должен быть не короче 3 символов." };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    return { error: "Username может содержать только буквы, цифры и _.-" };
  }
  if (cleanBio.length > 300) {
    return { error: "Описание слишком длинное (максимум 300 символов)." };
  }

  return {
    value: {
      displayName: cleanDisplayName,
      username: cleanUsername,
      bio: cleanBio,
    },
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

function fitSizeIntoBox(widthRaw, heightRaw, maxSide) {
  const width = Math.max(1, Number(widthRaw) || 1);
  const height = Math.max(1, Number(heightRaw) || 1);
  const side = Math.max(width, height);
  if (side <= maxSide) return { width, height };
  const ratio = maxSide / side;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось обработать изображение"));
    img.src = src;
  });
}

async function optimizeAvatarDataUrl(file) {
  const original = await readFileAsDataUrl(file);
  if (!String(original).startsWith("data:image/")) {
    throw new Error("Неверный формат файла");
  }
  if (original.length <= MAX_AVATAR_DATA_URL_CHARS) {
    return original;
  }

  const image = await loadImageElement(original);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    return original;
  }

  const naturalWidth = image.naturalWidth || image.width || AVATAR_MAX_SIDE;
  const naturalHeight = image.naturalHeight || image.height || AVATAR_MAX_SIDE;
  let { width, height } = fitSizeIntoBox(naturalWidth, naturalHeight, AVATAR_MAX_SIDE);
  let quality = 0.86;
  let encoded = original;

  const render = (nextQuality) => {
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", nextQuality);
  };

  encoded = render(quality);
  while (encoded.length > MAX_AVATAR_DATA_URL_CHARS && quality > 0.46) {
    quality -= 0.1;
    encoded = render(quality);
  }

  while (encoded.length > MAX_AVATAR_DATA_URL_CHARS && Math.max(width, height) > 220) {
    width = Math.max(120, Math.round(width * 0.85));
    height = Math.max(120, Math.round(height * 0.85));
    encoded = render(Math.max(0.56, quality));
  }

  if (encoded.length <= MAX_AVATAR_DATA_URL_CHARS) {
    return encoded;
  }
  return original;
}

async function applyProfileSave() {
  if (!profileEditMode || profileSaving || !me) return;

  const validation = validateProfileDraft({
    displayName: profileDisplayInput?.value,
    username: profileUsernameInput?.value,
    bio: profileBioInput?.value,
  });
  if (validation.error) {
    setProfileEditError(validation.error);
    return;
  }

  const payload = {
    displayName: validation.value.displayName,
    username: validation.value.username,
    bio: validation.value.bio,
  };
  if (profileAvatarChanged) {
    const avatarValue = String(profileAvatarDraft || "");
    if (avatarValue && avatarValue.length > MAX_AVATAR_DATA_URL_CHARS) {
      setProfileEditError("Картинка слишком большая. Выберите изображение поменьше.");
      return;
    }
    payload.avatar = avatarValue;
  }

  try {
    profileSaving = true;
    syncProfileEditButtons();
    setProfileEditError("");
    setProfilePanelFeedback("");

    const result = await api("/api/profile/me", {
      method: "PATCH",
      auth: true,
      body: payload,
    });

    me = result.user || me;
    applyMyProfile(me);
    setProfileEditMode(false, { focus: false });
    setProfilePanelFeedback("Профиль обновлен", "success");

    await loadChats(true);
    if (activeChatId) {
      await loadMessages(activeChatId, true, false);
    }
    if (!groupPanel.classList.contains("hidden")) {
      await refreshGroupPanel();
    }
  } catch (error) {
    const message = String(error.message || "");
    if (message.toLowerCase().includes("entity too large")) {
      setProfileEditError("Картинка слишком большая. Выберите изображение поменьше.");
    } else {
      setProfileEditError(message || "Не удалось сохранить профиль");
    }
  } finally {
    profileSaving = false;
    syncProfileEditButtons();
    renderProfilePanel();
  }
}

async function onProfileAvatarSelected(file) {
  if (!file) return;
  if (!String(file.type || "").startsWith("image/")) {
    setProfileEditError("Можно выбрать только изображение");
    return;
  }
  if (Number(file.size || 0) > MAX_AVATAR_UPLOAD_BYTES) {
    setProfileEditError("Файл слишком большой. Максимум 12 МБ.");
    return;
  }

  try {
    const dataUrl = await optimizeAvatarDataUrl(file);
    if (!String(dataUrl).startsWith("data:image/")) throw new Error("Неверный формат файла");
    if (dataUrl.length > MAX_AVATAR_DATA_URL_CHARS) {
      throw new Error("Изображение слишком тяжелое. Попробуйте другое фото.");
    }
    profileAvatarDraft = dataUrl;
    profileAvatarChanged = true;
    setProfileEditError("");
    renderProfilePanel();
  } catch (error) {
    setProfileEditError(error.message || "Не удалось загрузить аватар");
  } finally {
    if (profileAvatarFileInput) {
      profileAvatarFileInput.value = "";
    }
  }
}

function closeAllPanels() {
  groupPanel.classList.add("hidden");
  groupPanel.setAttribute("aria-hidden", "true");
  groupPanelChatId = null;
  groupMembersCache = [];
  groupAddModal.classList.add("hidden");
  groupAddModal.setAttribute("aria-hidden", "true");
  profilePanel.classList.add("hidden");
  profilePanel.setAttribute("aria-hidden", "true");
  if (contactPanel) {
    contactPanel.classList.add("hidden");
    contactPanel.setAttribute("aria-hidden", "true");
  }
  createGroupModal.classList.add("hidden");
  createGroupModal.setAttribute("aria-hidden", "true");
  confirmModal.classList.add("hidden");
  confirmModal.setAttribute("aria-hidden", "true");
  messageEditModal.classList.add("hidden");
  messageEditModal.setAttribute("aria-hidden", "true");
  messageForwardModal.classList.add("hidden");
  messageForwardModal.setAttribute("aria-hidden", "true");
  editingMessageId = null;
  forwardingMessage = null;
  forwardSelectedChatIds = new Set();
  forwardCandidates = [];
  forwardingInFlight = false;
  creatingGroupInFlight = false;
  createFlowMode = "direct";
  createGroupStep = "users";
  createGroupSelectedUsers = [];
  createRecentUsers = [];
  groupAddRecentUsers = [];
  groupAddSearchUsers = [];
  groupAddSelectedUsers = [];
  groupAddSubmitting = false;
  if (createDirectSearchTimer) {
    clearTimeout(createDirectSearchTimer);
    createDirectSearchTimer = null;
  }
  if (createGroupSearchTimer) {
    clearTimeout(createGroupSearchTimer);
    createGroupSearchTimer = null;
  }
  if (groupAddSearchTimer) {
    clearTimeout(groupAddSearchTimer);
    groupAddSearchTimer = null;
  }
  messageEditFeedback.textContent = "";
  messageForwardFeedback.textContent = "";
  messageForwardList.innerHTML = "";
  if (groupAddModalInput) groupAddModalInput.value = "";
  if (groupAddModalState) groupAddModalState.textContent = "Введите имя или username для поиска.";
  if (groupAddModalFeedback) groupAddModalFeedback.textContent = "";
  if (groupAddModalRecentList) groupAddModalRecentList.innerHTML = "";
  if (groupAddModalResultsList) groupAddModalResultsList.innerHTML = "";
  if (groupAddModalSelected) groupAddModalSelected.innerHTML = "";
  if (groupAddRecentCount) groupAddRecentCount.textContent = "";
  if (groupAddResultsCount) groupAddResultsCount.textContent = "";
  if (groupAddModalSubmitBtn) {
    groupAddModalSubmitBtn.disabled = true;
    groupAddModalSubmitBtn.textContent = "Добавить";
  }
  setProfilePanelFeedback("");
  setContactPanelFeedback("");
  setProfileEditMode(false, { focus: false });
  if (messageForwardSendBtn) {
    messageForwardSendBtn.disabled = true;
    messageForwardSendBtn.textContent = "Переслать";
  }
  syncOverlayVisibility();
  closeComposerEmojiPicker();
  closeComposerAttachMenu();
  closeMessagePopovers();
}

function openOverlay() {
  uiOverlay.classList.remove("hidden");
}

function setMessagePopoverHost(node) {
  if (messagePopoverHost && messagePopoverHost !== node) {
    messagePopoverHost.classList.remove("action-menu-open");
  }
  messagePopoverHost = node instanceof Element ? node : null;
  if (messagePopoverHost) {
    messagePopoverHost.classList.add("action-menu-open");
  }
}

function armMessagePopoverDismissGuard(ms = 380) {
  messagePopoverDismissGuardUntil = Date.now() + Math.max(120, Number(ms) || 0);
}

function isMessagePopoverDismissGuardActive() {
  return Date.now() < messagePopoverDismissGuardUntil;
}

function closeMessagePopovers({ keepReactionPicker = false } = {}) {
  document.querySelectorAll(".msg-popover").forEach((node) => node.classList.add("hidden"));
  document.querySelectorAll(".msg-action-btn.active").forEach((node) => node.classList.remove("active"));
  if (messagePopoverHost) {
    messagePopoverHost.classList.remove("action-menu-open");
  }
  messagePopoverHost = null;
  messagePopoverDismissGuardUntil = 0;
  if (!keepReactionPicker) {
    closeReactionEmojiPicker();
  }
}

function openMessageOverflowPopover({ popover, toggle, fromLongPress = false }) {
  if (!popover || !toggle) return;
  const opening = popover.classList.contains("hidden");
  closeMessagePopovers();
  if (!opening) return;
  if (fromLongPress) {
    armMessagePopoverDismissGuard();
  }
  popover.classList.remove("hidden");
  toggle.classList.add("active");
  setMessagePopoverHost(toggle.closest(".msg"));
  requestAnimationFrame(() => positionMessagePopover(popover));
}

function positionMessagePopover(popover) {
  if (!popover || popover.classList.contains("hidden") || !messagesRoot) {
    return;
  }

  popover.style.setProperty("--popover-shift-x", "0px");

  const popRect = popover.getBoundingClientRect();
  const listRect = messagesRoot.getBoundingClientRect();
  if (!popRect.width || !listRect.width) {
    return;
  }

  const safeGap = 10;
  const minLeft = listRect.left + safeGap;
  const maxRight = listRect.right - safeGap;

  let shiftX = 0;
  if (popRect.left < minLeft) {
    shiftX = minLeft - popRect.left;
  } else if (popRect.right > maxRight) {
    shiftX = maxRight - popRect.right;
  }

  popover.style.setProperty("--popover-shift-x", `${Math.round(shiftX)}px`);
}

function closeComposerEmojiPicker() {
  if (composerEmojiPickerInstance?.isPickerVisible()) {
    composerEmojiPickerInstance.hidePicker();
  }
  composerEmojiBtn.classList.remove("active");
  clearMobileComposerEmojiLayout();
}

async function toggleComposerEmojiPicker() {
  if (!composerEmojiBtn || composerInput.disabled) return;
  try {
    await ensureEmojiPickersReady();
  } catch {
    clearMessagesState("Не удалось загрузить emoji picker", "error");
    return;
  }

  const opening = !composerEmojiPickerInstance.isPickerVisible();
  closeComposerEmojiPicker();
  closeComposerAttachMenu();
  if (!opening) return;
  closeMessagePopovers();
  if (isPhoneLayout()) {
    composerInput.blur();
    scheduleChatChromeSync({ refreshViewport: true, preserveBottom: false });
  }
  composerEmojiBtn.classList.add("active");
  composerEmojiPickerInstance.showPicker(composerEmojiBtn);
  if (isPhoneLayout()) {
    requestAnimationFrame(() => {
      updateMobileComposerEmojiLayout();
      window.setTimeout(() => {
        updateMobileComposerEmojiLayout();
      }, 36);
      window.setTimeout(() => {
        updateMobileComposerEmojiLayout();
      }, 140);
    });
  }
}

function renderComposerEmojiPicker() {
  void ensureEmojiPickersReady().catch(() => {
    // lazily retry on first open if module failed during preload
  });
}

function openMessageEditModal(message) {
  if (!message || !message.canEdit || message.isSystem || message.deletedAt) return;

  editingMessageId = message.id;
  messageEditInput.value = message.text || "";
  messageEditFeedback.textContent = "";
  messageEditModal.classList.remove("hidden");
  messageEditModal.setAttribute("aria-hidden", "false");
  openOverlay();
  closeMessagePopovers();
  messageEditInput.focus();
  messageEditInput.setSelectionRange(messageEditInput.value.length, messageEditInput.value.length);
}

function closeMessageEditModal() {
  editingMessageId = null;
  messageEditModal.classList.add("hidden");
  messageEditModal.setAttribute("aria-hidden", "true");
  messageEditFeedback.textContent = "";
  syncOverlayVisibility();
}

function closeMessageForwardModal() {
  forwardingMessage = null;
  forwardingInFlight = false;
  forwardSelectedChatIds = new Set();
  forwardCandidates = [];
  messageForwardModal.classList.add("hidden");
  messageForwardModal.setAttribute("aria-hidden", "true");
  messageForwardPreview.innerHTML = "";
  messageForwardSearchInput.value = "";
  messageForwardFeedback.textContent = "";
  messageForwardList.innerHTML = "";
  if (messageForwardSendBtn) {
    messageForwardSendBtn.textContent = "Переслать";
    messageForwardSendBtn.disabled = true;
  }
  syncOverlayVisibility();
}

function normalizeUsernameLabel(username) {
  return String(username || "").trim().replace(/^@+/, "");
}

function resolveForwardSenderLabel(source) {
  const displayName = String(source?.senderName || source?.displayName || "").trim();
  if (displayName) return displayName;

  const username = normalizeUsernameLabel(source?.senderUsername || source?.username);
  if (username) return `@${username}`;

  return "Пользователь";
}

function getForwardSourceLabel(message) {
  if (message?.forwardedFrom) return resolveForwardSenderLabel(message.forwardedFrom);
  if (message?.sender) return resolveForwardSenderLabel(message.sender);
  return "Пользователь";
}

function buildForwardFallbackText(message) {
  const label = getForwardSourceLabel(message);
  const sourceText = String(message?.text || "").trim();
  return `Переслано от ${label}\n${sourceText}`;
}

function getMessageAttachment(message) {
  if (!message || message.deletedAt) return null;
  const attachment = message.attachment;
  if (!attachment || typeof attachment !== "object") return null;

  const rawUrl = String(attachment.url || attachment.fileUrl || "").trim();
  if (!rawUrl) return null;

  return {
    kind: attachment.kind === "photo" ? "photo" : "attachment",
    url: rawUrl,
    fileName: String(attachment.fileName || "Файл").trim() || "Файл",
    fileSize: Number.isFinite(Number(attachment.fileSize)) ? Number(attachment.fileSize) : null,
    mimeType: normalizeAttachmentMimeType(attachment.mimeType),
  };
}

function buildAttachmentNode(message) {
  const attachment = getMessageAttachment(message);
  if (!attachment) return null;

  if (attachment.kind === "photo") {
    const photoLink = document.createElement("a");
    photoLink.className = "msg-attachment-photo";
    photoLink.href = attachment.url;
    photoLink.target = "_blank";
    photoLink.rel = "noopener noreferrer";

    const image = document.createElement("img");
    image.src = attachment.url;
    image.alt = attachment.fileName || "Фото";
    image.loading = "lazy";
    photoLink.appendChild(image);
    return photoLink;
  }

  const fileCard = document.createElement("a");
  fileCard.className = "msg-attachment-file";
  fileCard.href = attachment.url;
  fileCard.target = "_blank";
  fileCard.rel = "noopener noreferrer";
  fileCard.download = attachment.fileName || "file";

  const icon = document.createElement("span");
  icon.className = "msg-attachment-file-icon";
  icon.textContent = "📄";
  fileCard.appendChild(icon);

  const meta = document.createElement("span");
  meta.className = "msg-attachment-file-meta";
  const title = document.createElement("span");
  title.className = "msg-attachment-file-name";
  title.textContent = attachment.fileName || "Документ";
  meta.appendChild(title);

  const sub = document.createElement("span");
  sub.className = "msg-attachment-file-sub";
  sub.textContent = attachment.fileSize ? formatFileSize(attachment.fileSize) : "Документ";
  meta.appendChild(sub);
  fileCard.appendChild(meta);

  return fileCard;
}

function syncForwardSendState() {
  if (!messageForwardSendBtn) return;
  const selectedCount = forwardSelectedChatIds.size;
  if (selectedCount <= 0) {
    messageForwardSendBtn.textContent = "Переслать";
  } else if (selectedCount === 1) {
    messageForwardSendBtn.textContent = "Переслать в 1 чат";
  } else {
    messageForwardSendBtn.textContent = `Переслать в ${selectedCount} чата`;
  }
  messageForwardSendBtn.disabled = forwardingInFlight || selectedCount <= 0 || !forwardingMessage;
}

async function loadForwardCandidates() {
  const [activeData, archivedData] = await Promise.all([
    api("/api/chats?archived=false", { auth: true }),
    api("/api/chats?archived=true", { auth: true }),
  ]);

  const map = new Map();
  [...(activeData.chats || []), ...(archivedData.chats || [])].forEach((chat) => {
    map.set(Number(chat.id), chat);
  });

  forwardCandidates = [...map.values()].sort(sortChatsByRecent);
}

async function forwardMessageToSelectedChats() {
  if (!forwardingMessage || forwardingInFlight) return;
  const selectedIds = [...forwardSelectedChatIds];
  if (!selectedIds.length) return;
  let shouldCloseForwardModal = false;

  try {
    forwardingInFlight = true;
    syncForwardSendState();
    messageForwardFeedback.textContent = selectedIds.length > 1 ? `Пересылаем в ${selectedIds.length} чата...` : "Пересылаем...";

    const settled = await Promise.allSettled(
      selectedIds.map((chatId) =>
        api(`/api/chats/${chatId}/messages`, {
          method: "POST",
          auth: true,
          body: {
            text: buildForwardFallbackText(forwardingMessage),
            forwardFromMessageId: forwardingMessage.id,
          },
        })
      )
    );

    const chatMap = new Map(forwardCandidates.map((chat) => [Number(chat.id), chat]));
    const successIds = [];
    const failed = [];

    settled.forEach((entry, index) => {
      const chatId = selectedIds[index];
      if (entry.status === "fulfilled") {
        successIds.push(chatId);
      } else {
        const title = chatMap.get(Number(chatId))?.title || `чат ${chatId}`;
        failed.push(`«${title}»: ${entry.reason?.message || "ошибка"}`);
      }
    });

    if (successIds.length) {
      scheduleChatsRefresh();
      if (activeChatId && successIds.some((chatId) => Number(chatId) === Number(activeChatId))) {
        scheduleMessagesRefresh(activeChatId);
      }
    }

    if (!failed.length) {
      shouldCloseForwardModal = true;
      return;
    }

    if (successIds.length) {
      messageForwardFeedback.textContent = `Частично отправлено (${successIds.length}/${selectedIds.length}). ${failed[0]}`;
    } else {
      messageForwardFeedback.textContent = failed[0] || "Не удалось переслать сообщение";
    }
  } catch (error) {
    messageForwardFeedback.textContent = error.message;
  } finally {
    forwardingInFlight = false;
    if (shouldCloseForwardModal) {
      closeMessageForwardModal();
      return;
    }
    syncForwardSendState();
    renderForwardChatList(messageForwardSearchInput.value);
  }
}

function renderForwardChatList(query = "") {
  messageForwardList.innerHTML = "";
  const normalizedQuery = normalizeUserSearchQuery(query).toLowerCase();

  const candidates = forwardCandidates.filter((chat) => {
    if (!normalizedQuery) return true;
    const title = String(chat.title || "").toLowerCase();
    const peerUsername = String(chat.peer?.username || "").toLowerCase();
    const peerName = String(chat.peer?.displayName || "").toLowerCase();
    return title.includes(normalizedQuery) || peerUsername.includes(normalizedQuery) || peerName.includes(normalizedQuery);
  });

  if (!candidates.length) {
    messageForwardList.innerHTML = `<div class="list-state">Подходящие чаты не найдены</div>`;
    return;
  }

  candidates.forEach((chat) => {
    const item = document.createElement("div");
    const selected = forwardSelectedChatIds.has(Number(chat.id));
    item.className = `forward-chat-item${selected ? " selected" : ""}`;

    const avatar = chat.avatar || buildAvatarPlaceholder(chat.title || chat.peer?.username || "CH");
    const subtitle =
      chat.type === "group"
        ? `${chat.memberCount || 0} участников`
        : `@${chat.peer?.username || chat.title}`;
    const time = timeLabel(chat.lastMessage?.createdAt || chat.createdAt);
    const archivedTag = chat.archived ? " • архив" : "";

    item.innerHTML = `
      <label class="forward-chat-select" title="Выбрать чат">
        <input type="checkbox" ${selected ? "checked" : ""} ${forwardingInFlight ? "disabled" : ""} />
        <span></span>
      </label>
      <img class="forward-chat-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(chat.title)}" />
      <div class="forward-chat-meta">
        <div class="forward-chat-topline">
          <div class="forward-chat-title">${escapeHtml(chat.title)}</div>
          <div class="forward-chat-time">${escapeHtml(time)}</div>
        </div>
        <div class="forward-chat-subtitle">${escapeHtml(subtitle + archivedTag)}</div>
      </div>
    `;

    const check = item.querySelector("input[type='checkbox']");
    const toggle = () => {
      if (forwardingInFlight) return;
      if (forwardSelectedChatIds.has(Number(chat.id))) {
        forwardSelectedChatIds.delete(Number(chat.id));
      } else {
        forwardSelectedChatIds.add(Number(chat.id));
      }
      syncForwardSendState();
      renderForwardChatList(messageForwardSearchInput.value);
    };

    check.addEventListener("change", (event) => {
      event.stopPropagation();
      toggle();
    });

    item.addEventListener("click", (event) => {
      if (event.target instanceof HTMLInputElement) return;
      toggle();
    });

    messageForwardList.appendChild(item);
  });
}

async function openMessageForwardModal(message) {
  if (!message || message.isSystem || message.deletedAt) return;

  const sourceLabel = getForwardSourceLabel(message);
  const sourceText = String(message.text || "").trim();
  if (!sourceText) {
    clearMessagesState("Пустое сообщение нельзя переслать", "error");
    return;
  }

  forwardingMessage = message;
  forwardingInFlight = false;
  forwardSelectedChatIds = new Set();
  forwardCandidates = [];
  syncForwardSendState();
  messageForwardFeedback.textContent = "Загрузка чатов...";
  messageForwardSearchInput.value = "";
  messageForwardPreview.innerHTML = `
    <div class="forward-preview-label">Переслано от ${escapeHtml(sourceLabel)}</div>
    <div class="forward-preview-text">${escapeHtml(truncate(sourceText, 220))}</div>
  `;
  messageForwardModal.classList.remove("hidden");
  messageForwardModal.setAttribute("aria-hidden", "false");
  openOverlay();
  closeMessagePopovers();

  try {
    await loadForwardCandidates();
    messageForwardFeedback.textContent = `Недавних чатов: ${forwardCandidates.length}`;
  } catch (error) {
    forwardCandidates = [...chats].sort(sortChatsByRecent);
    messageForwardFeedback.textContent = `Не удалось обновить список чатов: ${error.message}`;
  }

  renderForwardChatList("");
  syncForwardSendState();
  messageForwardSearchInput.focus();
}
function openCreateMenu() {
  openCreateGroupModal("direct");
}

function closeCreateMenu() {
  if (createMenu) {
    createMenu.classList.add("hidden");
  }
}

function extractRecentUsersFromChats(items) {
  const chatsSource = Array.isArray(items) ? [...items] : [];
  const byUserId = new Map();

  chatsSource
    .filter((chat) => chat && chat.type === "direct" && chat.peer)
    .sort(sortChatsByRecent)
    .forEach((chat) => {
      const peer = chat.peer;
      const peerId = Number(peer.id);
      if (!Number.isInteger(peerId) || peerId <= 0 || byUserId.has(peerId)) return;
      byUserId.set(peerId, {
        id: peerId,
        username: peer.username,
        displayName: peer.displayName || peer.username,
        avatar: peer.avatar || buildAvatarPlaceholder(peer.username || peer.displayName || "U"),
        chatId: Number(chat.id),
        archived: Boolean(chat.archived),
        lastAt: getChatSortTime(chat),
      });
    });

  return [...byUserId.values()];
}

function renderCreateUserList(container, users, { selectedUsernames = new Set(), actionLabel = "Открыть", onAction } = {}) {
  if (!container) return;
  container.innerHTML = "";
  const list = Array.isArray(users) ? users : [];

  if (!list.length) {
    container.innerHTML = `<div class="list-state">Пока пусто</div>`;
    return;
  }

  list.forEach((user) => {
    const username = String(user?.username || "").trim();
    if (!username) return;
    const selected = selectedUsernames.has(username.toLowerCase());
    const row = document.createElement("button");
    row.type = "button";
    row.className = `create-user-item${selected ? " selected" : ""}`;

    const secondaryBits = [];
    if (user.archived) secondaryBits.push("архив");
    if (user.lastAt) secondaryBits.push(`активность ${timeLabel(user.lastAt)}`);
    const secondary = secondaryBits.length ? ` • ${secondaryBits.join(" • ")}` : "";

    row.innerHTML = `
      <img class="create-user-avatar" src="${escapeHtml(user.avatar || buildAvatarPlaceholder(username))}" alt="${escapeHtml(
      user.displayName || username
    )}" />
      <div class="create-user-meta">
        <div class="create-user-name">${escapeHtml(user.displayName || username)}</div>
        <div class="create-user-username">@${escapeHtml(username)}${escapeHtml(secondary)}</div>
      </div>
      <span class="create-user-action">${selected ? "Выбран" : escapeHtml(actionLabel)}</span>
    `;

    row.addEventListener("click", async () => {
      if (typeof onAction === "function") {
        await onAction(user, selected);
      }
    });
    container.appendChild(row);
  });
}

function syncCreateFlowActions() {
  const isGroup = createFlowMode === "group";
  const onUsersStep = isGroup && createGroupStep === "users";
  const onTitleStep = isGroup && createGroupStep === "title";

  if (createGroupBackBtn) {
    createGroupBackBtn.classList.toggle("hidden", !onTitleStep);
    createGroupBackBtn.disabled = creatingGroupInFlight;
  }

  if (createGroupNextBtn) {
    createGroupNextBtn.classList.toggle("hidden", !onUsersStep);
    createGroupNextBtn.disabled = createGroupSelectedUsers.length < 1 || creatingGroupInFlight;
  }

  if (createGroupSubmitBtn) {
    createGroupSubmitBtn.classList.toggle("hidden", !onTitleStep);
    createGroupSubmitBtn.disabled = creatingGroupInFlight || String(createGroupTitleInput?.value || "").trim().length < 2;
  }
}

function setCreateGroupStep(step) {
  createGroupStep = step === "title" ? "title" : "users";
  if (createGroupStepUsers) createGroupStepUsers.classList.toggle("hidden", createGroupStep !== "users");
  if (createGroupStepTitle) createGroupStepTitle.classList.toggle("hidden", createGroupStep !== "title");
  syncCreateFlowActions();
}

function setCreateFlowMode(mode) {
  createFlowMode = mode === "group" ? "group" : "direct";
  if (createTabDirectBtn) createTabDirectBtn.classList.toggle("active", createFlowMode === "direct");
  if (createTabGroupBtn) createTabGroupBtn.classList.toggle("active", createFlowMode === "group");
  if (createDirectView) createDirectView.classList.toggle("hidden", createFlowMode !== "direct");
  if (createGroupView) createGroupView.classList.toggle("hidden", createFlowMode !== "group");
  setCreateGroupStep("users");
}

function renderCreateGroupMembersPreview() {
  if (!createGroupMembersPreview) return;
  createGroupMembersPreview.innerHTML = "";
  if (!createGroupSelectedUsers.length) {
    createGroupMembersPreview.innerHTML = `<div class="list-state">Участники не выбраны</div>`;
    return;
  }

  createGroupSelectedUsers.forEach((user) => {
    const chip = document.createElement("span");
    chip.className = "selected-chip";
    chip.innerHTML = `
      <img src="${escapeHtml(user.avatar || buildAvatarPlaceholder(user.username))}" alt="${escapeHtml(user.displayName || user.username)}" />
      <span>${escapeHtml(user.displayName || user.username)}</span>
    `;
    createGroupMembersPreview.appendChild(chip);
  });
}

function renderCreateGroupSelected() {
  if (!createGroupSelected) return;
  createGroupSelected.innerHTML = "";

  if (!createGroupSelectedUsers.length) {
    createGroupSelected.innerHTML = `<div class="list-state">Выберите хотя бы одного участника</div>`;
    renderCreateGroupMembersPreview();
    syncCreateFlowActions();
    return;
  }

  createGroupSelectedUsers.forEach((user) => {
    const chip = document.createElement("div");
    chip.className = "selected-chip removable";
    chip.innerHTML = `
      <img src="${escapeHtml(user.avatar || buildAvatarPlaceholder(user.username))}" alt="${escapeHtml(user.displayName || user.username)}" />
      <span>${escapeHtml(user.displayName || user.username)}</span>
      <button type="button" class="selected-chip-remove" title="Убрать">✕</button>
    `;
    chip.querySelector("button")?.addEventListener("click", (event) => {
      event.stopPropagation();
      createGroupSelectedUsers = createGroupSelectedUsers.filter((item) => item.username.toLowerCase() !== user.username.toLowerCase());
      renderCreateGroupSelected();
      renderCreateGroupRecent();
      searchUsersForCreateGroup(createGroupSearchInput?.value || "");
    });
    createGroupSelected.appendChild(chip);
  });

  renderCreateGroupMembersPreview();
  syncCreateFlowActions();
}

function renderCreateDirectRecent() {
  renderCreateUserList(createDirectRecentList, createRecentUsers, {
    actionLabel: "Открыть",
    onAction: async (user) => {
      await openDirectChatByUsername(user.username, { closeCreateFlow: true });
      if (createDirectState) {
        createDirectState.textContent = `Открыт чат с @${user.username}`;
      }
    },
  });
}

function renderCreateGroupRecent() {
  const selectedSet = new Set(createGroupSelectedUsers.map((item) => String(item.username || "").toLowerCase()));
  renderCreateUserList(createGroupRecentList, createRecentUsers, {
    selectedUsernames: selectedSet,
    actionLabel: "Выбрать",
    onAction: async (user, alreadySelected) => {
      if (alreadySelected) return;
      createGroupSelectedUsers.push(user);
      renderCreateGroupSelected();
      renderCreateGroupRecent();
      await searchUsersForCreateGroup(createGroupSearchInput?.value || "");
    },
  });
}

async function loadCreateRecentUsers() {
  const [activeData, archivedData] = await Promise.all([
    api("/api/chats?archived=false", { auth: true }),
    api("/api/chats?archived=true", { auth: true }),
  ]);

  const map = new Map();
  [...(activeData.chats || []), ...(archivedData.chats || [])].forEach((chat) => {
    map.set(Number(chat.id), chat);
  });
  createRecentUsers = extractRecentUsersFromChats([...map.values()]).slice(0, 24);
}

async function openDirectChatByUsername(username, { closeCreateFlow = false } = {}) {
  const result = await api("/api/chats/direct", {
    method: "POST",
    auth: true,
    body: { username },
  });

  showArchived = false;
  setArchiveToggleLabel();
  await loadChats(true);

  const nextChatId = result.chat?.id ? Number(result.chat.id) : null;
  if (Number.isInteger(nextChatId) && nextChatId > 0) {
    await openChat(nextChatId);
  } else if (result.target?.username) {
    const fallback = chats.find((chat) => chat.type === "direct" && String(chat.peer?.username || "").toLowerCase() === result.target.username.toLowerCase());
    if (fallback) {
      await openChat(fallback.id);
    }
  }

  if (closeCreateFlow) {
    closeCreateGroupModal();
  }
}

async function openCreateGroupModal(initialMode = "direct") {
  closeCreateMenu();
  if (!groupPanel.classList.contains("hidden")) {
    closeGroupPanel();
  }
  if (!profilePanel.classList.contains("hidden")) {
    closeProfilePanel();
  }
  if (contactPanel && !contactPanel.classList.contains("hidden")) {
    closeContactPanel();
  }
  createGroupModal.classList.remove("hidden");
  createGroupModal.setAttribute("aria-hidden", "false");
  openOverlay();

  createGroupSelectedUsers = [];
  createRecentUsers = [];
  creatingGroupInFlight = false;
  createGroupStep = "users";
  if (createDirectSearchTimer) {
    clearTimeout(createDirectSearchTimer);
    createDirectSearchTimer = null;
  }
  if (createGroupSearchTimer) {
    clearTimeout(createGroupSearchTimer);
    createGroupSearchTimer = null;
  }
  if (createDirectSearchInput) createDirectSearchInput.value = "";
  if (createGroupSearchInput) createGroupSearchInput.value = "";
  if (createGroupTitleInput) createGroupTitleInput.value = "";
  if (createDirectState) createDirectState.textContent = "Начните вводить имя или username.";
  if (createGroupSearchState) createGroupSearchState.textContent = "Найдите и выберите участников.";
  if (createGroupFeedback) createGroupFeedback.textContent = "";
  if (createDirectResults) createDirectResults.innerHTML = `<div class="list-state">Здесь появятся результаты поиска</div>`;
  if (createGroupSearchResults) createGroupSearchResults.innerHTML = `<div class="list-state">Здесь появятся результаты поиска</div>`;

  setCreateFlowMode(initialMode);
  renderCreateGroupSelected();
  renderCreateDirectRecent();
  renderCreateGroupRecent();

  try {
    await loadCreateRecentUsers();
    renderCreateDirectRecent();
    renderCreateGroupRecent();
    if (createDirectState && createFlowMode === "direct") {
      createDirectState.textContent = createRecentUsers.length ? "Недавние контакты ниже. Можно сразу открыть чат." : "Недавних контактов пока нет.";
    }
  } catch (error) {
    if (createDirectState) {
      createDirectState.textContent = `Не удалось загрузить недавние контакты: ${error.message}`;
    }
    if (createGroupSearchState && createFlowMode === "group") {
      createGroupSearchState.textContent = `Недавние контакты не загружены: ${error.message}`;
    }
  }

  syncCreateFlowActions();
  if (createFlowMode === "group") {
    createGroupSearchInput?.focus();
  } else {
    createDirectSearchInput?.focus();
  }
}

function closeCreateGroupModal() {
  createGroupModal.classList.add("hidden");
  createGroupModal.setAttribute("aria-hidden", "true");
  createGroupSelectedUsers = [];
  createRecentUsers = [];
  creatingGroupInFlight = false;
  createFlowMode = "direct";
  createGroupStep = "users";
  if (createDirectSearchTimer) {
    clearTimeout(createDirectSearchTimer);
    createDirectSearchTimer = null;
  }
  if (createGroupSearchTimer) {
    clearTimeout(createGroupSearchTimer);
    createGroupSearchTimer = null;
  }
  syncOverlayVisibility();
}

function showGroupPanelFeedback(text = "", kind = "") {
  groupPanelFeedback.textContent = text;
  groupPanelFeedback.className = "group-panel-feedback";
  if (kind) {
    groupPanelFeedback.classList.add(`is-${kind}`);
  }
}

function openGroupPanel() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group") return;
  if (!profilePanel.classList.contains("hidden")) {
    closeProfilePanel();
  }
  if (contactPanel && !contactPanel.classList.contains("hidden")) {
    closeContactPanel();
  }
  if (!groupAddModal.classList.contains("hidden")) {
    closeGroupAddModal();
  }

  groupPanelChatId = chat.id;
  groupPanel.classList.remove("hidden");
  groupPanel.setAttribute("aria-hidden", "false");
  openOverlay();
  refreshGroupPanel();
}

function closeGroupPanel() {
  groupPanel.classList.add("hidden");
  groupPanel.setAttribute("aria-hidden", "true");
  groupPanelChatId = null;
  showGroupPanelFeedback("");
  closeGroupAddModal();
  syncOverlayVisibility();
}

async function loadGroupAddRecentUsers() {
  const [activeData, archivedData] = await Promise.all([
    api("/api/chats?archived=false", { auth: true }),
    api("/api/chats?archived=true", { auth: true }),
  ]);
  const map = new Map();
  [...(activeData.chats || []), ...(archivedData.chats || [])].forEach((chat) => {
    map.set(Number(chat.id), chat);
  });
  groupAddRecentUsers = extractRecentUsersFromChats([...map.values()]).slice(0, 20);
}

function closeGroupAddModal() {
  groupAddModal.classList.add("hidden");
  groupAddModal.setAttribute("aria-hidden", "true");
  groupAddSubmitting = false;
  groupAddSelectedUsers = [];
  groupAddRecentUsers = [];
  groupAddSearchUsers = [];
  if (groupAddSearchTimer) {
    clearTimeout(groupAddSearchTimer);
    groupAddSearchTimer = null;
  }
  if (groupAddModalInput) groupAddModalInput.value = "";
  if (groupAddModalState) groupAddModalState.textContent = "Введите имя или username для поиска.";
  if (groupAddModalRecentList) groupAddModalRecentList.innerHTML = "";
  if (groupAddModalResultsList) groupAddModalResultsList.innerHTML = "";
  if (groupAddModalSelected) groupAddModalSelected.innerHTML = "";
  if (groupAddRecentCount) groupAddRecentCount.textContent = "";
  if (groupAddResultsCount) groupAddResultsCount.textContent = "";
  setGroupAddModalFeedback("");
  syncGroupAddModalState();
  syncOverlayVisibility();
}

async function searchUsersForGroupAddModal(query) {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group" || !groupPanelChatId || Number(chat.id) !== Number(groupPanelChatId)) return;

  const seq = ++groupAddSearchSeq;
  const q = normalizeUserSearchQuery(query);
  groupAddSearchUsers = [];
  renderGroupAddUserList(groupAddModalResultsList, [], {
    emptyText: "Здесь появятся результаты поиска",
    countNode: groupAddResultsCount,
  });

  if (!q) {
    groupAddModalState.textContent = "Введите имя, username или @username";
    return;
  }

  try {
    groupAddModalState.textContent = "Поиск...";
    const result = await api(`/api/users/search?q=${encodeURIComponent(q)}`, { auth: true });
    if (seq !== groupAddSearchSeq) return;

    groupAddSearchUsers = Array.isArray(result.users) ? result.users : [];
    const members = getGroupMemberUsernameSet();
    const notInGroup = groupAddSearchUsers.filter((user) => !members.has(String(user.username || "").toLowerCase()));

    if (!groupAddSearchUsers.length) {
      groupAddModalState.textContent = "Ничего не найдено";
      renderGroupAddUserList(groupAddModalResultsList, [], {
        emptyText: "Попробуйте другой запрос",
        countNode: groupAddResultsCount,
      });
      return;
    }

    if (!notInGroup.length) {
      groupAddModalState.textContent = "Найденные пользователи уже в группе";
    } else {
      groupAddModalState.textContent = `Найдено: ${groupAddSearchUsers.length}`;
    }

    renderGroupAddUserList(groupAddModalResultsList, groupAddSearchUsers, {
      emptyText: "Попробуйте другой запрос",
      countNode: groupAddResultsCount,
    });
    syncGroupAddModalState();
  } catch (error) {
    if (seq !== groupAddSearchSeq) return;
    groupAddModalState.textContent = error.message;
    renderGroupAddUserList(groupAddModalResultsList, [], {
      emptyText: error.message,
      countNode: groupAddResultsCount,
    });
  }
}

async function openGroupAddModal() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group" || !groupPanelChatId || Number(chat.id) !== Number(groupPanelChatId)) return;
  if (!canManageGroup(chat)) return;

  setGroupAddModalFeedback("");
  groupAddSelectedUsers = [];
  groupAddSearchUsers = [];
  groupAddRecentUsers = [];
  groupAddSubmitting = false;
  if (groupAddSearchTimer) {
    clearTimeout(groupAddSearchTimer);
    groupAddSearchTimer = null;
  }

  groupAddModal.classList.remove("hidden");
  groupAddModal.setAttribute("aria-hidden", "false");
  groupAddModalState.textContent = "Загружаем недавние контакты...";
  renderGroupAddSelectedUsers();
  renderGroupAddUserList(groupAddModalRecentList, [], {
    emptyText: "Загрузка...",
    countNode: groupAddRecentCount,
  });
  renderGroupAddUserList(groupAddModalResultsList, [], {
    emptyText: "Здесь появятся результаты поиска",
    countNode: groupAddResultsCount,
  });
  syncGroupAddModalState();
  openOverlay();

  try {
    await loadGroupAddRecentUsers();
    renderGroupAddUserList(groupAddModalRecentList, groupAddRecentUsers, {
      emptyText: "Недавних контактов пока нет",
      countNode: groupAddRecentCount,
    });
    groupAddModalState.textContent = groupAddRecentUsers.length
      ? "Выберите пользователей из недавних или воспользуйтесь поиском."
      : "Недавних контактов пока нет. Воспользуйтесь поиском.";
  } catch (error) {
    groupAddRecentUsers = [];
    renderGroupAddUserList(groupAddModalRecentList, [], {
      emptyText: "Недавние контакты недоступны",
      countNode: groupAddRecentCount,
    });
    groupAddModalState.textContent = `Не удалось загрузить недавние: ${error.message}`;
  }

  groupAddModalInput.focus();
}

async function submitGroupAddSelectedUsers() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group" || !groupPanelChatId || Number(chat.id) !== Number(groupPanelChatId)) return;
  if (groupAddSubmitting) return;

  const selectedByUsername = new Map();
  (groupAddSelectedUsers || []).forEach((raw) => {
    const user = normalizeGroupAddUser(raw);
    if (!user) return;
    const key = user.username.toLowerCase();
    if (!selectedByUsername.has(key)) {
      selectedByUsername.set(key, user);
    }
  });
  const selectedUsers = [...selectedByUsername.values()];
  if (!selectedUsers.length) {
    setGroupAddModalFeedback("Выберите хотя бы одного участника", "error");
    syncGroupAddModalState();
    return;
  }

  const members = getGroupMemberUsernameSet();
  const usernamesToAdd = selectedUsers
    .map((user) => user.username)
    .filter((username) => !members.has(String(username || "").toLowerCase()));

  if (!usernamesToAdd.length) {
    setGroupAddModalFeedback("Все выбранные пользователи уже в группе", "error");
    syncGroupAddModalState();
    return;
  }

  try {
    groupAddSubmitting = true;
    syncGroupAddModalState();
    setGroupAddModalFeedback(`Добавляем: ${usernamesToAdd.length}...`, "");
    await api(`/api/chats/${groupPanelChatId}/group/members`, {
      method: "POST",
      auth: true,
      body: { usernames: usernamesToAdd },
    });
    if (usernamesToAdd.length === 1) {
      showGroupPanelFeedback(`Добавлен @${usernamesToAdd[0]}`, "success");
    } else {
      showGroupPanelFeedback(`Добавлено участников: ${usernamesToAdd.length}`, "success");
    }
    await loadChats(true);
    await loadMessages(groupPanelChatId, true);
    await refreshGroupPanel();
    closeGroupAddModal();
  } catch (error) {
    setGroupAddModalFeedback(error.message, "error");
  } finally {
    groupAddSubmitting = false;
    syncGroupAddModalState();
  }
}

function askConfirm(text) {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    confirmModalText.textContent = text;
    confirmModal.classList.remove("hidden");
    confirmModal.setAttribute("aria-hidden", "false");
    openOverlay();
  });
}

function closeConfirmModal(result) {
  if (confirmResolve) {
    confirmResolve(Boolean(result));
  }
  confirmResolve = null;
  confirmModal.classList.add("hidden");
  confirmModal.setAttribute("aria-hidden", "true");
  syncOverlayVisibility();
}

function canManageGroup(chat) {
  return Boolean(chat && chat.type === "group" && (chat.myRole === "owner" || chat.myRole === "admin"));
}

function isGroupOwner(chat) {
  return Boolean(chat && chat.type === "group" && chat.myRole === "owner");
}

function setGroupAddModalFeedback(text = "", kind = "") {
  if (!groupAddModalFeedback) return;
  groupAddModalFeedback.textContent = text;
  groupAddModalFeedback.className = "group-panel-feedback";
  if (kind) {
    groupAddModalFeedback.classList.add(`is-${kind}`);
  }
}

function getGroupMemberUsernameSet() {
  const result = new Set();
  (groupMembersCache || []).forEach((item) => {
    const username = String(item?.user?.username || "").trim().toLowerCase();
    if (username) result.add(username);
  });
  return result;
}

function normalizeGroupAddUser(user) {
  if (!user) return null;
  const username = String(user.username || "").trim();
  if (!username) return null;
  return {
    id: Number(user.id) || 0,
    username,
    displayName: String(user.displayName || user.username || "").trim() || username,
    avatar: user.avatar || buildAvatarPlaceholder(username),
    archived: Boolean(user.archived),
    lastAt: user.lastAt || "",
  };
}

function getGroupAddSelectedUsernameSet() {
  const set = new Set();
  (groupAddSelectedUsers || []).forEach((raw) => {
    const user = normalizeGroupAddUser(raw);
    if (!user) return;
    set.add(user.username.toLowerCase());
  });
  return set;
}

function renderGroupAddSelectedUsers() {
  if (!groupAddModalSelected) return;
  const unique = [];
  const seen = new Set();
  (groupAddSelectedUsers || []).forEach((raw) => {
    const user = normalizeGroupAddUser(raw);
    if (!user) return;
    const key = user.username.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(user);
  });
  groupAddSelectedUsers = unique;

  if (!unique.length) {
    groupAddModalSelected.innerHTML = `<div class="list-state">Выберите пользователей из недавних или результатов поиска</div>`;
    return;
  }

  const members = getGroupMemberUsernameSet();
  groupAddModalSelected.innerHTML = "";
  unique.forEach((selected) => {
    const usernameKey = selected.username.toLowerCase();
    const alreadyInGroup = members.has(usernameKey);
    const row = document.createElement("div");
    row.className = `selected-member-item${alreadyInGroup ? " in-group" : ""}`;
    row.innerHTML = `
      <img src="${escapeHtml(selected.avatar)}" alt="${escapeHtml(selected.displayName)}" />
      <div class="member-meta">
        <div class="name">${escapeHtml(selected.displayName)}</div>
        <div class="username">@${escapeHtml(selected.username)}</div>
      </div>
      <div class="selected-member-actions">
        <span class="create-user-action">${alreadyInGroup ? "Уже в группе" : "Выбран"}</span>
        <button type="button" class="selected-chip-remove" title="Убрать">✕</button>
      </div>
    `;
    const removeBtn = row.querySelector(".selected-chip-remove");
    if (removeBtn) {
      removeBtn.disabled = groupAddSubmitting;
      removeBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (groupAddSubmitting) return;
        groupAddSelectedUsers = groupAddSelectedUsers.filter(
          (item) => String(item?.username || "").toLowerCase() !== usernameKey
        );
        refreshGroupAddModalLists();
      });
    }
    groupAddModalSelected.appendChild(row);
  });
}

function syncGroupAddModalState() {
  const members = getGroupMemberUsernameSet();
  const uniqueSelected = [];
  const seen = new Set();
  (groupAddSelectedUsers || []).forEach((raw) => {
    const user = normalizeGroupAddUser(raw);
    if (!user) return;
    const key = user.username.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    uniqueSelected.push(user);
  });
  const addableCount = uniqueSelected.filter((user) => !members.has(user.username.toLowerCase())).length;
  const canSubmit = Boolean(addableCount > 0 && !groupAddSubmitting && groupPanelChatId);
  if (groupAddModalSubmitBtn) {
    groupAddModalSubmitBtn.disabled = !canSubmit;
    if (groupAddSubmitting) {
      groupAddModalSubmitBtn.textContent = "Добавляем...";
    } else if (addableCount > 0) {
      groupAddModalSubmitBtn.textContent = `Добавить (${addableCount})`;
    } else {
      groupAddModalSubmitBtn.textContent = "Добавить";
    }
  }
}

function renderGroupAddUserList(container, users, { emptyText = "Пока пусто", countNode = null } = {}) {
  if (!container) return;
  container.innerHTML = "";
  const source = Array.isArray(users) ? users.map(normalizeGroupAddUser).filter(Boolean) : [];
  const members = getGroupMemberUsernameSet();
  const selectedUsernames = getGroupAddSelectedUsernameSet();

  if (countNode) {
    countNode.textContent = source.length ? `${source.length}` : "";
  }

  if (!source.length) {
    container.innerHTML = `<div class="list-state">${escapeHtml(emptyText)}</div>`;
    return;
  }

  source.forEach((user) => {
    const usernameKey = user.username.toLowerCase();
    const alreadyInGroup = members.has(usernameKey);
    const selected = selectedUsernames.has(usernameKey);

    const secondaryBits = [];
    if (user.archived) secondaryBits.push("архив");
    if (user.lastAt) secondaryBits.push(`активность ${timeLabel(user.lastAt)}`);
    const secondary = secondaryBits.length ? ` • ${secondaryBits.join(" • ")}` : "";
    const actionLabel = alreadyInGroup ? "Уже в группе" : selected ? "Выбран" : "Выбрать";

    const row = document.createElement("button");
    row.type = "button";
    row.className = `create-user-item${selected ? " selected" : ""}${alreadyInGroup ? " in-group" : ""}`;
    row.innerHTML = `
      <img class="create-user-avatar" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.displayName)}" />
      <div class="create-user-meta">
        <div class="create-user-name">${escapeHtml(user.displayName)}</div>
        <div class="create-user-username">@${escapeHtml(user.username)}${escapeHtml(secondary)}</div>
      </div>
      <span class="create-user-action">${escapeHtml(actionLabel)}</span>
    `;

    if (alreadyInGroup || groupAddSubmitting) {
      row.disabled = true;
    } else {
      row.addEventListener("click", () => {
        if (selected) {
          groupAddSelectedUsers = groupAddSelectedUsers.filter(
            (item) => String(item?.username || "").toLowerCase() !== usernameKey
          );
        } else {
          groupAddSelectedUsers.push(user);
        }
        setGroupAddModalFeedback("");
        refreshGroupAddModalLists();
      });
    }

    container.appendChild(row);
  });
}

function refreshGroupAddModalLists() {
  renderGroupAddSelectedUsers();
  renderGroupAddUserList(groupAddModalRecentList, groupAddRecentUsers, {
    emptyText: "Недавних контактов пока нет",
    countNode: groupAddRecentCount,
  });
  renderGroupAddUserList(groupAddModalResultsList, groupAddSearchUsers, {
    emptyText: "Здесь появятся результаты поиска",
    countNode: groupAddResultsCount,
  });
  syncGroupAddModalState();
}

function renderGroupMembersList(chat, members) {
  groupMembersList.innerHTML = "";
  groupMembersCache = members;
  groupMembersCount.textContent = `${members.length} участников`;

  if (!members.length) {
    groupMembersState.textContent = "Участники не найдены";
    return;
  }
  groupMembersState.textContent = "";

  members.forEach((item) => {
    const isSelf = me && Number(item.user.id) === Number(me.id);
    const row = document.createElement("div");
    row.className = "group-member-item";

    const roleBadge = `<span class="group-role role-${escapeHtml(item.role)}">${roleLabel(item.role)}</span>`;
    row.innerHTML = `
      <img src="${escapeHtml(item.user.avatar || buildAvatarPlaceholder(item.user.username))}" alt="${escapeHtml(item.user.displayName || item.user.username)}" />
      <div class="member-meta">
        <div class="name">${escapeHtml(item.user.displayName || item.user.username)}</div>
        <div class="username">@${escapeHtml(item.user.username || "")}</div>
      </div>
      <div class="member-role-wrap">${roleBadge}</div>
      <div class="member-actions"></div>
    `;

    const actions = row.querySelector(".member-actions");
    const canManage = canManageGroup(chat);
    const owner = isGroupOwner(chat);

    if (canManage && !isSelf) {
      if (owner && item.role !== "owner") {
        const roleBtn = document.createElement("button");
        roleBtn.type = "button";
        roleBtn.className = "btn-ghost";
        roleBtn.textContent = item.role === "admin" ? "Сделать участником" : "Сделать админом";
        roleBtn.addEventListener("click", async () => {
          try {
            const nextRole = item.role === "admin" ? "member" : "admin";
            await api(`/api/chats/${groupPanelChatId}/group/members/${item.user.id}/role`, {
              method: "PATCH",
              auth: true,
              body: { role: nextRole },
            });
            showGroupPanelFeedback("Роль обновлена", "success");
            await loadChats(true);
            await refreshGroupPanel();
          } catch (error) {
            showGroupPanelFeedback(error.message, "error");
          }
        });
        actions.appendChild(roleBtn);
      }

      const canRemove = item.role !== "owner" && (owner || item.role === "member");
      if (canRemove) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn-danger";
        removeBtn.textContent = "Удалить";
        removeBtn.addEventListener("click", async () => {
          const ok = await askConfirm(`Удалить @${item.user.username} из группы?`);
          if (!ok) return;
          try {
            await api(`/api/chats/${groupPanelChatId}/group/members/${item.user.id}`, {
              method: "DELETE",
              auth: true,
            });
            showGroupPanelFeedback("Участник удален", "success");
            await loadChats(true);
            await loadMessages(groupPanelChatId, true);
            await refreshGroupPanel();
          } catch (error) {
            showGroupPanelFeedback(error.message, "error");
          }
        });
        actions.appendChild(removeBtn);
      }
    }

    groupMembersList.appendChild(row);
  });
}

async function refreshGroupPanel() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group" || !groupPanelChatId || Number(chat.id) !== Number(groupPanelChatId)) {
    closeGroupPanel();
    return;
  }

  groupPanelTitle.textContent = chat.title;
  groupPanelMeta.textContent = `${chat.memberCount || 0} участников | ваша роль: ${roleLabel(chat.myRole)}`;
  groupRenameForm.classList.toggle("hidden", !canManageGroup(chat));
  groupAddOpenBtn.classList.toggle("hidden", !canManageGroup(chat));
  groupAddOpenBtn.disabled = !canManageGroup(chat);
  groupLeaveBtn.classList.toggle("hidden", !chat);
  if (document.activeElement !== groupRenameInput) {
    groupRenameInput.value = chat.title || "";
  }
  if (!canManageGroup(chat) && !groupAddModal.classList.contains("hidden")) {
    closeGroupAddModal();
  }

  groupMembersState.textContent = "Загрузка участников...";
  try {
    const result = await api(`/api/chats/${chat.id}/group/members`, { auth: true });
    renderGroupMembersList(chat, result.members || []);
    if (!groupAddModal.classList.contains("hidden")) {
      refreshGroupAddModalLists();
    }
  } catch (error) {
    groupMembersState.textContent = error.message;
  }
}

function getActiveChat() {
  return chats.find((chat) => chat.id === activeChatId) || null;
}

function isModerator(chat) {
  return Boolean(chat && chat.type === "group" && (chat.myRole === "owner" || chat.myRole === "admin"));
}

function truncate(text, max = 60) {
  const value = String(text || "");
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightSearchText(value, query) {
  const source = String(value || "");
  const q = String(query || "").trim();
  if (!source || !q) return escapeHtml(source);

  const pattern = escapeRegex(q);
  if (!pattern) return escapeHtml(source);
  const re = new RegExp(pattern, "ig");

  let cursor = 0;
  let output = "";
  let matched = false;
  source.replace(re, (match, offset) => {
    matched = true;
    output += escapeHtml(source.slice(cursor, offset));
    output += `<mark>${escapeHtml(match)}</mark>`;
    cursor = offset + match.length;
    return match;
  });
  output += escapeHtml(source.slice(cursor));

  return matched ? output : escapeHtml(source);
}

function setChatSearchState(text = "", kind = "info") {
  if (!chatSearchResults) return;
  if (!text) {
    chatSearchResults.innerHTML = "";
    chatSearchResults.classList.add("hidden");
    return;
  }

  chatSearchResults.classList.remove("hidden");
  chatSearchResults.innerHTML = `<div class="chat-search-state is-${escapeHtml(kind)}">${escapeHtml(text)}</div>`;
}

function clearMessageJumpHighlights() {
  if (!messagesRoot) return;
  messagesRoot.querySelectorAll(".msg.jump").forEach((node) => {
    node.classList.remove("jump");
  });
}

function clearChatSearch({ clearInput = false } = {}) {
  chatSearchQuery = "";
  chatSearchOffset = 0;
  chatSearchTotal = 0;
  chatSearchHasMore = false;
  chatSearchItems = [];
  chatSearchRequestSeq += 1;
  if (chatSearchResults) {
    chatSearchResults.innerHTML = "";
    chatSearchResults.classList.add("hidden");
  }
  clearMessageJumpHighlights();
  if (clearInput && chatSearchInput) {
    chatSearchInput.value = "";
  }
}

const MESSAGE_INTERACTIVE_TARGET_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "label",
  "[role='button']",
  "[contenteditable='true']",
  ".actions",
  ".msg-action-wrap",
  ".msg-popover",
  ".reactions",
  ".reply-preview",
  ".forwarded-head",
  ".author",
].join(", ");

function hasMessageTextSelection(node) {
  if (!node || typeof window.getSelection !== "function") return false;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return false;
  if (!String(selection.toString() || "").trim()) return false;

  try {
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range && node.contains(range.commonAncestorContainer)) return true;
    }
  } catch {
    // Ignore browser-specific selection errors.
  }

  return Boolean(
    (selection.anchorNode && node.contains(selection.anchorNode)) ||
    (selection.focusNode && node.contains(selection.focusNode)),
  );
}

function isMessageInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(MESSAGE_INTERACTIVE_TARGET_SELECTOR));
}

function clearMessageLongPressState() {
  const state = messageLongPressState;
  if (!state) return;

  if (state.timerId) {
    window.clearTimeout(state.timerId);
  }
  if (state.messageNode) {
    state.messageNode.classList.remove("long-press-pending");
  }

  document.removeEventListener("pointermove", state.onMove, true);
  document.removeEventListener("pointerup", state.onPointerUp, true);
  document.removeEventListener("pointercancel", state.onPointerCancel, true);
  document.removeEventListener("contextmenu", state.onContextMenu, true);
  window.removeEventListener("blur", state.onBlur, true);
  messagesRoot.removeEventListener("scroll", state.onScroll, true);

  messageLongPressState = null;
}

function shouldIgnoreMessageLongPressStart(event, messageNode) {
  if (!event || event.button !== 0) return true;
  if (event.pointerType && event.pointerType !== "mouse") return true;
  if (isMessageInteractiveTarget(event.target)) return true;
  return hasMessageTextSelection(messageNode);
}

function startMessageLongPress(event, { messageNode, onLongPress } = {}) {
  if (!messageNode || typeof onLongPress !== "function") return;
  if (shouldIgnoreMessageLongPressStart(event, messageNode)) return;

  clearMessageLongPressState();

  const startX = Number(event.clientX) || 0;
  const startY = Number(event.clientY) || 0;
  const pointerId = Number.isInteger(event.pointerId) ? event.pointerId : null;

  const cancel = () => {
    clearMessageLongPressState();
  };

  const onMove = (moveEvent) => {
    if (pointerId !== null && Number.isInteger(moveEvent.pointerId) && moveEvent.pointerId !== pointerId) {
      return;
    }
    const dx = Math.abs((Number(moveEvent.clientX) || 0) - startX);
    const dy = Math.abs((Number(moveEvent.clientY) || 0) - startY);
    if (Math.max(dx, dy) > MESSAGE_LONG_PRESS_MOVE_THRESHOLD_PX) {
      cancel();
    }
  };

  const onPointerUp = (upEvent) => {
    if (pointerId !== null && Number.isInteger(upEvent.pointerId) && upEvent.pointerId !== pointerId) {
      return;
    }
    cancel();
  };

  const onPointerCancel = (cancelEvent) => {
    if (pointerId !== null && Number.isInteger(cancelEvent.pointerId) && cancelEvent.pointerId !== pointerId) {
      return;
    }
    cancel();
  };

  const onContextMenu = () => cancel();
  const onBlur = () => cancel();
  const onScroll = () => cancel();

  const timerId = window.setTimeout(() => {
    const current = messageLongPressState;
    if (!current || current.timerId !== timerId) return;
    clearMessageLongPressState();
    if (!document.body.contains(messageNode)) return;
    if (hasMessageTextSelection(messageNode)) return;
    onLongPress();
  }, MESSAGE_LONG_PRESS_MS);

  messageNode.classList.add("long-press-pending");
  messageLongPressState = {
    timerId,
    messageNode,
    onMove,
    onPointerUp,
    onPointerCancel,
    onContextMenu,
    onBlur,
    onScroll,
  };

  document.addEventListener("pointermove", onMove, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("pointercancel", onPointerCancel, true);
  document.addEventListener("contextmenu", onContextMenu, true);
  window.addEventListener("blur", onBlur, true);
  messagesRoot.addEventListener("scroll", onScroll, true);
}

function shouldIgnoreMessageDoubleClick(event, messageNode) {
  if (isMessageInteractiveTarget(event?.target)) {
    return true;
  }

  return hasMessageTextSelection(messageNode);
}

function activateReplyTarget(message, { sourceNode = null } = {}) {
  if (!message || message.isSystem || message.deletedAt) return;

  setReplyTarget(message);
  closeMessagePopovers();

  if (!composerInput.disabled) {
    composerInput.focus();
  }

  if (sourceNode) {
    sourceNode.classList.remove("reply-armed");
    requestAnimationFrame(() => {
      sourceNode.classList.add("reply-armed");
      window.setTimeout(() => sourceNode.classList.remove("reply-armed"), 520);
    });
  }
}

function setReplyTarget(message) {
  const shouldPreserveBottom = isMessagesNearBottom(140);
  replyTarget = message
    ? {
        id: message.id,
        senderName: message.sender.displayName,
        text: truncate(message.text, 120),
      }
    : null;

  if (!replyTarget) {
    replyBox.classList.add("hidden");
    replyLabel.textContent = "";
    scheduleChatChromeSync({ preserveBottom: shouldPreserveBottom });
    return;
  }

  replyLabel.textContent = `Ответ на ${replyTarget.senderName}: ${replyTarget.text}`;
  replyBox.classList.remove("hidden");
  scheduleChatChromeSync({ preserveBottom: shouldPreserveBottom });
}

function normalizeAttachmentMimeType(raw) {
  return String(raw || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
}

function getFileExtension(name) {
  const fileName = String(name || "");
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot >= fileName.length - 1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function isPhotoFileType(mimeType, fileName = "") {
  const cleanMime = normalizeAttachmentMimeType(mimeType);
  if (PHOTO_MIME_TYPES.has(cleanMime)) return true;
  const extension = getFileExtension(fileName);
  return extension === ".jpg" || extension === ".jpeg" || extension === ".png" || extension === ".webp" || extension === ".gif";
}

function isDocumentFileType(mimeType, fileName = "") {
  const cleanMime = normalizeAttachmentMimeType(mimeType);
  if (DOCUMENT_MIME_TYPES.has(cleanMime)) return true;
  const extension = getFileExtension(fileName);
  return [".pdf", ".txt", ".doc", ".docx", ".xls", ".xlsx"].includes(extension);
}

function formatFileSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "—";
  const units = ["Б", "КБ", "МБ", "ГБ"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const formatted = size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

function closeComposerAttachMenu() {
  if (!composerAttachMenu) return;
  composerAttachMenu.classList.add("hidden");
  composerAttachMenu.setAttribute("aria-hidden", "true");
  composerAttachBtn?.classList.remove("active");
}

function positionComposerAttachMenu(trigger) {
  if (!composerAttachMenu || !trigger) return;
  const menuRect = composerAttachMenu.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const composerRect = composer.getBoundingClientRect();
  const gap = 8;

  let top = triggerRect.top - composerRect.top - menuRect.height - gap;
  const topInViewport = composerRect.top + top;
  if (topInViewport < 6) {
    const belowTop = triggerRect.bottom - composerRect.top + gap;
    const belowBottomInViewport = composerRect.top + belowTop + menuRect.height;
    if (belowBottomInViewport <= window.innerHeight - 6) {
      top = belowTop;
    } else {
      top = 6 - composerRect.top;
    }
  }

  let left = triggerRect.right - composerRect.left - menuRect.width;
  if (left < 6) {
    left = triggerRect.left - composerRect.left;
  }

  const maxLeft = Math.max(6, composerRect.width - menuRect.width - 6);
  const clampedLeft = Math.min(Math.max(6, left), maxLeft);

  composerAttachMenu.style.top = `${Math.round(top)}px`;
  composerAttachMenu.style.left = `${Math.round(clampedLeft)}px`;
}

function openComposerAttachMenu(trigger) {
  if (!composerAttachMenu || !trigger) return;
  const opening = composerAttachMenu.classList.contains("hidden");
  closeComposerEmojiPicker();
  closeMessagePopovers();

  if (!opening) {
    closeComposerAttachMenu();
    return;
  }

  const revealMenu = () => {
    composerAttachBtn?.classList.add("active");
    composerAttachMenu.classList.remove("hidden");
    composerAttachMenu.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => positionComposerAttachMenu(trigger));
  };

  if (isPhoneLayout()) {
    const hadFocusedInput = isComposerInputFocused();
    if (hadFocusedInput) {
      composerInput.blur();
      scheduleChatChromeSync({ refreshViewport: true, preserveBottom: false });
      window.setTimeout(() => {
        requestAnimationFrame(revealMenu);
      }, 90);
      return;
    }

    requestAnimationFrame(revealMenu);
    return;
  }

  revealMenu();
}

function isFileDragEvent(event) {
  const transfer = event?.dataTransfer;
  if (!transfer) return false;
  const types = Array.from(transfer.types || []).map((value) => String(value || "").toLowerCase());
  return types.includes("files") || types.includes("application/x-moz-file");
}

function setChatDropOverlayVisible(visible) {
  if (!chatDropOverlay) return;
  chatDropOverlay.classList.toggle("hidden", !visible);
  chatDropOverlay.setAttribute("aria-hidden", visible ? "false" : "true");
}

function resetChatDropOverlayState() {
  chatDragDepth = 0;
  setChatDropOverlayVisible(false);
}

function getAttachmentKindForFile(file) {
  if (!file) return null;
  const mimeType = normalizeAttachmentMimeType(file.type);
  const fileName = String(file.name || "");
  if (isPhotoFileType(mimeType, fileName)) return "photo";
  if (isDocumentFileType(mimeType, fileName)) return "attachment";
  return null;
}

function handleChatAreaFileDrop(fileList) {
  if (!activeChatId) {
    clearMessagesState("Сначала выберите чат, а потом добавьте файл.", "error");
    return;
  }

  if (!fileList || !fileList.length) return;
  const files = Array.from(fileList);
  if (files.length > 1) {
    showTransientMessagesInfo("Сейчас можно добавить только один файл. Взял первый из списка.");
  }

  if (composerAttachmentDraft?.file) {
    showTransientMessagesInfo("Предыдущее вложение заменено новым.");
  }

  const file = files[0];
  const kind = getAttachmentKindForFile(file);
  if (!kind) {
    clearMessagesState("Неподдерживаемый тип файла. Выберите фото или документ.", "error");
    return;
  }

  onComposerFileSelected(file, kind);
}

function clearComposerAttachmentDraft({ clearInputs = true } = {}) {
  if (composerAttachmentDraft?.previewUrl) {
    URL.revokeObjectURL(composerAttachmentDraft.previewUrl);
  }
  composerAttachmentDraft = null;
  if (clearInputs) {
    if (composerPhotoInput) composerPhotoInput.value = "";
    if (composerDocInput) composerDocInput.value = "";
  }
  renderComposerAttachmentPreview();
}

function renderComposerAttachmentPreview() {
  if (!composerAttachmentPreview) return;
  const shouldPreserveBottom = isMessagesNearBottom(140);

  const draft = composerAttachmentDraft;
  if (!draft) {
    composerAttachmentPreview.classList.add("hidden");
    composerAttachmentPreview.innerHTML = "";
    scheduleChatChromeSync({ preserveBottom: shouldPreserveBottom });
    return;
  }

  composerAttachmentPreview.classList.remove("hidden");
  composerAttachmentPreview.innerHTML = "";

  const card = document.createElement("div");
  card.className = `composer-attachment-card ${draft.kind === "photo" ? "is-photo" : "is-document"}`;

  if (draft.kind === "photo") {
    const thumb = document.createElement("img");
    thumb.className = "composer-attachment-thumb";
    thumb.src = draft.previewUrl || draft.url || "";
    thumb.alt = draft.fileName || "Фото";
    card.appendChild(thumb);
  } else {
    const icon = document.createElement("span");
    icon.className = "composer-attachment-file-icon";
    icon.textContent = "📄";
    card.appendChild(icon);
  }

  const meta = document.createElement("div");
  meta.className = "composer-attachment-meta";

  const title = document.createElement("p");
  title.className = "composer-attachment-name";
  title.textContent = draft.fileName || "Файл";
  meta.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "composer-attachment-sub";
  const typeLabel = draft.kind === "photo" ? "Фото" : "Документ";
  subtitle.textContent = `${typeLabel} • ${formatFileSize(draft.fileSize)}`;
  meta.appendChild(subtitle);

  card.appendChild(meta);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "composer-attachment-remove";
  removeButton.title = "Убрать вложение";
  removeButton.textContent = "✕";
  removeButton.addEventListener("click", () => {
    clearComposerAttachmentDraft();
    composerInput?.focus();
  });
  card.appendChild(removeButton);

  composerAttachmentPreview.appendChild(card);
  scheduleChatChromeSync({ preserveBottom: shouldPreserveBottom });
}

function onComposerFileSelected(file, preferredKind) {
  if (!file) return;

  const mimeType = normalizeAttachmentMimeType(file.type);
  const fileName = String(file.name || "").trim() || "file";
  const isPhoto = isPhotoFileType(mimeType, fileName);
  const isDocument = isDocumentFileType(mimeType, fileName);

  if (Number(file.size || 0) > MAX_ATTACHMENT_BYTES) {
    clearMessagesState("Файл слишком большой. Выберите файл до 12 МБ.", "error");
    return;
  }

  if (preferredKind === "photo" && !isPhoto) {
    clearMessagesState("Поддерживаются только изображения JPEG, PNG, WEBP или GIF.", "error");
    return;
  }

  if (preferredKind === "attachment" && !isDocument) {
    clearMessagesState("Поддерживаются документы PDF, TXT, DOC, DOCX, XLS, XLSX.", "error");
    return;
  }

  if (!isPhoto && !isDocument) {
    clearMessagesState("Неподдерживаемый тип файла. Выберите фото или документ.", "error");
    return;
  }

  clearComposerAttachmentDraft({ clearInputs: false });
  composerAttachmentDraft = {
    file,
    kind: preferredKind === "photo" ? "photo" : "attachment",
    fileName,
    mimeType,
    fileSize: Number(file.size || 0),
    previewUrl: preferredKind === "photo" ? URL.createObjectURL(file) : null,
  };
  renderComposerAttachmentPreview();
}

function triggerComposerFilePicker(kind) {
  closeComposerAttachMenu();
  if (kind === "photo") {
    composerPhotoInput?.click();
    return;
  }
  composerDocInput?.click();
}

function syncComposerState() {
  const shouldPreserveBottom = isMessagesNearBottom(140);
  const enabled = Boolean(activeChatId);
  const interactive = enabled && !sendingMessage;
  if (composer) {
    composer.classList.toggle("hidden", !enabled);
  }
  composerInput.disabled = !interactive;
  if (composerAttachBtn) {
    composerAttachBtn.disabled = !interactive;
  }
  if (composerEmojiBtn) {
    composerEmojiBtn.disabled = !interactive;
  }
  if (composerSubmitBtn) {
    composerSubmitBtn.disabled = !interactive;
  }
  if (!interactive) {
    closeComposerEmojiPicker();
    closeComposerAttachMenu();
    resetChatDropOverlayState();
  }
  if (!enabled) {
    composerInput.value = "";
    setReplyTarget(null);
    clearComposerAttachmentDraft();
  }
  scheduleChatChromeSync({ preserveBottom: shouldPreserveBottom });
}

async function api(path, { method = "GET", body = null, auth = false, formData = null } = {}) {
  const headers = {};

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const hasFormData = formData instanceof FormData;
  if (!hasFormData) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      ...(hasFormData ? { body: formData } : (body ? { body: JSON.stringify(body) } : {})),
    });
  } catch {
    throw new Error("Не удалось подключиться к серверу");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Ошибка запроса: ${response.status}`);
  }
  return data;
}

function renderChatHeader() {
  const chat = getActiveChat();

  if (!chat) {
    chatPanelRoot?.classList.add("is-chat-empty");
    chatTitle.textContent = "";
    chatMeta.textContent = "";
    if (chatHeaderAvatar) {
      chatHeaderAvatar.classList.add("hidden");
      chatHeaderAvatar.removeAttribute("src");
      chatHeaderAvatar.alt = "";
    }
    if (chatHeaderMain) {
      chatHeaderMain.classList.remove("is-clickable");
      chatHeaderMain.removeAttribute("role");
      chatHeaderMain.removeAttribute("tabindex");
      chatHeaderMain.removeAttribute("aria-label");
    }
    chatMeta.classList.remove("interactive");
    chatMeta.removeAttribute("role");
    chatMeta.removeAttribute("tabindex");
    chatSearchForm.classList.add("hidden");
    clearChatSearch({ clearInput: true });

    [chatPinBtn, chatMuteBtn, chatArchiveBtn, groupInfoBtn].forEach((btn) => {
      btn.disabled = true;
    });
    [chatPinBtn, chatMuteBtn, chatArchiveBtn].forEach((btn) => {
      btn.classList.add("hidden");
    });

    groupInfoBtn.classList.add("hidden");
    if (contactPanel && !contactPanel.classList.contains("hidden")) {
      closeContactPanel();
    }
    syncResponsiveLayoutState();
    return;
  }

  chatPanelRoot?.classList.remove("is-chat-empty");
  chatTitle.textContent = chat.title;
  if (chat.type === "direct") {
    const peerDisplay = chat.peer?.displayName || chat.peer?.username || chat.title;
    const peerUsername = chat.peer?.username ? `@${chat.peer.username}` : "личный чат";
    const peerStatus = getDirectContactStatus(chat);
    chatMeta.textContent = `${peerUsername} | ${peerStatus}`;
    if (chatHeaderAvatar) {
      chatHeaderAvatar.classList.remove("hidden");
      chatHeaderAvatar.src = chat.peer?.avatar || buildAvatarPlaceholder(peerDisplay || "U");
      chatHeaderAvatar.alt = peerDisplay;
    }
    if (chatHeaderMain) {
      chatHeaderMain.classList.add("is-clickable");
      chatHeaderMain.setAttribute("role", "button");
      chatHeaderMain.setAttribute("tabindex", "0");
      chatHeaderMain.setAttribute("aria-label", `Открыть профиль ${peerDisplay}`);
    }
    chatMeta.classList.remove("interactive");
    chatMeta.removeAttribute("role");
    chatMeta.removeAttribute("tabindex");
  } else {
    chatMeta.textContent = `${chat.memberCount || 0} участников | роль: ${roleLabel(chat.myRole)}`;
    if (chatHeaderAvatar) {
      chatHeaderAvatar.classList.remove("hidden");
      chatHeaderAvatar.src = chat.avatar || buildAvatarPlaceholder(chat.title || "GR");
      chatHeaderAvatar.alt = chat.title || "Группа";
    }
    if (chatHeaderMain) {
      chatHeaderMain.classList.remove("is-clickable");
      chatHeaderMain.removeAttribute("role");
      chatHeaderMain.removeAttribute("tabindex");
      chatHeaderMain.removeAttribute("aria-label");
    }
    chatMeta.classList.add("interactive");
    chatMeta.setAttribute("role", "button");
    chatMeta.setAttribute("tabindex", "0");
  }

  chatSearchForm.classList.remove("hidden");
  [chatPinBtn, chatMuteBtn, chatArchiveBtn].forEach((btn) => {
    btn.classList.remove("hidden");
  });

  chatPinBtn.disabled = false;
  chatMuteBtn.disabled = false;
  chatArchiveBtn.disabled = false;
  chatPinBtn.textContent = chat.pinned ? "\uD83D\uDCCD" : "\uD83D\uDCCC";
  chatPinBtn.title = chat.pinned ? "Открепить чат" : "Закрепить чат";
  chatMuteBtn.textContent = chat.muted ? "\uD83D\uDD14" : "\uD83D\uDD15";
  chatMuteBtn.title = chat.muted ? "Включить звук" : "Выключить звук";
  chatArchiveBtn.textContent = chat.archived ? "\uD83D\uDCC2" : "\uD83D\uDDD2";
  chatArchiveBtn.title = chat.archived ? "Вернуть из архива" : "Отправить в архив";

  const group = chat.type === "group";
  groupInfoBtn.classList.toggle("hidden", !group);
  groupInfoBtn.disabled = !group;

  if (!group && !groupPanel.classList.contains("hidden")) {
    closeGroupPanel();
  } else if (group && !groupPanel.classList.contains("hidden") && Number(groupPanelChatId) === Number(chat.id)) {
    refreshGroupPanel();
  }

  if (!group && contactPanel && !contactPanel.classList.contains("hidden")) {
    renderContactPanel();
  }
  if (group && contactPanel && !contactPanel.classList.contains("hidden")) {
    closeContactPanel();
  }
  syncResponsiveLayoutState();
}

function buildChatLastPreview(chat) {
  const last = chat?.lastMessage;
  if (!last) {
    return {
      text: "Пока нет сообщений",
      kind: "empty",
    };
  }

  const serverKind = String(last.kind || "").trim().toLowerCase();
  let previewKind = serverKind || "text";
  let previewText = String(last.preview || "").trim();

  if (!previewText) {
    if (last.deletedAt) {
      previewKind = "deleted";
      previewText = "Сообщение удалено";
    } else {
      const legacyForward = parseLegacyForwardFallbackText(last.text);
      if (legacyForward) {
        previewKind = "forwarded";
        previewText = `Переслано: ${legacyForward.text}`;
      } else {
        previewText = String(last.text || "").trim();
      }
    }
  }

  if (!previewText) {
    previewText = "Сообщение";
  }

  if (previewKind !== "system" && previewKind !== "deleted") {
    if (last.mine) {
      previewText = `Вы: ${previewText}`;
    } else if (chat?.type === "group") {
      const senderRaw = String(last.senderName || "").trim();
      if (senderRaw) {
        previewText = `${senderRaw}: ${previewText}`;
      }
    }
  }

  return {
    kind: previewKind,
    text: truncate(previewText, 78),
  };
}

function buildChatCardFlags(chat) {
  const flags = [];
  flags.push(chat.type === "group" ? "Группа" : "ЛС");
  if (chat.pinned) flags.push("Закреплен");
  if (chat.muted) flags.push("Без звука");
  if (chat.archived) flags.push("Архив");
  return flags;
}

function buildChatListStatusMeta(chat) {
  const last = chat?.lastMessage;
  if (!last) return null;
  if (!last.mine) return null;
  if (last.deletedAt || String(last.kind || "") === "system") return null;

  const status = String(last.status || "sent");
  const count = messageStatusCheckCount(status);
  if (!count) return null;
  return {
    status,
    count,
  };
}

function createChatListItem(chat) {
  const item = document.createElement("button");
  item.type = "button";

  const preview = buildChatLastPreview(chat);
  const time = chat.lastMessage ? timeLabel(chat.lastMessage.createdAt) : "";
  const statusMeta = buildChatListStatusMeta(chat);
  const avatar = chat.avatar || buildAvatarPlaceholder(chat.title || chat.peer?.username || "CH");
  const hasUnread = Number(chat.unreadCount || 0) > 0;
  const previewKindClass = String(preview.kind || "text").replace(/[^a-z0-9_-]/gi, "") || "text";
  const unreadBadge = hasUnread
    ? `<span class="unread-pill${chat.muted ? " muted" : ""}">${chat.unreadCount}</span>`
    : "";
  const previewStatusHtml = statusMeta
    ? renderStatusChecksHtml(statusMeta.status, "chat-item-preview-status")
    : "";
  const flags = buildChatCardFlags(chat)
    .map((flag) => `<span class="chat-flag">${escapeHtml(flag)}</span>`)
    .join("");

  item.className = `chat-item${chat.id === activeChatId ? " active" : ""}${hasUnread ? " unread" : ""}${chat.pinned ? " pinned" : ""}${
    chat.muted ? " muted" : ""
  }${showArchived || chat.archived ? " archived" : ""}`;

  item.innerHTML = `
    <img class="chat-item-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(chat.title)}" />
    <div class="chat-item-main">
      <div class="chat-item-topline">
        <span class="chat-item-title-wrap">
          <span class="chat-item-title">${escapeHtml(chat.title)}</span>
          ${chat.pinned ? '<span class="chat-item-icon-pin" title="Закреплен">📌</span>' : ""}
          ${chat.muted ? '<span class="chat-item-icon-mute" title="Без звука">🔕</span>' : ""}
        </span>
        <span class="chat-item-time-wrap"><span class="chat-item-time">${escapeHtml(time)}</span></span>
      </div>
      <div class="chat-item-bottomline">
        <span class="chat-item-preview-wrap">${previewStatusHtml}<span class="chat-item-preview preview-${previewKindClass}">${escapeHtml(preview.text)}</span></span>
        ${unreadBadge}
      </div>
      <div class="chat-item-flags">${flags}</div>
    </div>
  `;

  item.addEventListener("click", () => {
    openChat(chat.id);
  });

  return item;
}

function appendChatSectionDivider(text) {
  const divider = document.createElement("div");
  divider.className = "chat-list-divider";
  divider.textContent = text;
  chatList.appendChild(divider);
}

function renderChatList() {
  chatList.innerHTML = "";

  if (!chats.length) {
    chatListState.textContent = showArchived ? "Нет чатов в архиве" : "Чатов пока нет";
    return;
  }

  chatListState.textContent = "";
  const ordered = [...chats].sort(sortChatsByRecent);
  const pinned = ordered.filter((chat) => chat.pinned);
  const regular = ordered.filter((chat) => !chat.pinned);

  if (pinned.length) {
    appendChatSectionDivider(showArchived ? "Закрепленные в архиве" : "Закрепленные");
    pinned.forEach((chat) => {
      chatList.appendChild(createChatListItem(chat));
    });
  }

  if (regular.length) {
    if (pinned.length) {
      appendChatSectionDivider(showArchived ? "Остальные в архиве" : "Остальные");
    }
    regular.forEach((chat) => {
      chatList.appendChild(createChatListItem(chat));
    });
  }
}

function jumpToMessage(messageId) {
  const target = document.getElementById(`msg-${messageId}`);
  if (!target) return false;

  clearMessageJumpHighlights();
  target.classList.add("jump");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => target.classList.remove("jump"), 1200);
  return true;
}

function normalizeMessages(items) {
  if (!Array.isArray(items) || !items.length) return [];

  const order = [];
  const byKey = new Map();

  items.forEach((message, index) => {
    if (!message) return;
    const rawId = Number(message.id);
    const key = Number.isInteger(rawId) && rawId > 0 ? `id:${rawId}` : `idx:${index}`;

    if (!byKey.has(key)) {
      order.push(key);
    }
    byKey.set(key, message);
  });

  return order.map((key) => byKey.get(key)).filter(Boolean);
}

function getMessageTimestamp(iso) {
  if (!iso) return NaN;
  const ts = new Date(iso).getTime();
  return Number.isFinite(ts) ? ts : NaN;
}

function shouldContinueMessageSeries(prev, next) {
  if (!prev || !next || prev.isSystem || next.isSystem) return false;
  if (Number(prev.sender?.id) !== Number(next.sender?.id)) return false;
  if (Boolean(prev.mine) !== Boolean(next.mine)) return false;
  if (messageDayKey(prev.createdAt) !== messageDayKey(next.createdAt)) return false;

  const prevTs = getMessageTimestamp(prev.createdAt);
  const nextTs = getMessageTimestamp(next.createdAt);
  if (Number.isFinite(prevTs) && Number.isFinite(nextTs) && Math.abs(nextTs - prevTs) > MESSAGE_SERIES_GAP_MS) {
    return false;
  }
  return true;
}

function groupAuthorColorKey(message) {
  const seed = String(message?.sender?.username || message?.sender?.displayName || message?.sender?.id || "");
  const palette = ["#4d6db4", "#38689f", "#4d6597", "#5e5ea8", "#3e778c", "#6b5f9f", "#7a5d92"];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

function renderMessages(items) {
  const shouldStickToBottom = messagesRoot.scrollHeight - messagesRoot.scrollTop - messagesRoot.clientHeight < 120;
  clearMessageLongPressState();
  const normalized = normalizeMessages(items);
  activeMessages = normalized;
  messagesRoot.classList.remove("hidden");
  messagesRoot.innerHTML = "";
  const activeChat = getActiveChat();
  const isGroupChat = activeChat?.type === "group";
  if (activeChat?.type) {
    messagesRoot.dataset.chatType = activeChat.type;
  } else {
    delete messagesRoot.dataset.chatType;
  }

  if (!normalized.length) {
    clearMessagesState("Пока здесь пусто. Напишите первое сообщение.", "empty");
    return;
  }

  clearMessagesState("");

  let prevRenderedDay = "";
  normalized.forEach((message, index) => {
    const currentDay = messageDayKey(message.createdAt);
    if (currentDay && currentDay !== prevRenderedDay) {
      const dayRow = document.createElement("div");
      dayRow.className = "msg-day-row";
      dayRow.innerHTML = `<span class="msg-day-separator">${escapeHtml(dateSeparatorLabel(message.createdAt))}</span>`;
      messagesRoot.appendChild(dayRow);
      prevRenderedDay = currentDay;
    }

    if (message.isSystem) {
      const systemRow = document.createElement("div");
      systemRow.className = "msg-row system-row";
      const systemNode = document.createElement("article");
      systemNode.className = "msg system";
      systemNode.id = `msg-${message.id}`;
      systemNode.innerHTML = `
        <div class="system-text">${escapeHtml(message.text)}</div>
        <div class="system-meta">${escapeHtml(messageTimeLabel(message.createdAt))}</div>
      `;
      systemRow.appendChild(systemNode);
      messagesRoot.appendChild(systemRow);
      return;
    }

    const prev = normalized[index - 1];
    const next = normalized[index + 1];
    const continuedFromSameSender = shouldContinueMessageSeries(prev, message);
    const continuesToNext = shouldContinueMessageSeries(message, next);
    const showSeriesAvatarAtEnd = !continuesToNext;
    const showSenderName = isGroupChat && !message.mine && !continuedFromSameSender;

    let seriesShape = "single";
    if (!continuedFromSameSender && continuesToNext) seriesShape = "first";
    if (continuedFromSameSender && continuesToNext) seriesShape = "middle";
    if (continuedFromSameSender && !continuesToNext) seriesShape = "last";

    const row = document.createElement("div");
    row.className = `msg-row ${message.mine ? "mine" : "other"} series-${seriesShape}${showSeriesAvatarAtEnd ? " has-avatar" : ""}`;

    if (showSeriesAvatarAtEnd) {
      const avatar = document.createElement("img");
      avatar.className = `msg-avatar${message.mine ? " mine" : ""}`;
      avatar.src = message.sender.avatar || buildAvatarPlaceholder(message.sender.username || message.sender.displayName);
      avatar.alt = message.sender.displayName || message.sender.username || "user";
      row.appendChild(avatar);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "msg-avatar-spacer";
      row.appendChild(spacer);
    }

    const node = document.createElement("article");
    const mineClass = message.mine ? "mine" : "other";
    const deletedClass = message.deletedAt ? " deleted" : "";
    node.className = `msg ${mineClass}${deletedClass} shape-${seriesShape}`;
    node.id = `msg-${message.id}`;

    if (showSenderName) {
      const author = document.createElement("div");
      author.className = "author";
      author.style.color = groupAuthorColorKey(message);
      const authorName = message.sender.displayName || message.sender.username || "Пользователь";
      const authorUsername = String(message.sender.username || "").trim();
      const nameNode = document.createElement("span");
      nameNode.className = "author-name";
      nameNode.textContent = authorName;
      author.appendChild(nameNode);

      if (authorUsername && authorUsername.toLowerCase() !== String(authorName || "").trim().toLowerCase()) {
        const usernameNode = document.createElement("span");
        usernameNode.className = "author-username";
        usernameNode.textContent = `@${authorUsername}`;
        author.appendChild(usernameNode);
      }
      node.appendChild(author);
    }

    if (message.replyTo) {
      const replyNode = document.createElement("button");
      replyNode.type = "button";
      replyNode.className = "reply-preview";
      const replyText = truncate(message.replyTo.text || "", 96);
      replyNode.innerHTML = `<div class="from">${message.replyTo.senderName}</div><div>${replyText}</div>`;
      replyNode.addEventListener("click", () => {
        if (message.replyTo?.id) jumpToMessage(message.replyTo.id);
      });
      node.appendChild(replyNode);
    }

    const legacyForward = !message.forwardedFrom && !message.deletedAt
      ? parseLegacyForwardFallbackText(message.text)
      : null;
    const forwardedFrom = message.forwardedFrom || legacyForward;

    if (forwardedFrom && !message.deletedAt) {
      const forwarded = document.createElement("div");
      forwarded.className = "forwarded-head";
      const sourceLabel = resolveForwardSenderLabel(forwardedFrom);
      forwarded.textContent = `Переслано от ${sourceLabel}`;
      node.appendChild(forwarded);
    }

    const attachmentNode = buildAttachmentNode(message);
    if (attachmentNode) {
      node.appendChild(attachmentNode);
    }

    const displayText = legacyForward ? legacyForward.text : message.text;
    const hasText = String(displayText || "").trim().length > 0;

    const footer = document.createElement("div");
    footer.className = "msg-footer";
    const editedPart = message.editedAt ? "изм. " : "";
    footer.innerHTML = `<span class="msg-time">${escapeHtml(`${editedPart}${messageTimeLabel(message.createdAt)}`)}</span>`;

    if (message.mine) {
      const checks = createStatusChecksNode(message.status, "msg-checks");
      if (checks) {
        footer.appendChild(checks);
      }
    }

    if (hasText || !attachmentNode) {
      const text = document.createElement("div");
      text.className = "text";
      text.textContent = displayText;
      if (!message.deletedAt && isEmojiOnlyText(displayText)) {
        text.classList.add("emoji-only");
      }

      const contentLine = document.createElement("div");
      contentLine.className = "msg-content-line";
      contentLine.appendChild(text);
      contentLine.appendChild(footer);
      node.appendChild(contentLine);
    } else {
      footer.classList.add("attachment-only");
      node.appendChild(footer);
    }

    if (message.reactions && message.reactions.length) {
      const reactionsWrap = document.createElement("div");
      reactionsWrap.className = "reactions";

      message.reactions.forEach((reaction) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `reaction-chip${reaction.reactedByMe ? " mine" : ""}`;
        chip.textContent = `${reaction.emoji} ${reaction.count}`;
        chip.addEventListener("click", async () => {
          await toggleReactionForMessage(message.id, message.conversationId, reaction.emoji);
        });
        reactionsWrap.appendChild(chip);
      });

      node.appendChild(reactionsWrap);
    }

    if (!message.deletedAt) {
      const actions = document.createElement("div");
      actions.className = "actions compact";

      const replyBtn = document.createElement("button");
      replyBtn.type = "button";
      replyBtn.className = "msg-action-btn";
      replyBtn.textContent = "Ответить";
      replyBtn.addEventListener("click", () => {
        activateReplyTarget(message, { sourceNode: node });
      });
      actions.appendChild(replyBtn);

      const reactWrap = document.createElement("div");
      reactWrap.className = "msg-action-wrap";
      const reactToggle = document.createElement("button");
      reactToggle.type = "button";
      reactToggle.className = "msg-action-btn msg-react-btn";
      reactToggle.textContent = "\uD83D\uDE0A";
      reactToggle.title = "Реакция";

      const reactPopover = document.createElement("div");
      reactPopover.className = "msg-popover reaction-popover hidden";
      REACTIONS.forEach((emoji) => {
        const reactBtn = document.createElement("button");
        reactBtn.type = "button";
        reactBtn.className = "emoji-btn";
        reactBtn.textContent = emoji;
        reactBtn.addEventListener("click", async (event) => {
          event.stopPropagation();
          closeMessagePopovers();
          await toggleReactionForMessage(message.id, message.conversationId, emoji);
        });
        reactPopover.appendChild(reactBtn);
      });

      const reactMoreBtn = document.createElement("button");
      reactMoreBtn.type = "button";
      reactMoreBtn.className = "emoji-btn emoji-open-btn";
      reactMoreBtn.textContent = "⋯";
      reactMoreBtn.title = "Выбрать другую реакцию";
      reactMoreBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        await openReactionEmojiPicker({
          messageId: message.id,
          conversationId: message.conversationId,
          trigger: reactToggle,
        });
      });
      reactPopover.appendChild(reactMoreBtn);

      reactToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const opening = reactPopover.classList.contains("hidden");
        closeMessagePopovers();
        if (opening) {
          reactPopover.classList.remove("hidden");
          reactToggle.classList.add("active");
          setMessagePopoverHost(reactToggle.closest(".msg"));
          requestAnimationFrame(() => positionMessagePopover(reactPopover));
        }
      });

      reactWrap.appendChild(reactToggle);
      reactWrap.appendChild(reactPopover);
      actions.appendChild(reactWrap);

      const moreWrap = document.createElement("div");
      moreWrap.className = "msg-action-wrap";
      const moreToggle = document.createElement("button");
      moreToggle.type = "button";
      moreToggle.className = "msg-action-btn msg-overflow-btn";
      moreToggle.textContent = "\u22EF";
      moreToggle.title = "Другие действия";

      const morePopover = document.createElement("div");
      morePopover.className = "msg-popover overflow-popover hidden";

      const forwardBtn = document.createElement("button");
      forwardBtn.type = "button";
      forwardBtn.textContent = "Переслать";
      forwardBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openMessageForwardModal(message);
      });
      morePopover.appendChild(forwardBtn);

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.textContent = "Копировать";
      copyBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(message.text || "");
          copyBtn.textContent = "Скопировано";
          setTimeout(() => {
            copyBtn.textContent = "Копировать";
          }, 900);
        } catch {
          copyBtn.textContent = "Не удалось";
          setTimeout(() => {
            copyBtn.textContent = "Копировать";
          }, 900);
        }
      });
      morePopover.appendChild(copyBtn);

      if (message.canEdit) {
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "Изменить";
        editBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          openMessageEditModal(message);
        });
        morePopover.appendChild(editBtn);
      }

      if (message.canDelete) {
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "danger-item";
        deleteBtn.textContent = "Удалить";
        deleteBtn.addEventListener("click", async (event) => {
          event.stopPropagation();
          closeMessagePopovers();
          const approved = await askConfirm("Удалить это сообщение у всех участников?");
          if (!approved) return;
          try {
            await api(`/api/messages/${message.id}`, {
              method: "DELETE",
              auth: true,
            });
            if (replyTarget && replyTarget.id === message.id) {
              setReplyTarget(null);
            }
            scheduleMessagesRefresh(message.conversationId);
            scheduleChatsRefresh();
          } catch (error) {
            clearMessagesState(error.message, "error");
          }
        });
        morePopover.appendChild(deleteBtn);
      }

      moreToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        openMessageOverflowPopover({ popover: morePopover, toggle: moreToggle });
      });

      moreWrap.appendChild(moreToggle);
      moreWrap.appendChild(morePopover);
      actions.appendChild(moreWrap);

      node.addEventListener("pointerdown", (event) => {
        startMessageLongPress(event, {
          messageNode: node,
          onLongPress: () => {
            openMessageOverflowPopover({ popover: morePopover, toggle: moreToggle, fromLongPress: true });
          },
        });
      });

      node.appendChild(actions);
    }

    node.addEventListener("dblclick", (event) => {
      if (event.button !== 0) return;
      if (shouldIgnoreMessageDoubleClick(event, node)) return;
      activateReplyTarget(message, { sourceNode: node });
    });

    row.appendChild(node);
    messagesRoot.appendChild(row);
  });

  if (pendingJumpMessageId) {
    jumpToMessage(pendingJumpMessageId);
    pendingJumpMessageId = null;
    return;
  }

  if (shouldStickToBottom) {
    messagesRoot.scrollTop = messagesRoot.scrollHeight;
  }
}

function searchResultTypeLabel(message) {
  if (!message) return "";
  if (message.isSystem) return "Системное";
  if (message.deletedAt) return "Удалено";
  if (message.attachment?.kind === "photo") return "Фото";
  if (message.attachment?.kind === "attachment") return "Файл";
  if (message.forwardedFrom) return "Переслано";
  if (message.replyTo) return "Ответ";
  return "";
}

async function openChatSearchResult(entry) {
  const messageId = Number(entry?.message?.id);
  if (!activeChatId || !Number.isInteger(messageId) || messageId <= 0) return;

  setChatSearchState("Переходим к сообщению...", "loading");

  try {
    await loadMessages(activeChatId, true, false, {
      aroundMessageId: messageId,
      window: 60,
    });

    let jumped = jumpToMessage(messageId);
    if (!jumped) {
      await loadMessages(activeChatId, true, false, {
        aroundMessageId: messageId,
        window: 120,
      });
      jumped = jumpToMessage(messageId);
    }

    if (!jumped) {
      throw new Error("Не удалось перейти к найденному сообщению.");
    }

    renderChatSearchResults(chatSearchItems, chatSearchQuery, {
      total: chatSearchTotal,
      hasMore: chatSearchHasMore,
    });
  } catch (error) {
    setChatSearchState(error.message || "Не удалось открыть найденное сообщение", "error");
  }
}

function renderChatSearchResults(results, query, options = {}) {
  if (!chatSearchResults) return;
  chatSearchResults.innerHTML = "";

  const items = Array.isArray(results) ? results : [];
  if (!items.length) {
    setChatSearchState("Совпадений не найдено", "empty");
    return;
  }

  const totalRaw = Number(options?.total);
  const total = Number.isInteger(totalRaw) && totalRaw >= 0 ? totalRaw : items.length;
  const hasMore = Boolean(options?.hasMore) && items.length < total;

  chatSearchResults.classList.remove("hidden");
  const summary = document.createElement("div");
  summary.className = "chat-search-summary";
  summary.textContent = total > items.length
    ? `Найдено: ${total}. Показано ${items.length}`
    : `Найдено: ${items.length}`;
  chatSearchResults.appendChild(summary);

  items.forEach((entry) => {
    const message = entry.message || {};
    const author = message.sender?.displayName || message.sender?.username || "Пользователь";
    const typeLabel = searchResultTypeLabel(message);
    const snippet = String(entry.snippet || message.text || "").trim() || "Сообщение";
    const replyContext = message.replyTo?.text
      ? `↪ ${message.replyTo.senderName}: ${message.replyTo.text}`
      : "";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-item chat-search-item";
    button.innerHTML = `
      <div class="chat-search-item-topline">
        <span class="title">${escapeHtml(author)} | ${escapeHtml(timeLabel(message.createdAt))}</span>
        ${typeLabel ? `<span class="chat-search-kind">${escapeHtml(typeLabel)}</span>` : ""}
      </div>
      <div class="snippet">${highlightSearchText(snippet, query)}</div>
      ${replyContext ? `<div class="chat-search-context">${highlightSearchText(replyContext, query)}</div>` : ""}
    `;
    button.addEventListener("click", async () => {
      await openChatSearchResult(entry);
    });
    chatSearchResults.appendChild(button);
  });

  if (hasMore) {
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.type = "button";
    loadMoreBtn.className = "btn-ghost chat-search-more-btn";
    loadMoreBtn.textContent = "Показать еще";
    loadMoreBtn.addEventListener("click", async () => {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = "Загрузка...";
      await runChatSearch(chatSearchQuery, {
        offset: chatSearchItems.length,
        append: true,
      });
    });
    chatSearchResults.appendChild(loadMoreBtn);
  }
}

async function runChatSearch(query, { offset = 0, append = false } = {}) {
  if (!activeChatId) return;

  const q = String(query || "").trim();
  if (!q.length) {
    clearChatSearch();
    return;
  }

  const safeOffset = Number.isInteger(Number(offset)) ? Math.max(0, Number(offset)) : 0;
  const seq = ++chatSearchRequestSeq;
  chatSearchQuery = q;

  if (!append) {
    chatSearchItems = [];
    chatSearchOffset = 0;
    chatSearchTotal = 0;
    chatSearchHasMore = false;
    setChatSearchState("Поиск в чате...", "loading");
  }

  try {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("limit", String(CHAT_SEARCH_PAGE_LIMIT));
    params.set("offset", String(safeOffset));
    const result = await api(`/api/chats/${activeChatId}/search?${params.toString()}`, { auth: true });
    if (seq !== chatSearchRequestSeq) return;

    const fetchedItems = Array.isArray(result.results) ? result.results : [];
    const totalRaw = Number(result.total);
    const total = Number.isInteger(totalRaw) && totalRaw >= 0 ? totalRaw : fetchedItems.length;

    if (append) {
      const knownIds = new Set(
        chatSearchItems
          .map((entry) => Number(entry?.message?.id))
          .filter((id) => Number.isInteger(id) && id > 0)
      );
      fetchedItems.forEach((entry) => {
        const id = Number(entry?.message?.id);
        if (Number.isInteger(id) && id > 0) {
          if (knownIds.has(id)) return;
          knownIds.add(id);
        }
        chatSearchItems.push(entry);
      });
    } else {
      chatSearchItems = fetchedItems;
    }

    chatSearchTotal = total;
    chatSearchOffset = chatSearchItems.length;
    chatSearchHasMore = Boolean(result.hasMore) || chatSearchOffset < chatSearchTotal;
    renderChatSearchResults(chatSearchItems, q, {
      total: chatSearchTotal,
      hasMore: chatSearchHasMore,
    });
  } catch (error) {
    if (seq !== chatSearchRequestSeq) return;
    setChatSearchState(error.message || "Ошибка поиска", "error");
  }
}

async function renderGlobalSearchResults(results) {
  if (!globalSearchResults || !globalSearchState) return;
  globalSearchResults.innerHTML = "";
  if (!results || !results.length) {
    globalSearchState.textContent = "Ничего не найдено";
    return;
  }

  globalSearchState.textContent = `Найдено: ${results.length}`;

  results.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-item";
    button.innerHTML = `
      <div class="title">${entry.chat.title} | ${entry.message.sender.displayName}</div>
      <div class="snippet">${entry.snippet || entry.message.text}</div>
    `;

    button.addEventListener("click", async () => {
      pendingJumpMessageId = entry.message.id;

      let found = chats.find((chat) => chat.id === entry.chat.id);
      if (!found) {
        showArchived = false;
        setArchiveToggleLabel();
        await loadChats(true);
        found = chats.find((chat) => chat.id === entry.chat.id);
      }

      if (!found) {
        showArchived = true;
        setArchiveToggleLabel();
        await loadChats(true);
        found = chats.find((chat) => chat.id === entry.chat.id);
      }

      if (!found) {
        clearMessagesState("Чат из результатов поиска недоступен.", "error");
        return;
      }

      await openChat(found.id);
    });

    globalSearchResults.appendChild(button);
  });
}

function scheduleChatsRefresh() {
  if (chatsRefreshTimer) return;
  chatsRefreshTimer = setTimeout(() => {
    chatsRefreshTimer = null;
    loadChats(true);
  }, 120);
}

function scheduleMessagesRefresh(conversationId) {
  if (!activeChatId || Number(activeChatId) !== Number(conversationId)) return;
  if (messagesRefreshTimer) return;
  messagesRefreshTimer = setTimeout(() => {
    messagesRefreshTimer = null;
    loadMessages(activeChatId, true, false);
  }, 120);
}

function upsertActiveMessage(message) {
  if (!message || !activeChatId) return false;
  if (Number(message.conversationId) !== Number(activeChatId)) return false;

  const next = [...activeMessages];
  const index = next.findIndex((item) => Number(item.id) === Number(message.id));
  if (index >= 0) {
    next[index] = message;
  } else {
    next.push(message);
  }

  next.sort((a, b) => Number(a.id) - Number(b.id));
  renderMessages(next);
  return true;
}

function scheduleReadAck(conversationId) {
  if (!activeChatId || Number(activeChatId) !== Number(conversationId)) return;
  if (document.hidden) return;

  pendingReadAckChatId = Number(conversationId);
  if (readAckTimer) return;

  readAckTimer = setTimeout(async () => {
    const targetChatId = pendingReadAckChatId;
    readAckTimer = null;
    pendingReadAckChatId = null;
    if (!targetChatId) return;
    await markChatRead(targetChatId);
    scheduleChatsRefresh();
  }, READ_ACK_DELAY_MS);
}

async function runFallbackSync() {
  if (fallbackSyncInFlight || !token) return;
  fallbackSyncInFlight = true;
  try {
    await loadChats(true);
    if (activeChatId) {
      await loadMessages(activeChatId, true, false);
    }
  } finally {
    fallbackSyncInFlight = false;
  }
}

function startFallbackSync() {
  if (fallbackSyncTimer || !token) return;
  fallbackSyncTimer = setInterval(() => {
    runFallbackSync();
  }, FALLBACK_SYNC_INTERVAL_MS);
}

function stopFallbackSync() {
  if (!fallbackSyncTimer) return;
  clearInterval(fallbackSyncTimer);
  fallbackSyncTimer = null;
}

async function markChatRead(chatId) {
  if (!chatId) return;
  try {
    await api(`/api/chats/${chatId}/read`, {
      method: "POST",
      auth: true,
    });
  } catch (error) {
    console.warn("markChatRead failed", error);
  }
}

async function loadChats(silent = false) {
  const seq = ++chatsRequestSeq;
  const previousActiveChatId = activeChatId;
  if (!silent) {
    chatListState.textContent = "Загрузка чатов...";
  }

  try {
    const data = await api(`/api/chats?archived=${showArchived ? "true" : "false"}`, { auth: true });
    if (seq !== chatsRequestSeq) return;

    chats = data.chats || [];

    if (activeChatId && !chats.some((chat) => chat.id === activeChatId)) {
      activeChatId = null;
    }

    if (!activeChatId && chats.length && !keepChatDeselected) {
      activeChatId = chats[0].id;
      keepChatDeselected = false;
    }

    syncChatBoundNavigationLayers();

    renderChatList();
    renderChatHeader();
    syncComposerState();

    if (!activeChatId) {
      renderMessages([]);
      showChatSelectionHintState();
      return;
    }

    if (silent && !previousActiveChatId && activeChatId) {
      await loadMessages(activeChatId, true, false);
    }
  } catch (error) {
    if (!silent) {
      chatListState.textContent = error.message;
    } else {
      console.warn("loadChats failed", error);
    }
  }
}

async function loadMessages(chatId, silent = false, markRead = !silent, options = {}) {
  if (!chatId) {
    renderMessages([]);
    showChatSelectionHintState();
    return;
  }

  const seq = ++messagesRequestSeq;

  if (!silent) {
    clearMessagesState("Загрузка сообщений...", "loading");
  }

  try {
    const params = new URLSearchParams();
    params.set("limit", String(Number(options?.limit) > 0 ? Number(options.limit) : 120));
    if (options && Number.isInteger(Number(options.aroundMessageId)) && Number(options.aroundMessageId) > 0) {
      params.set("aroundMessageId", String(Number(options.aroundMessageId)));
      if (Number.isInteger(Number(options.window)) && Number(options.window) > 0) {
        params.set("window", String(Number(options.window)));
      }
    }

    const data = await api(`/api/chats/${chatId}/messages?${params.toString()}`, { auth: true });
    if (seq !== messagesRequestSeq) return;
    if (activeChatId && Number(activeChatId) !== Number(chatId)) return;

    renderMessages(data.messages || []);
    sendWsEvent({ type: "presence:set_active_chat", conversationId: chatId });

    if (markRead) {
      await markChatRead(chatId);
    }
  } catch (error) {
    if (!silent) {
      clearMessagesState(error.message, "error");
    } else {
      console.warn("loadMessages failed", error);
    }
  }
}

async function openChat(chatId) {
  closeSidebarSearch();
  clearComposerAttachmentDraft();
  closeComposerEmojiPicker();
  closeComposerAttachMenu();
  resetChatDropOverlayState();
  activeChatId = chatId;
  keepChatDeselected = false;
  syncChatBoundNavigationLayers();
  renderChatList();
  renderChatHeader();
  syncComposerState();
  clearChatSearch({ clearInput: true });
  await loadMessages(chatId, false, true);
}
function sendWsEvent(payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function scheduleReconnect() {
  if (manualDisconnect || reconnectTimer || !token) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    openRealtime();
  }, 1500);
}

function applyPresenceUpdate(payload) {
  const userId = Number(payload?.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return;
  }

  const isOnline = Boolean(payload?.isOnline ?? payload?.online);
  const hasLastSeen = payload && Object.prototype.hasOwnProperty.call(payload, "lastSeenAt");
  const nextLastSeenAt = hasLastSeen && payload.lastSeenAt ? String(payload.lastSeenAt) : null;

  let changed = false;
  chats = chats.map((chat) => {
    if (!chat || chat.type !== "direct" || Number(chat?.peer?.id) !== userId) {
      return chat;
    }

    const peer = chat.peer || {};
    const mergedLastSeenAt = hasLastSeen
      ? nextLastSeenAt
      : (peer.lastSeenAt || null);
    if (Boolean(peer.online) === isOnline && String(peer.lastSeenAt || "") === String(mergedLastSeenAt || "")) {
      return chat;
    }

    changed = true;
    return {
      ...chat,
      peer: {
        ...peer,
        online: isOnline,
        isOnline,
        lastSeenAt: mergedLastSeenAt,
      },
    };
  });

  if (!changed) {
    return;
  }

  renderChatList();
  renderChatHeader();
  if (contactPanel && !contactPanel.classList.contains("hidden")) {
    renderContactPanel();
  }
}

function handleRealtimeEvent(payload) {
  if (payload.type === "presence:update") {
    applyPresenceUpdate(payload);
    return;
  }

  if (payload.type === "chat:removed") {
    if (activeChatId && Number(payload.conversationId) === Number(activeChatId)) {
      activeChatId = null;
      renderChatHeader();
      renderMessages([]);
      clearMessagesState("Вы больше не состоите в этом чате.", "error");
    }
    scheduleChatsRefresh();
    return;
  }

  if (payload.type === "message:new") {
    scheduleChatsRefresh();
    const sameChat = activeChatId && Number(payload.conversationId) === Number(activeChatId);
    if (sameChat && payload.message && upsertActiveMessage(payload.message)) {
      scheduleReadAck(payload.conversationId);
    } else {
      scheduleMessagesRefresh(payload.conversationId);
    }
    return;
  }

  if (payload.type === "message:updated") {
    scheduleChatsRefresh();
    const sameChat = activeChatId && Number(payload.conversationId) === Number(activeChatId);
    if (!(sameChat && payload.message && upsertActiveMessage(payload.message))) {
      scheduleMessagesRefresh(payload.conversationId);
    }
    return;
  }

  if (payload.type === "message:deleted" || payload.type === "message:reaction") {
    scheduleChatsRefresh();
    scheduleMessagesRefresh(payload.conversationId);
    return;
  }

  if (payload.type === "chat:updated" || payload.type === "group:members_updated" || payload.type === "group:updated") {
    scheduleChatsRefresh();
    if (activeChatId && Number(payload.conversationId) === Number(activeChatId)) {
      scheduleMessagesRefresh(payload.conversationId);
    }
    return;
  }

  if (payload.type === "chat:read") {
    scheduleChatsRefresh();
    if (!me || Number(payload.userId) !== Number(me.id)) {
      scheduleMessagesRefresh(payload.conversationId);
    }
  }
}

function openRealtime() {
  if (!token) {
    return;
  }

  manualDisconnect = false;
  setSocketState("Подключение...");

  const proto = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${proto}://${location.host}/ws?token=${encodeURIComponent(token)}`);

  ws.addEventListener("open", () => {
    setSocketState("В сети");
    stopFallbackSync();
    if (activeChatId) {
      sendWsEvent({ type: "presence:set_active_chat", conversationId: activeChatId });
    }
  });

  ws.addEventListener("message", (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }

    if (payload.type === "ws:error") {
      setSocketState(`Ошибка realtime: ${payload.error}`);
      return;
    }

    handleRealtimeEvent(payload);
  });

  ws.addEventListener("close", () => {
    if (manualDisconnect) {
      setSocketState("Не в сети");
      return;
    }
    setSocketState("Переподключение...");
    startFallbackSync();
    runFallbackSync();
    scheduleReconnect();
  });

  ws.addEventListener("error", () => {
    if (manualDisconnect) return;
    setSocketState("Ошибка realtime, переподключение...");
    startFallbackSync();
    try {
      ws.close();
    } catch {
      // ignore
    }
  });
}

async function onLoginSuccess(result) {
  token = result.token;
  me = result.user;
  activeChatId = null;
  keepChatDeselected = true;
  localStorage.setItem(TOKEN_KEY, token);

  applyMyProfile(me);
  showApp();

  await loadChats();
  if (activeChatId) {
    await loadMessages(activeChatId);
  }

  startFallbackSync();
  openRealtime();
}

async function restoreSession() {
  if (!token) {
    return false;
  }

  try {
    const data = await api("/api/profile/me", { auth: true });
    me = data.user;
    activeChatId = null;
    keepChatDeselected = true;
    applyMyProfile(me);
    showApp();

    await loadChats();
    if (activeChatId) {
      await loadMessages(activeChatId);
    }

    startFallbackSync();
    openRealtime();
    return true;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    token = "";
    me = null;
    stopFallbackSync();
    return false;
  }
}

async function applyChatPreference(field, nextValue) {
  if (!activeChatId) return;
  try {
    await api(`/api/chats/${activeChatId}/preferences`, {
      method: "PATCH",
      auth: true,
      body: { [field]: nextValue },
    });

    await loadChats(true);
    renderChatHeader();

    if (field === "archived") {
      await loadChats();
      if (activeChatId) {
        await loadMessages(activeChatId, true);
      }
    }
  } catch (error) {
    clearMessagesState(error.message, "error");
  }
}

async function promptCreateGroup() {
  await openCreateGroupModal("group");
}

async function showGroupMembers() {
  openGroupPanel();
}

async function addGroupMembers() {
  openGroupPanel();
  await refreshGroupPanel();
  openGroupAddModal();
}

async function renameGroup() {
  openGroupPanel();
  if (!groupRenameForm.classList.contains("hidden")) {
    groupRenameInput.focus();
    groupRenameInput.select();
  }
}

async function manageGroupMembers() {
  openGroupPanel();
}

async function leaveGroup() {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group") return;

  const approved = await askConfirm(`Выйти из группы ${chat.title}?`);
  if (!approved) return;

  try {
    await api(`/api/chats/${chat.id}/group/leave`, {
      method: "POST",
      auth: true,
    });

    closeGroupPanel();
    activeChatId = null;
    await loadChats();
  } catch (error) {
    showGroupPanelFeedback(error.message, "error");
  }
}

async function searchUsersForCreateGroup(query) {
  const seq = ++createGroupSearchSeq;
  const q = normalizeUserSearchQuery(query);
  if (createGroupSearchResults) {
    createGroupSearchResults.innerHTML = "";
  }

  if (!q) {
    createGroupSearchState.textContent = "Введите имя, display name или username";
    if (createGroupSearchResults) {
      createGroupSearchResults.innerHTML = `<div class="list-state">Здесь появятся результаты поиска</div>`;
    }
    return;
  }

  try {
    createGroupSearchState.textContent = "Поиск...";
    const result = await api(`/api/users/search?q=${encodeURIComponent(q)}`, { auth: true });
    if (seq !== createGroupSearchSeq) return;
    const sourceUsers = Array.isArray(result.users) ? result.users : [];
    const selectedSet = new Set(createGroupSelectedUsers.map((item) => String(item.username || "").toLowerCase()));
    const users = sourceUsers.filter((user) => !selectedSet.has(String(user.username || "").toLowerCase()));

    if (!sourceUsers.length) {
      createGroupSearchState.textContent = "Ничего не найдено";
      createGroupSearchResults.innerHTML = `<div class="list-state">Попробуйте изменить запрос</div>`;
      return;
    }

    if (!users.length) {
      createGroupSearchState.textContent = "Все найденные пользователи уже выбраны";
      createGroupSearchResults.innerHTML = `<div class="list-state">Добавьте других участников через поиск</div>`;
      return;
    }

    createGroupSearchState.textContent = `Найдено: ${users.length}. Выберите участников.`;
    renderCreateUserList(createGroupSearchResults, users, {
      selectedUsernames: selectedSet,
      actionLabel: "Выбрать",
      onAction: async (user, alreadySelected) => {
        if (alreadySelected) return;
        const exists = createGroupSelectedUsers.some((item) => String(item.username || "").toLowerCase() === String(user.username || "").toLowerCase());
        if (exists) return;
        createGroupSelectedUsers.push(user);
        renderCreateGroupSelected();
        renderCreateGroupRecent();
        await searchUsersForCreateGroup(createGroupSearchInput?.value || "");
      },
    });
  } catch (error) {
    if (seq !== createGroupSearchSeq) return;
    createGroupSearchState.textContent = error.message;
    createGroupSearchResults.innerHTML = `<div class="list-state">${escapeHtml(error.message)}</div>`;
  }
}

async function searchUsersForCreateDirect(query) {
  const seq = ++createDirectSearchSeq;
  const q = normalizeUserSearchQuery(query);
  if (createDirectResults) {
    createDirectResults.innerHTML = "";
  }

  if (!q) {
    if (createDirectState) {
      createDirectState.textContent = "Введите имя, username или @username";
    }
    if (createDirectResults) {
      createDirectResults.innerHTML = `<div class="list-state">Здесь появятся результаты поиска</div>`;
    }
    return;
  }

  try {
    if (createDirectState) {
      createDirectState.textContent = "Поиск...";
    }
    const result = await api(`/api/users/search?q=${encodeURIComponent(q)}`, { auth: true });
    if (seq !== createDirectSearchSeq) return;
    const users = Array.isArray(result.users) ? result.users : [];
    if (!users.length) {
      if (createDirectState) {
        createDirectState.textContent = "Пользователь не найден";
      }
      createDirectResults.innerHTML = `<div class="list-state">Попробуйте другой запрос</div>`;
      return;
    }

    if (createDirectState) {
      createDirectState.textContent = `Найдено: ${users.length}. Нажмите, чтобы открыть чат.`;
    }

    renderCreateUserList(createDirectResults, users, {
      actionLabel: "Открыть",
      onAction: async (user) => {
        try {
          if (createDirectState) {
            createDirectState.textContent = `Открываем чат с @${user.username}...`;
          }
          await openDirectChatByUsername(user.username, { closeCreateFlow: true });
        } catch (error) {
          if (createDirectState) {
            createDirectState.textContent = error.message;
          }
        }
      },
    });
  } catch (error) {
    if (seq !== createDirectSearchSeq) return;
    if (createDirectState) {
      createDirectState.textContent = error.message;
    }
    if (createDirectResults) {
      createDirectResults.innerHTML = `<div class="list-state">${escapeHtml(error.message)}</div>`;
    }
  }
}

authSwitchBtn?.addEventListener("click", () => {
  setMode(mode === "register" ? "login" : "register");
  usernameInput?.focus();
});

passwordToggleBtn?.addEventListener("click", () => {
  const show = passwordInput?.type !== "text";
  setPasswordVisibility(passwordInput, passwordToggleBtn, show);
  passwordInput?.focus();
});

inviteKeyToggleBtn?.addEventListener("click", () => {
  const show = inviteKeyInput?.type !== "text";
  setPasswordVisibility(inviteKeyInput, inviteKeyToggleBtn, show);
  inviteKeyInput?.focus();
});

[
  [usernameInput, usernameError],
  [displayNameInput, displayNameError],
  [passwordInput, passwordError],
  [inviteKeyInput, inviteKeyError],
].forEach(([inputNode, errorNode]) => {
  inputNode?.addEventListener("input", () => {
    if (authError) authError.textContent = "";
    setAuthFieldError(errorNode);
    syncAuthFormState();
  });
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (authSubmitting) return;
  authError.textContent = "";
  clearAuthFieldErrors();

  if (!validateAuthForm()) {
    syncAuthFormState();
    return;
  }

  const { username, displayName, password, inviteKey } = getAuthValues();
  authSubmitting = true;
  syncAuthFormState();

  try {
    if (mode === "register") {
      const result = await api("/api/auth/register", {
        method: "POST",
        body: {
          username,
          displayName,
          password,
          inviteKey,
        },
      });
      await onLoginSuccess(result);
      return;
    }

    const result = await api("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    await onLoginSuccess(result);
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    authSubmitting = false;
    syncAuthFormState();
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || "").trim();

  if (!query.length) {
    showSidebarSearchHint();
    return;
  }

  if (query.length < SIDEBAR_SEARCH_MIN_LEN) {
    showSidebarSearchHint();
    return;
  }

  if (sidebarSearchEntries.length) {
    await openSidebarSearchEntry(sidebarSearchActiveIndex >= 0 ? sidebarSearchActiveIndex : 0);
    return;
  }

  await runSidebarSearch(query, { openFirst: true });
});

searchInput?.addEventListener("focus", () => {
  const query = String(searchInput.value || "").trim();
  if (!query.length) {
    showSidebarSearchHint();
    return;
  }
  if (query.length < SIDEBAR_SEARCH_MIN_LEN) {
    showSidebarSearchHint();
    return;
  }

  if (query === sidebarSearchQuery && sidebarSearchEntries.length) {
    if (sidebarSearchResults) {
      sidebarSearchResults.classList.remove("hidden");
    }
    return;
  }
  runSidebarSearch(query);
});

searchInput?.addEventListener("input", () => {
  const query = String(searchInput.value || "").trim();
  setSidebarSearchFeedback("");
  if (!query.length) {
    showSidebarSearchHint();
    return;
  }
  scheduleSidebarSearch(query);
});

searchInput?.addEventListener("keydown", (event) => {
  if (!event) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    event.stopPropagation();
    if (!sidebarSearchEntries.length) {
      const query = String(searchInput.value || "").trim();
      if (query.length >= SIDEBAR_SEARCH_MIN_LEN) {
        runSidebarSearch(query);
      } else {
        showSidebarSearchHint();
      }
      return;
    }
    setSidebarSearchActiveIndex((sidebarSearchActiveIndex >= 0 ? sidebarSearchActiveIndex : -1) + 1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    event.stopPropagation();
    if (!sidebarSearchEntries.length) {
      const query = String(searchInput.value || "").trim();
      if (query.length >= SIDEBAR_SEARCH_MIN_LEN) {
        runSidebarSearch(query);
      } else {
        showSidebarSearchHint();
      }
      return;
    }
    setSidebarSearchActiveIndex((sidebarSearchActiveIndex >= 0 ? sidebarSearchActiveIndex : 0) - 1);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    const query = String(searchInput.value || "").trim();
    if (!query.length) {
      showSidebarSearchHint();
      return;
    }
    if (query.length < SIDEBAR_SEARCH_MIN_LEN) {
      showSidebarSearchHint();
      return;
    }
    if (sidebarSearchEntries.length) {
      openSidebarSearchEntry(sidebarSearchActiveIndex >= 0 ? sidebarSearchActiveIndex : 0);
      return;
    }
    runSidebarSearch(query, { openFirst: true });
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    closeSidebarSearch({ keepFeedback: false });
  }
});

if (globalSearchForm) {
  globalSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!globalSearchState || !globalSearchResults || !globalSearchInput) return;
    globalSearchState.textContent = "";
    globalSearchResults.innerHTML = "";

    const query = globalSearchInput.value.trim();
    if (query.length < 2) {
      globalSearchState.textContent = "Введите минимум 2 символа";
      return;
    }

    try {
      globalSearchState.textContent = "Поиск...";
      const result = await api(`/api/messages/search?q=${encodeURIComponent(query)}&limit=30`, { auth: true });
      await renderGlobalSearchResults(result.results || []);
    } catch (error) {
      globalSearchState.textContent = error.message;
    }
  });
}

chatSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!activeChatId) return;
  const query = chatSearchInput.value.trim();
  await runChatSearch(query, { offset: 0, append: false });
});

chatSearchInput.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  event.stopPropagation();
  clearChatSearch({ clearInput: true });
});

chatSearchClearBtn?.addEventListener("click", () => {
  clearChatSearch({ clearInput: true });
  chatSearchInput?.focus();
});

composerInput?.addEventListener("focus", () => {
  scheduleChatChromeSync({ preserveBottom: true, refreshViewport: isPhoneLayout() });
  window.setTimeout(() => {
    scheduleChatChromeSync({ preserveBottom: true, refreshViewport: isPhoneLayout() });
  }, 60);
});

composerInput?.addEventListener("blur", () => {
  window.setTimeout(() => {
    scheduleChatChromeSync({ preserveBottom: isMessagesNearBottom(140), refreshViewport: isPhoneLayout() });
  }, 40);
});

composer.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sendingMessage) return;
  const text = String(composerInput.value || "").trim();
  const hasAttachment = Boolean(composerAttachmentDraft?.file);
  if ((!text && !hasAttachment) || !activeChatId) return;

  sendingMessage = true;
  syncComposerState();
  try {
    let created;
    if (hasAttachment) {
      const payload = new FormData();
      payload.append("attachment", composerAttachmentDraft.file, composerAttachmentDraft.file.name);
      payload.append("attachmentKind", composerAttachmentDraft.kind);
      if (text) {
        payload.append("text", text);
      }
      if (replyTarget?.id) {
        payload.append("replyToMessageId", String(replyTarget.id));
      }
      created = await api(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        auth: true,
        formData: payload,
      });
    } else {
      created = await api(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        auth: true,
        body: {
          text,
          replyToMessageId: replyTarget ? replyTarget.id : null,
        },
      });
    }

    composerInput.value = "";
    setReplyTarget(null);
    clearComposerAttachmentDraft();
    closeComposerAttachMenu();
    closeComposerEmojiPicker();
    if (created && created.message && Number(created.message.conversationId) === Number(activeChatId)) {
      upsertActiveMessage(created.message);
    }
    scheduleChatsRefresh();
  } catch (error) {
    clearMessagesState(error.message, "error");
  } finally {
    sendingMessage = false;
    syncComposerState();
    composerInput.focus();
  }
});

replyCancelBtn.addEventListener("click", () => {
  setReplyTarget(null);
});

meProfileCard?.addEventListener("click", (event) => {
  if (event.target && event.target.closest("#logout-btn")) return;
  openProfilePanel();
});

meProfileCard?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openProfilePanel();
});

newChatBtn.addEventListener("click", () => {
  openCreateGroupModal("direct");
});

mobileChatBackBtn?.addEventListener("click", () => {
  handlePhoneBackNavigation();
});

chatPanelRoot?.addEventListener("touchstart", handleEdgeBackSwipeTouchStart, { passive: true });
chatPanelRoot?.addEventListener("touchmove", handleEdgeBackSwipeTouchMove, { passive: false });
chatPanelRoot?.addEventListener("touchend", handleEdgeBackSwipeTouchEnd, { passive: true });
chatPanelRoot?.addEventListener("touchcancel", handleEdgeBackSwipeTouchEnd, { passive: true });

chatHeaderMain?.addEventListener("click", () => {
  const chat = getActiveChat();
  if (!chat || chat.type !== "direct") return;
  openContactPanel();
});

chatHeaderMain?.addEventListener("keydown", (event) => {
  const chat = getActiveChat();
  if (!chat || chat.type !== "direct") return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openContactPanel();
});

groupInfoBtn.addEventListener("click", () => {
  openGroupPanel();
});

chatMeta.addEventListener("click", () => {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group") return;
  openGroupPanel();
});

chatMeta.addEventListener("keydown", (event) => {
  const chat = getActiveChat();
  if (!chat || chat.type !== "group") return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openGroupPanel();
  }
});

groupPanelCloseBtn.addEventListener("click", closeGroupPanel);
profilePanelCloseBtn?.addEventListener("click", closeProfilePanel);
contactPanelCloseBtn?.addEventListener("click", closeContactPanel);
createGroupCloseBtn.addEventListener("click", closeCreateGroupModal);
createGroupCancelBtn.addEventListener("click", closeCreateGroupModal);
createTabDirectBtn?.addEventListener("click", () => {
  setCreateFlowMode("direct");
  createDirectSearchInput?.focus();
});
createTabGroupBtn?.addEventListener("click", () => {
  setCreateFlowMode("group");
  createGroupSearchInput?.focus();
});
createDirectSearchInput?.addEventListener("input", () => {
  if (createDirectSearchTimer) {
    clearTimeout(createDirectSearchTimer);
  }
  const query = createDirectSearchInput.value;
  createDirectSearchTimer = setTimeout(() => {
    createDirectSearchTimer = null;
    searchUsersForCreateDirect(query);
  }, 150);
});
createDirectSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (createDirectSearchTimer) {
    clearTimeout(createDirectSearchTimer);
    createDirectSearchTimer = null;
  }
  searchUsersForCreateDirect(createDirectSearchInput.value);
});
createGroupSearchInput?.addEventListener("input", () => {
  if (createGroupSearchTimer) {
    clearTimeout(createGroupSearchTimer);
  }
  const query = createGroupSearchInput.value;
  createGroupSearchTimer = setTimeout(() => {
    createGroupSearchTimer = null;
    searchUsersForCreateGroup(query);
  }, 150);
});
createGroupSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (createGroupSearchTimer) {
    clearTimeout(createGroupSearchTimer);
    createGroupSearchTimer = null;
  }
  searchUsersForCreateGroup(createGroupSearchInput.value);
});
createGroupTitleInput?.addEventListener("input", () => {
  if (createGroupFeedback) {
    createGroupFeedback.textContent = "";
  }
  syncCreateFlowActions();
});
createGroupTitleInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || createGroupStep !== "title") return;
  event.preventDefault();
  createGroupSubmitBtn?.click();
});
createGroupNextBtn?.addEventListener("click", () => {
  if (!createGroupSelectedUsers.length) {
    createGroupSearchState.textContent = "Сначала выберите участников";
    return;
  }
  setCreateGroupStep("title");
  renderCreateGroupMembersPreview();
  syncCreateFlowActions();
  createGroupTitleInput?.focus();
});
createGroupBackBtn?.addEventListener("click", () => {
  setCreateGroupStep("users");
  createGroupSearchInput?.focus();
});
messageEditCloseBtn.addEventListener("click", closeMessageEditModal);
messageEditCancelBtn.addEventListener("click", closeMessageEditModal);
messageForwardCloseBtn.addEventListener("click", closeMessageForwardModal);
messageForwardCancelBtn.addEventListener("click", closeMessageForwardModal);

messageForwardSearchInput.addEventListener("input", () => {
  renderForwardChatList(messageForwardSearchInput.value);
});
messageForwardSendBtn.addEventListener("click", async () => {
  await forwardMessageToSelectedChats();
});

profileEditBtn?.addEventListener("click", () => {
  setProfilePanelFeedback("");
  setProfileEditMode(true);
});

profileEditCancelBtn?.addEventListener("click", () => {
  setProfilePanelFeedback("");
  setProfileEditMode(false, { focus: false });
});

profileEditForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await applyProfileSave();
});

profileAvatarChangeBtn?.addEventListener("click", () => {
  if (!profileEditMode || profileSaving || !profileAvatarFileInput) return;
  profileAvatarFileInput.click();
});

profileAvatarResetBtn?.addEventListener("click", () => {
  if (!profileEditMode || profileSaving) return;
  profileAvatarDraft = "";
  profileAvatarChanged = true;
  setProfileEditError("");
  renderProfilePanel();
});

profileAvatarFileInput?.addEventListener("change", async () => {
  const file = profileAvatarFileInput.files && profileAvatarFileInput.files[0] ? profileAvatarFileInput.files[0] : null;
  await onProfileAvatarSelected(file);
});

profilePanelLogoutBtn?.addEventListener("click", () => {
  logoutBtn.click();
});

contactPanelSearchBtn?.addEventListener("click", () => {
  if (!activeChatId) return;
  closeContactPanel();
  clearChatSearch({ clearInput: false });
  chatSearchInput?.focus();
  chatSearchInput?.select();
});

contactPanelMuteBtn?.addEventListener("click", async () => {
  const chat = getActiveChat();
  if (!chat || chat.type !== "direct") return;
  try {
    setContactPanelFeedback("");
    await applyChatPreference("muted", !chat.muted);
    renderContactPanel();
    setContactPanelFeedback(chat.muted ? "Звук включен" : "Чат без звука", "success");
  } catch (error) {
    setContactPanelFeedback(error.message, "error");
  }
});

contactPanelBlockBtn?.addEventListener("click", () => {
  setContactPanelFeedback("Блокировка пользователя появится на следующем этапе.", "error");
});

if (composerEmojiBtn) {
  composerEmojiBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    void toggleComposerEmojiPicker();
  });
}

composerAttachBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (composerAttachBtn.disabled) return;
  openComposerAttachMenu(composerAttachBtn);
});

composerAttachPhotoBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  triggerComposerFilePicker("photo");
});

composerAttachDocBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  triggerComposerFilePicker("attachment");
});

composerPhotoInput?.addEventListener("change", () => {
  const file = composerPhotoInput.files && composerPhotoInput.files[0] ? composerPhotoInput.files[0] : null;
  if (!file) return;
  onComposerFileSelected(file, "photo");
  composerPhotoInput.value = "";
});

composerDocInput?.addEventListener("change", () => {
  const file = composerDocInput.files && composerDocInput.files[0] ? composerDocInput.files[0] : null;
  if (!file) return;
  onComposerFileSelected(file, "attachment");
  composerDocInput.value = "";
});

messagesFrame?.addEventListener("dragenter", (event) => {
  if (!isFileDragEvent(event)) return;
  event.preventDefault();
  if (!activeChatId) return;
  chatDragDepth += 1;
  setChatDropOverlayVisible(true);
});

messagesFrame?.addEventListener("dragover", (event) => {
  if (!isFileDragEvent(event)) return;
  event.preventDefault();
  if (!activeChatId) return;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
  setChatDropOverlayVisible(true);
});

messagesFrame?.addEventListener("dragleave", (event) => {
  if (!isFileDragEvent(event)) return;
  event.preventDefault();
  if (chatDragDepth > 0) {
    chatDragDepth -= 1;
  }
  if (chatDragDepth <= 0) {
    resetChatDropOverlayState();
  }
});

messagesFrame?.addEventListener("drop", (event) => {
  if (!isFileDragEvent(event)) return;
  event.preventDefault();
  const files = event.dataTransfer?.files;
  resetChatDropOverlayState();
  if (!files || !files.length) return;
  handleChatAreaFileDrop(files);
});

document.addEventListener("dragover", (event) => {
  if (!isFileDragEvent(event)) return;
  event.preventDefault();
});

document.addEventListener("drop", (event) => {
  if (!isFileDragEvent(event)) return;
  event.preventDefault();
  const insideMessagesFrame = Boolean(event.target?.closest?.("#messages-frame"));
  if (!insideMessagesFrame) {
    resetChatDropOverlayState();
  }
});

document.addEventListener("dragleave", (event) => {
  if (!isFileDragEvent(event)) return;
  if (event.relatedTarget) return;
  resetChatDropOverlayState();
});

window.addEventListener("blur", () => {
  resetChatDropOverlayState();
});

uiOverlay.addEventListener("click", () => {
  closeTopPanelNavigationLayer();
});

confirmModalCancelBtn.addEventListener("click", () => closeConfirmModal(false));
confirmModalAcceptBtn.addEventListener("click", () => closeConfirmModal(true));

messageEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!editingMessageId) return;
  const nextText = String(messageEditInput.value || "").trim();
  if (!nextText) {
    messageEditFeedback.textContent = "Сообщение не может быть пустым";
    return;
  }

  try {
    messageEditSaveBtn.disabled = true;
    messageEditFeedback.textContent = "";
    const conversationId = activeChatId;
    await api(`/api/messages/${editingMessageId}`, {
      method: "PATCH",
      auth: true,
      body: { text: nextText },
    });
    closeMessageEditModal();
    if (conversationId) {
      scheduleMessagesRefresh(conversationId);
      scheduleChatsRefresh();
    }
  } catch (error) {
    messageEditFeedback.textContent = error.message;
  } finally {
    messageEditSaveBtn.disabled = false;
  }
});

groupRenameForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const chat = getActiveChat();
  if (!chat || chat.type !== "group") return;
  const nextTitle = String(groupRenameInput.value || "").trim();
  if (nextTitle.length < 2) {
    showGroupPanelFeedback("Название должно быть не короче 2 символов", "error");
    return;
  }

  try {
    groupRenameSubmitBtn.disabled = true;
    await api(`/api/chats/${chat.id}/group`, {
      method: "PATCH",
      auth: true,
      body: { title: nextTitle },
    });
    showGroupPanelFeedback("Название обновлено", "success");
    await loadChats(true);
    renderChatHeader();
    await refreshGroupPanel();
  } catch (error) {
    showGroupPanelFeedback(error.message, "error");
  } finally {
    groupRenameSubmitBtn.disabled = false;
  }
});

groupAddOpenBtn?.addEventListener("click", () => {
  openGroupAddModal();
});

groupAddModalCloseBtn?.addEventListener("click", () => {
  closeGroupAddModal();
});

groupAddModalCancelBtn?.addEventListener("click", () => {
  closeGroupAddModal();
});

groupAddModalSearchForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (groupAddSearchTimer) {
    clearTimeout(groupAddSearchTimer);
    groupAddSearchTimer = null;
  }
  await searchUsersForGroupAddModal(groupAddModalInput.value);
});

groupAddModalInput?.addEventListener("input", () => {
  if (groupAddSearchTimer) {
    clearTimeout(groupAddSearchTimer);
  }
  const query = groupAddModalInput.value;
  groupAddSearchTimer = setTimeout(() => {
    groupAddSearchTimer = null;
    searchUsersForGroupAddModal(query);
  }, 160);
});

groupAddModalInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (groupAddSearchTimer) {
    clearTimeout(groupAddSearchTimer);
    groupAddSearchTimer = null;
  }
  searchUsersForGroupAddModal(groupAddModalInput.value);
});

groupAddModalSubmitBtn?.addEventListener("click", async () => {
  await submitGroupAddSelectedUsers();
});

groupLeaveBtn.addEventListener("click", leaveGroup);

createGroupSubmitBtn.addEventListener("click", async () => {
  if (creatingGroupInFlight) return;
  const title = String(createGroupTitleInput.value || "").trim();
  if (!createGroupSelectedUsers.length) {
    createGroupFeedback.textContent = "Выберите хотя бы одного участника";
    setCreateGroupStep("users");
    return;
  }
  if (title.length < 2) {
    createGroupFeedback.textContent = "Название должно быть не короче 2 символов";
    return;
  }

  try {
    creatingGroupInFlight = true;
    syncCreateFlowActions();
    createGroupFeedback.textContent = "Создаём группу...";
    const result = await api("/api/chats/group", {
      method: "POST",
      auth: true,
      body: {
        title,
        memberUsernames: createGroupSelectedUsers.map((item) => item.username),
      },
    });

    createGroupFeedback.textContent = "";
    closeCreateGroupModal();
    showArchived = false;
    setArchiveToggleLabel();
    await loadChats(true);
    if (result.chat?.id) {
      await openChat(result.chat.id);
    }
  } catch (error) {
    createGroupFeedback.textContent = error.message;
  } finally {
    creatingGroupInFlight = false;
    syncCreateFlowActions();
  }
});

document.addEventListener("click", (event) => {
  if (createMenu && !createMenu.contains(event.target) && event.target !== newChatBtn) {
    closeCreateMenu();
  }
  if (
    searchForm &&
    sidebarSearchResults &&
    !searchForm.contains(event.target) &&
    !sidebarSearchResults.contains(event.target)
  ) {
    closeSidebarSearch();
  }
  if (!event.target.closest(".msg-action-wrap") && !isInsideEmojiPicker(event.target)) {
    if (!isMessagePopoverDismissGuardActive()) {
      closeMessagePopovers();
    }
  }
  if (!event.target.closest("#composer-input-wrap") && !isInsideEmojiPicker(event.target)) {
    closeComposerEmojiPicker();
  }
  if (
    !event.target.closest("#composer-attach-btn") &&
    !event.target.closest("#composer-attach-menu")
  ) {
    closeComposerAttachMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    handleEscapeNavigation();
  }
});

messagesRoot.addEventListener("scroll", () => {
  clearMessageLongPressState();
  closeMessagePopovers();
  if (!isPhoneLayout()) {
    closeComposerAttachMenu();
  }
  resetChatDropOverlayState();
});

archiveToggleBtn.addEventListener("click", async () => {
  showArchived = !showArchived;
  setArchiveToggleLabel();
  activeChatId = null;
  await loadChats();
  if (activeChatId) {
    await loadMessages(activeChatId);
  }
});

chatPinBtn.addEventListener("click", async () => {
  const chat = getActiveChat();
  if (!chat) return;
  await applyChatPreference("pinned", !chat.pinned);
});

chatMuteBtn.addEventListener("click", async () => {
  const chat = getActiveChat();
  if (!chat) return;
  await applyChatPreference("muted", !chat.muted);
});

chatArchiveBtn.addEventListener("click", async () => {
  const chat = getActiveChat();
  if (!chat) return;
  await applyChatPreference("archived", !chat.archived);
});

logoutBtn.addEventListener("click", async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  manualDisconnect = true;
  stopFallbackSync();
  if (readAckTimer) {
    clearTimeout(readAckTimer);
    readAckTimer = null;
    pendingReadAckChatId = null;
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  ws = null;

  try {
    await api("/api/auth/logout", {
      method: "POST",
      auth: true,
    });
  } catch {
    // ignore logout API errors
  }

  token = "";
  me = null;
  chats = [];
  activeChatId = null;
  keepChatDeselected = false;
  activeMessages = [];
  meDisplay.textContent = "";
  meUsername.textContent = "";
  meAvatar.removeAttribute("src");
  setReplyTarget(null);
  sendingMessage = false;
  closeAllPanels();
  closeCreateMenu();
  clearChatSearch({ clearInput: true });
  syncComposerState();
  localStorage.removeItem(TOKEN_KEY);
  showAuth();
  setSocketState("Не в сети");
});

function bindLayoutQueryListener(mediaQuery) {
  if (!mediaQuery) return;
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", () => {
      scheduleChatChromeSync({
        refreshViewport: true,
        preserveBottom: isMessagesNearBottom(140) || isComposerInputFocused(),
      });
    });
    return;
  }
  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(() => {
      scheduleChatChromeSync({
        refreshViewport: true,
        preserveBottom: isMessagesNearBottom(140) || isComposerInputFocused(),
      });
    });
  }
}

bindLayoutQueryListener(PHONE_LAYOUT_QUERY);
bindLayoutQueryListener(TABLET_LAYOUT_QUERY);

window.addEventListener("resize", () => {
  scheduleChatChromeSync({
    refreshViewport: true,
    preserveBottom: isMessagesNearBottom(140) || isComposerInputFocused(),
  });
});

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    scheduleChatChromeSync({
      refreshViewport: true,
      preserveBottom: isMessagesNearBottom(140) || isComposerInputFocused(),
    });
  });
  window.visualViewport.addEventListener("scroll", () => {
    scheduleChatChromeSync({
      refreshViewport: true,
      preserveBottom: isMessagesNearBottom(140) || isComposerInputFocused(),
    });
  });
}

window.addEventListener("orientationchange", () => {
  scheduleChatChromeSync({
    refreshViewport: true,
    preserveBottom: isMessagesNearBottom(140) || isComposerInputFocused(),
  });
});

tabLogin.addEventListener("click", () => setMode("login"));
tabRegister.addEventListener("click", () => setMode("register"));

async function bootstrap() {
  initComposerLayoutObserver();
  syncViewportHeightVariable();
  syncResponsiveLayoutState();
  setMode("login");
  setSocketState("Не в сети");
  setArchiveToggleLabel();
  renderComposerEmojiPicker();
  syncForwardSendState();
  syncComposerState();
  clearChatSearch({ clearInput: true });
  scheduleChatChromeSync();

  if (!token) {
    showAuth();
    return;
  }

  showBootScreen();
  const restored = await restoreSession();
  if (!restored) {
    showAuth();
  }
}

bootstrap();







