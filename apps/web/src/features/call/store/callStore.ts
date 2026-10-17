import type { PeerInfo, PeerMediaState } from "@vidbase/shared";
import { create } from "zustand";

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
  /** Who was inside when we were turned away from a full room. */
  occupants: PeerInfo[];
}

interface CallActions {
  startConnecting: (roomId: string) => void;
  joined: (self: PeerInfo, peers: PeerInfo[]) => void;
  roomFull: (occupants: PeerInfo[]) => void;
  invalidRoom: () => void;
  connectionLost: () => void;
  peerJoined: (peer: PeerInfo) => void;
  peerLeft: (peerId: string) => void;
  peerUpdated: (peer: PeerInfo) => void;
  patchSelf: (patch: Partial<PeerMediaState>) => void;
  reset: () => void;
}

const initialState: CallState = {
  roomId: null,
  status: "idle",
  isReconnecting: false,
  self: null,
  peers: [],
  occupants: [],
};

/**
 * Room state for the call UI. It only stores data: the socket wiring lives in
 * `services/roomSession.ts`, which calls these actions.
 */
export const useCallStore = create<CallState & CallActions>()((set) => ({
  ...initialState,

  startConnecting: (roomId) =>
    set({ ...initialState, roomId, status: "connecting" }),

  joined: (self, peers) =>
    set({
      status: "joined",
      isReconnecting: false,
      self,
      peers,
      occupants: [],
    }),

  roomFull: (occupants) =>
    set({ status: "full", isReconnecting: false, peers: [], occupants }),

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
    set((state) => ({ peers: state.peers.filter(({ id }) => id !== peerId) })),

  peerUpdated: (peer) =>
    set((state) => ({
      peers: state.peers.map((current) =>
        current.id === peer.id ? peer : current,
      ),
    })),

  patchSelf: (patch) =>
    set((state) => (state.self ? { self: { ...state.self, ...patch } } : {})),

  reset: () => set(initialState),
}));
