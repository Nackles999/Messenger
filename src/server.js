require("dotenv").config();

const path = require("path");
const http = require("http");
const config = require("./config");
const { createDatabase } = require("./db/client");
const { runMigrations } = require("./db/migrate");
const { MessengerService } = require("./messengerService");
const { createApp } = require("./createApp");
const { createRealtimeHub } = require("./realtimeHub");

async function start() {
  const db = createDatabase(config.dbPath);
  await runMigrations(db, path.join(__dirname, "db", "migrations"));

  const service = new MessengerService(db, config, null);
  await service.cleanupExpiredSessions();

  const app = createApp({ service, config });
  const server = http.createServer(app);

  const hub = createRealtimeHub({ server, service });
  service.setHub(hub);

  const cleanupTimer = setInterval(() => {
    service.cleanupExpiredSessions().catch((error) => {
      console.error("cleanupExpiredSessions error", error);
    });
  }, 10 * 60 * 1000);
  cleanupTimer.unref();

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, () => {
      resolve();
    });
  });

  console.log(`Messenger MVP started on http://localhost:${config.port}`);
  console.log(`Database: ${config.dbPath}`);
  console.log(`Invite key: ${config.inviteKey}`);

  return { db, app, server, service, hub };
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
}

module.exports = {
  start,
};
