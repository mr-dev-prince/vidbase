import { randomUUID } from "node:crypto";
import type { SocketLimits } from "../rateLimits";
import type { StreamRegistry } from "../StreamRegistry";
import type { SignalingSocket } from "../types";
import { parseChatText, parseReaction } from "../validation";

/**
 * Chat messages and emoji reactions, passed on to everyone else in the
 * socket's call or live stream (its `channel`). The sender shows their own
 * right away, so it isn't echoed back to them.
 */
export function registerMessageHandlers(
  socket: SignalingSocket,
  streams: StreamRegistry,
  limits: SocketLimits,
) {
  // Over the limit, messages are dropped silently.
  socket.on("chat:send", (rawText) => {
    if (!limits.chat.take()) return;
    const { channel, profile, stream } = socket.data;
    const text = parseChatText(rawText);
    if (!channel || !profile || !text) return;
    // A stream's audience also shares one limit, since it can be 100 people.
    if (stream && !streams.allow(stream.id, "chat")) return;

    socket.to(channel).emit("chat:message", {
      id: randomUUID(),
      author: { id: socket.id, ...profile },
      text,
    });
  });

  socket.on("reaction:send", (rawEmoji) => {
    if (!limits.reaction.take()) return;
    const { channel, stream } = socket.data;
    const emoji = parseReaction(rawEmoji);
    if (!channel || !emoji) return;
    if (stream && !streams.allow(stream.id, "reactions")) return;

    socket.to(channel).emit("reaction", { from: socket.id, emoji });
  });
}
