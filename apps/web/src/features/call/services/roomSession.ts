// The only place the call feature talks to the socket. It turns server
// events into store actions, and UI intents into socket messages.

import {
  isValidRoomId,
  type JoinRoomResult,
  type PeerMediaState,
  type PeerProfile,
  type SignalPayload,
} from "@vidbase/shared";
import { getSocket } from "@/lib/socket";
import { useCallStore } from "../store/callStore";

const DEFAULT_MEDIA: PeerMediaState = {
  isMuted: false,
  isCameraOff: false,
  isHandRaised: false,
};

/**
 * Connects to the signaling server and joins `roomId`, keeping the call store
 * in sync. Returns a cleanup function that leaves the room and disconnects.
 */
export function joinRoom(roomId: string, profile: PeerProfile): () => void {
  const store = useCallStore.getState();

  if (!isValidRoomId(roomId)) {
    store.invalidRoom();
    return store.reset;
  }

  const socket = getSocket();
  // Ignore late replies that arrive after this session was cleaned up.
  let isActive = true;

  const handleJoinResult = (result: JoinRoomResult) => {
    if (!isActive) return;
    if (result.ok) {
      store.joined(result.self, result.peers);
    } else if (result.reason === "full") {
      store.roomFull(result.peers);
      // Stop retrying; "knock again" reconnects on purpose.
      socket.disconnect();
    } else {
      store.invalidRoom();
    }
  };

  // Runs on the first connect and after every automatic reconnect,
  // re-joining with our latest mic/camera state.
  const sendJoin = () => {
    const media = useCallStore.getState().self ?? DEFAULT_MEDIA;
    socket.emit(
      "room:join",
      {
        roomId,
        profile,
        media: {
          isMuted: media.isMuted,
          isCameraOff: media.isCameraOff,
          isHandRaised: media.isHandRaised,
        },
      },
      handleJoinResult,
    );
  };

  const handleDisconnect = (reason: string) => {
    if (!isActive || useCallStore.getState().status === "full") return;
    store.connectionLost();
    // The server kicked us; Socket.IO won't retry on its own in that case.
    if (reason === "io server disconnect") socket.connect();
  };

  // Socket.IO keeps retrying by itself; we just reflect it in the UI.
  const handleConnectError = () => {
    if (isActive) store.connectionLost();
  };

  socket.on("connect", sendJoin);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);
  socket.on("peer:joined", store.peerJoined);
  socket.on("peer:left", store.peerLeft);
  socket.on("peer:updated", store.peerUpdated);

  store.startConnecting(roomId);
  socket.connect();

  return () => {
    isActive = false;
    socket.off("connect", sendJoin);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
    socket.off("peer:joined", store.peerJoined);
    socket.off("peer:left", store.peerLeft);
    socket.off("peer:updated", store.peerUpdated);

    if (socket.connected) socket.emit("room:leave");
    socket.disconnect();
    store.reset();
  };
}

/** Tries a full room again (e.g. someone may have left). */
export function knockAgain() {
  useCallStore.setState({ status: "connecting", occupants: [] });
  getSocket().connect();
}

/** Sends a WebRTC handshake message to one peer (the server relays it). */
export function sendSignal(to: string, payload: SignalPayload) {
  getSocket().emit("signal", { to, payload });
}

/** Listens for WebRTC handshake messages. Returns a function to stop. */
export function onSignal(
  handler: (from: string, payload: SignalPayload) => void,
) {
  const socket = getSocket();
  const listener = ({
    from,
    payload,
  }: {
    from: string;
    payload: SignalPayload;
  }) => handler(from, payload);
  socket.on("signal", listener);
  return () => {
    socket.off("signal", listener);
  };
}

/** Shares a change to your mic/camera/hand with the room. */
export function shareMediaState(patch: Partial<PeerMediaState>) {
  const { self, patchSelf } = useCallStore.getState();
  if (!self) return;

  const hasChanged = (Object.keys(patch) as (keyof PeerMediaState)[]).some(
    (key) => self[key] !== patch[key],
  );
  if (!hasChanged) return;

  patchSelf(patch);
  getSocket().emit("peer:update", patch);
}
