"use client";

import { Check, Copy, Users } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Sticker } from "@/components/ui/Sticker";
import { formatDuration } from "@/lib/utils";

interface CallTopBarProps {
  roomId: string;
  elapsedSeconds: number;
  peopleCount: number;
  capacity: number;
  isReconnecting: boolean;
}

export function CallTopBar({
  roomId,
  elapsedSeconds,
  peopleCount,
  capacity,
  isReconnecting,
}: CallTopBarProps) {
  const isFull = peopleCount >= capacity;
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access denied; the code is still visible to copy by hand.
    }
  };

  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-cream px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Logo className="text-2xl" />
        <button
          type="button"
          onClick={copyRoomCode}
          aria-label={`Copy room code ${roomId}`}
          className="inline-flex min-w-0 -rotate-1 items-center gap-2 rounded-lg border-2 border-ink bg-sun px-3 py-1 font-mono text-sm font-bold shadow-hard-sm transition hover:rotate-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
        >
          <span className="truncate">#{roomId}</span>
          {copied ? (
            <Check aria-hidden className="size-4 shrink-0" />
          ) : (
            <Copy aria-hidden className="size-4 shrink-0" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2">
        {isReconnecting ? (
          <Sticker tone="sun" className="-rotate-2">
            <span className="size-2 animate-blink rounded-full bg-ink" />
            reconnecting…
          </Sticker>
        ) : (
          <Sticker tone="tomato" className="tabular-nums">
            <span className="size-2 animate-blink rounded-full bg-ink" />
            {formatDuration(elapsedSeconds)}
          </Sticker>
        )}
        <Sticker
          tone={isFull ? "flamingo" : "mint"}
          className="rotate-2 tabular-nums"
        >
          <Users aria-hidden className="size-3.5" />
          {peopleCount}/{capacity} {isFull ? "· full" : "here"}
        </Sticker>
      </div>
    </header>
  );
}
