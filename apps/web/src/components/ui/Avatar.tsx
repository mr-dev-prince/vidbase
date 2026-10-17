import { accentBg } from "@/lib/theme";
import { cn, initials } from "@/lib/utils";
import type { Person } from "@/types";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-20 text-2xl",
  xl: "size-28 text-4xl sm:size-32 sm:text-5xl",
};

interface AvatarProps {
  person: Person;
  size?: AvatarSize;
  /** Slowly morphs the blob shape. */
  animated?: boolean;
  className?: string;
}

/** Initials on a colored blob. Decorative: the name is always shown nearby. */
export function Avatar({
  person,
  size = "md",
  animated,
  className,
}: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-blob border-2 border-ink font-display font-extrabold tracking-tight",
        accentBg[person.accent],
        SIZES[size],
        animated && "animate-blob",
        className,
      )}
    >
      {initials(person.name)}
    </span>
  );
}
