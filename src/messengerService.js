const { hashPassword, verifyPassword, randomToken } = require("./security");

const ALLOWED_REACTIONS = ["\uD83D\uDC4D", "\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDD25", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDC4F"];
const MUTE_UNTIL_FAR = "9999-12-31T23:59:59.000Z";
const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function nowIso() {
  return new Date().toISOString();
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function directKey(userAId, userBId) {
  const [a, b] = [Number(userAId), Number(userBId)].sort((x, y) => x - y);
  return `direct:${a}:${b}`;
}

function buildAvatarPlaceholder(seed) {
  const safe = encodeURIComponent((seed || "user").slice(0, 2).toUpperCase());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${safe}`;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function uniq(values) {
  return [...new Set(values)];
}

class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

class MessengerService {
  constructor(db, config, hub) {
    this.db = db;
    this.config = config;
    this.hub = hub;
  }

  setHub(hub) {
    this.hub = hub;
  }

  sanitizeUsername(raw) {
    return String(raw || "").trim().slice(0, 32);
  }

  sanitizeDisplayName(raw, fallback) {
    const value = String(raw || "").trim().slice(0, 48);
    return value || fallback;
  }

  sanitizeAvatar(raw, fallbackSeed) {
    const value = String(raw || "").trim();
    if (!value) {
      return buildAvatarPlaceholder(fallbackSeed);
    }

    if (value.startsWith("data:image/")) {
      return value.slice(0, 3000000);
    }

    if (/^https?:\/\/\S+$/i.test(value)) {
      return value.slice(0, 2048);
    }

    return buildAvatarPlaceholder(fallbackSeed);
  }

  sanitizeBio(raw) {
    return String(raw || "").trim().slice(0, 300);
  }

  sanitizeGroupTitle(raw) {
    return String(raw || "").trim().slice(0, 120);
  }

  sanitizeMessage(raw) {
    return String(raw || "").trim().slice(0, 2000);
  }

  sanitizeSearchQuery(raw) {
    return String(raw || "").trim().slice(0, 120);
  }

  normalizeMimeType(raw) {
    return String(raw || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
  }

  sanitizeAttachmentPayload(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

    const kindRaw = String(raw.kind || "").trim().toLowerCase();
    const kind = kindRaw === "photo" ? "photo" : kindRaw === "attachment" ? "attachment" : "";
    if (!kind) {
      throw new AppError("Некорректный тип вложения.", 400);
    }

    const fileUrl = String(raw.fileUrl || raw.url || "").trim();
    if (!fileUrl || !fileUrl.startsWith("/uploads/messages/")) {
      throw new AppError("Некорректный путь к вложению.", 400);
    }

    const mimeType = this.normalizeMimeType(raw.mimeType);
    const isPhotoMime = PHOTO_MIME_TYPES.has(mimeType);
    const isDocumentMime = DOCUMENT_MIME_TYPES.has(mimeType);
    if (!isPhotoMime && !isDocumentMime) {
      throw new AppError("Неподдерживаемый тип файла.", 400);
    }

    if (kind === "photo" && !isPhotoMime) {
      throw new AppError("Некорректный тип вложения для фото.", 400);
    }
    if (kind === "attachment" && !isDocumentMime) {
      throw new AppError("Некорректный тип вложения для документа.", 400);
    }

    const fileSize = Number(raw.fileSize);
    const normalizedSize = Number.isFinite(fileSize) && fileSize > 0 ? Math.round(fileSize) : null;
    const originalFileName = String(raw.originalFileName || raw.fileName || "").trim().slice(0, 160) || "Файл";
    const storedFileName = String(raw.storedFileName || "").trim().slice(0, 160) || null;

    return {
      kind,
      fileUrl,
      mimeType,
      fileSize: normalizedSize,
      originalFileName,
      storedFileName,
    };
  }

  sanitizeReactionEmoji(raw) {
    const value = String(raw || "").trim().slice(0, 32);
    if (!value) return "";

    // Accept unicode emoji from full picker (including ZWJ/skin-tone sequences).
    // Keep validation lightweight: at least one emoji code point must exist.
    const hasEmoji = /[\p{Extended_Pictographic}\p{Emoji}]/u.test(value);
    return hasEmoji ? value : "";
  }

  normalizeLookupText(raw) {
    return String(raw || "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("ru-RU");
  }

  textMatchesLookup(targetRaw, queryNormalized, queryTokens) {
    const target = this.normalizeLookupText(targetRaw);
    if (!target) return false;
    if (target.includes(queryNormalized)) return true;
    if (queryTokens.length > 1) {
      return queryTokens.every((token) => target.includes(token));
    }
    return false;
  }

  scoreUserLookup(row, queryNormalized, queryTokens) {
    const username = String(row?.username || "");
    const displayName = String(row?.display_name || "");
    const usernameNorm = this.normalizeLookupText(username);
    const displayNorm = this.normalizeLookupText(displayName);

    let score = 0;
    if (usernameNorm === queryNormalized) score = Math.max(score, 120);
    if (displayNorm && displayNorm === queryNormalized) score = Math.max(score, 112);
    if (usernameNorm.startsWith(queryNormalized)) score = Math.max(score, 98);
    if (displayNorm && displayNorm.startsWith(queryNormalized)) score = Math.max(score, 92);
    if (this.textMatchesLookup(usernameNorm, queryNormalized, queryTokens)) score = Math.max(score, 80);
    if (displayNorm && this.textMatchesLookup(displayNorm, queryNormalized, queryTokens)) score = Math.max(score, 74);

    if (!score && queryTokens.length > 1) {
      const merged = `${usernameNorm} ${displayNorm}`.trim();
      if (queryTokens.every((token) => merged.includes(token))) {
        score = 64;
      }
    }
    return score;
  }

  scoreGroupLookup(row, queryNormalized, queryTokens) {
    const title = String(row?.title || "");
    const titleNorm = this.normalizeLookupText(title);
    if (!titleNorm) return 0;

    let score = 0;
    if (titleNorm === queryNormalized) score = Math.max(score, 116);
    if (titleNorm.startsWith(queryNormalized)) score = Math.max(score, 98);
    if (this.textMatchesLookup(titleNorm, queryNormalized, queryTokens)) score = Math.max(score, 80);

    if (!score && queryTokens.length > 1 && queryTokens.every((token) => titleNorm.includes(token))) {
      score = 68;
    }
    return score;
  }

  scoreMessageLookup(textRaw, queryNormalized, queryTokens) {
    const target = this.normalizeLookupText(textRaw);
    if (!target) return 0;

    let score = 0;
    if (target === queryNormalized) score = Math.max(score, 128);
    if (target.startsWith(queryNormalized)) score = Math.max(score, 112);
    if (target.includes(queryNormalized)) score = Math.max(score, 92);
    if (queryTokens.length > 1 && queryTokens.every((token) => target.includes(token))) {
      score = Math.max(score, 80);
    }
    return score;
  }

  normalizeUsernamesInput(input) {
    if (Array.isArray(input)) {
      return uniq(input.map((x) => this.sanitizeUsername(x)).filter(Boolean));
    }
    const single = this.sanitizeUsername(input);
    return single ? [single] : [];
  }

  toPublicUser(row) {
    const userId = Number(row.id);
    const isOnline = Number.isInteger(userId) && userId > 0 && this.hub ? this.hub.isUserOnline(userId) : false;
    const lastSeenAt = row.last_seen_at ? String(row.last_seen_at) : null;

    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name || row.username,
      avatar: row.avatar_url || buildAvatarPlaceholder(row.username),
      bio: String(row.bio || ""),
      online: isOnline,
      isOnline,
      lastSeenAt,
    };
  }

  isModeratorRole(role) {
    return role === "owner" || role === "admin";
  }

  async markUserLastSeenOffline(userId, atIso = nowIso()) {
    const normalizedUserId = Number(userId);
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return null;
    }
    const timestamp = String(atIso || nowIso());
    await this.db.run("UPDATE users SET last_seen_at = ? WHERE id = ?", [timestamp, normalizedUserId]);
    return timestamp;
  }

  async getPresenceAudienceUserIds(userId) {
    const normalizedUserId = Number(userId);
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return [];
    }

    const rows = await this.db.all(
      `
        SELECT DISTINCT cm_peer.user_id AS user_id
        FROM conversation_members cm_self
        JOIN conversations c ON c.id = cm_self.conversation_id AND c.type = 'direct'
        JOIN conversation_members cm_peer ON cm_peer.conversation_id = cm_self.conversation_id
        WHERE cm_self.user_id = ? AND cm_peer.user_id <> ?
      `,
      [normalizedUserId, normalizedUserId]
    );

    return rows
      .map((row) => Number(row.user_id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  async getUsersByIds(ids) {
    const uniqueIds = uniq(
      (Array.isArray(ids) ? ids : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    );
    if (!uniqueIds.length) return [];
    const placeholders = uniqueIds.map(() => "?").join(", ");
    return this.db.all(`SELECT id, username, display_name FROM users WHERE id IN (${placeholders})`, uniqueIds);
  }

  userLabel(user) {
    if (!user) return "Пользователь";
    const displayName = String(user.display_name || user.displayName || "").trim();
    if (displayName) return displayName;

    const username = String(user.username || "").trim();
    if (username) return `@${username}`;

    return "Пользователь";
  }

  async buildSystemEventTexts({ actorUserId, targetUserId = null, action, payload = null }) {
    const actor = await this.db.get("SELECT id, username, display_name FROM users WHERE id = ?", [actorUserId]);
    if (!actor) return [];
    const actorLabel = this.userLabel(actor);

    if (action === "group_rename") {
      const title = String(payload?.title || "").trim();
      if (!title) return [];
      return [`${actorLabel} изменил название группы на «${title}»`];
    }

    if (action === "group_add_members") {
      const addedUsers = await this.getUsersByIds(payload?.userIds || []);
      return addedUsers.map((user) => `${actorLabel} добавил ${this.userLabel(user)}`);
    }

    if (action === "group_remove_member") {
      if (!targetUserId) return [];
      const target = await this.db.get("SELECT id, username, display_name FROM users WHERE id = ?", [targetUserId]);
      if (!target) return [];
      return [`${actorLabel} удалил ${this.userLabel(target)} из группы`];
    }

    if (action === "group_leave") {
      return [`${actorLabel} покинул группу`];
    }

    if (action === "group_set_role") {
      if (!targetUserId) return [];
      const target = await this.db.get("SELECT id, username, display_name FROM users WHERE id = ?", [targetUserId]);
      if (!target) return [];
      if (String(payload?.role || "").trim() === "admin") {
        return [`${actorLabel} назначил ${this.userLabel(target)} админом`];
      }
      return [`${actorLabel} изменил роль ${this.userLabel(target)} на участник`];
    }

    return [];
  }

  async appendSystemEventMessages({ conversationId, actorUserId, targetUserId = null, action, payload = null }) {
    const conversation = await this.db.get("SELECT id, type FROM conversations WHERE id = ?", [conversationId]);
    if (!conversation || conversation.type !== "group") return;

    const texts = await this.buildSystemEventTexts({
      actorUserId,
      targetUserId,
      action,
      payload,
    });

    if (!texts.length) return;

    for (const text of texts) {
      await this.db.run(
        `
          INSERT INTO chat_messages (conversation_id, sender_id, text, reply_to_message_id, metadata_json, created_at)
          VALUES (?, ?, ?, NULL, ?, ?)
        `,
        [
          conversation.id,
          actorUserId,
          text,
          JSON.stringify({
            kind: "system_event",
            action,
            targetUserId: targetUserId || null,
            payload: payload || null,
          }),
          nowIso(),
        ]
      );
    }
  }

  async addModerationLog({ conversationId, actorUserId, targetUserId = null, action, payload = null }) {
    const payloadJson = payload ? JSON.stringify(payload) : null;
    await this.db.run(
      `
        INSERT INTO moderation_logs
        (conversation_id, actor_user_id, target_user_id, action, payload_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [conversationId, actorUserId, targetUserId, action, payloadJson, nowIso()]
    );
    await this.appendSystemEventMessages({
      conversationId,
      actorUserId,
      targetUserId,
      action,
      payload,
    });
  }

  async registerUser({ username, displayName, avatar, password, inviteKey }) {
    const cleanUsername = this.sanitizeUsername(username);
    if (cleanUsername.length < 3) throw new AppError("Имя пользователя должно быть не короче 3 символов.", 400);
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) throw new AppError("Имя пользователя может содержать только буквы, цифры и _.-", 400);
    if (String(password || "").length < 6) throw new AppError("Пароль должен быть не короче 6 символов.", 400);
    if (String(inviteKey || "") !== this.config.inviteKey) throw new AppError("Неверный ключ приглашения.", 403);

    const exists = await this.db.get("SELECT id FROM users WHERE username = ? COLLATE NOCASE", [cleanUsername]);
    if (exists) throw new AppError("Такое имя пользователя уже занято.", 409);

    const insert = await this.db.run(
      `INSERT INTO users (username, display_name, avatar_url, password_hash, created_at) VALUES (?, ?, ?, ?, ?)`,
      [cleanUsername, this.sanitizeDisplayName(displayName, cleanUsername), this.sanitizeAvatar(avatar, cleanUsername), hashPassword(password), nowIso()]
    );

    const user = await this.db.get("SELECT id, username, display_name, avatar_url, bio, last_seen_at FROM users WHERE id = ?", [insert.lastID]);
    const token = await this.createSession(user.id, user.username);
    return { token, user: this.toPublicUser(user) };
  }

  async loginUser({ username, password }) {
    const cleanUsername = this.sanitizeUsername(username);
    if (!cleanUsername || !password) throw new AppError("Нужны имя пользователя и пароль.", 400);

    const user = await this.db.get(
      `SELECT id, username, display_name, avatar_url, bio, last_seen_at, password_hash FROM users WHERE username = ? COLLATE NOCASE`,
      [cleanUsername]
    );
    if (!user || !verifyPassword(password, user.password_hash)) throw new AppError("Неверное имя пользователя или пароль.", 401);

    const token = await this.createSession(user.id, user.username);
    return { token, user: this.toPublicUser(user) };
  }

  async createSession(userId, usernameArg) {
    let username = String(usernameArg || "").trim();
    if (!username) {
      const row = await this.db.get("SELECT username FROM users WHERE id = ?", [userId]);
      username = row ? row.username : "";
    }

    const token = randomToken();
    const createdAt = nowIso();
    const expiresAt = addDaysIso(this.config.sessionTtlDays);
    await this.db.run(
      `INSERT INTO sessions (token, user_id, username, created_at, expires_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [token, userId, username, createdAt, expiresAt, createdAt]
    );
    return token;
  }

  async getSessionByToken(tokenRaw) {
    const token = String(tokenRaw || "").trim();
    if (!token) return null;

    const session = await this.db.get(`SELECT token, user_id, expires_at FROM sessions WHERE token = ?`, [token]);
    if (!session) return null;

    if (new Date(session.expires_at).getTime() <= Date.now()) {
      await this.db.run("DELETE FROM sessions WHERE token = ?", [token]);
      return null;
    }

    await this.db.run("UPDATE sessions SET last_seen_at = ? WHERE token = ?", [nowIso(), token]);

    const user = await this.db.get("SELECT id, username, display_name, avatar_url, bio, last_seen_at FROM users WHERE id = ?", [session.user_id]);
    if (!user) {
      await this.db.run("DELETE FROM sessions WHERE token = ?", [token]);
      return null;
    }

    return { token, user: this.toPublicUser(user) };
  }

  async deleteSession(tokenRaw) {
    const token = String(tokenRaw || "").trim();
    if (!token) return;
    await this.db.run("DELETE FROM sessions WHERE token = ?", [token]);
  }

  async cleanupExpiredSessions() {
    await this.db.run("DELETE FROM sessions WHERE expires_at <= ?", [nowIso()]);
  }

  async getMyProfile(userId) {
    const user = await this.db.get("SELECT id, username, display_name, avatar_url, bio, last_seen_at FROM users WHERE id = ?", [userId]);
    if (!user) throw new AppError("Пользователь не найден.", 404);
    return this.toPublicUser(user);
  }

  async updateMyProfile(userId, { displayName, username, avatar, bio }) {
    const current = await this.db.get("SELECT id, username, display_name, avatar_url, bio, last_seen_at FROM users WHERE id = ?", [userId]);
    if (!current) throw new AppError("Пользователь не найден.", 404);

    let nextUsername = current.username;
    if (username !== undefined) {
      const cleanUsername = this.sanitizeUsername(username);
      if (cleanUsername.length < 3) {
        throw new AppError("Имя пользователя должно быть не короче 3 символов.", 400);
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        throw new AppError("Имя пользователя может содержать только буквы, цифры и _.-", 400);
      }
      const usernameTaken = await this.db.get("SELECT id FROM users WHERE username = ? COLLATE NOCASE AND id <> ?", [cleanUsername, userId]);
      if (usernameTaken) {
        throw new AppError("Такое имя пользователя уже занято.", 409);
      }
      nextUsername = cleanUsername;
    }

    const nextDisplayName = displayName !== undefined
      ? this.sanitizeDisplayName(displayName, nextUsername)
      : this.sanitizeDisplayName(current.display_name, nextUsername);
    const nextAvatar = avatar !== undefined
      ? this.sanitizeAvatar(avatar, nextUsername)
      : this.sanitizeAvatar(current.avatar_url, nextUsername);
    const nextBio = bio !== undefined ? this.sanitizeBio(bio) : this.sanitizeBio(current.bio);

    await this.db.run("UPDATE users SET username = ?, display_name = ?, avatar_url = ?, bio = ? WHERE id = ?", [
      nextUsername,
      nextDisplayName,
      nextAvatar,
      nextBio,
      userId,
    ]);
    await this.db.run("UPDATE sessions SET username = ? WHERE user_id = ?", [nextUsername, userId]);

    return this.getMyProfile(userId);
  }

  async searchUsers(userId, query) {
    const q = String(query || "").trim().replace(/^@+/, "").slice(0, 48);
    const qNormalized = this.normalizeLookupText(q);
    if (!qNormalized) return [];
    const qTokens = qNormalized.split(" ").filter(Boolean);

    const rows = await this.db.all(
      `
        SELECT id, username, display_name, avatar_url, last_seen_at
        FROM users
        WHERE id <> ?
        ORDER BY username COLLATE NOCASE ASC
        LIMIT 300
      `,
      [userId]
    );

    const ranked = rows
      .map((row) => ({ row, score: this.scoreUserLookup(row, qNormalized, qTokens) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return String(a.row.username || "").localeCompare(String(b.row.username || ""), "ru-RU", { sensitivity: "base" });
      })
      .slice(0, 20)
      .map((entry) => entry.row);

    return ranked.map((row) => this.toPublicUser(row));
  }

  async searchSidebar(userId, query, { userLimitRaw = 8, groupLimitRaw = 8 } = {}) {
    const raw = String(query || "").trim().slice(0, 72);
    const usersQuery = raw.replace(/^@+/, "");
    const usersQueryNormalized = this.normalizeLookupText(usersQuery);
    const usersQueryTokens = usersQueryNormalized.split(" ").filter(Boolean);
    const groupsQueryNormalized = this.normalizeLookupText(raw);
    const groupsQueryTokens = groupsQueryNormalized.split(" ").filter(Boolean);

    if (!usersQueryNormalized && !groupsQueryNormalized) {
      return { users: [], groups: [] };
    }

    const parsedUserLimit = Number(userLimitRaw);
    const parsedGroupLimit = Number(groupLimitRaw);
    const userLimit = Number.isInteger(parsedUserLimit) ? Math.min(Math.max(parsedUserLimit, 1), 20) : 8;
    const groupLimit = Number.isInteger(parsedGroupLimit) ? Math.min(Math.max(parsedGroupLimit, 1), 20) : 8;

    const usersPromise = usersQueryNormalized
      ? this.searchUsers(userId, usersQuery)
      : Promise.resolve([]);
    const groupsPromise = groupsQueryNormalized
      ? this.db.all(
          `
            SELECT c.id, c.title, c.avatar_url,
                   cm.archived,
                   (
                     SELECT COUNT(*)
                     FROM conversation_members cm_count
                     WHERE cm_count.conversation_id = c.id
                   ) AS member_count,
                   (
                     SELECT MAX(m.created_at)
                     FROM chat_messages m
                     WHERE m.conversation_id = c.id
                   ) AS last_activity_at
            FROM conversation_members cm
            JOIN conversations c ON c.id = cm.conversation_id
            WHERE cm.user_id = ? AND c.type = 'group'
            ORDER BY c.id DESC
            LIMIT 500
          `,
          [userId]
        )
      : Promise.resolve([]);

    const [usersRaw, groupsRaw] = await Promise.all([usersPromise, groupsPromise]);

    const users = (Array.isArray(usersRaw) ? usersRaw : []).slice(0, userLimit);
    const groups = (Array.isArray(groupsRaw) ? groupsRaw : [])
      .map((row) => ({
        row,
        score: this.scoreGroupLookup(row, groupsQueryNormalized, groupsQueryTokens),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        const aTime = String(a.row?.last_activity_at || "");
        const bTime = String(b.row?.last_activity_at || "");
        const byTime = bTime.localeCompare(aTime);
        if (byTime !== 0) return byTime;
        return String(a.row?.title || "").localeCompare(String(b.row?.title || ""), "ru-RU", { sensitivity: "base" });
      })
      .slice(0, groupLimit)
      .map((entry) => {
        const row = entry.row;
        const title = String(row.title || "").trim() || "Группа без названия";
        return {
          id: Number(row.id),
          title,
          avatar: row.avatar_url || buildAvatarPlaceholder(title),
          memberCount: Number(row.member_count || 0),
          archived: Boolean(row.archived),
        };
      });

    return { users, groups };
  }

  async getUserByUsername(username) {
    const clean = this.sanitizeUsername(username);
    if (!clean) return null;
    return this.db.get("SELECT id, username, display_name, avatar_url, last_seen_at FROM users WHERE username = ? COLLATE NOCASE", [clean]);
  }

  async getUsersByUsernames(usernames) {
    if (!usernames.length) return [];
    const placeholders = usernames.map(() => "?").join(", ");
    return this.db.all(`SELECT id, username, display_name, avatar_url, last_seen_at FROM users WHERE username COLLATE NOCASE IN (${placeholders})`, usernames);
  }

  async getConversationForMember(userId, conversationId) {
    const row = await this.db.get(
      `
        SELECT c.id, c.type, c.title, c.avatar_url, c.created_by, c.created_at,
               cm.role AS my_role, cm.pinned, cm.archived, cm.muted_until, cm.last_read_message_id
        FROM conversation_members cm
        JOIN conversations c ON c.id = cm.conversation_id
        WHERE cm.user_id = ? AND cm.conversation_id = ?
      `,
      [userId, conversationId]
    );
    if (!row) throw new AppError("Чат не найден.", 404);
    return row;
  }

  async assertConversationMember(userId, conversationId) {
    return this.getConversationForMember(userId, conversationId);
  }

  async getConversationMember(conversationId, userId) {
    return this.db.get("SELECT cm.user_id, cm.role, cm.joined_at FROM conversation_members cm WHERE cm.conversation_id = ? AND cm.user_id = ?", [conversationId, userId]);
  }

  async getConversationMembers(conversationId) {
    return this.db.all(
      `
        SELECT cm.user_id, cm.role, cm.joined_at, cm.archived, u.username, u.display_name, u.avatar_url, u.last_seen_at
        FROM conversation_members cm
        JOIN users u ON u.id = cm.user_id
        WHERE cm.conversation_id = ?
        ORDER BY cm.joined_at ASC, cm.user_id ASC
      `,
      [conversationId]
    );
  }

  async getDirectPeer(conversationId, userId) {
    const peer = await this.db.get(
      `
        SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.last_seen_at
        FROM conversation_members cm
        JOIN users u ON u.id = cm.user_id
        WHERE cm.conversation_id = ? AND cm.user_id <> ?
        LIMIT 1
      `,
      [conversationId, userId]
    );
    if (!peer) throw new AppError("Собеседник не найден.", 500);
    return peer;
  }

  async getChatSummary(userId, conversationId) {
    const conversation = await this.getConversationForMember(userId, conversationId);

    let peer = null;
    let memberCount = 0;
    if (conversation.type === "direct") {
      peer = await this.getDirectPeer(conversation.id, userId);
      memberCount = 2;
    } else {
      const countRow = await this.db.get("SELECT COUNT(*) AS count FROM conversation_members WHERE conversation_id = ?", [conversation.id]);
      memberCount = countRow ? countRow.count : 0;
    }

    const lastMessage = await this.db.get(
      `
        SELECT m.id, m.sender_id, m.text, m.created_at, m.deleted_at, m.reply_to_message_id, m.metadata_json,
               sender.display_name AS sender_display_name, sender.username AS sender_username
        FROM chat_messages m
        JOIN users sender ON sender.id = m.sender_id
        WHERE m.conversation_id = ?
        ORDER BY m.id DESC
        LIMIT 1
      `,
      [conversation.id]
    );
    const lastPreview = this.buildChatListLastPreview(lastMessage);
    const lastMessageMine = Boolean(lastMessage && Number(lastMessage.sender_id) === Number(userId));
    let lastMessageStatus = null;
    if (lastMessageMine && lastMessage && !lastMessage.deleted_at) {
      const metadata = this.parseMessageMetadata(lastMessage.metadata_json);
      if (String(metadata?.kind || "") !== "system_event") {
        const counters = await this.db.get(
          `
            SELECT COUNT(*) AS total_count,
                   SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) AS delivered_count,
                   SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) AS read_count
            FROM message_receipts
            WHERE message_id = ?
          `,
          [lastMessage.id]
        );
        lastMessageStatus = this.messageStatusFromReceipts(
          {
            total: Number(counters?.total_count || 0),
            delivered: Number(counters?.delivered_count || 0),
            read: Number(counters?.read_count || 0),
          },
          { isGroup: conversation.type === "group" }
        );
      }
    }

    const unread = await this.db.get(
      `
        SELECT COUNT(*) AS count
        FROM chat_messages
        WHERE conversation_id = ? AND sender_id <> ? AND id > ? AND deleted_at IS NULL
      `,
      [conversation.id, userId, conversation.last_read_message_id || 0]
    );

    const isMuted = !!conversation.muted_until && (conversation.muted_until === MUTE_UNTIL_FAR || new Date(conversation.muted_until).getTime() > Date.now());
    const peerIsOnline = conversation.type === "direct" && this.hub ? this.hub.isUserOnline(peer.id) : false;

    return {
      id: conversation.id,
      type: conversation.type,
      title: conversation.type === "direct" ? (peer.display_name || peer.username) : (conversation.title || "Группа без названия"),
      avatar: conversation.type === "direct" ? (peer.avatar_url || buildAvatarPlaceholder(peer.username)) : (conversation.avatar_url || buildAvatarPlaceholder(conversation.title || "GR")),
      peer: conversation.type === "direct" ? {
        id: peer.id,
        username: peer.username,
        displayName: peer.display_name || peer.username,
        avatar: peer.avatar_url || buildAvatarPlaceholder(peer.username),
        bio: String(peer.bio || ""),
        online: peerIsOnline,
        isOnline: peerIsOnline,
        lastSeenAt: peer.last_seen_at ? String(peer.last_seen_at) : null,
      } : null,
      memberCount,
      myRole: conversation.my_role,
      pinned: Boolean(conversation.pinned),
      archived: Boolean(conversation.archived),
      muted: isMuted,
      unreadCount: unread ? unread.count : 0,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        senderId: lastMessage.sender_id,
        mine: lastMessageMine,
        senderName: lastMessage.sender_display_name || lastMessage.sender_username,
        text: lastMessage.deleted_at ? "Сообщение удалено" : (lastMessage.text || ""),
        preview: lastPreview.preview,
        kind: lastPreview.kind,
        status: lastMessageStatus,
        createdAt: lastMessage.created_at,
        deletedAt: lastMessage.deleted_at || null,
      } : null,
      createdAt: conversation.created_at,
    };
  }

  async ensureDirectConversation(ownerId, targetUsername) {
    const owner = await this.db.get("SELECT id, username FROM users WHERE id = ?", [ownerId]);
    if (!owner) throw new AppError("Пользователь не найден.", 404);

    const target = await this.getUserByUsername(targetUsername);
    if (!target) throw new AppError("Пользователь не найден.", 404);
    if (target.id === owner.id) throw new AppError("Нельзя открыть чат с самим собой.", 400);

    const key = directKey(owner.id, target.id);
    let conversation = await this.db.get("SELECT id, type, title, created_at FROM conversations WHERE direct_key = ?", [key]);

    if (!conversation) {
      const createdAt = nowIso();
      const insert = await this.db.run(
        `INSERT INTO conversations (type, title, direct_key, created_by, created_at) VALUES ('direct', NULL, ?, ?, ?)`,
        [key, owner.id, createdAt]
      );
      conversation = { id: insert.lastID, type: "direct", title: null, created_at: createdAt };

      await this.db.run(`INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`, [conversation.id, owner.id, createdAt]);
      await this.db.run(`INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`, [conversation.id, target.id, createdAt]);
    }

    const joinedAt = conversation.created_at || nowIso();
    await this.db.run(
      `INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`,
      [conversation.id, owner.id, joinedAt]
    );
    await this.db.run(
      `INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`,
      [conversation.id, target.id, joinedAt]
    );

    await this.db.run(
      `UPDATE conversation_members SET archived = 0 WHERE conversation_id = ? AND user_id = ?`,
      [conversation.id, owner.id]
    );

    const chat = await this.getChatSummary(owner.id, conversation.id);
    return { chat, target: this.toPublicUser(target) };
  }

  async createGroupConversation(ownerId, { title, avatar, memberUsernames }) {
    const owner = await this.db.get("SELECT id, username FROM users WHERE id = ?", [ownerId]);
    if (!owner) throw new AppError("Пользователь не найден.", 404);

    const cleanTitle = this.sanitizeGroupTitle(title);
    if (cleanTitle.length < 2) throw new AppError("Название группы должно быть не короче 2 символов.", 400);
    const cleanAvatar = this.sanitizeAvatar(avatar, cleanTitle);

    const names = this.normalizeUsernamesInput(memberUsernames).filter((name) => name.toLowerCase() !== owner.username.toLowerCase());
    const users = await this.getUsersByUsernames(names);
    const found = new Set(users.map((u) => u.username.toLowerCase()));
    const missing = names.filter((name) => !found.has(name.toLowerCase()));
    if (missing.length) throw new AppError(`Пользователи не найдены: ${missing.join(", ")}`, 404);

    const createdAt = nowIso();
    const insert = await this.db.run(
      `INSERT INTO conversations (type, title, avatar_url, created_by, created_at) VALUES ('group', ?, ?, ?, ?)`,
      [cleanTitle, cleanAvatar, owner.id, createdAt]
    );
    const conversationId = insert.lastID;

    await this.db.run(`INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)`, [conversationId, owner.id, createdAt]);
    for (const user of users) {
      await this.db.run(`INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`, [conversationId, user.id, createdAt]);
    }

    const memberIds = [owner.id, ...users.map((u) => u.id)];
    if (this.hub) {
      this.hub.sendToUsers(memberIds, { type: "chat:updated", conversationId });
      this.hub.sendToUsers(memberIds, { type: "group:members_updated", conversationId });
    }

    return { chat: await this.getChatSummary(owner.id, conversationId) };
  }

  async renameGroupConversation(actorUserId, conversationId, { title, avatar }) {
    const conversation = await this.getConversationForMember(actorUserId, conversationId);
    if (conversation.type !== "group") throw new AppError("Это не групповой чат.", 400);
    if (!this.isModeratorRole(conversation.my_role)) throw new AppError("Только owner/admin могут переименовать группу.", 403);

    const nextTitle = this.sanitizeGroupTitle(title);
    if (nextTitle.length < 2) throw new AppError("Название группы должно быть не короче 2 символов.", 400);
    const nextAvatar = this.sanitizeAvatar(avatar, nextTitle);

    await this.db.run("UPDATE conversations SET title = ?, avatar_url = ? WHERE id = ?", [nextTitle, nextAvatar, conversation.id]);

    await this.addModerationLog({
      conversationId: conversation.id,
      actorUserId,
      action: "group_rename",
      payload: { title: nextTitle },
    });

    const members = await this.getConversationMembers(conversation.id);
    const memberIds = members.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(memberIds, { type: "chat:updated", conversationId: conversation.id });
      this.hub.sendToUsers(memberIds, { type: "group:updated", conversationId: conversation.id });
    }

    return this.getChatSummary(actorUserId, conversation.id);
  }

  async listGroupMembers(userId, conversationId) {
    const conversation = await this.getConversationForMember(userId, conversationId);
    if (conversation.type !== "group") throw new AppError("Это не групповой чат.", 400);

    const members = await this.getConversationMembers(conversation.id);
    return members.map((member) => ({
      user: {
        id: member.user_id,
        username: member.username,
        displayName: member.display_name || member.username,
        avatar: member.avatar_url || buildAvatarPlaceholder(member.username),
        online: this.hub ? this.hub.isUserOnline(member.user_id) : false,
        isOnline: this.hub ? this.hub.isUserOnline(member.user_id) : false,
        lastSeenAt: member.last_seen_at ? String(member.last_seen_at) : null,
      },
      role: member.role,
      joinedAt: member.joined_at,
    }));
  }

  async addGroupMembers(actorUserId, conversationId, memberUsernames) {
    const conversation = await this.getConversationForMember(actorUserId, conversationId);
    if (conversation.type !== "group") throw new AppError("Это не групповой чат.", 400);
    if (!this.isModeratorRole(conversation.my_role)) throw new AppError("Только owner/admin могут добавлять участников.", 403);

    const names = this.normalizeUsernamesInput(memberUsernames);
    if (!names.length) throw new AppError("Не переданы пользователи.", 400);

    const users = await this.getUsersByUsernames(names);
    const found = new Set(users.map((u) => u.username.toLowerCase()));
    const missing = names.filter((name) => !found.has(name.toLowerCase()));
    if (missing.length) throw new AppError(`Пользователи не найдены: ${missing.join(", ")}`, 404);

    const currentMembers = await this.getConversationMembers(conversation.id);
    const currentIds = new Set(currentMembers.map((m) => m.user_id));

    const addedIds = [];
    for (const user of users) {
      if (currentIds.has(user.id)) continue;
      await this.db.run(
        `INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`,
        [conversation.id, user.id, nowIso()]
      );
      addedIds.push(user.id);
    }

    if (addedIds.length) {
      await this.addModerationLog({
        conversationId: conversation.id,
        actorUserId,
        action: "group_add_members",
        payload: { userIds: addedIds },
      });
    }

    const memberRows = await this.getConversationMembers(conversation.id);
    const memberIds = memberRows.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers([...memberIds, ...addedIds], { type: "group:members_updated", conversationId: conversation.id });
      this.hub.sendToUsers([...memberIds, ...addedIds], { type: "chat:updated", conversationId: conversation.id });
    }

    return { addedUserIds: addedIds, members: await this.listGroupMembers(actorUserId, conversation.id) };
  }

  async setGroupMemberRole(actorUserId, conversationId, targetUserId, nextRole) {
    const conversation = await this.getConversationForMember(actorUserId, conversationId);
    if (conversation.type !== "group") throw new AppError("Это не групповой чат.", 400);
    if (conversation.my_role !== "owner") throw new AppError("Только владелец может менять роли участников.", 403);

    const role = String(nextRole || "").trim();
    if (!["admin", "member"].includes(role)) throw new AppError("Роль должна быть admin или member.", 400);

    const target = await this.getConversationMember(conversation.id, targetUserId);
    if (!target) throw new AppError("Участник не найден.", 404);
    if (target.role === "owner") throw new AppError("Нельзя изменить роль владельца.", 400);

    await this.db.run(`UPDATE conversation_members SET role = ? WHERE conversation_id = ? AND user_id = ?`, [role, conversation.id, targetUserId]);

    await this.addModerationLog({
      conversationId: conversation.id,
      actorUserId,
      targetUserId,
      action: "group_set_role",
      payload: { role },
    });

    const members = await this.getConversationMembers(conversation.id);
    const ids = members.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(ids, { type: "group:members_updated", conversationId: conversation.id });
      this.hub.sendToUsers(ids, { type: "chat:updated", conversationId: conversation.id });
    }

    return { ok: true };
  }

  async removeGroupMember(actorUserId, conversationId, targetUserId) {
    const conversation = await this.getConversationForMember(actorUserId, conversationId);
    if (conversation.type !== "group") throw new AppError("Это не групповой чат.", 400);
    if (!this.isModeratorRole(conversation.my_role)) throw new AppError("Только owner/admin могут удалять участников.", 403);

    const target = await this.getConversationMember(conversation.id, targetUserId);
    if (!target) throw new AppError("Участник не найден.", 404);
    if (target.user_id === actorUserId) throw new AppError("Для выхода используйте действие «Выйти из группы».", 400);
    if (target.role === "owner") throw new AppError("Владельца нельзя удалить.", 400);
    if (conversation.my_role === "admin" && target.role !== "member") throw new AppError("Админ может удалять только участников с ролью member.", 403);

    await this.db.run(`DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?`, [conversation.id, target.user_id]);

    await this.addModerationLog({
      conversationId: conversation.id,
      actorUserId,
      targetUserId: target.user_id,
      action: "group_remove_member",
    });

    const members = await this.getConversationMembers(conversation.id);
    const ids = members.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(ids, { type: "group:members_updated", conversationId: conversation.id });
      this.hub.sendToUsers(ids, { type: "chat:updated", conversationId: conversation.id });
      this.hub.sendToUsers([target.user_id], { type: "chat:removed", conversationId: conversation.id });
    }

    return { ok: true };
  }

  async leaveGroup(userId, conversationId) {
    const conversation = await this.getConversationForMember(userId, conversationId);
    if (conversation.type !== "group") throw new AppError("Это не групповой чат.", 400);

    const members = await this.getConversationMembers(conversation.id);
    const me = members.find((m) => m.user_id === userId);
    if (!me) throw new AppError("Вы не состоите в этой группе.", 404);

    if (me.role === "owner") {
      const others = members.filter((m) => m.user_id !== userId);
      if (others.length) {
        const nextOwner = others.find((m) => m.role === "admin") || others.find((m) => m.role === "member") || others[0];
        await this.db.run(`UPDATE conversation_members SET role = 'owner' WHERE conversation_id = ? AND user_id = ?`, [conversation.id, nextOwner.user_id]);
      }
    }

    await this.db.run(`DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?`, [conversation.id, userId]);

    await this.addModerationLog({
      conversationId: conversation.id,
      actorUserId: userId,
      action: "group_leave",
    });

    const leftMembers = await this.getConversationMembers(conversation.id);
    const leftIds = leftMembers.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(leftIds, { type: "group:members_updated", conversationId: conversation.id });
      this.hub.sendToUsers(leftIds, { type: "chat:updated", conversationId: conversation.id });
      this.hub.sendToUsers([userId], { type: "chat:removed", conversationId: conversation.id });
    }

    return { ok: true };
  }

  async setChatPreferences(userId, conversationId, { pinned, muted, archived }) {
    await this.assertConversationMember(userId, conversationId);

    const updates = [];
    const params = [];

    const pinnedBool = toBoolean(pinned);
    if (pinnedBool !== null) {
      updates.push("pinned = ?");
      params.push(pinnedBool ? 1 : 0);
    }

    const archivedBool = toBoolean(archived);
    if (archivedBool !== null) {
      updates.push("archived = ?");
      params.push(archivedBool ? 1 : 0);
    }

    const mutedBool = toBoolean(muted);
    if (mutedBool !== null) {
      updates.push("muted_until = ?");
      params.push(mutedBool ? MUTE_UNTIL_FAR : null);
    }

    if (!updates.length) throw new AppError("Не переданы настройки.", 400);

    params.push(conversationId, userId);
    await this.db.run(`UPDATE conversation_members SET ${updates.join(", ")} WHERE conversation_id = ? AND user_id = ?`, params);

    if (this.hub) this.hub.sendToUsers([userId], { type: "chat:updated", conversationId });
    return this.getChatSummary(userId, conversationId);
  }

  async listChats(userId, options = {}) {
    const archivedFlag = toBoolean(options.archived);
    const whereArchived = archivedFlag === true ? "cm.archived = 1" : "cm.archived = 0";

    const rows = await this.db.all(
      `SELECT cm.conversation_id AS id FROM conversation_members cm WHERE cm.user_id = ? AND ${whereArchived}`,
      [userId]
    );

    const chats = [];
    for (const row of rows) {
      chats.push(await this.getChatSummary(userId, row.id));
    }

    chats.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const at = a.lastMessage ? a.lastMessage.createdAt : a.createdAt;
      const bt = b.lastMessage ? b.lastMessage.createdAt : b.createdAt;
      const byTime = String(bt || "").localeCompare(String(at || ""));
      if (byTime !== 0) return byTime;
      return Number(b.id || 0) - Number(a.id || 0);
    });

    return chats;
  }

  async buildReactionsMap(messageIds, viewerUserId) {
    if (!messageIds.length) return new Map();
    const placeholders = messageIds.map(() => "?").join(", ");
    const rows = await this.db.all(
      `
        SELECT message_id, emoji, COUNT(*) AS count, SUM(CASE WHEN user_id = ? THEN 1 ELSE 0 END) AS mine
        FROM message_reactions
        WHERE message_id IN (${placeholders})
        GROUP BY message_id, emoji
      `,
      [viewerUserId, ...messageIds]
    );

    const map = new Map();
    for (const row of rows) {
      if (!map.has(row.message_id)) map.set(row.message_id, []);
      map.get(row.message_id).push({
        emoji: row.emoji,
        count: row.count,
        reactedByMe: Number(row.mine) > 0,
      });
    }
    return map;
  }

  async buildReceiptCounters(messageIds) {
    if (!messageIds.length) return new Map();
    const placeholders = messageIds.map(() => "?").join(", ");
    const rows = await this.db.all(
      `
        SELECT message_id, COUNT(*) AS total_count,
               SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) AS delivered_count,
               SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) AS read_count
        FROM message_receipts
        WHERE message_id IN (${placeholders})
        GROUP BY message_id
      `,
      [...messageIds]
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.message_id, {
        total: Number(row.total_count || 0),
        delivered: Number(row.delivered_count || 0),
        read: Number(row.read_count || 0),
      });
    }
    return map;
  }

  truncatePreview(text, max = 120) {
    const value = String(text || "");
    if (value.length <= max) return value;
    return `${value.slice(0, max - 3)}...`;
  }

  buildChatListLastPreview(row) {
    if (!row) {
      return { kind: "empty", preview: "" };
    }

    const metadata = this.parseMessageMetadata(row.metadata_json);
    const rawKind = String(metadata?.kind || "").trim();
    const deleted = Boolean(row.deleted_at);
    const text = String(row.text || "");

    if (deleted) {
      return { kind: "deleted", preview: "Сообщение удалено" };
    }

    if (rawKind === "system_event") {
      return {
        kind: "system",
        preview: this.truncatePreview(text || "Системное событие", 110),
      };
    }

    if (rawKind === "forwarded") {
      const compact = this.truncatePreview(text || "", 92);
      return {
        kind: "forwarded",
        preview: compact ? `Переслано: ${compact}` : "Пересланное сообщение",
      };
    }

    if (rawKind === "attachment") {
      const filename = String(metadata?.fileName || metadata?.name || "").trim();
      return {
        kind: "attachment",
        preview: filename ? `Файл: ${this.truncatePreview(filename, 84)}` : "Вложение",
      };
    }

    if (rawKind === "photo") {
      return { kind: "photo", preview: "Фото" };
    }

    if (rawKind === "voice") {
      return { kind: "voice", preview: "Голосовое сообщение" };
    }

    if (!text && row.reply_to_message_id) {
      return { kind: "reply", preview: "Ответ на сообщение" };
    }

    return { kind: "text", preview: this.truncatePreview(text || "Сообщение", 110) };
  }

  messageStatusFromReceipts(counters, options = {}) {
    if (!counters || counters.total <= 0) return "sent";
    const isGroup = Boolean(options && options.isGroup);

    if (isGroup) {
      if (counters.read > 0) return "read";
      if (counters.delivered > 0) return "delivered";
      return "sent";
    }

    if (counters.read >= counters.total) return "read";
    if (counters.delivered >= counters.total) return "delivered";
    if (counters.delivered > 0) return "delivered";
    return "sent";
  }

  formatReplyPreview(row) {
    if (!row.reply_id) return null;
    const text = row.reply_deleted_at ? "Сообщение удалено" : this.truncatePreview(row.reply_text || "", 140);
    return {
      id: row.reply_id,
      senderName: row.reply_sender_display_name || row.reply_sender_username || "Неизвестно",
      text,
      deletedAt: row.reply_deleted_at || null,
    };
  }

  parseMessageMetadata(raw) {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
      return null;
    } catch {
      return null;
    }
  }

  async resolveForwardSource(userId, sourceMessageId) {
    const source = await this.db.get(
      `
        SELECT m.id, m.conversation_id, m.sender_id, m.text, m.deleted_at, m.metadata_json,
               sender.username AS sender_username, sender.display_name AS sender_display_name
        FROM chat_messages m
        JOIN users sender ON sender.id = m.sender_id
        JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
        WHERE m.id = ?
      `,
      [userId, sourceMessageId]
    );

    if (!source) throw new AppError("Исходное сообщение для пересылки не найдено.", 404);
    if (source.deleted_at) throw new AppError("Нельзя переслать удаленное сообщение.", 400);

    const sourceMetadata = this.parseMessageMetadata(source.metadata_json);
    if (sourceMetadata?.kind === "system_event") {
      throw new AppError("Системное сообщение нельзя переслать.", 400);
    }

    const sourceText = this.sanitizeMessage(source.text);
    if (!sourceText) throw new AppError("Нельзя переслать пустое сообщение.", 400);

    const originalSenderName = String(
      sourceMetadata?.kind === "forwarded"
        ? (sourceMetadata.originalSenderName || sourceMetadata.originalSenderUsername || "")
        : (source.sender_display_name || source.sender_username || "")
    ).trim();
    const originalSenderUsername = String(
      sourceMetadata?.kind === "forwarded"
        ? (sourceMetadata.originalSenderUsername || "")
        : (source.sender_username || "")
    ).trim();

    return {
      text: sourceText,
      originalMessageId: Number.isInteger(Number(sourceMetadata?.originalMessageId))
        ? Number(sourceMetadata.originalMessageId)
        : source.id,
      originalConversationId: Number.isInteger(Number(sourceMetadata?.originalConversationId))
        ? Number(sourceMetadata.originalConversationId)
        : source.conversation_id,
      originalSenderId: Number.isInteger(Number(sourceMetadata?.originalSenderId))
        ? Number(sourceMetadata.originalSenderId)
        : source.sender_id,
      originalSenderUsername: originalSenderUsername || source.sender_username,
      originalSenderName: originalSenderName || source.sender_display_name || source.sender_username || "Пользователь",
    };
  }

  formatMessage(row, userId, conversation, reactionsMap, receiptMap) {
    const metadata = this.parseMessageMetadata(row.metadata_json);

    const isSystem = Boolean(metadata && metadata.kind === "system_event");
    const isForwarded = Boolean(metadata && metadata.kind === "forwarded");
    const isAttachment = Boolean(metadata && (metadata.kind === "photo" || metadata.kind === "attachment"));
    const mine = Number(row.sender_id) === Number(userId);
    const canModerate = conversation.type === "group" && this.isModeratorRole(conversation.my_role);
    const deletedAt = row.deleted_at || null;
    const visibleText = deletedAt ? "Сообщение удалено" : (row.text || "");
    const status = mine && !isSystem
      ? this.messageStatusFromReceipts(receiptMap.get(row.id), { isGroup: conversation.type === "group" })
      : null;
    const forwardedFrom = !isSystem && isForwarded
      ? {
        originalMessageId: Number.isInteger(Number(metadata.originalMessageId)) ? Number(metadata.originalMessageId) : null,
        originalConversationId: Number.isInteger(Number(metadata.originalConversationId)) ? Number(metadata.originalConversationId) : null,
        senderId: Number.isInteger(Number(metadata.originalSenderId)) ? Number(metadata.originalSenderId) : null,
        senderName: String(metadata.originalSenderName || metadata.originalSenderUsername || "Пользователь"),
        senderUsername: metadata.originalSenderUsername ? String(metadata.originalSenderUsername) : null,
      }
      : null;
    const attachment = !isSystem && !deletedAt && isAttachment
      ? {
        kind: metadata.kind === "photo" ? "photo" : "attachment",
        url: String(metadata.fileUrl || metadata.url || "").trim(),
        fileName: String(metadata.fileName || metadata.originalFileName || "Файл").trim(),
        mimeType: this.normalizeMimeType(metadata.mimeType),
        fileSize: Number.isFinite(Number(metadata.fileSize)) ? Number(metadata.fileSize) : null,
        storedFileName: metadata.storedFileName ? String(metadata.storedFileName) : null,
      }
      : null;

    return {
      id: row.id,
      conversationId: row.conversation_id,
      sender: {
        id: row.sender_id,
        username: row.sender_username,
        displayName: row.sender_display_name || row.sender_username,
        avatar: row.sender_avatar_url || buildAvatarPlaceholder(row.sender_username),
      },
      text: visibleText,
      mine,
      isSystem,
      isForwarded,
      isAttachment,
      attachment,
      forwardedFrom,
      systemAction: isSystem ? String(metadata.action || "") : null,
      status,
      createdAt: row.created_at,
      editedAt: row.edited_at || null,
      deletedAt,
      canEdit: mine && !deletedAt && !isSystem && !isForwarded && !isAttachment,
      canDelete: !deletedAt && !isSystem && (mine || canModerate),
      replyTo: isSystem ? null : this.formatReplyPreview(row),
      replyToMessageId: row.reply_to_message_id || null,
      reactions: isSystem || deletedAt ? [] : reactionsMap.get(row.id) || [],
    };
  }

  async mapMessagesForViewer(userId, conversation, rows) {
    const messageIds = rows.map((row) => row.id);
    const [reactionsMap, receiptMap] = await Promise.all([
      this.buildReactionsMap(messageIds, userId),
      this.buildReceiptCounters(messageIds),
    ]);
    return rows.map((row) => this.formatMessage(row, userId, conversation, reactionsMap, receiptMap));
  }

  async markDeliveredInConversation(userId, conversationId) {
    const at = nowIso();
    await this.db.run(
      `
        UPDATE message_receipts
        SET delivered_at = COALESCE(delivered_at, ?)
        WHERE user_id = ? AND message_id IN (
          SELECT id
          FROM chat_messages
          WHERE conversation_id = ? AND sender_id <> ?
        )
      `,
      [at, userId, conversationId, userId]
    );
  }

  async listMessages(userId, conversationId, limitRaw, aroundMessageIdRaw = null, windowRaw = null) {
    const conversation = await this.assertConversationMember(userId, conversationId);
    await this.markDeliveredInConversation(userId, conversation.id);

    const requested = Number(limitRaw);
    const fallback = Math.min(120, this.config.maxMessagesPerChat || 120);
    const limit = Number.isInteger(requested)
      ? Math.max(1, Math.min(requested, this.config.maxMessagesPerChat || 120))
      : fallback;

    const aroundMessageId = Number(aroundMessageIdRaw);
    const hasAround = Number.isInteger(aroundMessageId) && aroundMessageId > 0;
    const windowNum = Number(windowRaw);
    const windowSize = Number.isInteger(windowNum) ? Math.max(15, Math.min(windowNum, 160)) : 56;

    const baseSelect = `
      SELECT m.id, m.conversation_id, m.sender_id, m.text, m.edited_at, m.deleted_at, m.created_at, m.reply_to_message_id, m.metadata_json,
             sender.username AS sender_username, sender.display_name AS sender_display_name, sender.avatar_url AS sender_avatar_url,
             rm.id AS reply_id, rm.text AS reply_text, rm.deleted_at AS reply_deleted_at,
             rs.username AS reply_sender_username, rs.display_name AS reply_sender_display_name
      FROM chat_messages m
      JOIN users sender ON sender.id = m.sender_id
      LEFT JOIN chat_messages rm ON rm.id = m.reply_to_message_id
      LEFT JOIN users rs ON rs.id = rm.sender_id
    `;

    let rows = [];
    if (hasAround) {
      const target = await this.db.get(
        `SELECT id FROM chat_messages WHERE id = ? AND conversation_id = ?`,
        [aroundMessageId, conversation.id]
      );
      if (!target) throw new AppError("Сообщение не найдено в этом чате.", 404);

      const beforeDesc = await this.db.all(
        `
          ${baseSelect}
          WHERE m.conversation_id = ? AND m.id <= ?
          ORDER BY m.id DESC
          LIMIT ?
        `,
        [conversation.id, aroundMessageId, windowSize + 1]
      );
      const afterAsc = await this.db.all(
        `
          ${baseSelect}
          WHERE m.conversation_id = ? AND m.id > ?
          ORDER BY m.id ASC
          LIMIT ?
        `,
        [conversation.id, aroundMessageId, windowSize]
      );

      rows = [...beforeDesc].reverse().concat(afterAsc);
    } else {
      const rowsDesc = await this.db.all(
        `
          ${baseSelect}
          WHERE m.conversation_id = ?
          ORDER BY m.id DESC
          LIMIT ?
        `,
        [conversation.id, limit]
      );
      rows = [...rowsDesc].reverse();
    }

    const messages = await this.mapMessagesForViewer(userId, conversation, rows);
    return { messages };
  }

  async getSingleMessageRow(messageId) {
    return this.db.get(
      `
        SELECT m.id, m.conversation_id, m.sender_id, m.text, m.edited_at, m.deleted_at, m.created_at, m.reply_to_message_id, m.metadata_json,
               sender.username AS sender_username, sender.display_name AS sender_display_name, sender.avatar_url AS sender_avatar_url,
               rm.id AS reply_id, rm.text AS reply_text, rm.deleted_at AS reply_deleted_at,
               rs.username AS reply_sender_username, rs.display_name AS reply_sender_display_name
        FROM chat_messages m
        JOIN users sender ON sender.id = m.sender_id
        LEFT JOIN chat_messages rm ON rm.id = m.reply_to_message_id
        LEFT JOIN users rs ON rs.id = rm.sender_id
        WHERE m.id = ?
      `,
      [messageId]
    );
  }

  async sendMessage(userId, conversationId, payloadOrText, replyToMessageIdRaw = null) {
    const conversation = await this.assertConversationMember(userId, conversationId);

    let text = payloadOrText;
    let replyToMessageId = replyToMessageIdRaw;
    let forwardFromMessageId = null;
    let attachmentPayload = null;
    if (payloadOrText && typeof payloadOrText === "object" && !Array.isArray(payloadOrText)) {
      text = payloadOrText.text;
      replyToMessageId = payloadOrText.replyToMessageId;
      forwardFromMessageId = payloadOrText.forwardFromMessageId;
      attachmentPayload = payloadOrText.attachment;
    }
    const attachment = this.sanitizeAttachmentPayload(attachmentPayload);
    const hasAttachment = Boolean(attachment);

    const forwardId = Number(forwardFromMessageId);
    const hasForward = Number.isInteger(forwardId) && forwardId > 0;
    if (forwardFromMessageId !== null && forwardFromMessageId !== undefined && !hasForward) {
      throw new AppError("Некорректный id сообщения для пересылки.", 400);
    }
    if (hasForward && hasAttachment) {
      throw new AppError("Нельзя пересылать сообщение и прикреплять новый файл одновременно.", 400);
    }

    let cleanText = "";
    let metadataJson = null;
    let finalReplyId = null;

    if (hasForward) {
      const source = await this.resolveForwardSource(userId, forwardId);
      cleanText = source.text;
      metadataJson = JSON.stringify({
        kind: "forwarded",
        originalMessageId: source.originalMessageId,
        originalConversationId: source.originalConversationId,
        originalSenderId: source.originalSenderId,
        originalSenderUsername: source.originalSenderUsername,
        originalSenderName: source.originalSenderName,
      });
    } else {
      cleanText = this.sanitizeMessage(text);
      if (!cleanText && !hasAttachment) throw new AppError("Сообщение не может быть пустым.", 400);

      if (hasAttachment) {
        metadataJson = JSON.stringify({
          kind: attachment.kind,
          fileUrl: attachment.fileUrl,
          fileName: attachment.originalFileName,
          storedFileName: attachment.storedFileName,
          mimeType: attachment.mimeType,
          fileSize: attachment.fileSize,
        });
      }

      const replyId = Number(replyToMessageId);
      const hasReply = Number.isInteger(replyId) && replyId > 0;
      if (hasReply) {
        const replyTarget = await this.db.get(
          `SELECT id, conversation_id FROM chat_messages WHERE id = ?`,
          [replyId]
        );
        if (!replyTarget || replyTarget.conversation_id !== conversation.id) {
          throw new AppError("Сообщение для ответа не найдено в этом чате.", 404);
        }
        finalReplyId = replyTarget.id;
      }
    }

    const createdAt = nowIso();
    const insert = await this.db.run(
      `
        INSERT INTO chat_messages (conversation_id, sender_id, text, reply_to_message_id, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [conversation.id, userId, cleanText, finalReplyId, metadataJson, createdAt]
    );
    const messageId = insert.lastID;

    const members = await this.getConversationMembers(conversation.id);
    for (const member of members) {
      if (member.user_id === userId) continue;

      if (Number(member.archived) === 1) {
        await this.db.run(
          `UPDATE conversation_members SET archived = 0 WHERE conversation_id = ? AND user_id = ?`,
          [conversation.id, member.user_id]
        );
      }

      const memberOnline = this.hub ? this.hub.isUserOnline(member.user_id) : false;
      const memberActive = this.hub ? this.hub.isUserActiveInConversation(member.user_id, conversation.id) : false;
      const deliveredAt = memberOnline || memberActive ? createdAt : null;
      const readAt = memberActive ? createdAt : null;

      await this.db.run(
        `
          INSERT OR IGNORE INTO message_receipts (message_id, user_id, delivered_at, read_at)
          VALUES (?, ?, ?, ?)
        `,
        [messageId, member.user_id, deliveredAt, readAt]
      );

      if (readAt) {
        await this.db.run(
          `
            UPDATE conversation_members
            SET last_read_message_id = CASE
              WHEN last_read_message_id < ? THEN ?
              ELSE last_read_message_id
            END
            WHERE conversation_id = ? AND user_id = ?
          `,
          [messageId, messageId, conversation.id, member.user_id]
        );
      }
    }

    await this.db.run(
      `
        UPDATE conversation_members
        SET last_read_message_id = CASE
          WHEN last_read_message_id < ? THEN ?
          ELSE last_read_message_id
        END
        WHERE conversation_id = ? AND user_id = ?
      `,
      [messageId, messageId, conversation.id, userId]
    );

    const row = await this.getSingleMessageRow(messageId);
    const memberIds = members.map((m) => m.user_id);

    const personalizedEntries = await Promise.all(
      members.map(async (member) => {
        const memberConversation = await this.getConversationForMember(member.user_id, conversation.id);
        const [messageForMember] = await this.mapMessagesForViewer(member.user_id, memberConversation, [row]);
        return [member.user_id, messageForMember];
      })
    );
    const messagesByUserId = new Map(personalizedEntries);

    if (this.hub) {
      for (const member of members) {
        const messageForMember = messagesByUserId.get(member.user_id);
        if (!messageForMember) continue;
        this.hub.sendToUsers([member.user_id], {
          type: "message:new",
          conversationId: conversation.id,
          message: messageForMember,
        });
      }
      this.hub.sendToUsers(memberIds, { type: "chat:updated", conversationId: conversation.id });
    }

    const senderMessage = messagesByUserId.get(userId);
    if (!senderMessage) {
      const [fallbackMessage] = await this.mapMessagesForViewer(userId, conversation, [row]);
      return fallbackMessage;
    }
    return senderMessage;
  }

  async editMessage(userId, messageId, text) {
    const cleanText = this.sanitizeMessage(text);
    if (!cleanText) throw new AppError("Сообщение не может быть пустым.", 400);

    const row = await this.db.get(
      `
        SELECT m.id, m.conversation_id, m.sender_id, m.deleted_at, m.metadata_json
        FROM chat_messages m
        JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
        WHERE m.id = ? AND cm.user_id = ?
      `,
      [messageId, userId]
    );
    if (!row) throw new AppError("Сообщение не найдено.", 404);
    if (row.sender_id !== userId) throw new AppError("Можно редактировать только свои сообщения.", 403);
    if (row.deleted_at) throw new AppError("Удаленное сообщение нельзя редактировать.", 400);
    const metadata = this.parseMessageMetadata(row.metadata_json);
    if (metadata?.kind === "system_event") throw new AppError("Системное сообщение нельзя редактировать.", 400);
    if (metadata?.kind === "forwarded") throw new AppError("Пересланное сообщение нельзя редактировать.", 400);
    if (metadata?.kind === "photo" || metadata?.kind === "attachment") {
      throw new AppError("Сообщение с вложением нельзя редактировать.", 400);
    }

    await this.db.run("UPDATE chat_messages SET text = ?, edited_at = ? WHERE id = ?", [cleanText, nowIso(), messageId]);

    const conversation = await this.assertConversationMember(userId, row.conversation_id);
    const members = await this.getConversationMembers(conversation.id);
    const memberIds = members.map((m) => m.user_id);
    const updatedRow = await this.getSingleMessageRow(messageId);

    const personalizedEntries = await Promise.all(
      members.map(async (member) => {
        const memberConversation = await this.getConversationForMember(member.user_id, conversation.id);
        const [messageForMember] = await this.mapMessagesForViewer(member.user_id, memberConversation, [updatedRow]);
        return [member.user_id, messageForMember];
      })
    );
    const messagesByUserId = new Map(personalizedEntries);

    if (this.hub) {
      for (const member of members) {
        const messageForMember = messagesByUserId.get(member.user_id);
        if (!messageForMember) continue;
        this.hub.sendToUsers([member.user_id], {
          type: "message:updated",
          conversationId: conversation.id,
          message: messageForMember,
        });
      }
      this.hub.sendToUsers(memberIds, { type: "chat:updated", conversationId: conversation.id });
    }

    const actorMessage = messagesByUserId.get(userId);
    if (!actorMessage) {
      const [fallbackMessage] = await this.mapMessagesForViewer(userId, conversation, [updatedRow]);
      return fallbackMessage;
    }
    return actorMessage;
  }

  async deleteMessage(userId, messageId) {
    const row = await this.db.get(
      `
        SELECT m.id, m.conversation_id, m.sender_id, m.deleted_at, c.type, cm.role AS actor_role
        FROM chat_messages m
        JOIN conversations c ON c.id = m.conversation_id
        JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = ?
        WHERE m.id = ?
      `,
      [userId, messageId]
    );
    if (!row) throw new AppError("Сообщение не найдено.", 404);
    if (row.deleted_at) return { ok: true, messageId: row.id };

    const mine = row.sender_id === userId;
    const canModerate = row.type === "group" && this.isModeratorRole(row.actor_role);
    if (!mine && !canModerate) throw new AppError("Нет прав на удаление этого сообщения.", 403);

    const deletedAt = nowIso();
    await this.db.run(
      `
        UPDATE chat_messages
        SET text = '', deleted_at = ?, edited_at = COALESCE(edited_at, ?)
        WHERE id = ?
      `,
      [deletedAt, deletedAt, row.id]
    );
    await this.db.run(`DELETE FROM message_reactions WHERE message_id = ?`, [row.id]);

    if (!mine && canModerate) {
      await this.addModerationLog({
        conversationId: row.conversation_id,
        actorUserId: userId,
        targetUserId: row.sender_id,
        action: "group_delete_message",
        payload: { messageId: row.id },
      });
    }

    const members = await this.getConversationMembers(row.conversation_id);
    const memberIds = members.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(memberIds, { type: "message:deleted", conversationId: row.conversation_id, messageId: row.id });
      this.hub.sendToUsers(memberIds, { type: "chat:updated", conversationId: row.conversation_id });
    }

    return { ok: true, messageId: row.id };
  }

  async markConversationRead(userId, conversationId) {
    const conversation = await this.assertConversationMember(userId, conversationId);
    const at = nowIso();

    await this.db.run(
      `
        UPDATE message_receipts
        SET delivered_at = COALESCE(delivered_at, ?),
            read_at = COALESCE(read_at, ?)
        WHERE user_id = ? AND message_id IN (
          SELECT id
          FROM chat_messages
          WHERE conversation_id = ? AND sender_id <> ?
        )
      `,
      [at, at, userId, conversation.id, userId]
    );

    const latest = await this.db.get("SELECT MAX(id) AS max_id FROM chat_messages WHERE conversation_id = ?", [conversation.id]);
    const lastRead = latest && latest.max_id ? Number(latest.max_id) : 0;

    await this.db.run(
      `
        UPDATE conversation_members
        SET last_read_message_id = CASE
          WHEN last_read_message_id < ? THEN ?
          ELSE last_read_message_id
        END
        WHERE conversation_id = ? AND user_id = ?
      `,
      [lastRead, lastRead, conversation.id, userId]
    );

    const members = await this.getConversationMembers(conversation.id);
    const memberIds = members.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(memberIds, { type: "chat:read", conversationId: conversation.id, userId, lastReadMessageId: lastRead });
      this.hub.sendToUsers(memberIds, { type: "chat:updated", conversationId: conversation.id });
    }

    return { ok: true, lastReadMessageId: lastRead };
  }

  async toggleReaction(userId, messageId, emojiRaw) {
    const emoji = this.sanitizeReactionEmoji(emojiRaw);
    if (!emoji) {
      throw new AppError("Неподдерживаемая реакция.", 400);
    }

    const message = await this.db.get(
      `
        SELECT m.id, m.conversation_id, m.deleted_at, m.metadata_json
        FROM chat_messages m
        JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
        WHERE m.id = ? AND cm.user_id = ?
      `,
      [messageId, userId]
    );
    if (!message) throw new AppError("Сообщение не найдено.", 404);
    if (message.deleted_at) throw new AppError("Нельзя поставить реакцию на удаленное сообщение.", 400);
    const metadata = this.parseMessageMetadata(message.metadata_json);
    if (metadata?.kind === "system_event") throw new AppError("На системное сообщение нельзя поставить реакцию.", 400);

    const existing = await this.db.get(
      `SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?`,
      [message.id, userId, emoji]
    );

    let active = false;
    if (existing) {
      await this.db.run(`DELETE FROM message_reactions WHERE id = ?`, [existing.id]);
      active = false;
    } else {
      await this.db.run(
        `INSERT INTO message_reactions (message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)`,
        [message.id, userId, emoji, nowIso()]
      );
      active = true;
    }

    const map = await this.buildReactionsMap([message.id], userId);
    const reactions = map.get(message.id) || [];

    const members = await this.getConversationMembers(message.conversation_id);
    const memberIds = members.map((m) => m.user_id);
    if (this.hub) {
      this.hub.sendToUsers(memberIds, {
        type: "message:reaction",
        conversationId: message.conversation_id,
        messageId: message.id,
      });
    }

    return { messageId: message.id, active, reactions };
  }

  async searchMessagesInChat(userId, conversationId, query, limitRaw = 30, offsetRaw = 0) {
    const conversation = await this.assertConversationMember(userId, conversationId);
    const q = this.sanitizeSearchQuery(query);
    if (!q.length) throw new AppError("Введите текст для поиска.", 400);

    const limitNum = Number(limitRaw);
    const limit = Number.isInteger(limitNum) ? Math.max(1, Math.min(limitNum, 100)) : 30;
    const offsetNum = Number(offsetRaw);
    const offset = Number.isInteger(offsetNum) ? Math.max(0, offsetNum) : 0;
    const qNormalized = this.normalizeLookupText(q);
    const qTokens = qNormalized.split(" ").filter(Boolean);

    // Search over the full chat history (not only recently loaded rows) so old
    // messages are always discoverable, including Unicode case-insensitive text.
    const candidates = await this.db.all(
      `
        SELECT m.id, m.text, m.deleted_at
        FROM chat_messages m
        WHERE m.conversation_id = ?
        ORDER BY m.id DESC
      `,
      [conversation.id]
    );

    const matched = candidates
      .map((row) => {
        const sourceText = row.deleted_at ? "Сообщение удалено" : (row.text || "");
        return { id: Number(row.id), score: this.scoreMessageLookup(sourceText, qNormalized, qTokens) };
      })
      .filter((entry) => Number.isInteger(entry.id) && entry.id > 0 && entry.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.id - a.id;
      });

    const total = matched.length;
    const pagedIds = matched.slice(offset, offset + limit).map((entry) => entry.id);
    if (!pagedIds.length) {
      return {
        query: q,
        total,
        limit,
        offset,
        hasMore: false,
        results: [],
      };
    }

    const placeholders = pagedIds.map(() => "?").join(", ");
    const rows = await this.db.all(
      `
        SELECT m.id, m.conversation_id, m.sender_id, m.text, m.edited_at, m.deleted_at, m.created_at, m.reply_to_message_id, m.metadata_json,
               sender.username AS sender_username, sender.display_name AS sender_display_name, sender.avatar_url AS sender_avatar_url,
               rm.id AS reply_id, rm.text AS reply_text, rm.deleted_at AS reply_deleted_at,
               rs.username AS reply_sender_username, rs.display_name AS reply_sender_display_name
        FROM chat_messages m
        JOIN users sender ON sender.id = m.sender_id
        LEFT JOIN chat_messages rm ON rm.id = m.reply_to_message_id
        LEFT JOIN users rs ON rs.id = rm.sender_id
        WHERE m.id IN (${placeholders})
      `,
      pagedIds
    );

    const byId = new Map(rows.map((row) => [Number(row.id), row]));
    const orderedRows = pagedIds.map((id) => byId.get(Number(id))).filter(Boolean);
    const messages = await this.mapMessagesForViewer(userId, conversation, orderedRows);
    const messagesById = new Map(messages.map((message) => [Number(message.id), message]));
    const results = pagedIds
      .map((id) => messagesById.get(Number(id)))
      .filter(Boolean)
      .map((message) => ({
        message,
        snippet: this.truncatePreview(message.text, 180),
      }));

    return {
      query: q,
      total,
      limit,
      offset,
      hasMore: offset + results.length < total,
      results,
    };
  }

  async searchMessagesGlobal(userId, query, limitRaw = 40) {
    const q = this.sanitizeSearchQuery(query);
    if (q.length < 2) throw new AppError("Поисковый запрос должен быть не короче 2 символов.", 400);

    const limitNum = Number(limitRaw);
    const limit = Number.isInteger(limitNum) ? Math.max(1, Math.min(limitNum, 100)) : 40;
    const qNormalized = this.normalizeLookupText(q);
    const qTokens = qNormalized.split(" ").filter(Boolean);
    const fetchLimit = Math.max(limit * 30, 600);

    const rows = await this.db.all(
      `
        SELECT m.id, m.conversation_id, m.sender_id, m.text, m.edited_at, m.deleted_at, m.created_at, m.reply_to_message_id, m.metadata_json,
               sender.username AS sender_username, sender.display_name AS sender_display_name, sender.avatar_url AS sender_avatar_url,
               rm.id AS reply_id, rm.text AS reply_text, rm.deleted_at AS reply_deleted_at,
               rs.username AS reply_sender_username, rs.display_name AS reply_sender_display_name
        FROM conversation_members my
        JOIN chat_messages m ON m.conversation_id = my.conversation_id
        JOIN users sender ON sender.id = m.sender_id
        LEFT JOIN chat_messages rm ON rm.id = m.reply_to_message_id
        LEFT JOIN users rs ON rs.id = rm.sender_id
        WHERE my.user_id = ? AND m.deleted_at IS NULL
        ORDER BY m.id DESC
        LIMIT ?
      `,
      [userId, fetchLimit]
    );

    const matchedRows = rows
      .map((row) => ({ row, score: this.scoreMessageLookup(row.text || "", qNormalized, qTokens) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.row.id - a.row.id;
      })
      .slice(0, limit)
      .map((entry) => entry.row);

    const byConversation = new Map();
    for (const row of matchedRows) {
      if (!byConversation.has(row.conversation_id)) {
        byConversation.set(row.conversation_id, []);
      }
      byConversation.get(row.conversation_id).push(row);
    }

    const chatSummaryMap = new Map();
    for (const conversationId of byConversation.keys()) {
      chatSummaryMap.set(conversationId, await this.getChatSummary(userId, conversationId));
    }

    const results = [];
    for (const [conversationId, rowsForConversation] of byConversation.entries()) {
      const conversation = await this.assertConversationMember(userId, conversationId);
      const messages = await this.mapMessagesForViewer(userId, conversation, rowsForConversation);
      const chat = chatSummaryMap.get(conversationId);
      for (const message of messages) {
        results.push({
          chat: {
            id: chat.id,
            type: chat.type,
            title: chat.title,
            avatar: chat.avatar,
          },
          message,
          snippet: this.truncatePreview(message.text, 180),
        });
      }
    }

    results.sort((a, b) => b.message.id - a.message.id);
    return {
      query: q,
      results,
    };
  }
}

module.exports = {
  MessengerService,
  AppError,
  ALLOWED_REACTIONS,
};




