import type { ReactNode } from "react";
import { accentFill } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Accent } from "@/types";

function starPoints(spikes: number, outer: number, inner: number) {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

const STAR_POINTS = starPoints(16, 48, 39);

interface StarburstProps {
  tone?: Accent;
  spin?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A spinning "SALE!"-style starburst with static content on top.
 * Size and position it via `className` (it may be absolutely positioned).
 */
export function Starburst({
  tone = "sun",
  spin = true,
  className,
  children,
}: StarburstProps) {
  return (
    <div className={cn("grid", className)}>
      <div className="relative grid size-full place-items-center">
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className={cn(
            "absolute inset-0 size-full drop-shadow-[3px_3px_0_var(--color-ink)]",
            spin && "animate-spin-slow",
          )}
        >
          <polygon
            points={STAR_POINTS}
            className={accentFill[tone]}
            stroke="var(--color-ink)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
