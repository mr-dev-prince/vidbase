"use client";

import { useEffect, useState } from "react";

/** An index that steps through 0..length-1 every `everyMs`. */
export function useCycle(length: number, everyMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, everyMs);
    return () => clearInterval(timer);
  }, [length, everyMs]);

  return index;
}
