"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface GoLiveButtonProps {
  isLive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/** A big round record button with text orbiting around it. */
export function GoLiveButton({ isLive, onClick, disabled }: GoLiveButtonProps) {
  const pathId = useId();
  const orbit = isLive ? "end stream ✺ end stream ✺ " : "go live ✺ go live ✺ ";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLive ? "End stream" : "Go live"}
      className={cn(
        "group relative grid size-36 shrink-0 place-items-center rounded-full border-[3px] border-ink shadow-hard-lg transition-[translate,box-shadow,background-color] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky",
        isLive ? "bg-ink text-paper" : "bg-tomato text-ink",
      )}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full animate-spin-slow"
      >
        <defs>
          <path
            id={pathId}
            d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
          />
        </defs>
        <text className="fill-current font-mono text-[9.5px] font-bold uppercase tracking-[0.18em]">
          <textPath href={`#${pathId}`}>{orbit}</textPath>
        </text>
      </svg>
      <span className="relative grid size-16 place-items-center rounded-blob border-[3px] border-current font-display text-lg font-extrabold uppercase leading-none transition-transform group-hover:scale-110">
        {isLive ? "End" : "Go!"}
      </span>
    </button>
  );
}
