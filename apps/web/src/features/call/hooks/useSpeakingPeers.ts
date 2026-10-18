"use client";

import { useEffect, useRef, useState } from "react";

/** Loudness (RMS of the waveform, 0–1) above which someone counts as talking. */
const SPEAKING_LEVEL = 0.02;
/** Keep the indicator on this long after the last loud moment, so it doesn't flicker between words. */
const HOLD_MS = 400;
const POLL_MS = 100;

interface Meter {
  id: string;
  analyser: AnalyserNode;
  samples: Float32Array<ArrayBuffer>;
  lastLoudAt: number;
}

function isLoud({ analyser, samples }: Meter) {
  analyser.getFloatTimeDomainData(samples);
  let sum = 0;
  for (const sample of samples) sum += sample * sample;
  return Math.sqrt(sum / samples.length) > SPEAKING_LEVEL;
}

function sameIds(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  return a.size === b.size && [...a].every((id) => b.has(id));
}

/**
 * Who is talking right now, measured from the actual audio of each stream
 * (by person id). A muted mic sends silence, so it never counts as talking.
 */
export function useSpeakingPeers(
  streams: Record<string, MediaStream | null | undefined>,
): ReadonlySet<string> {
  const [speaking, setSpeaking] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // The record is rebuilt on every render; only rebuild the meters when the
  // actual set of streams changes.
  const streamsRef = useRef(streams);
  streamsRef.current = streams;
  const streamKey = Object.entries(streams)
    .map(([id, stream]) => `${id}:${stream?.id ?? ""}`)
    .sort()
    .join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: streamKey stands in for the streams record
  useEffect(() => {
    const withAudio = Object.entries(streamsRef.current).filter(
      (entry): entry is [string, MediaStream] =>
        (entry[1]?.getAudioTracks().length ?? 0) > 0,
    );
    if (withAudio.length === 0) return;

    const context = new AudioContext();
    const meters: Meter[] = withAudio.map(([id, stream]) => {
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      return {
        id,
        analyser,
        samples: new Float32Array(analyser.fftSize),
        lastLoudAt: Number.NEGATIVE_INFINITY,
      };
    });

    // Browsers may start audio suspended until the page is interacted with.
    const resume = () => {
      if (context.state === "suspended") context.resume().catch(() => {});
    };
    resume();
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);

    const timer = setInterval(() => {
      const now = performance.now();
      const next = new Set<string>();
      for (const meter of meters) {
        if (isLoud(meter)) meter.lastLoudAt = now;
        if (now - meter.lastLoudAt < HOLD_MS) next.add(meter.id);
      }
      setSpeaking((current) => (sameIds(current, next) ? current : next));
    }, POLL_MS);

    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      context.close().catch(() => {});
      setSpeaking(new Set());
    };
  }, [streamKey]);

  return speaking;
}
