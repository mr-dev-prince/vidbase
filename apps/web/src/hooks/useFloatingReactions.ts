"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createId } from "@/lib/utils";
import type { FloatingReaction } from "@/types";

/** Oldest ones are dropped past this, so a flood can't freeze the page. */
const MAX_ON_SCREEN = 30;

/** Emoji that float up and disappear after `lifetimeMs`. */
export function useFloatingReactions(lifetimeMs = 2600) {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  const fire = useCallback(
    (emoji: string) => {
      const reaction = { id: createId(), emoji, left: 8 + Math.random() * 84 };
      setReactions((current) => [
        ...current.slice(-(MAX_ON_SCREEN - 1)),
        reaction,
      ]);

      const timer = setTimeout(() => {
        setReactions((current) => current.filter((r) => r.id !== reaction.id));
        timers.current.delete(timer);
      }, lifetimeMs);
      timers.current.add(timer);
    },
    [lifetimeMs],
  );

  return { reactions, fire };
}
