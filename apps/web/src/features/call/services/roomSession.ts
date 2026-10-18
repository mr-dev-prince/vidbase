// The only place the call feature talks to the socket. It turns server
// events into store actions, and UI intents into socket messages.

import {
  CHAT_MESSAGE_MAX_LENGTH,
  type ChatMessagePayload,
  isValidRoomId,
  type JoinRoomResult,
  type PeerMediaState,
  type PeerProfile,
  type ReactionEmoji,
  type SignalPayload,
} from "@vidbase/shared";
import { getSocket } from "@/lib/socket";
import { createId } from "@/lib/utils";
import { useCallStore } from "../store/callStore";

/** How long to wait before trying again after the server says "slow down". */
const RATE_LIMIT_RETRY_MS = 5_000;

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
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const retryLater = (retry: () => void) => {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      if (isActive) retry();
    }, RATE_LIMIT_RETRY_MS);
  };

  const handleJoinResult = (result: JoinRoomResult) => {
    if (!isActive) return;
    if (result.ok) {
      store.joined(result.self, result.peers);
    } else if (result.reason === "full") {
      store.roomFull();
      // Stop retrying; "knock again" reconnects on purpose.
      socket.disconnect();
    } else if (result.reason === "rate-limited") {
      // Too many joins from this network; wait a moment and ask again.
      store.connectionLost();
      retryLater(sendJoin);
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

  // Socket.IO keeps retrying network errors by itself; we just reflect it in
  // the UI. A refusal from the server (too many connections) leaves the
  // socket inactive, so we retry that one ourselves after a pause.
  const handleConnectError = () => {
    if (!isActive) return;
    store.connectionLost();
    if (!socket.active) retryLater(() => socket.connect());
  };

  const handleChatMessage = ({ id, author, text }: ChatMessagePayload) => {
    if (!isActive) return;
    store.addChatMessage({
      id,
      author: { name: author.name, accent: author.accent },
      text,
    });
  };

  socket.on("connect", sendJoin);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);
  socket.on("peer:joined", store.peerJoined);
  socket.on("peer:left", store.peerLeft);
  socket.on("peer:updated", store.peerUpdated);
  socket.on("chat:message", handleChatMessage);

  store.startConnecting(roomId);
  socket.connect();

  return () => {
    isActive = false;
    clearTimeout(retryTimer);
    socket.off("connect", sendJoin);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
    socket.off("peer:joined", store.peerJoined);
    socket.off("peer:left", store.peerLeft);
    socket.off("peer:updated", store.peerUpdated);
    socket.off("chat:message", handleChatMessage);

    if (socket.connected) socket.emit("room:leave");
    socket.disconnect();
    store.reset();
  };
}

/** Tries a full room again (e.g. someone may have left). */
export function knockAgain() {
  useCallStore.setState({ status: "connecting" });
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

/** Sends a chat message to the room and shows it in your own feed right away. */
export function sendChatMessage(text: string) {
  const { self, addChatMessage } = useCallStore.getState();
  const trimmed = text.trim();
  if (!self || !trimmed || trimmed.length > CHAT_MESSAGE_MAX_LENGTH) return;

  getSocket().emit("chat:send", trimmed);
  addChatMessage({
    id: createId(),
    author: { name: self.name, accent: self.accent },
    text: trimmed,
    isMine: true,
  });
}

/** Throws an emoji to everyone else in the room. */
export function sendReaction(emoji: ReactionEmoji) {
  getSocket().emit("reaction:send", emoji);
}

/** Listens for other people's emoji reactions. Returns a function to stop. */
export function onReaction(handler: (emoji: ReactionEmoji) => void) {
  const socket = getSocket();
  const listener = ({ emoji }: { emoji: ReactionEmoji }) => handler(emoji);
  socket.on("reaction", listener);
  return () => {
    socket.off("reaction", listener);
  };
}
