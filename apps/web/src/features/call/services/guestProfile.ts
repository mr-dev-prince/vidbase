import { isAccent, type PeerProfile } from "@vidbase/shared";
import { createGuestName } from "@/lib/room";
import { ACCENTS } from "@/lib/theme";
import { randomItem } from "@/lib/utils";

const STORAGE_KEY = "vidbase:guest-profile";

function isProfile(value: unknown): value is PeerProfile {
  if (typeof value !== "object" || value === null) return false;
  const { name, accent } = value as Record<string, unknown>;
  return typeof name === "string" && isAccent(accent);
}

/**
 * A random name + color until real accounts exist. Kept per browser tab, so
 * a reload keeps your identity and a second tab acts as a different person.
 */
export function getGuestProfile(): PeerProfile {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (isProfile(saved)) return saved;
  } catch {
    // Storage blocked or corrupted: fall through and make a new profile.
  }

  const profile: PeerProfile = {
    name: createGuestName(),
    accent: randomItem(ACCENTS),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Not fatal: the profile just won't survive a reload.
  }
  return profile;
}
