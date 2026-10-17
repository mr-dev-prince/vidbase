import { cn } from "@/lib/utils";

export function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-tomato px-2.5 py-0.5 font-mono text-xs font-bold uppercase shadow-hard-sm",
        className,
      )}
    >
      <span className="size-2 animate-blink rounded-full bg-ink" />
      Live
    </span>
  );
}
