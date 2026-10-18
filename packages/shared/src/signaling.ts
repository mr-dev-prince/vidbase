// The Socket.IO contract between the browser and the signaling server.
// Both sides import these types, so an event can't drift out of sync.

import type { Accent } from "./accents";
import type { ReactionEmoji } from "./reactions";
import type { StreamCategory } from "./stream";

/** Flags every peer shares with the rest of the room. */
export interface PeerMediaState {
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
}

/** How a peer shows up to others. */
export interface PeerProfile {
  name: string;
  accent: Accent;
}

/** One person in a room. `id` is their socket id on the server. */
export interface PeerInfo extends PeerProfile, PeerMediaState {
  id: string;
}

export interface JoinRoomRequest {
  roomId: string;
  profile: PeerProfile;
  media: PeerMediaState;
}

export type JoinRoomResult =
  /** You're in. `peers` is everyone who was already there. */
  | { ok: true; self: PeerInfo; peers: PeerInfo[] }
  /** Every seat is taken. Who's inside is not revealed. */
  | { ok: false; reason: "full" }
  | { ok: false; reason: "invalid-request" }
  /** Too many joins from your network lately; try again in a few seconds. */
  | { ok: false; reason: "rate-limited" };

/** A chat message, as everyone else in the room receives it. */
export interface ChatMessagePayload {
  id: string;
  /** Filled in by the server from its room list, so it can't be faked. */
  author: PeerProfile & { id: string };
  text: string;
}

/** Plain-object version of an RTCIceCandidate, safe to send as JSON. */
export interface IceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment: string | null;
}

/** WebRTC negotiation messages. The server relays them without reading them. */
export type SignalPayload =
  | { type: "offer" | "answer"; sdp: string }
  | { type: "ice-candidate"; candidate: IceCandidate };

/** An SDP offer or answer, passed between a browser and the SFU. */
export interface SessionDescription {
  type: "offer" | "answer";
  sdp: string;
}

/** What the broadcaster picks before going live. */
export interface StreamDetails {
  title: string;
  category: StreamCategory;
}

/** A live stream, as shown in lists and to viewers. */
export interface StreamInfo extends StreamDetails {
  id: string;
  host: PeerProfile;
  viewers: number;
  /** When it went live, in ms since the epoch. */
  startedAt: number;
}

export interface StartStreamRequest {
  details: StreamDetails;
  profile: PeerProfile;
  /** The broadcaster's offer, with one send-only audio and video lane. */
  offer: SessionDescription;
  /** Which lane (`mid`) in the offer carries which track. */
  mids: { audio: string; video: string };
}

/** Why going live or tuning in didn't work. */
export type StreamFailure =
  | "invalid-request"
  | "rate-limited"
  /** Streaming isn't configured on the server (no Cloudflare credentials). */
  | "unavailable"
  /** Cloudflare's SFU rejected the request or didn't answer. */
  | "sfu-error"
  | "not-found"
  /** The stream already has MAX_VIEWERS people watching. */
  | "full"
  /** This month's free Cloudflare allowance is (nearly) used up. */
  | "over-budget";

/** Why a stream ended, when it wasn't the broadcaster's choice. */
export type StreamEndReason = "over-budget";

export type StartStreamResult =
  | { ok: true; stream: StreamInfo; answer: SessionDescription }
  | { ok: false; reason: StreamFailure };

export type WatchStreamResult =
  /** Apply `offer`, then send your answer with `stream:answer`. */
  | { ok: true; stream: StreamInfo; offer: SessionDescription }
  | { ok: false; reason: StreamFailure };

export interface ClientToServerEvents {
  "room:join": (
    request: JoinRoomRequest,
    ack: (result: JoinRoomResult) => void,
  ) => void;
  "room:leave": () => void;
  "peer:update": (patch: Partial<PeerMediaState>) => void;
  signal: (message: { to: string; payload: SignalPayload }) => void;
  "chat:send": (text: string) => void;
  "reaction:send": (emoji: ReactionEmoji) => void;
  "stream:start": (
    request: StartStreamRequest,
    ack: (result: StartStreamResult) => void,
  ) => void;
  "stream:watch": (
    request: { streamId: string; profile: PeerProfile },
    ack: (result: WatchStreamResult) => void,
  ) => void;
  /** A viewer's answer to the offer from `stream:watch`. */
  "stream:answer": (
    answer: SessionDescription,
    ack: (result: { ok: boolean }) => void,
  ) => void;
  /** Stop broadcasting, or stop watching. */
  "stream:leave": () => void;
}

export interface ServerToClientEvents {
  "peer:joined": (peer: PeerInfo) => void;
  "peer:left": (peerId: string) => void;
  "peer:updated": (peer: PeerInfo) => void;
  signal: (message: { from: string; payload: SignalPayload }) => void;
  "chat:message": (message: ChatMessagePayload) => void;
  reaction: (reaction: { from: string; emoji: ReactionEmoji }) => void;
  /** How many people are watching (sent at most about once a second). */
  "stream:viewers": (count: number) => void;
  /** The broadcaster stopped or disconnected, or the server ended it. */
  "stream:ended": (reason?: StreamEndReason) => void;
}

/** Things the server remembers about each connection. */
export interface SocketData {
  /** The call room this socket is in. */
  roomId?: string;
  /** The live stream this socket is broadcasting or watching. */
  stream?: { id: string; role: "host" | "viewer" };
  /** Where chat and reactions from this socket go (a Socket.IO room). */
  channel?: string;
  /** Name and color for chat, set on joining a call or stream. */
  profile?: PeerProfile;
  /** The client's IP address, used for rate limits. */
  ip: string;
}
