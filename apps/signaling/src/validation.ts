// Everything a client sends is untrusted. These parsers return a clean,
// typed value, or null when the input is malformed.

import {
  CHAT_MESSAGE_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  isAccent,
  isReactionEmoji,
  isStreamCategory,
  isValidRoomId,
  type JoinRoomRequest,
  type PeerMediaState,
  type PeerProfile,
  type ReactionEmoji,
  type SessionDescription,
  type SignalPayload,
  STREAM_TITLE_MAX_LENGTH,
  type StartStreamRequest,
} from "@vidbase/shared";

const MEDIA_KEYS = ["isMuted", "isCameraOff", "isHandRaised"] as const;
/** Generous upper bound for an SDP blob, to stop oversized messages. */
const MAX_SDP_LENGTH = 20_000;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const stringOrNull = (value: unknown) =>
  typeof value === "string" ? value : null;

/** Picks the known boolean flags. Any non-boolean value rejects the patch. */
export function parseMediaPatch(
  value: unknown,
): Partial<PeerMediaState> | null {
  if (!isRecord(value)) return null;

  const patch: Partial<PeerMediaState> = {};
  for (const key of MEDIA_KEYS) {
    const flag = value[key];
    if (flag === undefined) continue;
    if (typeof flag !== "boolean") return null;
    patch[key] = flag;
  }
  return patch;
}

function parseMediaState(value: unknown): PeerMediaState | null {
  const patch = parseMediaPatch(value);
  if (!patch || MEDIA_KEYS.some((key) => patch[key] === undefined)) return null;
  return patch as PeerMediaState;
}

function parseProfile(value: unknown): PeerProfile | null {
  if (!isRecord(value)) return null;
  const name =
    typeof value.name === "string"
      ? value.name.trim().slice(0, DISPLAY_NAME_MAX_LENGTH)
      : "";
  return name && isAccent(value.accent) ? { name, accent: value.accent } : null;
}

export function parseJoinRequest(value: unknown): JoinRoomRequest | null {
  if (!isRecord(value)) return null;

  const { roomId } = value;
  const profile = parseProfile(value.profile);
  const media = parseMediaState(value.media);

  if (!isValidRoomId(roomId) || !profile || !media) return null;
  return { roomId, profile, media };
}

function parseDescription(
  value: unknown,
  type: SessionDescription["type"],
): SessionDescription | null {
  if (!isRecord(value) || value.type !== type) return null;
  const { sdp } = value;
  return typeof sdp === "string" && sdp.length <= MAX_SDP_LENGTH
    ? { type, sdp }
    : null;
}

/** A transceiver `mid`: short, and only letters or digits. */
const isMid = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9]{1,8}$/.test(value);

export function parseStartStream(value: unknown): StartStreamRequest | null {
  if (!isRecord(value) || !isRecord(value.details) || !isRecord(value.mids)) {
    return null;
  }
  const { details, mids } = value;
  const title =
    typeof details.title === "string"
      ? details.title.trim().slice(0, STREAM_TITLE_MAX_LENGTH)
      : "";
  const profile = parseProfile(value.profile);
  const offer = parseDescription(value.offer, "offer");

  if (
    !title ||
    !isStreamCategory(details.category) ||
    !profile ||
    !offer ||
    !isMid(mids.audio) ||
    !isMid(mids.video) ||
    mids.audio === mids.video
  ) {
    return null;
  }
  return {
    details: { title, category: details.category },
    profile,
    offer,
    mids: { audio: mids.audio, video: mids.video },
  };
}

export function parseWatchStream(
  value: unknown,
): { streamId: string; profile: PeerProfile } | null {
  if (!isRecord(value)) return null;
  const { streamId } = value;
  const profile = parseProfile(value.profile);
  return isValidRoomId(streamId) && profile ? { streamId, profile } : null;
}

export function parseAnswer(value: unknown) {
  return parseDescription(value, "answer");
}

export function parseSignalMessage(
  value: unknown,
): { to: string; payload: SignalPayload } | null {
  if (!isRecord(value) || typeof value.to !== "string") return null;
  const { to, payload } = value;
  if (!isRecord(payload)) return null;

  if (
    (payload.type === "offer" || payload.type === "answer") &&
    typeof payload.sdp === "string" &&
    payload.sdp.length <= MAX_SDP_LENGTH
  ) {
    return { to, payload: { type: payload.type, sdp: payload.sdp } };
  }

  const { candidate } = payload;
  if (
    payload.type === "ice-candidate" &&
    isRecord(candidate) &&
    typeof candidate.candidate === "string"
  ) {
    return {
      to,
      payload: {
        type: "ice-candidate",
        candidate: {
          candidate: candidate.candidate,
          sdpMid: stringOrNull(candidate.sdpMid),
          sdpMLineIndex:
            typeof candidate.sdpMLineIndex === "number"
              ? candidate.sdpMLineIndex
              : null,
          usernameFragment: stringOrNull(candidate.usernameFragment),
        },
      },
    };
  }

  return null;
}

/** Trimmed chat text, or null when empty or too long. */
export function parseChatText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= CHAT_MESSAGE_MAX_LENGTH ? text : null;
}

export function parseReaction(value: unknown): ReactionEmoji | null {
  return isReactionEmoji(value) ? value : null;
}
