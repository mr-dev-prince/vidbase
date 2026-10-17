import type { ReactNode } from "react";
import { toneClasses } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

interface TicketProps {
  tone: Tone;
  /** Text printed sideways on the tear-off stub. */
  stub: string;
  className?: string;
  children: ReactNode;
}

const NOTCH =
  "absolute right-16 size-8 translate-x-1/2 rounded-full border-[3px] border-ink bg-[var(--notch,var(--color-paper))]";

/** A ticket-shaped card with a perforated tear-off stub. */
export function Ticket({ tone, stub, className, children }: TicketProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-full rounded-3xl border-[3px] border-ink shadow-funk [--funk:var(--color-sun)]",
          toneClasses[tone],
        )}
      >
        <div className="min-w-0 flex-1 p-6 sm:p-8">{children}</div>
        <div className="flex w-16 shrink-0 items-center justify-center border-l-[3px] border-dashed border-ink">
          <span className="rotate-90 whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.3em]">
            {stub}
          </span>
        </div>
      </div>
      {/* Half-circle "bites" where the stub tears off. */}
      <span
        aria-hidden
        className={cn(
          NOTCH,
          "top-0 -translate-y-1/2 [clip-path:inset(50%_0_0_0)]",
        )}
      />
      <span
        aria-hidden
        className={cn(
          NOTCH,
          "bottom-0 translate-y-1/2 [clip-path:inset(0_0_50%_0)]",
        )}
      />
    </div>
  );
}
