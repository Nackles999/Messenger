const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const PORT = 3230;
const DB_PATH = path.join(process.cwd(), "data", "ui-smoke.db");
const BASE_URL = `http://localhost:${PORT}`;
const EDGE_PATH = process.env.PLAYWRIGHT_EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

process.env.PORT = String(PORT);
process.env.DB_PATH = DB_PATH;
process.env.INVITE_KEY = "ui-smoke-invite";

const { start } = require("../src/server");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTextInSelector(page, selector, text, timeout = 12000) {
  await page.waitForFunction(
    ({ selector: selectorArg, text: textArg }) => {
      const node = document.querySelector(selectorArg);
      return !!node && String(node.textContent || "").includes(textArg);
    },
    { selector, text },
    { timeout }
  );
}

async function waitForMessageText(page, text, timeout = 12000) {
  await page.waitForFunction(
    (value) =>
      Array.from(document.querySelectorAll("#messages .msg .text, #messages .msg .system-text")).some((node) =>
        String(node.textContent || "").includes(value)
      ),
    text,
    { timeout }
  );
}

async function openChatByTitle(page, title) {
  await page.waitForFunction(
    (value) =>
      Array.from(document.querySelectorAll("#chat-list .chat-item .chat-item-title")).some((node) =>
        String(node.textContent || "").includes(value)
      ),
    title,
    { timeout: 12000 }
  );

  await page.locator("#chat-list .chat-item").filter({ hasText: title }).first().click();
  await waitForTextInSelector(page, "#chat-title", title, 12000);
}

async function registerByUi(page, { username, displayName, password, inviteKey }) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click("#tab-register");
  await page.fill("#username-input", username);
  await page.fill("#display-name-input", displayName);
  await page.fill("#password-input", password);
  await page.fill("#invite-key-input", inviteKey);
  await page.click("#auth-submit");
  await page.waitForSelector("#app-screen:not(.hidden)", { timeout: 12000 });
  await waitForTextInSelector(page, "#me-display", displayName, 12000);
}

async function sendMessage(page, text) {
  await page.fill("#composer-input", text);
  await page.click("#composer button[type='submit']");
  await waitForMessageText(page, text, 12000);
}

async function countMessagesByText(page, text) {
  return page.evaluate((value) => {
    return Array.from(document.querySelectorAll("#messages .msg .text")).filter(
      (node) => String(node.textContent || "").trim() === value
    ).length;
  }, text);
}

async function assertComposerButtonVisibleInViewport(page) {
  const metrics = await page.evaluate(() => {
    const button = document.querySelector("#composer button[type='submit']");
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    return {
      visible: rect.width > 0 && rect.height > 0,
      inViewport:
        rect.right <= window.innerWidth + 0.5 &&
        rect.left >= -0.5 &&
        rect.bottom <= window.innerHeight + 0.5 &&
        rect.top >= -0.5,
      label: String(button.textContent || "").trim(),
    };
  });

  assert.ok(metrics, "send button is missing in DOM");
  assert.ok(metrics.visible, "send button has zero size");
  assert.ok(metrics.inViewport, "send button is outside viewport");
  assert.equal(metrics.label, "Отправить");
}

async function clickMessageAction(page, messageText, buttonText) {
  const clicked = await page.evaluate(
    ({ text, action }) => {
      const messages = Array.from(document.querySelectorAll("#messages .msg"));
      const match = messages.find((node) => {
        const textNode = node.querySelector(".text");
        return textNode && String(textNode.textContent || "").includes(text);
      });
      if (!match) return false;

      const actionButton = Array.from(match.querySelectorAll("button")).find((node) =>
        String(node.textContent || "").trim().includes(action)
      );
      if (!actionButton) return false;

      actionButton.click();
      return true;
    },
    { text: messageText, action: buttonText }
  );

  assert.ok(clicked, `message action "${buttonText}" was not found for text "${messageText}"`);
}

