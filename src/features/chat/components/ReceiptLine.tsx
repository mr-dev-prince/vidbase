import { accentBg } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ReceiptLineProps {
  message: ChatMessage;
  isMine: boolean;
}

/** A printed line on the receipt chat: "NAME  message". */
export function ReceiptLine({ message, isMine }: ReceiptLineProps) {
  if (message.kind === "system") {
    return (
      <p className="py-1 text-center text-[11px] uppercase tracking-widest text-ink/60">
        — {message.text} —
      </p>
    );
  }

  return (
    <p className="text-[13px] leading-snug [overflow-wrap:anywhere]">
      <span
        className={cn(
          "mr-1.5 rounded-sm px-1 font-bold uppercase",
          isMine ? "bg-ink text-paper" : accentBg[message.author.accent],
        )}
      >
        {message.author.name}
      </span>
      {message.text}
    </p>
  );
}
