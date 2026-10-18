// Socket helpers shared by broadcasting and watching. Like the call's
// roomSession, the stream services are the only stream code that talks to
// the socket; components and hooks go through them.

import type { ChatMessagePayload, ReactionEmoji } from "@vidbase/shared";
import { CHAT_MESSAGE_MAX_LENGTH } from "@vidbase/shared";
import { getSocket } from "@/lib/socket";

/** How long to wait for the server (and Cloudflare behind it) to answer. */
export const REQUEST_TIMEOUT_MS = 20_000;

/** Opens the socket and resolves once it's connected. */
export function connectSocket() {
  const socket = getSocket();
  if (socket.connected) return Promise.resolve(socket);

  return new Promise<typeof socket>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };
    const onConnect = () => {
      cleanup();
      resolve(socket);
    };
    const onError = () => {
      cleanup();
      socket.disconnect();
      reject(new Error("can't reach the server"));
    };
    const timer = setTimeout(onError, REQUEST_TIMEOUT_MS);
    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
    socket.connect();
  });
}

interface StreamMessageHandlers {
  onChat: (message: ChatMessagePayload) => void;
  onReaction: (emoji: ReactionEmoji) => void;
}

/** Listens for chat and reactions from the stream. Returns a function to stop. */
export function onStreamMessages({
  onChat,
  onReaction,
}: StreamMessageHandlers) {
  const socket = getSocket();
  const handleReaction = ({ emoji }: { emoji: ReactionEmoji }) =>
    onReaction(emoji);
  socket.on("chat:message", onChat);
  socket.on("reaction", handleReaction);
  return () => {
    socket.off("chat:message", onChat);
    socket.off("reaction", handleReaction);
  };
}

/** Sends a chat message. Returns the cleaned-up text, or null if not sent. */
export function sendStreamChat(text: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > CHAT_MESSAGE_MAX_LENGTH) return null;
  getSocket().emit("chat:send", trimmed);
  return trimmed;
}

export function sendStreamReaction(emoji: ReactionEmoji) {
  getSocket().emit("reaction:send", emoji);
}
