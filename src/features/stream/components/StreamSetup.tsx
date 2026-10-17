"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export const STREAM_CATEGORIES = [
  "Just chatting",
  "Music",
  "Gaming",
  "Coding",
  "Crafts",
  "Food",
] as const;

export type StreamCategory = (typeof STREAM_CATEGORIES)[number];

interface StreamSetupProps {
  title: string;
  onTitleChange: (title: string) => void;
  category: StreamCategory;
  onCategoryChange: (category: StreamCategory) => void;
}

export function StreamSetup({
  title,
  onTitleChange,
  category,
  onCategoryChange,
}: StreamSetupProps) {
  const titleId = useId();

  return (
    <section className="rotate-1 rounded-3xl border-[3px] border-ink bg-sun p-5 shadow-hard-lg">
      <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
        Stream setup
      </h2>

      <label
        htmlFor={titleId}
        className="mt-4 block font-mono text-[11px] font-bold uppercase tracking-widest"
      >
        Title
      </label>
      {/* Styled like a strip from a label maker. */}
      <input
        id={titleId}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        maxLength={80}
        className="mt-1.5 w-full -rotate-1 rounded-sm bg-ink px-3 py-2 font-mono text-sm font-bold uppercase tracking-wider text-paper shadow-hard-sm placeholder:text-paper/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky"
        placeholder="Name your stream"
      />

      <fieldset className="mt-5">
        <legend className="font-mono text-[11px] font-bold uppercase tracking-widest">
          Category
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {STREAM_CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === category}
              onClick={() => onCategoryChange(option)}
              className={cn(
                "rounded-full border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky",
                option === category
                  ? "bg-ink text-paper"
                  : "bg-cream hover:-translate-y-0.5",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
