// Signaling server: helps browsers find each other in a room and relays
// WebRTC handshake messages. Video and audio never pass through it.

import { createServer } from "node:http";
import { MAX_PARTICIPANTS } from "@vidbase/shared";
import { Server } from "socket.io";
import { config } from "./config";
import { registerRoomHandlers } from "./handlers/roomHandlers";
import { registerSignalHandlers } from "./handlers/signalHandlers";
import { log } from "./logger";
import { RoomRegistry } from "./RoomRegistry";
import type { SignalingServer } from "./types";

const rooms = new RoomRegistry(MAX_PARTICIPANTS);

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

io.on("connection", (socket) => {
  registerRoomHandlers(socket, rooms);
  registerSignalHandlers(socket, rooms);
});

httpServer.listen(config.port, () => {
  log.info(
    `listening on :${config.port}, allowing ${config.corsOrigins.join(", ")}`,
  );
});

function shutdown() {
  log.info("shutting down");
  io.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
