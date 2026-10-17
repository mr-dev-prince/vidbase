import { Marquee } from "@/components/ui/Marquee";
import { accentBg } from "@/lib/theme";
import { cn, formatCount } from "@/lib/utils";
import type { Broadcast } from "@/types";

/** A tilted news-ticker strip of what's live right now. */
export function LiveTicker({ broadcasts }: { broadcasts: Broadcast[] }) {
  return (
    <div className="relative z-10 -mx-4 -rotate-2 border-y-[3px] border-ink bg-ink py-3 text-paper">
      <Marquee>
        {broadcasts.map((broadcast) => (
          <span
            key={broadcast.id}
            className="mx-6 inline-flex items-center gap-3 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight"
          >
            <span
              className={cn(
                "size-3 animate-blink rounded-full",
                accentBg[broadcast.accent],
              )}
            />
            {broadcast.title}
            <span className="font-mono text-sm text-lime">
              {formatCount(broadcast.viewers)} watching
            </span>
            <span aria-hidden className="text-sun">
              ✺
            </span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
