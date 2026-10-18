"use client";

import type { StreamInfo } from "@vidbase/shared";
import { useEffect } from "react";
import { create } from "zustand";
import { SIGNALING_URL } from "@/lib/socket";

const REFRESH_MS = 10_000;

/** Null until the first answer, so the page can tell "loading" from "none". */
const useLiveStore = create<{ streams: StreamInfo[] | null }>(() => ({
  streams: null,
}));

let subscribers = 0;
let timer: ReturnType<typeof setInterval> | undefined;

async function refresh() {
  try {
    const response = await fetch(`${SIGNALING_URL}/streams`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`GET /streams: ${response.status}`);
    useLiveStore.setState({ streams: await response.json() });
  } catch {
    // Server unreachable: keep the last list we had, or show "nobody's live"
    // rather than loading forever.
    if (useLiveStore.getState().streams === null) {
      useLiveStore.setState({ streams: [] });
    }
  }
}

/**
 * Who's live right now, from the signaling server's `/streams` list,
 * refreshed every 10 seconds. Every component on the page shares one poll.
 */
export function useLiveStreams() {
  useEffect(() => {
    subscribers += 1;
    if (subscribers === 1) {
      refresh();
      timer = setInterval(refresh, REFRESH_MS);
    }
    return () => {
      subscribers -= 1;
      if (subscribers === 0) clearInterval(timer);
    };
  }, []);

  return useLiveStore((state) => state.streams);
}
