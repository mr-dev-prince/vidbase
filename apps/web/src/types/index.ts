import type { Accent } from "@vidbase/shared";

// The palette is defined in @vidbase/shared, since the server validates it too.
export type { Accent };

/** Surface colors for buttons and stickers: any accent plus ink and cream. */
export type Tone = Accent | "ink" | "cream";

export interface Person {
  name: string;
  accent: Accent;
}

export interface Participant extends Person {
  id: string;
  isLocal?: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeaking?: boolean;
  isHandRaised?: boolean;
}

export interface Broadcast {
  id: string;
  title: string;
  host: Person;
  category: string;
  viewers: number;
  tags: string[];
  accent: Accent;
}

export type ChatMessageKind = "message" | "system";

export interface ChatMessage {
  id: string;
  author: Person;
  text: string;
  kind?: ChatMessageKind;
}

/** A chat message before it has been given an id. */
export type ChatSeed = Omit<ChatMessage, "id">;

export interface FloatingReaction {
  id: string;
  emoji: string;
  /** Horizontal position, as a percentage of the container width. */
  left: number;
}
