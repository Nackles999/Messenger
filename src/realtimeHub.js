const { WebSocketServer, WebSocket } = require("ws");

function createRealtimeHub({ server, service }) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const socketsByUserId = new Map();
  const stateBySocket = new Map();

  function addSocket(userId, ws) {
    if (!socketsByUserId.has(userId)) {
      socketsByUserId.set(userId, new Set());
    }
    socketsByUserId.get(userId).add(ws);
  }

  function removeSocket(userId, ws) {
    const set = socketsByUserId.get(userId);
    if (!set) {
      return;
    }
    set.delete(ws);
    if (set.size === 0) {
      socketsByUserId.delete(userId);
    }
  }

  function safeSend(ws, payload) {
    if (ws.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify(payload));
  }

  function sendToUsers(userIds, payload) {
    const unique = [...new Set(userIds.map((id) => Number(id)).filter((id) => Number.isInteger(id)))];
    for (const userId of unique) {
      const set = socketsByUserId.get(userId);
      if (!set) {
        continue;
      }
      for (const ws of set) {
        safeSend(ws, payload);
      }
    }
  }

  function isUserOnline(userId) {
    const set = socketsByUserId.get(Number(userId));
    if (!set) {
      return false;
    }
    for (const ws of set) {
      if (ws.readyState === WebSocket.OPEN) {
        return true;
      }
    }
    return false;
  }

  function isUserActiveInConversation(userId, conversationId) {
    const set = socketsByUserId.get(Number(userId));
    if (!set) {
      return false;
    }
    const target = Number(conversationId);
    for (const ws of set) {
      const state = stateBySocket.get(ws);
      if (ws.readyState === WebSocket.OPEN && state && state.activeConversationId === target) {
        return true;
      }
    }
    return false;
  }

  async function broadcastPresenceUpdate(userId, isOnline, lastSeenAt = null) {
    const normalizedUserId = Number(userId);
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return;
    }

    let audience = [];
    try {
      audience = await service.getPresenceAudienceUserIds(normalizedUserId);
    } catch {
      audience = [];
    }

    sendToUsers([...audience, normalizedUserId], {
      type: "presence:update",
      userId: normalizedUserId,
      isOnline: Boolean(isOnline),
      online: Boolean(isOnline),
      lastSeenAt: lastSeenAt ? String(lastSeenAt) : null,
    });
  }

  wss.on("connection", (ws, req) => {
    (async () => {
      try {
        const url = new URL(req.url, "http://localhost");
        const token = String(url.searchParams.get("token") || "").trim();
        const session = await service.getSessionByToken(token);

        if (!session) {
          ws.close(4001, "Unauthorized");
          return;
        }

        const userId = session.user.id;
        const wasOnline = isUserOnline(userId);
        addSocket(userId, ws);
        stateBySocket.set(ws, {
          userId,
          activeConversationId: null,
        });

        safeSend(ws, {
          type: "ws:ready",
          user: session.user,
        });

        if (!wasOnline) {
          broadcastPresenceUpdate(userId, true).catch(() => {});
        }

        ws.on("message", async (raw) => {
          let event;
          try {
            event = JSON.parse(raw.toString());
          } catch {
            safeSend(ws, { type: "ws:error", error: "Invalid message format" });
            return;
          }

          const state = stateBySocket.get(ws);
          if (!state) {
            return;
          }

          if (event.type === "presence:set_active_chat") {
            const conversationId = Number(event.conversationId);
            if (!Number.isInteger(conversationId) || conversationId <= 0) {
              state.activeConversationId = null;
              return;
            }

            try {
              await service.assertConversationMember(state.userId, conversationId);
              state.activeConversationId = conversationId;
            } catch {
              state.activeConversationId = null;
            }
            return;
          }

          if (event.type === "presence:clear_active_chat") {
            state.activeConversationId = null;
            return;
          }

          if (event.type === "ping") {
            safeSend(ws, { type: "pong", at: new Date().toISOString() });
          }
        });

        ws.on("close", () => {
          const state = stateBySocket.get(ws);
          if (!state) {
            return;
          }
          stateBySocket.delete(ws);
          removeSocket(state.userId, ws);

          if (isUserOnline(state.userId)) {
            return;
          }

          (async () => {
            try {
              const lastSeenAt = await service.markUserLastSeenOffline(state.userId);
              await broadcastPresenceUpdate(state.userId, false, lastSeenAt);
            } catch {
              await broadcastPresenceUpdate(state.userId, false);
            }
          })();
        });
      } catch {
        ws.close(1011, "Internal Error");
      }
    })();
  });

  return {
    sendToUsers,
    isUserOnline,
    isUserActiveInConversation,
  };
}

module.exports = {
  createRealtimeHub,
};
