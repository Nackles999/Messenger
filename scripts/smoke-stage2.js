const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const { WebSocket } = require("ws");

const PORT = 3210;
const DB_PATH = path.join(process.cwd(), "data", "stage2-smoke.db");

process.env.PORT = String(PORT);
process.env.DB_PATH = DB_PATH;
process.env.INVITE_KEY = "stage2-invite";

const { start } = require("../src/server");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(pathname, { method = "GET", token = "", body = null } = {}) {
  const response = await fetch(`http://localhost:${PORT}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${method} ${pathname} failed (${response.status}): ${json.error || "unknown"}`);
  }
  return json;
}

async function waitForEvent(ws, predicate, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("WebSocket event timeout"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      ws.off("message", onMessage);
      ws.off("close", onClose);
      ws.off("error", onError);
    }

    function onMessage(raw) {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (!predicate(payload)) return;

      cleanup();
      resolve(payload);
    }

    function onClose(code, reason) {
      cleanup();
      reject(new Error(`WebSocket closed: ${code} ${String(reason || "")}`));
    }

    function onError(error) {
      cleanup();
      reject(error);
    }

    ws.on("message", onMessage);
    ws.on("close", onClose);
    ws.on("error", onError);
  });
}

async function main() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const boot = await start();
  const { server, db } = boot;
  let wsBob = null;

  try {
    const users = [
      { username: "alice", displayName: "Alice" },
      { username: "bob", displayName: "Bob" },
      { username: "carol", displayName: "Carol" },
      { username: "dave", displayName: "Dave" },
    ];

    const tokens = {};

    for (const user of users) {
      const reg = await request("/api/auth/register", {
        method: "POST",
        body: {
          username: user.username,
          displayName: user.displayName,
          password: "secret123",
          inviteKey: "stage2-invite",
        },
      });
      assert.ok(reg.token, "register should return token");
      tokens[user.username] = reg.token;
    }

    await request("/api/auth/logout", { method: "POST", token: tokens.alice });
    const reloginAlice = await request("/api/auth/login", {
      method: "POST",
      body: { username: "alice", password: "secret123" },
    });
    tokens.alice = reloginAlice.token;

    console.log("Connecting websocket as bob...");
    wsBob = new WebSocket(`ws://localhost:${PORT}/ws?token=${encodeURIComponent(tokens.bob)}`);
    await waitForEvent(wsBob, (event) => event.type === "ws:ready");
    console.log("Websocket ready");

    const directOpen = await request("/api/chats/direct", {
      method: "POST",
      token: tokens.alice,
      body: { username: "bob" },
    });
    const directId = directOpen.chat.id;
    assert.ok(directId > 0, "direct chat id should be positive");

    wsBob.send(JSON.stringify({ type: "presence:set_active_chat", conversationId: directId }));

    const wsDirectPromise = waitForEvent(
      wsBob,
      (event) => event.type === "message:new" && Number(event.conversationId) === Number(directId)
    );

    const directMsg1 = await request(`/api/chats/${directId}/messages`, {
      method: "POST",
      token: tokens.alice,
      body: { text: "hello bob" },
    });
    assert.equal(directMsg1.message.text, "hello bob");

    const wsNewDirect = await wsDirectPromise;
    assert.equal(wsNewDirect.message.text, "hello bob");

    const directMsg2 = await request(`/api/chats/${directId}/messages`, {
      method: "POST",
      token: tokens.alice,
      body: { text: "this is a reply", replyToMessageId: directMsg1.message.id },
    });
    assert.equal(directMsg2.message.replyToMessageId, directMsg1.message.id);

    await request(`/api/messages/${directMsg1.message.id}`, {
      method: "PATCH",
      token: tokens.alice,
      body: { text: "hello bob edited" },
    });

    await request(`/api/messages/${directMsg2.message.id}/reactions`, {
      method: "POST",
      token: tokens.bob,
      body: { emoji: "\uD83D\uDC4D" },
    });

    const directMessages = await request(`/api/chats/${directId}/messages?limit=50`, {
      token: tokens.alice,
    });
    assert.ok(directMessages.messages.some((m) => m.replyTo && m.replyTo.id === directMsg1.message.id));
    assert.ok(directMessages.messages.some((m) => (m.reactions || []).length > 0));

    const directChatSearch = await request(`/api/chats/${directId}/search?q=${encodeURIComponent("reply")}&limit=10`, {
      token: tokens.alice,
    });
    assert.ok((directChatSearch.results || []).length >= 1, "chat search should find direct message");

    const globalSearch = await request(`/api/messages/search?q=${encodeURIComponent("hello")}&limit=20`, {
      token: tokens.alice,
    });
    assert.ok((globalSearch.results || []).length >= 1, "global search should return matches");

    const groupCreate = await request("/api/chats/group", {
      method: "POST",
      token: tokens.alice,
      body: {
        title: "Core Team",
        memberUsernames: ["bob", "carol"],
      },
    });
    const groupId = groupCreate.chat.id;
    assert.ok(groupId > 0, "group chat id should be positive");

    const groupMembersInitial = await request(`/api/chats/${groupId}/group/members`, {
      token: tokens.alice,
    });
    assert.equal(groupMembersInitial.members.length, 3);

    await request(`/api/chats/${groupId}/group/members/2/role`, {
      method: "PATCH",
      token: tokens.alice,
      body: { role: "admin" },
    });

    await request(`/api/chats/${groupId}/group/members`, {
      method: "POST",
      token: tokens.bob,
      body: { usernames: ["dave"] },
    });

    const membersAfterAdd = await request(`/api/chats/${groupId}/group/members`, {
      token: tokens.bob,
    });
    assert.ok(membersAfterAdd.members.some((member) => member.user.username === "dave"));

    const daveId = membersAfterAdd.members.find((member) => member.user.username === "dave").user.id;

    await request(`/api/chats/${groupId}/group/members/${daveId}`, {
      method: "DELETE",
      token: tokens.bob,
    });

    await request(`/api/chats/${groupId}/group`, {
      method: "PATCH",
      token: tokens.bob,
      body: { title: "Core Team v2" },
    });

    const groupMsgCarol = await request(`/api/chats/${groupId}/messages`, {
      method: "POST",
      token: tokens.carol,
      body: { text: "I am here in group" },
    });

    await request(`/api/messages/${groupMsgCarol.message.id}`, {
      method: "DELETE",
      token: tokens.bob,
    });

    const groupMsgAlice = await request(`/api/chats/${groupId}/messages`, {
      method: "POST",
      token: tokens.alice,
      body: { text: "Please review my message" },
    });

    const groupReplyBob = await request(`/api/chats/${groupId}/messages`, {
      method: "POST",
      token: tokens.bob,
      body: { text: "Reply in group", replyToMessageId: groupMsgAlice.message.id },
    });
    assert.equal(groupReplyBob.message.replyToMessageId, groupMsgAlice.message.id);

    await request(`/api/messages/${groupMsgAlice.message.id}/reactions`, {
      method: "POST",
      token: tokens.carol,
      body: { emoji: "\uD83D\uDD25" },
    });

    await request(`/api/chats/${groupId}/preferences`, {
      method: "PATCH",
      token: tokens.alice,
      body: { pinned: true, muted: true },
    });

    await request(`/api/chats/${groupId}/preferences`, {
      method: "PATCH",
      token: tokens.alice,
      body: { archived: true },
    });

    const chatsVisible = await request("/api/chats", { token: tokens.alice });
    assert.ok(!chatsVisible.chats.some((chat) => chat.id === groupId), "archived chat should disappear from active list");

    const chatsArchived = await request("/api/chats?archived=true", { token: tokens.alice });
    assert.ok(chatsArchived.chats.some((chat) => chat.id === groupId), "archived chat should be visible in archived list");

    await request(`/api/chats/${groupId}/preferences`, {
      method: "PATCH",
      token: tokens.alice,
      body: { archived: false },
    });

    const groupSearch = await request(`/api/chats/${groupId}/search?q=${encodeURIComponent("Reply")}&limit=10`, {
      token: tokens.alice,
    });
    assert.ok((groupSearch.results || []).length >= 1, "group search should return reply message");

    await request(`/api/chats/${groupId}/group/leave`, {
      method: "POST",
      token: tokens.carol,
    });

    const chatsCarol = await request("/api/chats", { token: tokens.carol });
    assert.ok(!chatsCarol.chats.some((chat) => chat.id === groupId), "left group should be removed from chat list");

    await request(`/api/chats/${directId}/read`, {
      method: "POST",
      token: tokens.bob,
    });

    const health = await request("/health");
    assert.equal(health.status, "ok");

    if (wsBob && wsBob.readyState === WebSocket.OPEN) {
      await new Promise((resolve) => {
        wsBob.once("close", resolve);
        wsBob.close();
      });
    }
    console.log("Stage-2 smoke test passed");
  } finally {
    if (wsBob && wsBob.readyState === WebSocket.OPEN) {
      wsBob.close();
    }
    await sleep(100);
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve, reject) => {
      db.raw.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
