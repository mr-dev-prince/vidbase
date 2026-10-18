// Signaling server: helps browsers find each other in a room and relays
// WebRTC handshake messages. Video and audio never pass through it.

import { createServer } from "node:http";
import { MAX_PARTICIPANTS, MAX_VIEWERS } from "@vidbase/shared";
import { Server } from "socket.io";
import { config } from "./config";
import { registerMessageHandlers } from "./handlers/messageHandlers";
import { registerRoomHandlers } from "./handlers/roomHandlers";
import { registerSignalHandlers } from "./handlers/signalHandlers";
import {
  endAllStreams,
  registerStreamHandlers,
} from "./handlers/streamHandlers";
import { log } from "./logger";
import { RoomRegistry } from "./RoomRegistry";
import { clientIp, createSocketLimits, IpLimiter } from "./rateLimits";
import { StreamRegistry } from "./StreamRegistry";
import { CloudflareSfu } from "./sfu";
import type { SignalingServer } from "./types";
import { UsageMeter } from "./UsageMeter";

const rooms = new RoomRegistry(MAX_PARTICIPANTS);
const streams = new StreamRegistry(MAX_VIEWERS);
const sfu = config.sfu
  ? new CloudflareSfu(config.sfu.appId, config.sfu.secret)
  : null;
const usage = new UsageMeter(config.usageFile, config.streamBudgetGb);
const ipLimiter = new IpLimiter();
const sweepTimer = setInterval(() => ipLimiter.sweep(), 60_000);

/** Lets the web app read `/streams` from the browser (a different origin). */
function corsHeaders(origin: string | undefined): Record<string, string> {
  return origin && config.corsOrigins.includes(origin)
    ? { "access-control-allow-origin": origin, vary: "Origin" }
    : {};
}

// Plain HTTP serves a health check and the list of live streams;
// Socket.IO handles its own path.
const httpServer = createServer((request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405).end();
    return;
  }
  const json = (body: unknown) => {
    response.writeHead(200, {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...corsHeaders(request.headers.origin),
    });
    response.end(JSON.stringify(body));
  };

  if (request.url === "/health") {
    json({
      ok: true,
      rooms: rooms.roomCount,
      streams: streams.streamCount,
      streamingUsage: usage.summary(),
    });
    return;
  }
  if (request.url === "/streams") {
    json(streams.list());
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
  registerStreamHandlers(socket, streams, sfu, usage, limits);
  registerMessageHandlers(socket, streams, limits);
});

// Count viewer-time toward the monthly budget, and stop every stream once
// it's used up. Saved once a minute so a restart doesn't lose much.
const USAGE_TICK_SECONDS = 10;
const usageTimer = setInterval(() => {
  usage.addViewerSeconds(streams.totalViewers() * USAGE_TICK_SECONDS);
  if (usage.isOverBudget && streams.streamCount > 0) {
    log.warn("monthly streaming budget used up: ending all streams");
    endAllStreams(io, streams, "over-budget");
    usage.save();
  }
}, USAGE_TICK_SECONDS * 1000);
const saveTimer = setInterval(() => usage.save(), 60_000);

httpServer.listen(config.port, () => {
  log.info(
    `listening on :${config.port}, allowing ${config.corsOrigins.join(", ")}`,
  );
  if (!sfu) {
    log.warn("no CLOUDFLARE_REALTIME_APP_ID/SECRET set: live streaming is off");
  }
  const { month, usedGb, budgetGb } = usage.summary();
  log.info(`streaming usage for ${month}: ~${usedGb} of ${budgetGb} GB`);
});

function shutdown() {
  log.info("shutting down");
  clearInterval(sweepTimer);
  clearInterval(usageTimer);
  clearInterval(saveTimer);
  usage.save();
  io.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