async function clickReactionOnMessage(page, messageText, emoji) {
  const clicked = await page.evaluate(
    ({ text, emojiValue }) => {
      const messages = Array.from(document.querySelectorAll("#messages .msg"));
      const match = messages.find((node) => {
        const textNode = node.querySelector(".text");
        return textNode && String(textNode.textContent || "").includes(text);
      });
      if (!match) return false;

      const openButton = match.querySelector(".msg-react-btn");
      if (!openButton) return false;
      openButton.click();

      const reactionButton = Array.from(match.querySelectorAll(".reaction-popover .emoji-btn")).find(
        (node) => String(node.textContent || "").trim() === emojiValue
      );
      if (!reactionButton) return false;
      reactionButton.click();
      return true;
    },
    { text: messageText, emojiValue: emoji }
  );

  assert.ok(clicked, `reaction ${emoji} was not added to message "${messageText}"`);
}

async function installDialogStubs(page) {
  await page.evaluate(() => {
    if (window.__uiSmokeDialogStubs) return;

    window.__uiSmokeDialogStubs = true;
    window.__uiSmokePromptQueue = [];
    window.__uiSmokeConfirmValue = true;

    window.prompt = () => {
      if (!Array.isArray(window.__uiSmokePromptQueue) || window.__uiSmokePromptQueue.length === 0) {
        return null;
      }
      const next = window.__uiSmokePromptQueue.shift();
      if (next === null || next === undefined) return null;
      return String(next);
    };

    window.confirm = () => Boolean(window.__uiSmokeConfirmValue);
    window.alert = () => {};
  });
}

async function setPromptQueue(page, values) {
  await page.evaluate((nextValues) => {
    window.__uiSmokePromptQueue = Array.isArray(nextValues) ? [...nextValues] : [];
  }, values);
}

async function setConfirmValue(page, value) {
  await page.evaluate((nextValue) => {
    window.__uiSmokeConfirmValue = Boolean(nextValue);
  }, value);
}

async function openCreateFlow(page, mode = "direct") {
  await page.click("#new-chat-btn");
  await page.waitForSelector("#create-group-modal:not(.hidden)", { timeout: 12000 });
  if (mode === "group") {
    await page.click("#create-tab-group-btn");
    await page.waitForSelector("#create-group-view:not(.hidden)", { timeout: 12000 });
    await page.waitForSelector("#create-group-step-users:not(.hidden)", { timeout: 12000 });
  } else {
    await page.click("#create-tab-direct-btn");
    await page.waitForSelector("#create-direct-view:not(.hidden)", { timeout: 12000 });
  }
}

async function createGroupViaModal(page, title, memberUsernames) {
  await openCreateFlow(page, "group");

  let selectedCount = 0;
  for (const username of memberUsernames) {
    await page.fill("#create-group-search-input", username);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#create-group-search-results .create-user-item", { timeout: 12000 });
    await page
      .locator("#create-group-search-results .create-user-item")
      .filter({ hasText: username })
      .first()
      .click();
    selectedCount += 1;
    await page.waitForFunction(
      (count) => document.querySelectorAll("#create-group-selected .selected-chip").length >= count,
      selectedCount,
      { timeout: 12000 }
    );
  }

  await page.click("#create-group-next-btn");
  await page.waitForSelector("#create-group-step-title:not(.hidden)", { timeout: 12000 });
  await page.fill("#create-group-title-input", title);
  await page.click("#create-group-submit-btn");
  await waitForTextInSelector(page, "#chat-title", title, 12000);
}

