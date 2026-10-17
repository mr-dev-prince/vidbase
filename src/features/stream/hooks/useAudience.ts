"use client";

import { useEffect, useState } from "react";

interface UseAudienceOptions {
  enabled?: boolean;
  /** Average change per tick; positive values grow the audience. */
  trend?: number;
}

/** Demo only: a viewer count that drifts like a real live audience. */
export function useAudience(
  initial: number,
  { enabled = true, trend = 0 }: UseAudienceOptions = {},
) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (!enabled) {
      setCount(initial);
      return;
    }
    const timer = setInterval(() => {
      setCount((current) => {
        const swing = Math.max(3, current * 0.015);
        const next = current + trend + (Math.random() - 0.5) * swing;
        return Math.max(0, Math.round(next));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [enabled, initial, trend]);

  return count;
}
