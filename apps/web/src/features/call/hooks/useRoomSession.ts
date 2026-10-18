"use client";

import { useEffect } from "react";
import { getGuestProfile } from "@/lib/guestProfile";
import { joinRoom } from "../services/roomSession";

/** Joins `roomId` while the component is mounted, and leaves on unmount. */
export function useRoomSession(roomId: string) {
  useEffect(() => joinRoom(roomId, getGuestProfile()), [roomId]);
}
