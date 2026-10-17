import type { ComponentProps, ReactNode } from "react";
import { toneClasses } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  /** Accessible name, also shown as a sticker tooltip on hover. */
  label: string;
  icon: ReactNode;
  tone?: Tone;
  size?: IconButtonSize;
}

type IconButtonSize = "sm" | "md" | "lg";

const SIZES: Record<IconButtonSize, string> = {
  sm: "size-10",
  md: "size-11 sm:size-12",
  lg: "size-12 sm:size-16",
};

/** A blob-shaped icon button that rounds out on hover. */
export function IconButton({
  label,
  icon,
  tone = "cream",
  size = "md",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "group relative grid shrink-0 place-items-center rounded-blob border-2 border-ink shadow-hard",
        "transition-[translate,box-shadow,border-radius] duration-200 hover:-translate-y-1 hover:rounded-full hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky disabled:pointer-events-none disabled:opacity-50",
        SIZES[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {icon}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 -rotate-3 scale-75 whitespace-nowrap rounded-md border-2 border-ink bg-ink px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-paper opacity-0 transition group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}