async function run() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  if (!fs.existsSync(EDGE_PATH)) {
    throw new Error(`Edge was not found: ${EDGE_PATH}`);
  }

  const checks = [];
  const STEP_TIMEOUT_MS = 45000;
  const users = {
    alice: { username: "ui_alice", displayName: "Alice UI", password: "secret123" },
    bob: { username: "ui_bob", displayName: "Bob UI", password: "secret123" },
    charlie: { username: "ui_charlie", displayName: "Charlie UI", password: "secret123" },
  };

  const { server, db } = await start();
  let browser = null;

  async function withTimeout(name, promise, timeoutMs = STEP_TIMEOUT_MS) {
    let timer = null;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Step "${name}" timed out (${timeoutMs}ms)`)), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function step(name, fn) {
    console.log(`[UI] ${name} ... START`);
    try {
      await withTimeout(name, fn());
      checks.push({ name, ok: true });
      console.log(`[UI] ${name} ... PASS`);
    } catch (error) {
      checks.push({ name, ok: false, error: error.message });
      console.log(`[UI] ${name} ... FAIL`);
      throw error;
    }
  }

  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: EDGE_PATH,
      args: ["--disable-gpu", "--no-sandbox"],
    });

    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();
    const charlieContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();
    const charliePage = await charlieContext.newPage();

    await step("Auth screen and app title", async () => {
      await alicePage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await waitForTextInSelector(alicePage, "h1", "Мессенджер для своих");
      await alicePage.waitForSelector("#auth-screen:not(.hidden)");
    });

    await step("Alice registration via UI", async () => {
      await registerByUi(alicePage, { ...users.alice, inviteKey: "ui-smoke-invite" });
      await installDialogStubs(alicePage);
    });

    await step("Bob registration via UI", async () => {
      await registerByUi(bobPage, { ...users.bob, inviteKey: "ui-smoke-invite" });
      await installDialogStubs(bobPage);
    });

    await step("Charlie registration via UI", async () => {
      await registerByUi(charliePage, { ...users.charlie, inviteKey: "ui-smoke-invite" });
      await installDialogStubs(charliePage);
    });

    const directMessage0 = "UI direct: first ping from Bob";
    const directMessage1 = "UI direct: hello from Alice";
    const directMessage2 = "UI direct: reply from Bob";
    const editedMessage = "UI direct: hello from Alice (edited)";

    await step("Bob initiates direct chat and message reaches Alice", async () => {
      await bobPage.fill("#search-input", users.alice.username);
      await bobPage.click("#search-form button[type='submit']");
      await openChatByTitle(bobPage, users.alice.displayName);
      await assertComposerButtonVisibleInViewport(bobPage);
      await sendMessage(bobPage, directMessage0);
      await openChatByTitle(alicePage, users.bob.displayName);
      await waitForMessageText(alicePage, directMessage0, 12000);
    });

    await step("Alice opens direct chat from unified sidebar search", async () => {
      await alicePage.fill("#search-input", users.bob.username);
      await alicePage.click("#search-form button[type='submit']");
      await openChatByTitle(alicePage, users.bob.displayName);
      await assertComposerButtonVisibleInViewport(alicePage);
    });

    await step("Send message in direct chat", async () => {
      await sendMessage(alicePage, directMessage1);
    });

    await step("No duplicate when double-clicking send", async () => {
      const uniqueText = `UI no-dup ${Date.now()}`;
      await alicePage.fill("#composer-input", uniqueText);
      await alicePage.locator("#composer button[type='submit']").dblclick();
      await waitForMessageText(alicePage, uniqueText, 12000);
      await waitForMessageText(bobPage, uniqueText, 12000);
      await sleep(1200);

      const aliceCount = await countMessagesByText(alicePage, uniqueText);
      const bobCount = await countMessagesByText(bobPage, uniqueText);
      assert.equal(aliceCount, 1, "sender should see a single message");
      assert.equal(bobCount, 1, "receiver should see a single message");
    });

    await step("Realtime delivery for Bob", async () => {
      await openChatByTitle(bobPage, users.alice.displayName);
      await waitForMessageText(bobPage, directMessage1, 12000);
    });

    await step("Reply in direct chat", async () => {
      await clickMessageAction(bobPage, directMessage1, "Ответить");
      await waitForTextInSelector(bobPage, "#reply-label", "Ответ на");
      await assertComposerButtonVisibleInViewport(bobPage);
      await sendMessage(bobPage, directMessage2);
      await waitForMessageText(alicePage, directMessage2, 12000);
      await bobPage.waitForFunction(
        (value) =>
          Array.from(document.querySelectorAll("#messages .msg .reply-preview")).some((node) =>
            String(node.textContent || "").includes(value)
          ),
        directMessage1,
        { timeout: 12000 }
      );
    });

    await step("Edit and delete message in direct chat", async () => {
      await openChatByTitle(alicePage, users.bob.displayName);

      await clickMessageAction(alicePage, directMessage1, "⋯");
      await clickMessageAction(alicePage, directMessage1, "Изменить");
      await alicePage.waitForSelector("#message-edit-modal:not(.hidden)", { timeout: 12000 });
      await alicePage.fill("#message-edit-input", editedMessage);
      await alicePage.click("#message-edit-save-btn");
      await waitForMessageText(alicePage, editedMessage, 12000);

      await clickMessageAction(alicePage, editedMessage, "⋯");
      await clickMessageAction(alicePage, editedMessage, "Удалить");
      await alicePage.waitForSelector("#confirm-modal:not(.hidden)", { timeout: 12000 });
      await alicePage.click("#confirm-modal-accept-btn");
      await waitForMessageText(alicePage, "Сообщение удалено", 12000);
      await alicePage.waitForSelector("#messages .msg.deleted", { timeout: 12000 });
    });

    await step("Reactions in direct chat", async () => {
      await clickReactionOnMessage(alicePage, directMessage2, "👍");
      await alicePage.waitForFunction(
        () =>
          Array.from(document.querySelectorAll("#messages .reaction-chip")).some((node) =>
            String(node.textContent || "").includes("👍")
          ),
        { timeout: 12000 }
      );
    });

    const groupTitle = "UI Group Smoke";
    let renamedGroupTitle = "UI Group Smoke 2";
    const groupMessage = "UI group: first message";
    const groupReply = "UI group: Bob reply";

    await step("Create group via modal UI", async () => {
      await createGroupViaModal(alicePage, groupTitle, [users.bob.username]);
      await alicePage.waitForSelector("#group-info-btn:not(.hidden):not([disabled])", { timeout: 12000 });
    });

    await step("Group messages and realtime", async () => {
      await sendMessage(alicePage, groupMessage);
      await openChatByTitle(bobPage, groupTitle);
      await waitForMessageText(bobPage, groupMessage, 12000);
      await sendMessage(bobPage, groupReply);
      await waitForMessageText(alicePage, groupReply, 12000);
    });

    await step("Group management in side panel: members, rename, add user, add search", async () => {
      await openChatByTitle(alicePage, groupTitle);
      await alicePage.click("#group-info-btn");
      await alicePage.waitForSelector("#group-panel:not(.hidden)", { timeout: 12000 });
      await alicePage.waitForSelector("#group-members-list .group-member-item", { timeout: 12000 });

      const membersText = await alicePage.locator("#group-members-list").innerText();
      assert.ok(membersText.toLowerCase().includes(users.alice.username));
      assert.ok(membersText.toLowerCase().includes(users.bob.username));
      assert.ok(!membersText.toLowerCase().includes(users.charlie.username));

      await alicePage.fill("#group-rename-input", renamedGroupTitle);
      const renameInputValue = await alicePage.inputValue("#group-rename-input");
      assert.equal(renameInputValue, renamedGroupTitle, "rename input should contain a new title");
      await alicePage.click("#group-rename-submit-btn");
      await waitForTextInSelector(alicePage, "#group-panel-feedback", "Название обновлено", 12000);
      let renameApplied = false;
      let panelTitleSnapshot = "";
      let chatTitleSnapshot = "";
      for (let i = 0; i < 20; i += 1) {
        panelTitleSnapshot = (await alicePage.locator("#group-panel-title").innerText()).trim();
        chatTitleSnapshot = (await alicePage.locator("#chat-title").innerText()).trim();
        if (panelTitleSnapshot.includes(renamedGroupTitle) || chatTitleSnapshot.includes(renamedGroupTitle)) {
          renameApplied = true;
          break;
        }
        await sleep(300);
      }
      if (!renameApplied) {
        throw new Error(
          `Rename result not reflected in UI. Panel="${panelTitleSnapshot}" Chat="${chatTitleSnapshot}" Target="${renamedGroupTitle}"`
        );
      }

      await alicePage.click("#group-add-open-btn");
      await alicePage.waitForSelector("#group-add-modal:not(.hidden)", { timeout: 12000 });

      await alicePage.fill("#group-add-modal-input", users.bob.username);
      await alicePage.click("#group-add-modal-search-form button[type='submit']");
      await alicePage.waitForFunction(
        () => {
          const state = document.querySelector("#group-add-modal-state");
          return !!state && String(state.textContent || "").trim().length > 0;
        },
        { timeout: 12000 }
      );

      await alicePage.fill("#group-add-modal-input", users.charlie.username);
      await alicePage.click("#group-add-modal-search-form button[type='submit']");
      await alicePage.waitForSelector("#group-add-modal-results-list .create-user-item", { timeout: 12000 });
      await alicePage
        .locator("#group-add-modal-results-list .create-user-item")
        .filter({ hasText: users.charlie.username })
        .first()
        .click();
      await alicePage.click("#group-add-modal-submit-btn");
      await alicePage.waitForSelector("#group-add-modal", { state: "hidden", timeout: 12000 });

      await waitForTextInSelector(alicePage, "#group-panel-feedback", `Добавлен @${users.charlie.username}`, 12000);
      await alicePage.waitForFunction(
        (username) =>
          Array.from(document.querySelectorAll("#group-members-list .group-member-item .username")).some((node) =>
            String(node.textContent || "").toLowerCase().includes(username.toLowerCase())
          ),
        users.charlie.username,
        { timeout: 12000 }
      );
      await waitForMessageText(alicePage, "изменил название группы", 12000);
    await waitForMessageText(alicePage, `добавил ${users.charlie.displayName}`, 12000);

      await charliePage.waitForFunction(
        (title) =>
          Array.from(document.querySelectorAll("#chat-list .chat-item .chat-item-title")).some((node) =>
            String(node.textContent || "").includes(title)
          ),
        renamedGroupTitle,
        { timeout: 12000 }
      );

      await alicePage.click("#group-panel-close-btn");
      await alicePage.waitForFunction(() => {
        const panel = document.querySelector("#group-panel");
        return !!panel && panel.classList.contains("hidden");
      });
    });

    await step("Search inside current chat", async () => {
      await alicePage.fill("#chat-search-input", "group");
      await alicePage.click("#chat-search-form button[type='submit']");
      await alicePage.waitForSelector("#chat-search-results .search-result-item", { timeout: 12000 });
    });

    await step("Pin, mute and archive chat", async () => {
      await alicePage.click("#chat-pin-btn");
      await alicePage.click("#chat-mute-btn");
      await alicePage.waitForFunction(
        () =>
          Array.from(document.querySelectorAll("#chat-list .chat-item.active .chat-item-flags .chat-flag")).some((node) =>
            String(node.textContent || "").includes("Закреплен")
          ),
        { timeout: 12000 }
      );

      await alicePage.click("#chat-archive-btn");
      await alicePage.waitForFunction(
        (title) =>
          !Array.from(document.querySelectorAll("#chat-list .chat-item .chat-item-title")).some((node) =>
            String(node.textContent || "").includes(title)
          ),
        renamedGroupTitle,
        { timeout: 12000 }
      );

      await alicePage.click("#archive-toggle-btn");
      await openChatByTitle(alicePage, renamedGroupTitle);

      await alicePage.click("#chat-archive-btn");
      await alicePage.click("#archive-toggle-btn");
      await openChatByTitle(alicePage, renamedGroupTitle);
    });

    await step("No client fetch errors shown", async () => {
      const stateTextAlice = await alicePage.locator("#messages-state").innerText();
      const stateTextBob = await bobPage.locator("#messages-state").innerText();
      assert.ok(!String(stateTextAlice).includes("Failed to fetch"));
      assert.ok(!String(stateTextBob).includes("Failed to fetch"));
    });

    await step("Logout flow", async () => {
      await alicePage.click("#logout-btn");
      await alicePage.waitForSelector("#auth-screen:not(.hidden)", { timeout: 12000 });
    });

    console.log("\nUI SMOKE CHECKLIST:");
    checks.forEach((item, index) => {
      const status = item.ok ? "PASS" : `FAIL: ${item.error}`;
      console.log(`${index + 1}. ${item.name} -> ${status}`);
    });
    console.log("UI SMOKE: PASSED");
  } finally {
    if (browser) {
      await browser.close();
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

run().catch((error) => {
  console.error("UI SMOKE: FAILED");
  console.error(error);
  process.exit(1);
});
