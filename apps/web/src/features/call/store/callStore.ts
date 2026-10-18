import type { PeerInfo, PeerMediaState } from "@vidbase/shared";
import { create } from "zustand";
import type { ChatMessage } from "@/types";

export type RoomStatus =
  | "idle"
  /** Opening the socket and asking for a seat. */
  | "connecting"
  | "joined"
  /** Every seat was taken. */
  | "full"
  /** The signaling server can't be reached (it keeps retrying). */
  | "unreachable"
  /** The room code is malformed. */
  | "invalid";

interface CallState {
  roomId: string | null;
  status: RoomStatus;
  /** True while a joined call has lost its connection and is retrying. */
  isReconnecting: boolean;
  self: PeerInfo | null;
  /** Everyone else in the room. */
  peers: PeerInfo[];
  /** Goes up on every (re)join, so WebRTC knows to start a fresh mesh. */
  joinId: number;
  /** Video/audio received from each peer, by peer id. */
  remoteStreams: Record<string, MediaStream>;
  /** WebRTC connection state to each peer, by peer id. */
  linkStates: Record<string, RTCPeerConnectionState>;
  /** In-call chat since you joined (there's no history from before). */
  chat: ChatMessage[];
}

interface CallActions {
  startConnecting: (roomId: string) => void;
  joined: (self: PeerInfo, peers: PeerInfo[]) => void;
  roomFull: () => void;
  invalidRoom: () => void;
  connectionLost: () => void;
  peerJoined: (peer: PeerInfo) => void;
  peerLeft: (peerId: string) => void;
  peerUpdated: (peer: PeerInfo) => void;
  patchSelf: (patch: Partial<PeerMediaState>) => void;
  setRemoteStream: (peerId: string, stream: MediaStream) => void;
  setLinkState: (peerId: string, state: RTCPeerConnectionState) => void;
  clearMedia: () => void;
  addChatMessage: (message: ChatMessage) => void;
  reset: () => void;
}

const initialState: CallState = {
  roomId: null,
  status: "idle",
  isReconnecting: false,
  self: null,
  peers: [],
  joinId: 0,
  remoteStreams: {},
  linkStates: {},
  chat: [],
};

const MAX_CHAT_MESSAGES = 200;

function without<T>(record: Record<string, T>, key: string) {
  const { [key]: _removed, ...rest } = record;
  return rest;
}

/**
 * Room state for the call UI. It only stores data: the socket wiring lives in
 * `services/roomSession.ts`, which calls these actions.
 */
export const useCallStore = create<CallState & CallActions>()((set) => ({
  ...initialState,

  startConnecting: (roomId) =>
    set({ ...initialState, roomId, status: "connecting" }),

  joined: (self, peers) =>
    set((state) => ({
      status: "joined",
      isReconnecting: false,
      self,
      peers,
      joinId: state.joinId + 1,
    })),

  roomFull: () => set({ status: "full", isReconnecting: false, peers: [] }),

  invalidRoom: () => set({ status: "invalid" }),

  // Mid-call we keep the UI and show "reconnecting"; before joining we show an error.
  connectionLost: () =>
    set((state) =>
      state.status === "joined"
        ? { isReconnecting: true }
        : { status: "unreachable" },
    ),

  peerJoined: (peer) =>
    set((state) => ({
      peers: [...state.peers.filter(({ id }) => id !== peer.id), peer],
    })),

  peerLeft: (peerId) =>
    set((state) => ({
      peers: state.peers.filter(({ id }) => id !== peerId),
      remoteStreams: without(state.remoteStreams, peerId),
      linkStates: without(state.linkStates, peerId),
    })),

  peerUpdated: (peer) =>
    set((state) => ({
      peers: state.peers.map((current) =>
        current.id === peer.id ? peer : current,
      ),
    })),

  patchSelf: (patch) =>
    set((state) => (state.self ? { self: { ...state.self, ...patch } } : {})),

  setRemoteStream: (peerId, stream) =>
    set((state) => ({
      remoteStreams: { ...state.remoteStreams, [peerId]: stream },
    })),

  setLinkState: (peerId, linkState) =>
    set((state) => ({
      linkStates: { ...state.linkStates, [peerId]: linkState },
    })),

  clearMedia: () => set({ remoteStreams: {}, linkStates: {} }),

  addChatMessage: (message) =>
    set((state) => ({
      chat: [...state.chat.slice(-(MAX_CHAT_MESSAGES - 1)), message],
    })),

  reset: () => set(initialState),
}));
