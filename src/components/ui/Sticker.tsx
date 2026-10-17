import type { ReactNode } from "react";
import { toneClasses } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

interface StickerProps {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}

export function Sticker({ tone = "sun", className, children }: StickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1 font-mono text-xs font-bold uppercase leading-none shadow-hard-sm",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
