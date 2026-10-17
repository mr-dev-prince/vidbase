// Placeholder data (streams, chat lines) for UI that has no backend yet.

import type { Accent, Broadcast, ChatMessage, ChatSeed, Person } from "@/types";

const person = (name: string, accent: Accent): Person => ({ name, accent });

export const ME = person("You", "lime");
export const SYSTEM = person("vidbase", "sun");

const JUNO = person("Juno Park", "grape");
const DEV = person("Dev Okafor", "cobalt");

export const BROADCASTS: Broadcast[] = [
  {
    id: "late-night-synth-jam",
    title: "Late night synth jam 🎹",
    host: person("Kai Moreno", "grape"),
    category: "Music",
    viewers: 12840,
    tags: ["modular", "chill", "no-talking"],
    accent: "grape",
  },
  {
    id: "tetris-speedrun",
    title: "Tetris speedrun: no hold, no mercy",
    host: person("Leo Sato", "cobalt"),
    category: "Gaming",
    viewers: 48210,
    tags: ["speedrun", "retro"],
    accent: "cobalt",
  },
  {
    id: "cat-cam",
    title: "24/7 cat cam (he's plotting)",
    host: person("Biscuit Cat", "flamingo"),
    category: "Pets",
    viewers: 91200,
    tags: ["cats", "lofi", "plotting"],
    accent: "flamingo",
  },
  {
    id: "pottery-chaos",
    title: "Pottery wheel chaos, round 3",
    host: person("Ama Boateng", "tangerine"),
    category: "Crafts",
    viewers: 3420,
    tags: ["clay", "beginner", "oops"],
    accent: "tangerine",
  },
  {
    id: "rooftop-ramen",
    title: "Rooftop ramen from scratch",
    host: person("Noor Haddad", "tomato"),
    category: "Food",
    viewers: 7015,
    tags: ["noodles", "outdoors"],
    accent: "tomato",
  },
  {
    id: "building-webrtc",
    title: "Building a WebRTC app, live",
    host: person("Ines Duarte", "mint"),
    category: "Coding",
    viewers: 2310,
    tags: ["typescript", "nextjs", "webrtc"],
    accent: "mint",
  },
];

export function getBroadcast(id: string) {
  return BROADCASTS.find((broadcast) => broadcast.id === id);
}

export const CALL_CHAT_SEED: ChatMessage[] = [
  {
    id: "call-seed-1",
    kind: "system",
    author: SYSTEM,
    text: "Room created. Be weird, be kind.",
  },
  { id: "call-seed-2", author: JUNO, text: "is my mic working??" },
  { id: "call-seed-3", author: DEV, text: "yes juno, we can hear the blender" },
];

export const STREAM_CHAT_SEED: ChatMessage[] = [
  {
    id: "stream-seed-1",
    kind: "system",
    author: SYSTEM,
    text: "Welcome in. Throw emojis.",
  },
  {
    id: "stream-seed-2",
    author: person("pixelpanda", "cobalt"),
    text: "first time here!!",
  },
  {
    id: "stream-seed-3",
    author: person("noodle_wizard", "tangerine"),
    text: "the vibes are immaculate",
  },
];

const VIEWERS = [
  person("pixelpanda", "cobalt"),
  person("noodle_wizard", "tangerine"),
  person("moth.mom", "grape"),
  person("grumpyfern", "mint"),
  person("dj_toast", "sun"),
  person("kilobyte", "flamingo"),
];

const LINES = [
  "lmaooo",
  "W stream",
  "can you say hi to my mom",
  "🔥🔥🔥",
  "how long have you been doing this?",
  "is that a cat in the back",
  "audio is crispy today",
  "brb getting snacks",
  "who else came from the ticker",
  "this is my comfort stream",
  "chat is moving so fast nobody will see i'm a duck",
  "10/10 no notes",
];

/** Random audience messages used to make chat feel alive. */
export const AUDIENCE_CHATTER: ChatSeed[] = LINES.map((text, index) => ({
  author: VIEWERS[index % VIEWERS.length],
  text,
}));
