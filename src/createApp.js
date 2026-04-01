const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { createAuthMiddleware, parseBearerToken } = require("./authMiddleware");
const { AppError, ALLOWED_REACTIONS } = require("./messengerService");

const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const DOCUMENT_EXTENSIONS = new Set([".pdf", ".txt", ".doc", ".docx", ".xls", ".xlsx"]);
const ALL_ATTACHMENT_MIME_TYPES = new Set([...PHOTO_MIME_TYPES, ...DOCUMENT_MIME_TYPES]);
const MAX_ATTACHMENT_BYTES = 12 * 1024 * 1024;
const MIME_TO_EXTENSION = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["application/pdf", ".pdf"],
  ["text/plain", ".txt"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.ms-excel", ".xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
]);

function normalizeMimeType(raw) {
  return String(raw || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
}

function inferAttachmentKind(mimeType) {
  const cleanMime = normalizeMimeType(mimeType);
  return PHOTO_MIME_TYPES.has(cleanMime) ? "photo" : "attachment";
}

function hasAllowedExtension(originalName, kind) {
  const extension = String(path.extname(String(originalName || "")).toLowerCase()).trim();
  if (!extension) return true;
  if (kind === "photo") return PHOTO_EXTENSIONS.has(extension);
  return DOCUMENT_EXTENSIONS.has(extension);
}

function sanitizeOriginalFileName(raw) {
  const source = path.basename(String(raw || "").replaceAll("\\", "/"));
  const cleaned = source.replace(/[\x00-\x1f<>:"/\\|?*]+/g, " ").replace(/\s+/g, " ").trim();
  const capped = cleaned.slice(0, 120);
  return capped || "file";
}

function parsePositiveInt(raw, label) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`Некорректный параметр: ${label}.`, 400);
  }
  return value;
}

