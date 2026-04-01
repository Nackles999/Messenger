require("dotenv").config();

const path = require("path");
const config = require("../src/config");
const { createDatabase } = require("../src/db/client");
const { runMigrations } = require("../src/db/migrate");
const { hashPassword } = require("../src/security");

function nowIso() {
  return new Date().toISOString();
}

function directKey(a, b) {
  const sorted = [Number(a), Number(b)].sort((x, y) => x - y);
  return `direct:${sorted[0]}:${sorted[1]}`;
}

function avatarFor(seed) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

async function ensureUser(db, { username, displayName, password }) {
  const existing = await db.get(
    "SELECT id, username, display_name, avatar_url FROM users WHERE username = ? COLLATE NOCASE",
    [username]
  );
  if (existing) return existing;

  const insert = await db.run(
    `
      INSERT INTO users (username, display_name, avatar_url, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [username, displayName, avatarFor(username), hashPassword(password), nowIso()]
  );

  return db.get("SELECT id, username, display_name, avatar_url FROM users WHERE id = ?", [insert.lastID]);
}

async function ensureDirectConversation(db, userAId, userBId) {
  const key = directKey(userAId, userBId);
  let row = await db.get("SELECT id FROM conversations WHERE direct_key = ?", [key]);
  if (!row) {
    const createdAt = nowIso();
    const insert = await db.run(
      `
        INSERT INTO conversations (type, direct_key, created_by, created_at)
        VALUES ('direct', ?, ?, ?)
      `,
      [key, userAId, createdAt]
    );
    row = { id: insert.lastID };

    await db.run(
      `
        INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at)
        VALUES (?, ?, 'member', ?)
      `,
      [row.id, userAId, createdAt]
    );

    await db.run(
      `
        INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at)
        VALUES (?, ?, 'member', ?)
      `,
      [row.id, userBId, createdAt]
    );
  }

  return row.id;
}

async function ensureGroupConversation(db, ownerId, title, memberIds) {
  let row = await db.get(
    `
      SELECT id
      FROM conversations
      WHERE type = 'group' AND created_by = ? AND title = ?
      LIMIT 1
    `,
    [ownerId, title]
  );

  if (!row) {
    const createdAt = nowIso();
    const insert = await db.run(
      `
        INSERT INTO conversations (type, title, avatar_url, created_by, created_at)
        VALUES ('group', ?, ?, ?, ?)
      `,
      [title, avatarFor(title), ownerId, createdAt]
    );
    row = { id: insert.lastID };

    await db.run(
      `
        INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at)
        VALUES (?, ?, 'owner', ?)
      `,
      [row.id, ownerId, createdAt]
    );

    for (const memberId of memberIds) {
      if (memberId === ownerId) continue;
      await db.run(
        `
          INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at)
          VALUES (?, ?, 'member', ?)
        `,
        [row.id, memberId, createdAt]
      );
    }
  }

  return row.id;
}

async function ensureDirectMessages(db, conversationId, senderA, senderB) {
  const any = await db.get("SELECT id FROM chat_messages WHERE conversation_id = ? LIMIT 1", [conversationId]);
  if (any) return;

  const at = nowIso();

  const m1 = await db.run(
    `
      INSERT INTO chat_messages (conversation_id, sender_id, text, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [conversationId, senderA.id, "Hey, this is a seeded direct chat.", at]
  );

  await db.run(
    `
      INSERT INTO message_receipts (message_id, user_id, delivered_at, read_at)
      VALUES (?, ?, ?, ?)
    `,
    [m1.lastID, senderB.id, at, at]
  );

  const m2 = await db.run(
    `
      INSERT INTO chat_messages (conversation_id, sender_id, text, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [conversationId, senderB.id, "Great, now we can continue from MVP.", at]
  );

  await db.run(
    `
      INSERT INTO message_receipts (message_id, user_id, delivered_at, read_at)
      VALUES (?, ?, ?, ?)
    `,
    [m2.lastID, senderA.id, at, at]
  );
}

async function ensureGroupMessages(db, groupId, users) {
  const any = await db.get("SELECT id FROM chat_messages WHERE conversation_id = ? LIMIT 1", [groupId]);
  if (any) return;

  const at = nowIso();
  const members = [users.alex.id, users.sam.id, users.kate.id];

  const m1 = await db.run(
    `
      INSERT INTO chat_messages (conversation_id, sender_id, text, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [groupId, users.alex.id, "Welcome to the project group. Let's ship this MVP.", at]
  );

  const m2 = await db.run(
    `
      INSERT INTO chat_messages (conversation_id, sender_id, text, reply_to_message_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [groupId, users.sam.id, "Roger that. I'll take backend routes and moderation.", m1.lastID, at]
  );

  await db.run(
    `
      INSERT INTO chat_messages (conversation_id, sender_id, text, reply_to_message_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [groupId, users.kate.id, "I'll check the UI and states (loading/empty/error).", m2.lastID, at]
  );

  for (const messageId of [m1.lastID, m2.lastID]) {
    const senderId = messageId === m1.lastID ? users.alex.id : users.sam.id;
    for (const userId of members) {
      if (userId === senderId) continue;
      await db.run(
        `
          INSERT OR IGNORE INTO message_receipts (message_id, user_id, delivered_at, read_at)
          VALUES (?, ?, ?, ?)
        `,
        [messageId, userId, at, at]
      );
    }
  }

  await db.run(
    `
      INSERT OR IGNORE INTO message_reactions (message_id, user_id, emoji, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [m1.lastID, users.sam.id, "\uD83D\uDC4D", at]
  );

  await db.run(
    `
      INSERT OR IGNORE INTO message_reactions (message_id, user_id, emoji, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [m1.lastID, users.kate.id, "\uD83D\uDD25", at]
  );

  await db.run(
    `
      UPDATE conversation_members
      SET pinned = 1
      WHERE conversation_id = ? AND user_id = ?
    `,
    [groupId, users.alex.id]
  );

  await db.run(
    `
      UPDATE conversation_members
      SET role = 'admin'
      WHERE conversation_id = ? AND user_id = ?
    `,
    [groupId, users.sam.id]
  );
}

async function main() {
  const db = createDatabase(config.dbPath);
  await runMigrations(db, path.join(__dirname, "..", "src", "db", "migrations"));

  const users = {
    alex: await ensureUser(db, { username: "demo_alex", displayName: "Alex", password: "demo1234" }),
    sam: await ensureUser(db, { username: "demo_sam", displayName: "Sam", password: "demo1234" }),
    kate: await ensureUser(db, { username: "demo_kate", displayName: "Kate", password: "demo1234" }),
    ivan: await ensureUser(db, { username: "demo_ivan", displayName: "Ivan", password: "demo1234" }),
  };

  const directId = await ensureDirectConversation(db, users.alex.id, users.sam.id);
  await ensureDirectMessages(db, directId, users.alex, users.sam);

  const groupId = await ensureGroupConversation(db, users.alex.id, "Project Crew", [users.sam.id, users.kate.id]);
  await ensureGroupMessages(db, groupId, users);

  console.log("Seed completed");
  console.log("Users:");
  console.log("- demo_alex / demo1234");
  console.log("- demo_sam / demo1234");
  console.log("- demo_kate / demo1234");
  console.log("- demo_ivan / demo1234");
  console.log("Group:");
  console.log("- Project Crew (owner: demo_alex, admin: demo_sam)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
