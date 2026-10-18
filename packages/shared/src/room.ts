// Room rules shared by the browser and the signaling server.

/** Hard cap on people in one call room, including you. */
export const MAX_PARTICIPANTS = 5;

export const ROOM_ID_MAX_LENGTH = 64;
export const DISPLAY_NAME_MAX_LENGTH = 32;
export const CHAT_MESSAGE_MAX_LENGTH = 280;

/** Lowercase words joined by single dashes, e.g. "wobbly-mango-42". */
const ROOM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidRoomId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= ROOM_ID_MAX_LENGTH &&
    ROOM_ID_PATTERN.test(value)
  );
}
