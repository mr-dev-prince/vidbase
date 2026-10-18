import { randomUUID } from "node:crypto";
import type { RoomRegistry } from "../RoomRegistry";
import type { SocketLimits } from "../rateLimits";
import type { SignalingSocket } from "../types";
import { parseChatText, parseReaction } from "../validation";

/**
 * Chat messages and emoji reactions, passed on to everyone else in the room.
 * The sender shows their own right away, so it isn't echoed back to them.
 */
export function registerMessageHandlers(
  socket: SignalingSocket,
  rooms: RoomRegistry,
  limits: SocketLimits,
) {
  // Over the limit, messages are dropped silently.
  socket.on("chat:send", (rawText) => {
    if (!limits.chat.take()) return;
    const { roomId } = socket.data;
    const text = parseChatText(rawText);
    const sender = roomId && rooms.get(roomId, socket.id);
    if (!roomId || !text || !sender) return;

    socket.to(roomId).emit("chat:message", {
      id: randomUUID(),
      author: { id: sender.id, name: sender.name, accent: sender.accent },
      text,
    });
  });

  socket.on("reaction:send", (rawEmoji) => {
    if (!limits.reaction.take()) return;
    const { roomId } = socket.data;
    const emoji = parseReaction(rawEmoji);
    if (!roomId || !emoji) return;

    socket.to(roomId).emit("reaction", { from: socket.id, emoji });
  });
}
