"use client";

import { Loader } from "@/components/ui/Loader";
import { useRoomSession } from "../hooks/useRoomSession";
import { knockAgain } from "../services/roomSession";
import { useCallStore } from "../store/callStore";
import { CallSession } from "./CallSession";
import { ConnectionProblem } from "./ConnectionProblem";
import { RoomFull } from "./RoomFull";

/**
 * Entry point for a room: asks the server for a seat, then shows the call,
 * the "room full" screen or a connection problem. The camera is only
 * requested once you're actually in (inside CallSession).
 */
export function CallRoom({ roomId }: { roomId: string }) {
  useRoomSession(roomId);
  const status = useCallStore((state) => state.status);
  const occupants = useCallStore((state) => state.occupants);

  switch (status) {
    case "joined":
      return <CallSession roomId={roomId} />;
    case "full":
      return (
        <RoomFull
          roomId={roomId}
          occupants={occupants}
          onKnockAgain={knockAgain}
        />
      );
    case "unreachable":
    case "invalid":
      return <ConnectionProblem problem={status} roomId={roomId} />;
    default:
      return <Loader label="Knocking on the door" className="min-h-dvh" />;
  }
}
