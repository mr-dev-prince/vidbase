import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function TextField({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full min-w-0 rounded-full border-2 border-ink bg-cream px-5 font-mono text-sm shadow-[inset_3px_3px_0_rgb(0_0_0/0.08)] placeholder:text-ink/40",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-sky",
        className,
      )}
      {...props}
    />
  );
}
