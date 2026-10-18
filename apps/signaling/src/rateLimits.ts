// Rate limits, so one client can't flood the server or the people in a room.
// Joins and new connections are limited per IP address (reconnecting gives a
// fresh socket, so per-socket limits alone would be easy to dodge). Messages
// are limited per socket, since every socket has to join through the IP limit.

import type { SignalingSocket } from "./types";

interface BucketSize {
  /** How many can be used at once in a burst. */
  burst: number;
  /** How many come back per second after that. */
  perSecond: number;
}

export const LIMITS = {
  /** Open connections at once from one IP (a home or office shares one). */
  maxConnectionsPerIp: 20,
  /** New connections per IP, including reconnects. */
  connect: { burst: 20, perSecond: 1 / 3 },
  /** `room:join` per IP. This is what makes guessing room codes hopeless. */
  join: { burst: 10, perSecond: 0.5 },
  chat: { burst: 5, perSecond: 1 },
  reaction: { burst: 10, perSecond: 5 },
  /** `peer:update` (mic/camera/hand toggles). */
  mediaUpdate: { burst: 10, perSecond: 5 },
  /** WebRTC offers/answers/ICE candidates; joining a full room sends dozens. */
  signal: { burst: 200, perSecond: 50 },
} satisfies Record<string, BucketSize | number>;

/**
 * A "token bucket": starts with `burst` tokens, each action uses one, and
 * tokens trickle back at `perSecond`. Allows short bursts but caps the rate.
 */
export class TokenBucket {
  private tokens: number;
  private updatedAt = Date.now();

  constructor(private readonly size: BucketSize) {
    this.tokens = size.burst;
  }

  /** Uses a token. Returns false when there are none left. */
  take() {
    this.refill();
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }

  get isFull() {
    this.refill();
    return this.tokens >= this.size.burst;
  }

  private refill() {
    const now = Date.now();
    const earned = ((now - this.updatedAt) / 1000) * this.size.perSecond;
    this.tokens = Math.min(this.size.burst, this.tokens + earned);
    this.updatedAt = now;
  }
}

interface IpState {
  connections: number;
  connects: TokenBucket;
  joins: TokenBucket;
}

/** Per-IP limits on connections and joins, kept in memory. */
export class IpLimiter {
  private readonly ips = new Map<string, IpState>();

  /** Counts a new connection. Returns false if this IP has too many. */
  connect(ip: string) {
    const state = this.stateFor(ip);
    if (state.connections >= LIMITS.maxConnectionsPerIp) return false;
    if (!state.connects.take()) return false;
    state.connections += 1;
    return true;
  }

  disconnect(ip: string) {
    const state = this.ips.get(ip);
    if (state) state.connections = Math.max(0, state.connections - 1);
  }

  join(ip: string) {
    return this.stateFor(ip).joins.take();
  }

  /** Forgets IPs with no open connections whose limits have fully recovered. */
  sweep() {
    for (const [ip, state] of this.ips) {
      if (
        state.connections === 0 &&
        state.connects.isFull &&
        state.joins.isFull
      ) {
        this.ips.delete(ip);
      }
    }
  }

  private stateFor(ip: string) {
    let state = this.ips.get(ip);
    if (!state) {
      state = {
        connections: 0,
        connects: new TokenBucket(LIMITS.connect),
        joins: new TokenBucket(LIMITS.join),
      };
      this.ips.set(ip, state);
    }
    return state;
  }
}

/**
 * The limits one socket checks before handling a message. `join` draws from
 * its IP's shared bucket; the rest belong to this socket alone.
 */
export function createSocketLimits(ipLimiter: IpLimiter, ip: string) {
  return {
    join: { take: () => ipLimiter.join(ip) },
    chat: new TokenBucket(LIMITS.chat),
    reaction: new TokenBucket(LIMITS.reaction),
    mediaUpdate: new TokenBucket(LIMITS.mediaUpdate),
    signal: new TokenBucket(LIMITS.signal),
  };
}

export type SocketLimits = ReturnType<typeof createSocketLimits>;

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/**
 * The client's real IP. In production every connection arrives from
 * `cloudflared` on this machine, and Cloudflare puts the real address in the
 * `cf-connecting-ip` header. That header is only trusted on loopback
 * connections, so a client reaching the server directly can't fake it.
 */
export function clientIp(socket: SignalingSocket) {
  const { address, headers } = socket.handshake;
  const forwarded = headers["cf-connecting-ip"];
  if (LOOPBACK.has(address) && typeof forwarded === "string" && forwarded) {
    return forwarded;
  }
  return address;
}
