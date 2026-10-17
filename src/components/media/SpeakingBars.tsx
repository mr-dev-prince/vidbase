import { cn } from "@/lib/utils";

const BARS = [
  { id: "a", delay: "[animation-delay:-200ms]" },
  { id: "b", delay: "[animation-delay:-500ms]" },
  { id: "c", delay: "[animation-delay:-100ms]" },
];

/** A tiny bouncing equalizer shown while someone talks. */
export function SpeakingBars({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Speaking"
      className={cn(
        "inline-flex h-7 items-end gap-0.5 rounded-md border-2 border-ink bg-lime px-1.5 py-1 shadow-hard-sm",
        className,
      )}
    >
      {BARS.map((bar) => (
        <span
          key={bar.id}
          className={cn(
            "h-full w-1 origin-bottom animate-eq rounded-full bg-ink",
            bar.delay,
          )}
        />
      ))}
    </span>
  );
}
