const fs = require("fs");
const path = require("path");

function nowIso() {
  return new Date().toISOString();
}

async function ensureColumn(db, tableName, columnName, ddl) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  if (!columns.some((col) => col.name === columnName)) {
    await db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${ddl}`);
  }
}

async function runMigrations(db, migrationsDir) {
  await db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const existing = await db.get("SELECT id FROM schema_migrations WHERE id = ?", [file]);
    if (existing) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await db.exec(sql);
    await db.run("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)", [file, nowIso()]);
  }

  // Backward compatible upgrade for previously created users table.
  await ensureColumn(db, "users", "display_name", "TEXT");
  await ensureColumn(db, "users", "avatar_url", "TEXT");
  await ensureColumn(db, "users", "bio", "TEXT");
  await ensureColumn(db, "users", "last_seen_at", "TEXT");
  await ensureColumn(db, "sessions", "username", "TEXT");
  await ensureColumn(db, "conversations", "avatar_url", "TEXT");
  await ensureColumn(db, "chat_messages", "reply_to_message_id", "INTEGER");
  await ensureColumn(db, "chat_messages", "metadata_json", "TEXT");
  await ensureColumn(db, "conversation_members", "pinned", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "conversation_members", "archived", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "conversation_members", "muted_until", "TEXT");
}

module.exports = {
  runMigrations,
};
