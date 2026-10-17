/** The palette every person, stream and sticker is colored with. */
export const ACCENTS = [
  // Ordered so neighbours contrast, which keeps cycled lists lively.
  "tomato",
  "mint",
  "grape",
  "sun",
  "cobalt",
  "flamingo",
  "lime",
  "lilac",
  "tangerine",
  "sky",
  "bubblegum",
] as const;

export type Accent = (typeof ACCENTS)[number];

export function isAccent(value: unknown): value is Accent {
  return ACCENTS.includes(value as Accent);
}
