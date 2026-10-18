"use client";

import { useEffect, useState } from "react";

export type MediaStatus = "requesting" | "ready" | "blocked";

function stopTracks(stream: MediaStream | null) {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

async function requestCameraAndMic() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Media devices are unavailable in this context");
  }
  return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}

/**
 * Owns the local camera/mic stream.
 * Media is requested on mount and released on unmount.
 */
export function useLocalMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<MediaStatus>("requesting");
  const [isMicOn, setMicOn] = useState(true);
  const [isCamOn, setCamOn] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let acquired: MediaStream | null = null;

    requestCameraAndMic().then(
      (media) => {
        if (cancelled) {
          stopTracks(media);
          return;
        }
        acquired = media;
        setStream(media);
        setStatus("ready");
      },
      () => {
        if (!cancelled) setStatus("blocked");
      },
    );

    return () => {
      cancelled = true;
      stopTracks(acquired);
    };
  }, []);

  // Keep the tracks in sync with the toggles, including for a stream that arrives later.
  useEffect(() => {
    for (const track of stream?.getAudioTracks() ?? []) track.enabled = isMicOn;
  }, [stream, isMicOn]);

  useEffect(() => {
    for (const track of stream?.getVideoTracks() ?? []) track.enabled = isCamOn;
  }, [stream, isCamOn]);

  return {
    stream,
    status,
    isMicOn,
    isCamOn,
    toggleMic: () => setMicOn((on) => !on),
    toggleCam: () => setCamOn((on) => !on),
  };
}
