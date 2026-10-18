import type { PeerInfo, PeerMediaState } from "@vidbase/shared";

export type JoinOutcome =
  | { ok: true; peers: PeerInfo[] }
  | { ok: false; reason: "full" };

/**
 * Who is in which room, kept in memory.
 * It knows nothing about sockets, so it's easy to reason about and test.
 */
export class RoomRegistry {
  private readonly rooms = new Map<string, Map<string, PeerInfo>>();

  constructor(private readonly capacity: number) {}

  /** Seats `peer` in the room unless it's full. Returns everyone else there. */
  join(roomId: string, peer: PeerInfo): JoinOutcome {
    const room = this.rooms.get(roomId) ?? new Map<string, PeerInfo>();
    const others = [...room.values()].filter(({ id }) => id !== peer.id);

    if (!room.has(peer.id) && room.size >= this.capacity) {
      return { ok: false, reason: "full" };
    }

    room.set(peer.id, peer);
    this.rooms.set(roomId, room);
    return { ok: true, peers: others };
  }

  /** Removes a peer, and the room itself once it's empty. */
  leave(roomId: string, peerId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(peerId);
    if (room.size === 0) this.rooms.delete(roomId);
  }

  /** Applies a media change and returns the updated peer. */
  update(roomId: string, peerId: string, patch: Partial<PeerMediaState>) {
    const room = this.rooms.get(roomId);
    const peer = room?.get(peerId);
    if (!room || !peer) return undefined;

    const updated = { ...peer, ...patch };
    room.set(peerId, updated);
    return updated;
  }

  isInRoom(roomId: string, peerId: string) {
    return this.rooms.get(roomId)?.has(peerId) ?? false;
  }

  get roomCount() {
    return this.rooms.size;
  }
}
