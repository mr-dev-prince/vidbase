import type { RoomRegistry } from "../RoomRegistry";
import type { SignalingSocket } from "../types";
import { parseSignalMessage } from "../validation";

/**
 * Relays WebRTC offers, answers and ICE candidates from one peer to another.
 * The server never reads them, it only checks both peers share a room.
 */
export function registerSignalHandlers(
  socket: SignalingSocket,
  rooms: RoomRegistry,
) {
  socket.on("signal", (rawMessage) => {
    const { roomId } = socket.data;
    const message = parseSignalMessage(rawMessage);
    if (!roomId || !message) return;

    const isSelf = message.to === socket.id;
    if (isSelf || !rooms.isInRoom(roomId, message.to)) return;

    // Every socket is automatically in a room named after its own id.
    socket
      .to(message.to)
      .emit("signal", { from: socket.id, payload: message.payload });
  });
}
