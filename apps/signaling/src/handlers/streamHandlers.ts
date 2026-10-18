import type { StreamEndReason } from "@vidbase/shared";
import { log } from "../logger";
import type { SocketLimits } from "../rateLimits";
import { STREAM_TRACKS, type StreamRegistry } from "../StreamRegistry";
import type { CloudflareSfu } from "../sfu";
import type { SignalingServer, SignalingSocket } from "../types";
import type { UsageMeter } from "../UsageMeter";
import { parseAnswer, parseStartStream, parseWatchStream } from "../validation";

/** The Socket.IO room for a stream's audience and broadcaster. */
const channelFor = (streamId: string) => `stream:${streamId}`;

const VIEWER_COUNT_EVERY_MS = 1000;
/** Streams with a viewer-count update waiting to go out. */
const pendingCounts = new Set<string>();

/**
 * Tells a stream's audience how many are watching, at most once a second.
 * With 100 viewers, sending on every join would be 100 × 100 messages.
 */
function announceViewers(
  socket: SignalingSocket,
  streams: StreamRegistry,
  streamId: string,
) {
  if (pendingCounts.has(streamId)) return;
  pendingCounts.add(streamId);
  setTimeout(() => {
    pendingCounts.delete(streamId);
    const info = streams.info(streamId);
    if (info) {
      socket.nsp.to(channelFor(streamId)).emit("stream:viewers", info.viewers);
    }
  }, VIEWER_COUNT_EVERY_MS);
}

/** Ends every live stream, e.g. when the monthly budget is used up. */
export function endAllStreams(
  io: SignalingServer,
  streams: StreamRegistry,
  reason: StreamEndReason,
) {
  for (const id of streams.ids()) {
    const channel = channelFor(id);
    // Everyone, broadcaster included, so their pages can say why.
    io.to(channel).emit("stream:ended", reason);
    io.in(channel).socketsLeave(channel);
    streams.end(id);
  }
}

/**
 * Going live and tuning in. The video itself flows through Cloudflare's SFU:
 * this server only sets up SFU sessions and passes SDP back and forth.
 */
export function registerStreamHandlers(
  socket: SignalingSocket,
  streams: StreamRegistry,
  sfu: CloudflareSfu | null,
  usage: UsageMeter,
  limits: SocketLimits,
) {
  /** True while a start/watch is talking to the SFU, to block overlaps. */
  let isBusy = false;
  /** A viewer's SFU session, waiting for their `stream:answer`. */
  let pendingAnswerSession: string | undefined;

  const leaveStream = () => {
    const current = socket.data.stream;
    if (!current) return;
    const channel = channelFor(current.id);

    if (current.role === "host") {
      streams.end(current.id);
      socket.to(channel).emit("stream:ended");
      socket.nsp.in(channel).socketsLeave(channel);
      log.info(`${socket.id} ended stream ${current.id}`);
    } else {
      streams.leaveSeat(current.id, socket.id);
      socket.leave(channel);
      announceViewers(socket, streams, current.id);
    }

    socket.data.stream = undefined;
    socket.data.channel = undefined;
    socket.data.profile = undefined;
    pendingAnswerSession = undefined;
  };

  /** One activity per socket: not while in a call or another stream. */
  const isOccupied = () =>
    isBusy || Boolean(socket.data.roomId || socket.data.stream);

  socket.on("stream:start", async (rawRequest, ack) => {
    if (typeof ack !== "function") return;
    if (!limits.join.take()) return ack({ ok: false, reason: "rate-limited" });
    const request = parseStartStream(rawRequest);
    if (!request || isOccupied()) {
      return ack({ ok: false, reason: "invalid-request" });
    }
    if (!sfu) return ack({ ok: false, reason: "unavailable" });
    if (usage.isOverBudget) return ack({ ok: false, reason: "over-budget" });

    isBusy = true;
    try {
      const sessionId = await sfu.createSession();
      const answer = await sfu.publish(sessionId, request.offer, [
        { mid: request.mids.audio, trackName: STREAM_TRACKS.audio },
        { mid: request.mids.video, trackName: STREAM_TRACKS.video },
      ]);
      // They may have closed the tab while we waited on Cloudflare.
      if (!socket.connected) return;

      const stream = streams.start(request.profile, request.details, sessionId);
      socket.join(channelFor(stream.id));
      socket.data.stream = { id: stream.id, role: "host" };
      socket.data.channel = channelFor(stream.id);
      socket.data.profile = request.profile;
      ack({ ok: true, stream, answer });
      log.info(`${socket.id} (${stream.host.name}) went live: ${stream.id}`);
    } catch (error) {
      log.error(`${socket.id} couldn't go live`, error);
      ack({ ok: false, reason: "sfu-error" });
    } finally {
      isBusy = false;
    }
  });

  socket.on("stream:watch", async (rawRequest, ack) => {
    if (typeof ack !== "function") return;
    if (!limits.join.take()) return ack({ ok: false, reason: "rate-limited" });
    const request = parseWatchStream(rawRequest);
    if (!request || isOccupied()) {
      return ack({ ok: false, reason: "invalid-request" });
    }
    if (!sfu) return ack({ ok: false, reason: "unavailable" });
    if (usage.isOverBudget) return ack({ ok: false, reason: "over-budget" });

    const { streamId } = request;
    // Take a seat first, so the viewer cap holds while the SFU is slow.
    const seat = streams.takeSeat(streamId, socket.id);
    if (!seat.ok) return ack(seat);

    isBusy = true;
    try {
      const sessionId = await sfu.createSession();
      const offer = await sfu.subscribe(sessionId, seat.hostSessionId, [
        STREAM_TRACKS.audio,
        STREAM_TRACKS.video,
      ]);
      const stream = streams.info(streamId);
      if (!socket.connected || !stream) {
        streams.leaveSeat(streamId, socket.id);
        if (socket.connected) ack({ ok: false, reason: "not-found" });
        return;
      }

      socket.join(channelFor(streamId));
      socket.data.stream = { id: streamId, role: "viewer" };
      socket.data.channel = channelFor(streamId);
      socket.data.profile = request.profile;
      pendingAnswerSession = sessionId;
      ack({ ok: true, stream, offer });
      announceViewers(socket, streams, streamId);
    } catch (error) {
      streams.leaveSeat(streamId, socket.id);
      log.error(`${socket.id} couldn't tune in to ${streamId}`, error);
      ack({ ok: false, reason: "sfu-error" });
    } finally {
      isBusy = false;
    }
  });

  socket.on("stream:answer", async (rawAnswer, ack) => {
    if (typeof ack !== "function") return;
    const answer = parseAnswer(rawAnswer);
    const sessionId = pendingAnswerSession;
    if (!answer || !sessionId || !sfu) return ack({ ok: false });

    // One answer per watch.
    pendingAnswerSession = undefined;
    try {
      await sfu.renegotiate(sessionId, answer);
      ack({ ok: true });
    } catch (error) {
      log.error(`${socket.id} couldn't finish tuning in`, error);
      ack({ ok: false });
    }
  });

  socket.on("stream:leave", leaveStream);
  socket.on("disconnect", leaveStream);
}
