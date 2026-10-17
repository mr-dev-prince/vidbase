"use client";

import { Smile } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { REACTION_EMOJIS } from "@/lib/reactions";

/** Toggles a row of emoji. It stays open so people can spam reactions. */
export function ReactionPicker({
  onReact,
}: {
  onReact: (emoji: string) => void;
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2 gap-1 rounded-full border-2 border-ink bg-cream p-1.5 shadow-hard">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`React with ${emoji}`}
              onClick={() => onReact(emoji)}
              className="grid size-10 place-items-center rounded-full text-2xl transition hover:-translate-y-1 hover:scale-125 hover:bg-sun focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <IconButton
        label="React"
        tone={isOpen ? "flamingo" : "cream"}
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        icon={<Smile className="size-5" />}
      />
    </div>
  );
}
