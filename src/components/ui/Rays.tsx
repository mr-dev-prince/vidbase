import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { Accent } from "@/types";

interface RaysProps {
  tone?: Accent;
  /** Size and position it; the parent should be `relative isolate`. */
  className?: string;
}

/** Slowly turning retro sunburst, placed behind content. */
export function Rays({ tone = "sun", className }: RaysProps) {
  const style = { "--rays": `var(--color-${tone})` } as CSSProperties;

  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "pointer-events-none absolute -z-10 aspect-square animate-spin-lazy bg-rays",
        className,
      )}
    />
  );
}
