import type { IceCandidate, SignalPayload } from "@vidbase/shared";
import { ICE_SERVERS } from "./iceServers";

/**
 * Who makes offers on this link. The person who joins later is the offerer;
 * the one already in the room only answers. Because only one side ever
 * offers, the two can never send offers at the same time ("glare").
 */
export type LinkRole = "offerer" | "answerer";

export interface PeerLinkEvents {
  /** Send a handshake message to the other person (through the server). */
  sendSignal: (payload: SignalPayload) => void;
  /** Their audio/video arrived (called again as each track arrives). */
  onRemoteStream: (stream: MediaStream) => void;
  onStateChange: (state: RTCPeerConnectionState) => void;
}

const KINDS = ["audio", "video"] as const;
type TrackKind = (typeof KINDS)[number];

/** One WebRTC connection between you and one other person. */
export class PeerLink {
  private readonly pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  /** Collects the other person's tracks into a stream we can play. */
  private readonly remoteStream = new MediaStream();
  /** Incoming messages are applied one at a time, in arrival order. */
  private queue: Promise<void> = Promise.resolve();

  constructor(
    role: LinkRole,
    private localStream: MediaStream | null,
    private readonly events: PeerLinkEvents,
  ) {
    // Each network address the browser discovers goes to the other side.
    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        events.sendSignal({
          type: "ice-candidate",
          candidate: toIceCandidate(candidate),
        });
      }
    };

    this.pc.ontrack = ({ track }) => {
      this.remoteStream.addTrack(track);
      events.onRemoteStream(this.remoteStream);
    };

    this.pc.onconnectionstatechange = () => {
      const state = this.pc.connectionState;
      events.onStateChange(state);
      // Try new network paths. Only the offerer does it, so it stays one-sided.
      if (state === "failed" && role === "offerer") this.pc.restartIce();
    };

    if (role === "offerer") {
      // Two fixed lanes, audio and video, each sending and receiving.
      // Later changes swap the track in a lane instead of renegotiating.
      for (const kind of KINDS) {
        this.pc.addTransceiver(this.localTrack(kind) ?? kind, {
          direction: "sendrecv",
        });
      }
      // Fires once the lanes exist (and again after restartIce).
      this.pc.onnegotiationneeded = () => this.enqueue(() => this.sendOffer());
    }
  }

  /** Applies a handshake message from the other person. */
  handleSignal(payload: SignalPayload) {
    this.enqueue(async () => {
      switch (payload.type) {
        case "offer":
          await this.pc.setRemoteDescription({
            type: "offer",
            sdp: payload.sdp,
          });
          await this.attachLocalTracks();
          // No argument: the browser builds the matching answer for us.
          await this.pc.setLocalDescription();
          this.sendLocalDescription("answer");
          break;
        case "answer":
          await this.pc.setRemoteDescription({
            type: "answer",
            sdp: payload.sdp,
          });
          break;
        case "ice-candidate":
          await this.pc.addIceCandidate(payload.candidate);
          break;
      }
    });
  }

  /** Swaps in a new camera/mic stream without a new offer (replaceTrack). */
  setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    this.enqueue(() => this.attachLocalTracks());
  }

  close() {
    this.pc.onicecandidate = null;
    this.pc.ontrack = null;
    this.pc.onconnectionstatechange = null;
    this.pc.onnegotiationneeded = null;
    this.pc.close();
  }

  private async sendOffer() {
    if (this.pc.signalingState === "closed") return;
    // No argument: the browser builds the offer for us.
    await this.pc.setLocalDescription();
    this.sendLocalDescription("offer");
  }

  private sendLocalDescription(type: "offer" | "answer") {
    const sdp = this.pc.localDescription?.sdp;
    if (sdp) this.events.sendSignal({ type, sdp });
  }

  /** Puts our current tracks into the lanes (the answerer's lanes come from the offer). */
  private async attachLocalTracks() {
    for (const transceiver of this.pc.getTransceivers()) {
      if (transceiver.currentDirection === "stopped") continue;
      const kind = transceiver.receiver.track.kind as TrackKind;
      transceiver.direction = "sendrecv";
      await transceiver.sender.replaceTrack(this.localTrack(kind));
    }
  }

  private localTrack(kind: TrackKind) {
    return this.localStream?.getTracks().find((t) => t.kind === kind) ?? null;
  }

  private enqueue(task: () => Promise<void>) {
    this.queue = this.queue.then(task).catch((error: unknown) => {
      console.warn("[webrtc]", error);
    });
  }
}

/** RTCIceCandidate isn't plain JSON; copy the fields we need to send it. */
function toIceCandidate(candidate: RTCIceCandidate): IceCandidate {
  return {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    usernameFragment: candidate.usernameFragment,
  };
}
