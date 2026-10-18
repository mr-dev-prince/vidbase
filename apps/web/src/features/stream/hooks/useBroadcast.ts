"use client";

import type { PeerProfile, StreamDetails, StreamInfo } from "@vidbase/shared";
import { useEffect, useRef, useState } from "react";
import {
  type Broadcast,
  type BroadcastFailure,
  startBroadcast,
} from "../services/broadcastSession";

export type BroadcastStatus = "idle" | "starting" | "live";

/** Why you're not live: a failed start, a dropped connection, or the budget. */
export type BroadcastProblem = BroadcastFailure | "lost";

/** Going live from the studio, and the live stream's state. */
export function useBroadcast(media: MediaStream | null) {
  const [status, setStatus] = useState<BroadcastStatus>("idle");
  const [stream, setStream] = useState<StreamInfo | null>(null);
  const [viewers, setViewers] = useState(0);
  const [mediaState, setMediaState] = useState<RTCPeerConnectionState>("new");
  const [problem, setProblem] = useState<BroadcastProblem | null>(null);
  const broadcastRef = useRef<Broadcast | null>(null);

  // Leaving the studio ends the stream.
  useEffect(() => () => broadcastRef.current?.end(), []);

  const reset = () => {
    broadcastRef.current = null;
    setStatus("idle");
    setStream(null);
    setViewers(0);
    setMediaState("new");
  };

  /** Starts the stream. Resolves to true once you're live. */
  const goLive = async (details: StreamDetails, profile: PeerProfile) => {
    if (!media || status !== "idle") return false;
    setStatus("starting");
    setProblem(null);

    const result = await startBroadcast(media, details, profile, {
      onViewers: setViewers,
      onMediaState: setMediaState,
      onEnded: (reason) => {
        reset();
        setProblem(reason);
      },
    });
    if (!result.ok) {
      reset();
      setProblem(result.reason);
      return false;
    }
    broadcastRef.current = result.broadcast;
    setStream(result.broadcast.stream);
    setStatus("live");
    return true;
  };

  const end = () => {
    broadcastRef.current?.end();
    reset();
  };

  return { status, stream, viewers, mediaState, problem, goLive, end };
}
