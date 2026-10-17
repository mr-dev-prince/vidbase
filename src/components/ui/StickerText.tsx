import { accentAt, accentText } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface StickerTextProps {
  text: string;
  /** Shifts which accent the first letter gets. */
  offset?: number;
  className?: string;
}

/** Each letter a different color with an ink outline, like cut-out stickers. */
export function StickerText({ text, offset = 0, className }: StickerTextProps) {
  return (
    <span
      aria-label={text}
      role="img"
      className={cn("text-sticker", className)}
    >
      {Array.from(text, (char, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: letters of static text never reorder
          key={index}
          aria-hidden="true"
          className={cn(
            "inline-block transition-transform hover:-translate-y-1 hover:-rotate-6",
            accentText[accentAt(index + offset)],
          )}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
