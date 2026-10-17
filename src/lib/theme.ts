import type { Accent, Tone } from "@/types";

// Class names are written out in full so Tailwind can detect them.

/** Ordered so neighbours contrast, which keeps cycled lists lively. */
export const ACCENTS: readonly Accent[] = [
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
];

/** Picks an accent by position, e.g. to give each card a different color. */
export function accentAt(index: number): Accent {
  return ACCENTS[index % ACCENTS.length];
}

export const accentBg: Record<Accent, string> = {
  tomato: "bg-tomato",
  tangerine: "bg-tangerine",
  sun: "bg-sun",
  lime: "bg-lime",
  mint: "bg-mint",
  sky: "bg-sky",
  cobalt: "bg-cobalt",
  lilac: "bg-lilac",
  grape: "bg-grape",
  bubblegum: "bg-bubblegum",
  flamingo: "bg-flamingo",
};

export const accentText: Record<Accent, string> = {
  tomato: "text-tomato",
  tangerine: "text-tangerine",
  sun: "text-sun",
  lime: "text-lime",
  mint: "text-mint",
  sky: "text-sky",
  cobalt: "text-cobalt",
  lilac: "text-lilac",
  grape: "text-grape",
  bubblegum: "text-bubblegum",
  flamingo: "text-flamingo",
};

export const accentFill: Record<Accent, string> = {
  tomato: "fill-tomato",
  tangerine: "fill-tangerine",
  sun: "fill-sun",
  lime: "fill-lime",
  mint: "fill-mint",
  sky: "fill-sky",
  cobalt: "fill-cobalt",
  lilac: "fill-lilac",
  grape: "fill-grape",
  bubblegum: "fill-bubblegum",
  flamingo: "fill-flamingo",
};

/** Semi-transparent fills, used for masking-tape strips. */
export const accentTape: Record<Accent, string> = {
  tomato: "bg-tomato/80",
  tangerine: "bg-tangerine/80",
  sun: "bg-sun/80",
  lime: "bg-lime/80",
  mint: "bg-mint/80",
  sky: "bg-sky/80",
  cobalt: "bg-cobalt/80",
  lilac: "bg-lilac/80",
  grape: "bg-grape/80",
  bubblegum: "bg-bubblegum/80",
  flamingo: "bg-flamingo/80",
};

/** Background + matching text color for buttons and stickers. */
export const toneClasses: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  cream: "bg-cream text-ink",
  tomato: "bg-tomato text-ink",
  tangerine: "bg-tangerine text-ink",
  sun: "bg-sun text-ink",
  lime: "bg-lime text-ink",
  mint: "bg-mint text-ink",
  sky: "bg-sky text-ink",
  cobalt: "bg-cobalt text-ink",
  lilac: "bg-lilac text-ink",
  grape: "bg-grape text-ink",
  bubblegum: "bg-bubblegum text-ink",
  flamingo: "bg-flamingo text-ink",
};

const TILTS = [
  "-rotate-2",
  "rotate-1",
  "rotate-2",
  "-rotate-1",
  "rotate-3",
  "-rotate-3",
] as const;

/** A slight, deterministic rotation so lists look hand-placed. */
export function tilt(index: number) {
  return TILTS[index % TILTS.length];
}
