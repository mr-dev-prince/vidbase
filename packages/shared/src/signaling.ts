// The Socket.IO contract between the browser and the signaling server.
// Both sides import these types, so an event can't drift out of sync.

import type { Accent } from "./accents";
import type { ReactionEmoji } from "./reactions";

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
}

export interface ServerToClientEvents {
  "peer:joined": (peer: PeerInfo) => void;
  "peer:left": (peerId: string) => void;
  "peer:updated": (peer: PeerInfo) => void;
  signal: (message: { from: string; payload: SignalPayload }) => void;
  "chat:message": (message: ChatMessagePayload) => void;
  reaction: (reaction: { from: string; emoji: ReactionEmoji }) => void;
}

/** Things the server remembers about each connection. */
export interface SocketData {
  roomId?: string;
  /** The client's IP address, used for rate limits. */
  ip: string;
}
