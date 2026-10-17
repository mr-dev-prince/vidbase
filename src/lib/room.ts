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
] as const;

/** A memorable room code such as "wobbly-mango-42". */
export function createRoomCode() {
  const number = 10 + Math.floor(Math.random() * 90);
  return `${randomItem(ADJECTIVES)}-${randomItem(NOUNS)}-${number}`;
}

/** Turns user input like " Wobbly Mango 42 " into "wobbly-mango-42". */
export function normalizeRoomCode(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
