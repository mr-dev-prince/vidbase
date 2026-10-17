"use client";

import { useEffect, useState } from "react";

/** Seconds since `running` became true. Resets each time it starts again. */
export function useElapsedSeconds(running = true) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;

    setSeconds(0);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  return seconds;
}
