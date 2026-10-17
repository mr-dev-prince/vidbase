import { accentBg } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
  isMine: boolean;
}

/** Comic-style speech bubble, used on the notebook chat. */
export function ChatBubble({ message, isMine }: ChatBubbleProps) {
  if (message.kind === "system") {
    return (
      <p className="mx-auto w-fit -rotate-2 rounded border-2 border-dashed border-ink px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-ink/70">
        {message.text}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1",
        isMine ? "items-end self-end" : "items-start self-start",
      )}
    >
      <span className="px-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/60">
        {message.author.name}
      </span>
      <p
        className={cn(
          "rounded-2xl border-2 border-ink px-3.5 py-2 text-[15px] leading-snug shadow-hard-sm [overflow-wrap:anywhere]",
          isMine
            ? "rounded-br-sm bg-lime"
            : cn("rounded-bl-sm", accentBg[message.author.accent]),
        )}
      >
        {message.text}
      </p>
    </div>
  );
}
