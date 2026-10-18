/** The emoji people can throw. The server only relays these. */
export const REACTION_EMOJIS = ["🔥", "😂", "👏", "💖", "🤯", "🎉"] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export function isReactionEmoji(value: unknown): value is ReactionEmoji {
  return REACTION_EMOJIS.includes(value as ReactionEmoji);
}
