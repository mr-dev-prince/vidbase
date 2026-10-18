"use client";

import { Marquee } from "@/components/ui/Marquee";
import { accentBg } from "@/lib/theme";
import { cn, formatCount } from "@/lib/utils";
import { useLiveStreams } from "../hooks/useLiveStreams";

const QUIET_LINES = [
  { id: "a", text: "nobody's live right now" },
  { id: "b", text: "open the studio and be the first" },
];

/** A tilted news-ticker strip of what's live right now. */
export function LiveTicker() {
  const streams = useLiveStreams();

  return (
    <div className="relative z-10 -mx-4 -rotate-2 border-y-[3px] border-ink bg-ink py-3 text-paper">
      <Marquee>
        {streams?.length
          ? streams.map((stream) => (
              <span
                key={stream.id}
                className="mx-6 inline-flex items-center gap-3 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight"
              >
                <span
                  className={cn(
                    "size-3 animate-blink rounded-full",
                    accentBg[stream.host.accent],
                  )}
                />
                {stream.title}
                <span className="font-mono text-sm text-lime">
                  {formatCount(stream.viewers)} watching
                </span>
                <span aria-hidden className="text-sun">
                  ✺
                </span>
              </span>
            ))
          : QUIET_LINES.map((line) => (
              <span
                key={line.id}
                className="mx-6 inline-flex items-center gap-3 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight"
              >
                {line.text}
                <span aria-hidden className="text-sun">
                  ✺
                </span>
              </span>
            ))}
      </Marquee>
    </div>
  );
}
