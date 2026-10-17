import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@vidbase/shared";
import { io, type Socket } from "socket.io-client";

export type SignalingSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

// The signaling server is deployed separately (apps/signaling).
// Inlined at build time by Next.js because of the NEXT_PUBLIC_ prefix.
const SIGNALING_URL =
  process.env.NEXT_PUBLIC_SIGNALING_URL ?? "http://localhost:4000";

let socket: SignalingSocket | null = null;

/** The app's single connection to the signaling server, made on first use. */
export function getSocket(): SignalingSocket {
  socket ??= io(SIGNALING_URL, { autoConnect: false });
  return socket;
}
