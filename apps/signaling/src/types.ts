import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@vidbase/shared";
import type { Server, Socket } from "socket.io";

type InterServerEvents = Record<string, never>;

export type SignalingServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SignalingSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
