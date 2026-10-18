// Going live: publishes your camera and mic to Cloudflare's SFU once, and
// the SFU sends them on to every viewer.

import {
  type PeerProfile,
  STREAM_VIDEO_MAX_BITRATE,
  type StreamDetails,
  type StreamEndReason,
  type StreamFailure,
  type StreamInfo,
} from "@vidbase/shared";
import {
  createSfuConnection,
  localDescription,
  waitForIceGathering,
} from "../webrtc/sfuConnection";
import { connectSocket, REQUEST_TIMEOUT_MS } from "./streamSocket";

export type BroadcastFailure = StreamFailure | "unreachable";

export interface BroadcastEvents {
  onViewers: (count: number) => void;
  /** State of the connection carrying your video to Cloudflare. */
  onMediaState: (state: RTCPeerConnectionState) => void;
  /**
   * The stream ended without you pressing End: the connection dropped
   * ("lost"), or the server stopped it (e.g. the monthly budget ran out).
   */
  onEnded: (reason: "lost" | StreamEndReason) => void;
}

export interface Broadcast {
  stream: StreamInfo;
  /** Ends the stream and releases the connection. */
  end: () => void;
}

export type StartBroadcastResult =
  | { ok: true; broadcast: Broadcast }
  | { ok: false; reason: BroadcastFailure };

export async function startBroadcast(
  media: MediaStream,
  details: StreamDetails,
  profile: PeerProfile,
  events: BroadcastEvents,
): Promise<StartBroadcastResult> {
  let socket: Awaited<ReturnType<typeof connectSocket>>;
  try {
    socket = await connectSocket();
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  const pc = createSfuConnection();
  const fail = (reason: BroadcastFailure): StartBroadcastResult => {
    pc.close();
    socket.disconnect();
    return { ok: false, reason };
  };

  try {
    // One send-only lane each for audio and video. Muting just disables the
    // track, so the lanes never change and no renegotiation is needed.
    const audio = pc.addTransceiver(media.getAudioTracks()[0] ?? "audio", {
      direction: "sendonly",
    });
    // Capped bitrate: Cloudflare bills what it sends viewers, and the
    // server's monthly budget assumes nobody sends more than this.
    const video = pc.addTransceiver(media.getVideoTracks()[0] ?? "video", {
      direction: "sendonly",
      sendEncodings: [{ maxBitrate: STREAM_VIDEO_MAX_BITRATE }],
    });
    pc.onconnectionstatechange = () => events.onMediaState(pc.connectionState);

    await pc.setLocalDescription();
    await waitForIceGathering(pc);
    if (!audio.mid || !video.mid) return fail("invalid-request");

    const result = await socket
      .timeout(REQUEST_TIMEOUT_MS)
      .emitWithAck("stream:start", {
        details,
        profile,
        offer: localDescription(pc),
        mids: { audio: audio.mid, video: video.mid },
      });
    if (!result.ok) return fail(result.reason);

    await pc.setRemoteDescription(result.answer);

    const handleDisconnect = () => {
      end();
      events.onEnded("lost");
    };
    const handleEnded = (reason?: StreamEndReason) => {
      end();
      events.onEnded(reason ?? "lost");
    };
    const end = () => {
      socket.off("stream:viewers", events.onViewers);
      socket.off("disconnect", handleDisconnect);
      socket.off("stream:ended", handleEnded);
      if (socket.connected) socket.emit("stream:leave");
      pc.onconnectionstatechange = null;
      pc.close();
      socket.disconnect();
    };
    socket.on("stream:viewers", events.onViewers);
    socket.on("disconnect", handleDisconnect);
    socket.on("stream:ended", handleEnded);

    return { ok: true, broadcast: { stream: result.stream, end } };
  } catch (error) {
    console.warn("[stream]", error);
    return fail("sfu-error");
  }
}
