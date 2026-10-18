"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { ChatBubble } from "./ChatBubble";
import { ReceiptLine } from "./ReceiptLine";

export type ChatVariant = "bubble" | "receipt";

interface ChatFeedProps {
  messages: ChatMessage[];
  meName: string;
  variant: ChatVariant;
  className?: string;
}

const VARIANT_STYLES: Record<ChatVariant, string> = {
  bubble: "gap-3 py-2 pr-4 pl-12",
  receipt: "gap-2 px-4 py-3",
};

export function ChatFeed({
  messages,
  meName,
  variant,
  className,
}: ChatFeedProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  // Stick to the newest message.
  useEffect(() => {
    if (!lastMessageId) return;
    const list = listRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [lastMessageId]);

  const Message = variant === "bubble" ? ChatBubble : ReceiptLine;

  return (
    <ol
      ref={listRef}
      // Busy stream chats would flood screen readers, so only calls announce.
      aria-live={variant === "bubble" ? "polite" : "off"}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {messages.map((message) => (
        <li key={message.id} className="flex flex-col">
          <Message
            message={message}
            isMine={message.isMine ?? message.author.name === meName}
          />
        </li>
      ))}
    </ol>
  );
}
