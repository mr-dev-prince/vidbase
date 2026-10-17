"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VideoElementProps {
  stream: MediaStream;
  /** Flip horizontally, like a mirror. Use for your own camera. */
  mirrored?: boolean;
  fit?: "cover" | "contain";
  className?: string;
}

/**
 * Plays the video of a MediaStream. Always muted: your own mic must never
 * echo back, and other people's sound is played by RemoteAudio instead.
 */
export function VideoElement({
  stream,
  mirrored,
  fit = "cover",
  className,
}: VideoElementProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={cn(
        "size-full",
        fit === "cover" ? "object-cover" : "object-contain",
        mirrored && "-scale-x-100",
        className,
      )}
    />
  );
}
