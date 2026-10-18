"use client";

import type { ReactionEmoji } from "@vidbase/shared";
import { useCallback, useEffect, useState } from "react";
import { useFloatingReactions } from "@/hooks/useFloatingReactions";
import { createId } from "@/lib/utils";
import type { ChatMessage, ChatSeed, Person } from "@/types";
import {
  onStreamMessages,
  sendStreamChat,
  sendStreamReaction,
} from "../services/streamSocket";

const MAX_MESSAGES = 200;

/**
 * A stream's chat and floating reactions, for the broadcaster and viewers
 * alike. Listens only while `active` (live, or watching).
 */
export function useStreamChat(active: boolean, me: Person | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { reactions, fire } = useFloatingReactions();

  /** Adds any message (including notices) to the feed. */
  const post = useCallback((message: ChatSeed) => {
    setMessages((current) => [
      ...current.slice(-(MAX_MESSAGES - 1)),
      { ...message, id: createId() },
    ]);
  }, []);

  useEffect(() => {
    if (!active) return;
    return onStreamMessages({
      onChat: ({ author, text }) =>
        post({ author: { name: author.name, accent: author.accent }, text }),
      onReaction: fire,
    });
  }, [active, fire, post]);

  const send = (text: string) => {
    const sent = sendStreamChat(text);
    if (sent && me) post({ author: me, text: sent, isMine: true });
  };

  const react = (emoji: ReactionEmoji) => {
    fire(emoji);
    sendStreamReaction(emoji);
  };

  return { messages, post, send, reactions, react };
}
