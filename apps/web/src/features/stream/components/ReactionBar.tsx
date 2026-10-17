import { REACTION_EMOJIS } from "@/lib/reactions";
import { tilt } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ReactionBar({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs font-bold uppercase tracking-widest">
        Throw something →
      </span>
      {REACTION_EMOJIS.map((emoji, index) => (
        <button
          key={emoji}
          type="button"
          aria-label={`Send ${emoji}`}
          onClick={() => onReact(emoji)}
          className={cn(
            "grid size-12 place-items-center rounded-blob border-2 border-ink bg-cream text-2xl shadow-hard transition hover:-translate-y-1 hover:rotate-12 hover:bg-sun active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky",
            tilt(index),
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