function createApp({ service, config }) {
  const app = express();
  const auth = createAuthMiddleware(service);

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(express.json({ limit: "8mb" }));
  app.use(express.static(path.join(process.cwd(), "public")));

  const messageUploadsDir = path.join(process.cwd(), "public", "uploads", "messages");
  fs.mkdirSync(messageUploadsDir, { recursive: true });
  const uploadMessageAttachment = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, messageUploadsDir);
      },
      filename: (_req, file, callback) => {
        const cleanMime = normalizeMimeType(file?.mimetype);
        const mappedExtension = MIME_TO_EXTENSION.get(cleanMime) || "";
        const fallbackExt = String(path.extname(String(file?.originalname || "")).toLowerCase()).replace(/[^.a-z0-9]/g, "");
        const extension = (mappedExtension || fallbackExt || "").slice(0, 10);
        callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
      },
    }),
    limits: {
      files: 1,
      fileSize: MAX_ATTACHMENT_BYTES,
    },
    fileFilter: (_req, file, callback) => {
      const cleanMime = normalizeMimeType(file?.mimetype);
      if (!ALL_ATTACHMENT_MIME_TYPES.has(cleanMime)) {
        callback(new AppError("Неподдерживаемый тип файла. Разрешены фото и документы.", 400));
        return;
      }
      const kind = inferAttachmentKind(cleanMime);
      if (!hasAllowedExtension(file?.originalname, kind)) {
        callback(new AppError("Неподдерживаемое расширение файла.", 400));
        return;
      }
      callback(null, true);
    },
  });

  const authLimiter = rateLimit({
    windowMs: config.authRateLimitWindowMs,
    max: config.authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Слишком много попыток. Попробуйте позже." },
  });

  app.get("/health", async (_req, res) => {
    res.json({ status: "ok", uptimeSec: Math.floor(process.uptime()) });
  });

  app.post("/api/auth/register", authLimiter, async (req, res, next) => {
    try {
      const result = await service.registerUser({
        username: req.body?.username,
        displayName: req.body?.displayName,
        avatar: req.body?.avatar,
        password: req.body?.password,
        inviteKey: req.body?.inviteKey,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res, next) => {
    try {
      const result = await service.loginUser({
        username: req.body?.username,
        password: req.body?.password,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/logout", async (req, res, next) => {
    try {
      await service.deleteSession(parseBearerToken(req));
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/profile/me", auth, async (req, res, next) => {
    try {
      const profile = await service.getMyProfile(req.auth.user.id);
      res.json({ user: profile });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/profile/me", auth, async (req, res, next) => {
    try {
      const profile = await service.updateMyProfile(req.auth.user.id, {
        username: req.body?.username,
        displayName: req.body?.displayName,
        avatar: req.body?.avatar,
        bio: req.body?.bio,
      });
      res.json({ user: profile });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/search", auth, async (req, res, next) => {
    try {
      const users = await service.searchUsers(req.auth.user.id, req.query.q);
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sidebar-search", auth, async (req, res, next) => {
    try {
      const result = await service.searchSidebar(req.auth.user.id, req.query.q, {
        userLimitRaw: req.query.userLimit,
        groupLimitRaw: req.query.groupLimit,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chats", auth, async (req, res, next) => {
    try {
      const chats = await service.listChats(req.auth.user.id, {
        archived: req.query.archived,
      });
      res.json({ chats });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chats/direct", auth, async (req, res, next) => {
    try {
      const result = await service.ensureDirectConversation(req.auth.user.id, req.body?.username);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chats/group", auth, async (req, res, next) => {
    try {
      const result = await service.createGroupConversation(req.auth.user.id, {
        title: req.body?.title,
        avatar: req.body?.avatar,
        memberUsernames: req.body?.memberUsernames || req.body?.usernames || [],
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/chats/:chatId/group", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const chat = await service.renameGroupConversation(req.auth.user.id, chatId, {
        title: req.body?.title,
        avatar: req.body?.avatar,
      });
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chats/:chatId/group/members", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const members = await service.listGroupMembers(req.auth.user.id, chatId);
      res.json({ members });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chats/:chatId/group/members", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const result = await service.addGroupMembers(req.auth.user.id, chatId, req.body?.usernames || req.body?.memberUsernames || []);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/chats/:chatId/group/members/:userId/role", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const targetUserId = parsePositiveInt(req.params.userId, "id пользователя");
      const result = await service.setGroupMemberRole(req.auth.user.id, chatId, targetUserId, req.body?.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/chats/:chatId/group/members/:userId", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const targetUserId = parsePositiveInt(req.params.userId, "id пользователя");
      const result = await service.removeGroupMember(req.auth.user.id, chatId, targetUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chats/:chatId/group/leave", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const result = await service.leaveGroup(req.auth.user.id, chatId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/chats/:chatId/preferences", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const chat = await service.setChatPreferences(req.auth.user.id, chatId, {
        pinned: req.body?.pinned,
        muted: req.body?.muted,
        archived: req.body?.archived,
      });
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chats/:chatId/messages", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const result = await service.listMessages(
        req.auth.user.id,
        chatId,
        req.query.limit,
        req.query.aroundMessageId,
        req.query.window
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chats/:chatId/messages", auth, uploadMessageAttachment.single("attachment"), async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const attachment = req.file
        ? {
          kind: inferAttachmentKind(req.file.mimetype),
          originalFileName: sanitizeOriginalFileName(req.file.originalname),
          storedFileName: req.file.filename,
          mimeType: normalizeMimeType(req.file.mimetype),
          fileSize: Number(req.file.size || 0),
          fileUrl: `/uploads/messages/${encodeURIComponent(req.file.filename)}`,
        }
        : null;

      const message = await service.sendMessage(req.auth.user.id, chatId, {
        text: req.body?.text,
        replyToMessageId: req.body?.replyToMessageId,
        forwardFromMessageId: req.body?.forwardFromMessageId,
        attachment,
      });
      res.status(201).json({ message });
    } catch (error) {
      if (req.file?.path) {
        fs.promises.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  });

  app.post("/api/chats/:chatId/read", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const result = await service.markConversationRead(req.auth.user.id, chatId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chats/:chatId/search", auth, async (req, res, next) => {
    try {
      const chatId = parsePositiveInt(req.params.chatId, "id чата");
      const result = await service.searchMessagesInChat(
        req.auth.user.id,
        chatId,
        req.query.q,
        req.query.limit,
        req.query.offset
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/messages/search", auth, async (req, res, next) => {
    try {
      const result = await service.searchMessagesGlobal(req.auth.user.id, req.query.q, req.query.limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/messages/:messageId", auth, async (req, res, next) => {
    try {
      const messageId = parsePositiveInt(req.params.messageId, "id сообщения");
      const message = await service.editMessage(req.auth.user.id, messageId, req.body?.text);
      res.json({ message });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/messages/:messageId", auth, async (req, res, next) => {
    try {
      const messageId = parsePositiveInt(req.params.messageId, "id сообщения");
      const result = await service.deleteMessage(req.auth.user.id, messageId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/messages/:messageId/reactions", auth, async (req, res, next) => {
    try {
      const messageId = parsePositiveInt(req.params.messageId, "id сообщения");
      const result = await service.toggleReaction(req.auth.user.id, messageId, req.body?.emoji);
      res.json({
        ...result,
        allowedReactions: ALLOWED_REACTIONS,
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "Файл слишком большой. Выберите файл поменьше." });
        return;
      }
      res.status(400).json({ error: "Не удалось загрузить файл." });
      return;
    }

    if (err && err.type === "entity.too.large") {
      res.status(413).json({ error: "Файл слишком большой. Выберите изображение поменьше." });
      return;
    }

    if (err instanceof AppError) {
      res.status(err.status).json({ error: err.message });
      return;
    }

    if (err && err.status && err.message) {
      res.status(err.status).json({ error: err.message });
      return;
    }

    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  });

  return app;
}

module.exports = {
  createApp,
};

