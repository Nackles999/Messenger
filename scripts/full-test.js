const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const { WebSocket } = require("ws");

const PORT = 3220;
const DB_PATH = path.join(process.cwd(), "data", "full-test.db");

process.env.PORT = String(PORT);
process.env.DB_PATH = DB_PATH;
process.env.INVITE_KEY = "full-test-invite";

const { start } = require("../src/server");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(pathname, { method = "GET", token = "", body = null, expectStatus } = {}) {
  const response = await fetch(`http://localhost:${PORT}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (typeof expectStatus === "number") {
    assert.equal(response.status, expectStatus, `${method} ${pathname} expected ${expectStatus}, got ${response.status}`);
    return data;
  }

  if (!response.ok) {
    throw new Error(`${method} ${pathname} failed (${response.status}): ${data.error || "unknown error"}`);
  }

  return data;
}

async function expectApiError(pathname, options, status, textIncludes = "") {
  const data = await request(pathname, { ...options, expectStatus: status });
  assert.ok(data.error, `Expected API error in ${options.method || "GET"} ${pathname}`);
  if (textIncludes) {
    assert.ok(String(data.error).includes(textIncludes), `Expected error to include "${textIncludes}", got "${data.error}"`);
  }
  return data;
}

async function waitForEvent(ws, predicate, timeoutMs = 8000) {
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
    const health = await request("/health");
    assert.equal(health.status, "ok");

    const rootResponse = await fetch(`http://localhost:${PORT}/`);
    const rootHtml = await rootResponse.text();
    assert.equal(rootResponse.status, 200);
    assert.ok(rootHtml.includes("Мессенджер для своих"));
    assert.ok(rootHtml.includes("new-chat-btn"));
    assert.ok(rootHtml.includes("create-group-modal"));
    assert.ok(rootHtml.includes("create-tab-group-btn"));

    const users = [
      { username: "alice", displayName: "Alice", password: "secret123" },
      { username: "bob", displayName: "Bob", password: "secret123" },
      { username: "carol", displayName: "Carol", password: "secret123" },
      { username: "dave", displayName: "Dave", password: "secret123" },
    ];

    const tokens = {};
    const userByName = {};

    for (const user of users) {
      const reg = await request("/api/auth/register", {
        method: "POST",
        body: {
          username: user.username,
          displayName: user.displayName,
          password: user.password,
          inviteKey: "full-test-invite",
        },
      });
      assert.ok(reg.token);
      assert.ok(reg.user.id > 0);
      tokens[user.username] = reg.token;
      userByName[user.username] = reg.user;
    }

    await expectApiError(
      "/api/auth/register",
      {
        method: "POST",
        body: {
          username: "alice",
          displayName: "Alice2",
          password: "secret123",
          inviteKey: "full-test-invite",
        },
      },
      409
    );

    await expectApiError(
      "/api/auth/login",
      {
        method: "POST",
        body: { username: "alice", password: "wrong-pass" },
      },
      401
    );

    const relogAlice = await request("/api/auth/login", {
      method: "POST",
      body: { username: "alice", password: "secret123" },
    });
    tokens.alice = relogAlice.token;

    const meAlice = await request("/api/profile/me", { token: tokens.alice });
    assert.equal(meAlice.user.username, "alice");

    await request("/api/profile/me", {
      method: "PATCH",
      token: tokens.alice,
      body: {
        displayName: "Alice Updated",
        avatar: "https://example.com/alice.png",
      },
    });

    const meAliceUpdated = await request("/api/profile/me", { token: tokens.alice });
    assert.equal(meAliceUpdated.user.displayName, "Alice Updated");
    assert.equal(meAliceUpdated.user.avatar, "https://example.com/alice.png");

    const usersSearch = await request(`/api/users/search?q=${encodeURIComponent("bo")}`, { token: tokens.alice });
    assert.ok((usersSearch.users || []).some((u) => u.username === "bob"));

    const directOpen = await request("/api/chats/direct", {
      method: "POST",
      token: tokens.alice,
      body: { username: "bob" },
    });
    const directId = directOpen.chat.id;
    assert.ok(directId > 0);

    const chatsAliceBeforeWs = await request("/api/chats", { token: tokens.alice });
    assert.ok(chatsAliceBeforeWs.chats.some((chat) => chat.id === directId && chat.type === "direct"));

    wsBob = new WebSocket(`ws://localhost:${PORT}/ws?token=${encodeURIComponent(tokens.bob)}`);
    await waitForEvent(wsBob, (event) => event.type === "ws:ready");
    wsBob.send(JSON.stringify({ type: "presence:set_active_chat", conversationId: directId }));

    const messageNewPromise = waitForEvent(
      wsBob,
      (event) => event.type === "message:new" && Number(event.conversationId) === Number(directId)
    );

    const directMsg1 = await request(`/api/chats/${directId}/messages`, {
      method: "POST",
      token: tokens.alice,
      body: { text: "Привет, Боб" },
    });
    assert.equal(directMsg1.message.text, "Привет, Боб");

    const wsDirectEvent = await messageNewPromise;
    assert.equal(wsDirectEvent.message.text, "Привет, Боб");
    assert.equal(wsDirectEvent.message.mine, false, "recipient websocket payload should have mine=false");

    const directMsg2 = await request(`/api/chats/${directId}/messages`, {
      method: "POST",
      token: tokens.bob,
      body: { text: "Это ответ", replyToMessageId: directMsg1.message.id },
    });
    assert.equal(directMsg2.message.replyToMessageId, directMsg1.message.id);

    await request(`/api/messages/${directMsg2.message.id}`, {
      method: "PATCH",
      token: tokens.bob,
      body: { text: "Это отредактированный ответ" },
    });

    await expectApiError(
      `/api/messages/${directMsg2.message.id}`,
      {
        method: "PATCH",
        token: tokens.alice,
        body: { text: "Попытка чужого редактирования" },
      },
      403
    );

    const reaction1 = await request(`/api/messages/${directMsg2.message.id}/reactions`, {
      method: "POST",
      token: tokens.alice,
      body: { emoji: "\uD83D\uDC4D" },
    });
    assert.ok(reaction1.active);
    assert.ok((reaction1.reactions || []).some((x) => x.emoji === "\uD83D\uDC4D"));

    const reaction2 = await request(`/api/messages/${directMsg2.message.id}/reactions`, {
      method: "POST",
      token: tokens.alice,
      body: { emoji: "\uD83D\uDC4D" },
    });
    assert.equal(reaction2.active, false);

    await request(`/api/chats/${directId}/read`, {
      method: "POST",
      token: tokens.bob,
    });

    const directMessages = await request(`/api/chats/${directId}/messages?limit=50`, { token: tokens.alice });
    assert.ok(directMessages.messages.some((m) => m.replyTo && m.replyTo.id === directMsg1.message.id));

    const directSearch = await request(`/api/chats/${directId}/search?q=${encodeURIComponent("ответ")}&limit=20`, {
      token: tokens.alice,
    });
    assert.ok((directSearch.results || []).length >= 1);

    await request(`/api/chats/${directId}/preferences`, {
      method: "PATCH",
      token: tokens.bob,
      body: { archived: true },
    });

    const bobArchivedBefore = await request("/api/chats?archived=true", { token: tokens.bob });
    assert.ok(bobArchivedBefore.chats.some((chat) => chat.id === directId), "direct chat should be archived for bob");

    await request(`/api/chats/${directId}/messages`, {
      method: "POST",
      token: tokens.alice,
      body: { text: "возврат из архива" },
    });

    const bobActiveAfterIncoming = await request("/api/chats", { token: tokens.bob });
    assert.ok(
      bobActiveAfterIncoming.chats.some((chat) => chat.id === directId),
      "incoming message should return archived direct chat to active list"
    );

    const groupCreate = await request("/api/chats/group", {
      method: "POST",
      token: tokens.alice,
      body: { title: "Core Team", memberUsernames: ["bob", "carol"] },
    });
    const groupId = groupCreate.chat.id;
    assert.ok(groupId > 0);

    const groupMembersInitial = await request(`/api/chats/${groupId}/group/members`, { token: tokens.alice });
    assert.equal(groupMembersInitial.members.length, 3);

    await expectApiError(
      `/api/chats/${groupId}/group/members`,
      {
        method: "POST",
        token: tokens.carol,
        body: { usernames: ["dave"] },
      },
      403
    );

    await request(`/api/chats/${groupId}/group/members`, {
      method: "POST",
      token: tokens.alice,
      body: { usernames: ["dave"] },
    });

    await request(`/api/chats/${groupId}/group/members/${userByName.bob.id}/role`, {
      method: "PATCH",
      token: tokens.alice,
      body: { role: "admin" },
    });

    await request(`/api/chats/${groupId}/group`, {
      method: "PATCH",
      token: tokens.bob,
      body: { title: "Core Team Updated" },
    });

    const groupMembersAfterAdd = await request(`/api/chats/${groupId}/group/members`, { token: tokens.bob });
    const daveMember = groupMembersAfterAdd.members.find((m) => m.user.username === "dave");
    assert.ok(daveMember);

    await request(`/api/chats/${groupId}/group/members/${daveMember.user.id}`, {
      method: "DELETE",
      token: tokens.bob,
    });

    const groupMsgFromCarol = await request(`/api/chats/${groupId}/messages`, {
      method: "POST",
      token: tokens.carol,
      body: { text: "Сообщение от Carol" },
    });

    await request(`/api/messages/${groupMsgFromCarol.message.id}`, {
      method: "DELETE",
      token: tokens.bob,
    });

    const groupMsgForSearch = await request(`/api/chats/${groupId}/messages`, {
      method: "POST",
      token: tokens.alice,
      body: { text: "needle-глобальный-поиск" },
    });
    assert.ok(groupMsgForSearch.message.id > 0);

    await request(`/api/chats/${groupId}/preferences`, {
      method: "PATCH",
      token: tokens.alice,
      body: { pinned: true, muted: true, archived: true },
    });

    const chatsActive = await request("/api/chats", { token: tokens.alice });
    assert.ok(!chatsActive.chats.some((chat) => chat.id === groupId));

    const chatsArchived = await request("/api/chats?archived=true", { token: tokens.alice });
    assert.ok(chatsArchived.chats.some((chat) => chat.id === groupId));

    await request(`/api/chats/${groupId}/preferences`, {
      method: "PATCH",
      token: tokens.alice,
      body: { archived: false },
    });

    const groupSearch = await request(`/api/chats/${groupId}/search?q=${encodeURIComponent("needle")}&limit=20`, {
      token: tokens.alice,
    });
    assert.ok((groupSearch.results || []).length >= 1);

    const globalSearch = await request(`/api/messages/search?q=${encodeURIComponent("needle")}&limit=20`, {
      token: tokens.alice,
    });
    assert.ok((globalSearch.results || []).length >= 1);

    await request(`/api/chats/${groupId}/group/leave`, {
      method: "POST",
      token: tokens.carol,
    });

    const chatsCarol = await request("/api/chats", { token: tokens.carol });
    assert.ok(!chatsCarol.chats.some((chat) => chat.id === groupId));

    await expectApiError(
      `/api/chats/${directId}/messages`,
      {
        method: "POST",
        token: tokens.bob,
        body: { text: "cross reply fail", replyToMessageId: groupMsgForSearch.message.id },
      },
      404
    );

    await request("/api/auth/logout", { method: "POST", token: tokens.alice });
    await expectApiError("/api/profile/me", { token: tokens.alice }, 401);

    if (wsBob && wsBob.readyState === WebSocket.OPEN) {
      await new Promise((resolve) => {
        wsBob.once("close", resolve);
        wsBob.close();
      });
    }

    console.log("FULL TEST: PASSED");
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
  console.error("FULL TEST: FAILED");
  console.error(error);
  process.exit(1);
});
