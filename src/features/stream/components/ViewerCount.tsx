import { Starburst } from "@/components/ui/Starburst";
import { cn, formatCount } from "@/lib/utils";

/** A spinning starburst slapped onto the corner of the TV. */
export function ViewerCount({
  viewers,
  className,
}: {
  viewers: number;
  className?: string;
}) {
  return (
    <Starburst tone="sun" className={cn("size-28 sm:size-32", className)}>
      <span className="flex flex-col items-center leading-none">
        <span className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">
          {formatCount(viewers)}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase">
          watching
        </span>
      </span>
    </Starburst>
  );
}
