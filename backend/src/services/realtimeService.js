import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { env } from "../config/env.js";

const WEBSOCKET_PATH = "/ws";
const PING_INTERVAL_MS = 30000;
const userConnections = new Map();

function buildEvent(type, payload = {}) {
  return JSON.stringify({
    type,
    payload,
    sentAt: new Date().toISOString(),
  });
}

function sendRaw(socket, message) {
  if (socket.readyState !== socket.OPEN) {
    return;
  }

  socket.send(message);
}

function sendEvent(socket, type, payload = {}) {
  sendRaw(socket, buildEvent(type, payload));
}

function addConnection(userId, socket) {
  const key = String(userId);
  const existingConnections = userConnections.get(key) || new Set();
  existingConnections.add(socket);
  userConnections.set(key, existingConnections);
}

function removeConnection(userId, socket) {
  const key = String(userId);
  const existingConnections = userConnections.get(key);

  if (!existingConnections) {
    return;
  }

  existingConnections.delete(socket);

  if (existingConnections.size === 0) {
    userConnections.delete(key);
  }
}

function authenticateSocket(request) {
  const origin = request.headers.origin || env.frontendUrl;
  const requestUrl = new URL(request.url, origin);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    throw new Error("Missing token.");
  }

  return jwt.verify(token, env.jwtSecret);
}

function handleSocketConnection(socket, user) {
  socket.userId = String(user.id);
  socket.isAlive = true;

  addConnection(user.id, socket);
  sendEvent(socket, "realtime.connected", {
    userId: user.id,
    role: user.role,
  });

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  socket.on("message", (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      if (message?.type === "ping") {
        sendEvent(socket, "realtime.pong");
      }
    } catch {
      sendEvent(socket, "realtime.error", {
        message: "Unsupported realtime payload.",
      });
    }
  });

  socket.on("close", () => {
    removeConnection(user.id, socket);
  });
}

export function createRealtimeServer(server) {
  const websocketServer = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const origin = request.headers.origin || env.frontendUrl;
      const requestUrl = new URL(request.url, origin);

      if (requestUrl.pathname !== WEBSOCKET_PATH) {
        socket.destroy();
        return;
      }

      const user = authenticateSocket(request);

      websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        handleSocketConnection(websocket, user);
      });
    } catch (error) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  });

  const heartbeatInterval = setInterval(() => {
    websocketServer.clients.forEach((socket) => {
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, PING_INTERVAL_MS);

  websocketServer.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  return websocketServer;
}

export function sendRealtimeEventToUser(userId, type, payload = {}) {
  const key = String(userId);
  const sockets = userConnections.get(key);

  if (!sockets?.size) {
    return;
  }

  const message = buildEvent(type, payload);
  sockets.forEach((socket) => {
    sendRaw(socket, message);
  });
}

export function sendRealtimeEventToUsers(userIds, type, payload = {}) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean).map((value) => String(value)))];

  uniqueUserIds.forEach((userId) => {
    sendRealtimeEventToUser(userId, type, payload);
  });
}
