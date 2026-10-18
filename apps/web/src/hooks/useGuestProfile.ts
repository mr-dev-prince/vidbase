"use client";

import type { PeerProfile } from "@vidbase/shared";
import { useEffect, useState } from "react";
import { getGuestProfile } from "@/lib/guestProfile";

/**
 * Your random guest name and color. Null on the first render: it's kept in
 * sessionStorage, which only exists in the browser.
 */
export function useGuestProfile() {
  const [profile, setProfile] = useState<PeerProfile | null>(null);
  useEffect(() => setProfile(getGuestProfile()), []);
  return profile;
}
