import { cn } from "@/lib/utils";
import type { FloatingReaction } from "@/types";

/** Overlay that renders emoji floating up from the bottom of its container. */
export function ReactionLayer({
  reactions,
  className,
}: {
  reactions: FloatingReaction[];
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-10 overflow-hidden",
        className,
      )}
    >
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="absolute bottom-6 animate-float-up text-4xl drop-shadow-[2px_2px_0_var(--color-ink)] sm:text-5xl"
          style={{ left: `${reaction.left}%` }}
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}
