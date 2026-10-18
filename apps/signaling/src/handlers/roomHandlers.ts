import type { PeerInfo } from "@vidbase/shared";
import { log } from "../logger";
import type { RoomRegistry } from "../RoomRegistry";
import type { SocketLimits } from "../rateLimits";
import type { SignalingSocket } from "../types";
import { parseJoinRequest, parseMediaPatch } from "../validation";

/** Joining, leaving and sharing mic/camera/hand state within a room. */
export function registerRoomHandlers(
  socket: SignalingSocket,
  rooms: RoomRegistry,
  limits: SocketLimits,
) {
  const leaveCurrentRoom = () => {
    const { roomId } = socket.data;
    if (!roomId) return;

    rooms.leave(roomId, socket.id);
    socket.leave(roomId);
    socket.to(roomId).emit("peer:left", socket.id);
    socket.data.roomId = undefined;
    log.info(`${socket.id} left ${roomId}`);
  };

  socket.on("room:join", (rawRequest, ack) => {
    if (typeof ack !== "function") return;
    if (!limits.join.take()) {
      log.info(`${socket.id} (${socket.data.ip}) is joining too fast`);
      ack({ ok: false, reason: "rate-limited" });
      return;
    }

    const request = parseJoinRequest(rawRequest);
    if (!request) {
      ack({ ok: false, reason: "invalid-request" });
      return;
    }

    // One room per connection: switching rooms leaves the old one first.
    if (socket.data.roomId && socket.data.roomId !== request.roomId) {
      leaveCurrentRoom();
    }

    const self: PeerInfo = {
      id: socket.id,
      ...request.profile,
      ...request.media,
    };
    const outcome = rooms.join(request.roomId, self);

    if (!outcome.ok) {
      log.info(`${socket.id} turned away from full room ${request.roomId}`);
      ack({ ok: false, reason: "full" });
      return;
    }

    socket.data.roomId = request.roomId;
    socket.join(request.roomId);
    socket.to(request.roomId).emit("peer:joined", self);
    ack({ ok: true, self, peers: outcome.peers });
    log.info(
      `${socket.id} (${self.name}) joined ${request.roomId} [${outcome.peers.length + 1}]`,
    );
  });

  socket.on("room:leave", leaveCurrentRoom);
  socket.on("disconnect", leaveCurrentRoom);

  socket.on("peer:update", (rawPatch) => {
    if (!limits.mediaUpdate.take()) return;
    const { roomId } = socket.data;
    const patch = parseMediaPatch(rawPatch);
    if (!roomId || !patch) return;

    const updated = rooms.update(roomId, socket.id, patch);
    if (updated) socket.to(roomId).emit("peer:updated", updated);
  });
}
