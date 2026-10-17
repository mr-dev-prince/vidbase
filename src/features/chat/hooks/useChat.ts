"use client";

import { useCallback, useEffect, useState } from "react";
import { createId, randomItem } from "@/lib/utils";
import type { ChatMessage, ChatSeed, Person } from "@/types";

const MAX_MESSAGES = 200;

interface UseChatOptions {
  me: Person;
  initial?: ChatMessage[];
  /** Demo only: messages randomly "received" from other people. */
  chatter?: readonly ChatSeed[];
  chatterEveryMs?: number;
  chatterEnabled?: boolean;
}

export function useChat({
  me,
  initial = [],
  chatter,
  chatterEveryMs = 3000,
  chatterEnabled = true,
}: UseChatOptions) {
  const [messages, setMessages] = useState(initial);

  /** Adds any message (including system notices) to the feed. */
  const post = useCallback((message: ChatSeed) => {
    setMessages((current) => [
      ...current.slice(-(MAX_MESSAGES - 1)),
      { ...message, id: createId() },
    ]);
  }, []);

  /** Sends a message as the current user. */
  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed) post({ author: me, text: trimmed });
    },
    [me, post],
  );

  useEffect(() => {
    if (!chatterEnabled || !chatter?.length) return;
    const timer = setInterval(() => post(randomItem(chatter)), chatterEveryMs);
    return () => clearInterval(timer);
  }, [chatter, chatterEnabled, chatterEveryMs, post]);

  return { messages, send, post };
}
