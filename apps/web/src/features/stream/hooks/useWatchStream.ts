"use client";

import type { PeerProfile, StreamInfo } from "@vidbase/shared";
import { useEffect, useState } from "react";
import { type WatchStatus, watchStream } from "../services/watchSession";

/** Tunes in to a live stream for as long as the component is mounted. */
export function useWatchStream(streamId: string, profile: PeerProfile | null) {
  const [status, setStatus] = useState<WatchStatus>("connecting");
  const [stream, setStream] = useState<StreamInfo | null>(null);
  const [viewers, setViewers] = useState(0);
  const [media, setMedia] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<RTCPeerConnectionState>("new");

  useEffect(() => {
    if (!profile) return;
    return watchStream(streamId, profile, {
      onStatus: setStatus,
      onInfo: (info) => {
        setStream(info);
        setViewers(info.viewers);
      },
      onViewers: setViewers,
      // A new object each time, so React re-renders as tracks arrive.
      onMedia: (incoming) => setMedia(new MediaStream(incoming.getTracks())),
      onMediaState: setMediaState,
    });
  }, [streamId, profile]);

  return { status, stream, viewers, media, mediaState };
}
