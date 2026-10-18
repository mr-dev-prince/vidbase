// Signaling server: helps browsers find each other in a room and relays
// WebRTC handshake messages. Video and audio never pass through it.

import { createServer } from "node:http";
import { MAX_PARTICIPANTS } from "@vidbase/shared";
import { Server } from "socket.io";
import { config } from "./config";
import { registerMessageHandlers } from "./handlers/messageHandlers";
import { registerRoomHandlers } from "./handlers/roomHandlers";
import { registerSignalHandlers } from "./handlers/signalHandlers";
import { log } from "./logger";
import { RoomRegistry } from "./RoomRegistry";
import { clientIp, createSocketLimits, IpLimiter } from "./rateLimits";
import type { SignalingServer } from "./types";

const rooms = new RoomRegistry(MAX_PARTICIPANTS);
const ipLimiter = new IpLimiter();
const sweepTimer = setInterval(() => ipLimiter.sweep(), 60_000);

// Plain HTTP only serves a health check; Socket.IO handles its own path.
const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, rooms: rooms.roomCount }));
    return;
  }
  response.writeHead(404).end();
});

const io: SignalingServer = new Server(httpServer, {
  cors: { origin: config.corsOrigins },
  // Signaling messages are small; reject anything bigger than 100 KB.
  maxHttpBufferSize: 100_000,
});

// Turn away IPs with too many open or recent connections.
io.use((socket, next) => {
  const ip = clientIp(socket);
  if (!ipLimiter.connect(ip)) {
    log.info(`refused a connection from ${ip}: too many connections`);
    next(new Error("too-many-connections"));
    return;
  }
  socket.data.ip = ip;
  next();
});

io.on("connection", (socket) => {
  const limits = createSocketLimits(ipLimiter, socket.data.ip);
  socket.on("disconnect", () => ipLimiter.disconnect(socket.data.ip));
  registerRoomHandlers(socket, rooms, limits);
  registerSignalHandlers(socket, rooms, limits);
  registerMessageHandlers(socket, rooms, limits);
});

httpServer.listen(config.port, () => {
  log.info(
    `listening on :${config.port}, allowing ${config.corsOrigins.join(", ")}`,
  );
});

function shutdown() {
  log.info("shutting down");
  clearInterval(sweepTimer);
  io.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
