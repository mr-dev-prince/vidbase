// Watching a stream: the server asks Cloudflare's SFU for a session that
// receives the broadcaster's tracks, we answer its offer, and video flows
// from Cloudflare to this browser.

import type { PeerProfile, StreamEndReason, StreamInfo } from "@vidbase/shared";
import { getSocket } from "@/lib/socket";
import {
  createSfuConnection,
  localDescription,
  waitForIceGathering,
} from "../webrtc/sfuConnection";
import { REQUEST_TIMEOUT_MS } from "./streamSocket";

export type WatchStatus =
  | "connecting"
  | "watching"
  /** Was watching; the connection dropped and is being restored. */
  | "reconnecting"
  | "not-found"
  | "ended"
  | "full"
  /** This month's free streaming allowance is used up. */
  | "over-budget"
  | "unavailable"
  | "unreachable"
  | "error";

export interface WatchEvents {
  onStatus: (status: WatchStatus) => void;
  onInfo: (stream: StreamInfo) => void;
  onViewers: (count: number) => void;
  /** The broadcaster's audio/video (called again as each track arrives). */
  onMedia: (stream: MediaStream) => void;
  onMediaState: (state: RTCPeerConnectionState) => void;
}

const RETRY_MS = 5_000;

/**
 * Tunes in to `streamId` and keeps watching across reconnects (each one asks
 * the server again). Returns a function that stops watching.
 */
export function watchStream(
  streamId: string,
  profile: PeerProfile,
  events: WatchEvents,
): () => void {
  const socket = getSocket();
  let isActive = true;
  let hasWatched = false;
  let isOver = false;
  let pc: RTCPeerConnection | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const closeConnection = () => {
    if (!pc) return;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.close();
    pc = null;
  };

  /** A final state: stop and don't reconnect. */
  const finish = (status: WatchStatus) => {
    isOver = true;
    closeConnection();
    events.onStatus(status);
    socket.disconnect();
  };

  const retryLater = (retry: () => void) => {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      if (isActive && !isOver) retry();
    }, RETRY_MS);
  };

  const tuneIn = async () => {
    closeConnection();
    events.onStatus(hasWatched ? "reconnecting" : "connecting");
    // Drop any half-finished earlier attempt (a no-op on a fresh socket).
    socket.emit("stream:leave");
    try {
      const result = await socket
        .timeout(REQUEST_TIMEOUT_MS)
        .emitWithAck("stream:watch", { streamId, profile });
      if (!isActive) return;
      if (!result.ok) {
        if (result.reason === "rate-limited") return retryLater(tuneIn);
        if (result.reason === "sfu-error") return finish("error");
        if (result.reason === "invalid-request") return finish("not-found");
        return finish(result.reason);
      }
      events.onInfo(result.stream);

      const connection = createSfuConnection();
      pc = connection;
      const media = new MediaStream();
      connection.ontrack = ({ track }) => {
        media.addTrack(track);
        events.onMedia(media);
      };
      connection.onconnectionstatechange = () => {
        events.onMediaState(connection.connectionState);
        // No network path to Cloudflare worked: start over in a moment.
        if (connection.connectionState === "failed") retryLater(tuneIn);
      };

      await connection.setRemoteDescription(result.offer);
      await connection.setLocalDescription();
      await waitForIceGathering(connection);
      const done = await socket
        .timeout(REQUEST_TIMEOUT_MS)
        .emitWithAck("stream:answer", localDescription(connection));
      if (!isActive || pc !== connection) return;
      if (!done.ok) return finish("error");

      hasWatched = true;
      events.onStatus("watching");
    } catch (error) {
      if (!isActive) return;
      console.warn("[stream]", error);
      // A timeout or WebRTC error: try again rather than give up.
      retryLater(tuneIn);
    }
  };

  const handleEnded = (reason?: StreamEndReason) =>
    finish(reason === "over-budget" ? "over-budget" : "ended");
  const handleDisconnect = () => {
    if (isActive && !isOver) events.onStatus("reconnecting");
  };
  // A refusal from the server (too many connections) leaves the socket
  // inactive, so retry that ourselves; network errors retry on their own.
  const handleConnectError = () => {
    if (!isActive || isOver) return;
    events.onStatus(hasWatched ? "reconnecting" : "unreachable");
    if (!socket.active) retryLater(() => socket.connect());
  };

  socket.on("connect", tuneIn);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);
  socket.on("stream:viewers", events.onViewers);
  socket.on("stream:ended", handleEnded);
  socket.connect();

  return () => {
    isActive = false;
    clearTimeout(retryTimer);
    socket.off("connect", tuneIn);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
    socket.off("stream:viewers", events.onViewers);
    socket.off("stream:ended", handleEnded);
    closeConnection();
    if (socket.connected) socket.emit("stream:leave");
    socket.disconnect();
  };
}
