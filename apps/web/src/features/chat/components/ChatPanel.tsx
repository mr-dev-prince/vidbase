import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { ChatComposer } from "./ChatComposer";
import { ChatFeed, type ChatVariant } from "./ChatFeed";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  meName: string;
  variant?: ChatVariant;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** Message feed + composer. Put it inside a Notebook or a Receipt. */
export function ChatPanel({
  messages,
  onSend,
  meName,
  variant = "bubble",
  placeholder,
  disabled,
  className,
}: ChatPanelProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <ChatFeed messages={messages} meName={meName} variant={variant} />
      <ChatComposer
        onSend={onSend}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "border-ink/60",
          variant === "receipt" ? "border-t-2 border-dashed" : "border-t-2",
        )}
      />
    </div>
  );
}
