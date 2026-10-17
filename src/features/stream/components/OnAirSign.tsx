import { cn, formatDuration } from "@/lib/utils";

interface OnAirSignProps {
  isLive: boolean;
  elapsedSeconds: number;
}

/** The glowing studio sign above the door. */
export function OnAirSign({ isLive, elapsedSeconds }: OnAirSignProps) {
  return (
    <output
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border-[3px] border-ink px-4 py-2 font-display text-xl font-extrabold uppercase tracking-wider tabular-nums transition-all duration-500",
        isLive
          ? "rotate-1 bg-tomato shadow-[0_0_0_4px_var(--color-paper),0_0_36px_10px_var(--color-tomato)]"
          : "-rotate-1 bg-paper-deep text-ink/50",
      )}
    >
      <span
        className={cn(
          "size-3 rounded-full",
          isLive ? "animate-blink bg-ink" : "bg-ink/30",
        )}
      />
      {isLive ? `On air · ${formatDuration(elapsedSeconds)}` : "Off air"}
    </output>
  );
}
