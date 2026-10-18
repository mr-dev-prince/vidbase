// Live stream rules shared by the browser and the signaling server.

/**
 * Most people watching one stream at once. Video goes through Cloudflare's
 * SFU, not our server, so this is about keeping chat, reactions and the
 * viewer count manageable for the signaling server.
 */
export const MAX_VIEWERS = 100;

export const STREAM_TITLE_MAX_LENGTH = 80;

/**
 * Most bits per second the broadcaster's video may use (good 720p). Cloudflare
 * bills the video it sends to viewers, so the server budgets with this cap.
 */
export const STREAM_VIDEO_MAX_BITRATE = 1_200_000;

export const STREAM_CATEGORIES = [
  "Just chatting",
  "Music",
  "Gaming",
  "Coding",
  "Crafts",
  "Food",
] as const;

export type StreamCategory = (typeof STREAM_CATEGORIES)[number];

export function isStreamCategory(value: unknown): value is StreamCategory {
  return STREAM_CATEGORIES.includes(value as StreamCategory);
}
