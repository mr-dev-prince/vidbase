import { accentTape } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Accent } from "@/types";

// Hand-torn ends: each shape nibbles the left and right edges differently.
const TORN_EDGES = [
  "[clip-path:polygon(2%_0,98%_0,100%_18%,97%_34%,100%_52%,96%_70%,99%_86%,97%_100%,3%_100%,0_84%,3%_66%,0_50%,4%_32%,1%_16%)]",
  "[clip-path:polygon(0_0,97%_0,99%_14%,96%_30%,100%_46%,97%_62%,100%_80%,98%_100%,1%_100%,3%_82%,0_64%,4%_48%,1%_30%,3%_12%)]",
  "[clip-path:polygon(3%_0,100%_0,97%_20%,100%_38%,96%_58%,99%_76%,96%_100%,0_100%,3%_80%,1%_60%,4%_40%,0_22%)]",
] as const;

// Small angle/length differences for strips stuck across the top.
const TOP_VARIANTS = [
  "w-32 -rotate-6",
  "w-28 rotate-3",
  "w-36 -rotate-2",
  "w-28 rotate-6",
] as const;

export type TapePlacement = "top" | "top-left" | "top-right";

const PLACEMENTS: Record<TapePlacement, string> = {
  top: "-top-4 left-1/2 -translate-x-1/2",
  "top-left": "-top-2 -left-7 w-28 -rotate-[38deg]",
  "top-right": "-top-2 -right-7 w-28 rotate-[38deg]",
};

interface TapeProps {
  tone?: Accent;
  placement?: TapePlacement;
  /** Varies the torn edges (and angle, when on top) so strips don't look cloned. */
  seed?: number;
  className?: string;
}

/** A translucent strip of masking tape "holding" a card to the page. */
export function Tape({
  tone = "sun",
  placement = "top",
  seed = 0,
  className,
}: TapeProps) {
  return (
    <span
      aria-hidden
      className={cn(
        // The wrapper carries the shadow, since clip-path would cut it off.
        "absolute z-10 drop-shadow-[1px_2px_1.5px_rgb(0_0_0/0.28)]",
        PLACEMENTS[placement],
        placement === "top" && TOP_VARIANTS[seed % TOP_VARIANTS.length],
        className,
      )}
    >
      <span
        className={cn(
          "block h-8 w-full tape-texture",
          accentTape[tone],
          TORN_EDGES[seed % TORN_EDGES.length],
        )}
      />
    </span>
  );
}
