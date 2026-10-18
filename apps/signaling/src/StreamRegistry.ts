import { randomUUID } from "node:crypto";
import type { PeerProfile, StreamDetails, StreamInfo } from "@vidbase/shared";
import { LIMITS, TokenBucket } from "./rateLimits";

/** Track names the broadcaster publishes under in their SFU session. */
export const STREAM_TRACKS = { audio: "audio", video: "video" } as const;

interface LiveStream {
  info: Omit<StreamInfo, "viewers">;
  /** The broadcaster's SFU session, which viewers subscribe to. */
  hostSessionId: string;
  /** Socket ids of everyone watching (or about to). */
  viewers: Set<string>;
  /** Room-wide caps, so a full audience can't flood each other. */
  chat: TokenBucket;
  reactions: TokenBucket;
}

export type SeatResult =
  | { ok: true; hostSessionId: string }
  | { ok: false; reason: "not-found" | "full" };

/**
 * Who is streaming and who is watching, kept in memory.
 * Like RoomRegistry, it knows nothing about sockets or the SFU.
 */
export class StreamRegistry {
  private readonly streams = new Map<string, LiveStream>();

  constructor(private readonly maxViewers: number) {}

  start(
    host: PeerProfile,
    details: StreamDetails,
    hostSessionId: string,
  ): StreamInfo {
    // Streams are listed publicly, so the id only has to be unique.
    const id = randomUUID().replaceAll("-", "").slice(0, 12);
    const info = { id, host, ...details, startedAt: Date.now() };
    this.streams.set(id, {
      info,
      hostSessionId,
      viewers: new Set(),
      chat: new TokenBucket(LIMITS.streamChat),
      reactions: new TokenBucket(LIMITS.streamReaction),
    });
    return { ...info, viewers: 0 };
  }

  /** Ends a stream. Returns false if it didn't exist. */
  end(id: string) {
    return this.streams.delete(id);
  }

  /** Holds a viewer's seat before the (slow) SFU setup, so the cap holds. */
  takeSeat(id: string, viewerId: string): SeatResult {
    const stream = this.streams.get(id);
    if (!stream) return { ok: false, reason: "not-found" };
    if (
      !stream.viewers.has(viewerId) &&
      stream.viewers.size >= this.maxViewers
    ) {
      return { ok: false, reason: "full" };
    }
    stream.viewers.add(viewerId);
    return { ok: true, hostSessionId: stream.hostSessionId };
  }

  leaveSeat(id: string, viewerId: string) {
    this.streams.get(id)?.viewers.delete(viewerId);
  }

  info(id: string): StreamInfo | undefined {
    const stream = this.streams.get(id);
    return stream && { ...stream.info, viewers: stream.viewers.size };
  }

  /** Uses one of the stream's shared chat or reaction tokens. */
  allow(id: string, kind: "chat" | "reactions") {
    return this.streams.get(id)?.[kind].take() ?? false;
  }

  /** Everyone watching any stream, added up. */
  totalViewers() {
    let total = 0;
    for (const stream of this.streams.values()) total += stream.viewers.size;
    return total;
  }

  ids() {
    return [...this.streams.keys()];
  }

  /** Every live stream, most watched first. */
  list(): StreamInfo[] {
    return [...this.streams.values()]
      .map((stream) => ({ ...stream.info, viewers: stream.viewers.size }))
      .sort((a, b) => b.viewers - a.viewers);
  }

  get streamCount() {
    return this.streams.size;
  }
}
