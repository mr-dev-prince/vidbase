import type { ReactNode } from "react";
import { accentBg } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Accent } from "@/types";

interface TvFrameProps {
  tone?: Accent;
  className?: string;
  /** Screen content. Rendered inside a relative 16:9 container. */
  children: ReactNode;
}

/** A chunky retro TV set: antenna, bezel, knobs and a speaker grill. */
export function TvFrame({
  tone = "tomato",
  className,
  children,
}: TvFrameProps) {
  return (
    <div className={cn("relative pt-10", className)}>
      <Antenna />
      <div
        className={cn(
          "rounded-[2rem] border-[3px] border-ink p-3 shadow-hard-lg sm:p-4",
          accentBg[tone],
        )}
      >
        <div className="flex gap-3 sm:gap-4">
          <div className="relative aspect-video min-w-0 flex-1 overflow-hidden rounded-[1.5rem] border-[3px] border-ink bg-ink">
            {children}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-scanlines opacity-30"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgb(0_0_0/0.45)]"
            />
          </div>
          <div
            aria-hidden
            className="hidden w-14 shrink-0 flex-col items-center gap-4 py-2 sm:flex"
          >
            <Knob />
            <Knob className="rotate-[130deg]" />
            <div className="w-full flex-1 rounded-lg border-2 border-ink bg-grill opacity-80" />
          </div>
        </div>
      </div>
      <div aria-hidden className="flex justify-between px-16">
        <span className="h-4 w-8 rounded-b-lg border-2 border-t-0 border-ink bg-ink" />
        <span className="h-4 w-8 rounded-b-lg border-2 border-t-0 border-ink bg-ink" />
      </div>
    </div>
  );
}

function Antenna() {
  const rod =
    "absolute bottom-0 left-1/2 h-12 w-1.5 origin-bottom -translate-x-1/2 rounded-full bg-ink";
  return (
    <div
      aria-hidden
      className="absolute top-0 left-1/2 h-10 w-24 -translate-x-1/2"
    >
      <span className={cn(rod, "-rotate-[32deg]")} />
      <span className={cn(rod, "rotate-[32deg]")} />
      <span className="absolute -bottom-1 left-1/2 h-4 w-10 -translate-x-1/2 rounded-t-full bg-ink" />
    </div>
  );
}

function Knob({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative size-11 rounded-full border-[3px] border-ink bg-cream shadow-hard-sm",
        className,
      )}
    >
      <span className="absolute top-1 left-1/2 h-3.5 w-1 -translate-x-1/2 rounded-full bg-ink" />
    </span>
  );
}
