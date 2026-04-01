const path = require("path");

module.exports = {
  port: Number(process.env.PORT) || 3000,
  inviteKey: process.env.INVITE_KEY || "friends-invite-2026",
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS) || 30,
  maxMessagesPerChat: Number(process.env.MAX_MESSAGES_PER_CHAT) || 100,
  dbPath: process.env.DB_PATH || path.join(process.cwd(), "data", "messenger.db"),
  authRateLimitWindowMs: 15 * 60 * 1000,
  authRateLimitMax: 40,
};
