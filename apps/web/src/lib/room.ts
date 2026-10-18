import { randomItem } from "./utils";

const ADJECTIVES = [
  "wobbly",
  "fizzy",
  "cosmic",
  "spicy",
  "groovy",
  "sleepy",
  "zesty",
  "bouncy",
  "jazzy",
  "fuzzy",
  "snappy",
  "breezy",
  "cheeky",
  "dizzy",
  "funky",
  "glossy",
  "jolly",
  "lucky",
  "mellow",
  "nifty",
  "peppy",
  "quirky",
  "rowdy",
  "sassy",
  "silly",
  "sparkly",
  "sunny",
  "swirly",
  "toasty",
  "twisty",
  "witty",
  "zippy",
] as const;

const NOUNS = [
  "mango",
  "noodle",
  "disco",
  "pickle",
  "comet",
  "waffle",
  "llama",
  "gecko",
  "banjo",
  "bagel",
  "cactus",
  "donut",
  "falcon",
  "gnome",
  "hippo",
  "jelly",
  "kazoo",
  "lemur",
  "marble",
  "muffin",
  "narwhal",
  "otter",
  "panda",
  "pretzel",
  "quokka",
  "rocket",
  "sprout",
  "taco",
  "tuba",
  "walrus",
  "yeti",
  "zebra",
] as const;

/** No 0/o or 1/l, so a code read aloud or typed by hand comes out right. */
const SUFFIX_CHARS = "23456789abcdefghjkmnpqrstuvwxyz";
const SUFFIX_LENGTH = 6;

/** A random index from the browser's secure generator (not Math.random). */
function secureIndex(length: number) {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value % length;
}

function secureItem<T>(list: readonly T[]): T {
  return list[secureIndex(list.length)];
}

/**
 * A room code such as "wobbly-mango-k7f3q9". The code is the only key to a
 * room, so it has to be hard to guess: 32 × 32 × 31⁶ ≈ 900 billion options.
 */
export function createRoomCode() {
  const suffix = Array.from({ length: SUFFIX_LENGTH }, () =>
    secureItem([...SUFFIX_CHARS]),
  ).join("");
  return `${secureItem(ADJECTIVES)}-${secureItem(NOUNS)}-${suffix}`;
}

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1);

/** A friendly placeholder name such as "Groovy Llama". */
export function createGuestName() {
  return `${capitalize(randomItem(ADJECTIVES))} ${capitalize(randomItem(NOUNS))}`;
}

/** Turns user input like " Wobbly Mango K7F3Q9 " into "wobbly-mango-k7f3q9". */
export function normalizeRoomCode(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
