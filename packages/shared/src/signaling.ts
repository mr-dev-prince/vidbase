// The Socket.IO contract between the browser and the signaling server.
// Both sides import these types, so an event can't drift out of sync.

import type { Accent } from "./accents";

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
  /** Every seat is taken. `peers` is who's inside. */
  | { ok: false; reason: "full"; peers: PeerInfo[] }
  | { ok: false; reason: "invalid-request" };

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
}

export interface ServerToClientEvents {
  "peer:joined": (peer: PeerInfo) => void;
  "peer:left": (peerId: string) => void;
  "peer:updated": (peer: PeerInfo) => void;
  signal: (message: { from: string; payload: SignalPayload }) => void;
}

/** Things the server remembers about each connection. */
export interface SocketData {
  roomId?: string;
}
