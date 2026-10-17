"use client";

import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Plays everyone's voice through hidden <audio> elements, one per person.
 * Kept apart from the video tiles so you still hear people whose camera is
 * off (their tile shows an avatar, with no <video> element).
 */
export function RemoteAudio({ streams }: { streams: MediaStream[] }) {
  const [isBlocked, setBlocked] = useState(false);
  const [unlockCount, setUnlockCount] = useState(0);

  return (
    <>
      {streams.map((stream) => (
        <AudioOut
          key={stream.id}
          stream={stream}
          unlockCount={unlockCount}
          onBlocked={() => setBlocked(true)}
        />
      ))}
      {/* Browsers block sound until you interact with the page. */}
      {isBlocked && (
        <Button
          tone="sun"
          className="fixed top-24 left-1/2 z-40 -translate-x-1/2 -rotate-2"
          onClick={() => {
            setBlocked(false);
            setUnlockCount((count) => count + 1);
          }}
        >
          <Volume2 />
          Tap to hear everyone
        </Button>
      )}
    </>
  );
}

interface AudioOutProps {
  stream: MediaStream;
  /** Changes when the user taps to unlock sound, which retries playback. */
  unlockCount: number;
  onBlocked: () => void;
}

function AudioOut({ stream, unlockCount, onBlocked }: AudioOutProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onBlockedRef = useRef(onBlocked);
  onBlockedRef.current = onBlocked;

  // biome-ignore lint/correctness/useExhaustiveDependencies: unlockCount only re-triggers play() after the user taps
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.srcObject = stream;
    audio.play().catch(() => onBlockedRef.current());
  }, [stream, unlockCount]);

  // biome-ignore lint/a11y/useMediaCaption: live call audio has no captions
  return <audio ref={audioRef} autoPlay hidden />;
}
