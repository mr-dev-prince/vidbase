import type { MediaStatus } from "@/hooks/useLocalMedia";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types";
import { EmptySeat } from "./EmptySeat";
import { ScreenShareStage } from "./ScreenShareStage";
import { VideoTile } from "./VideoTile";

interface VideoWallProps {
  roomId: string;
  participants: Participant[];
  /** Total seats in the room; free ones are shown as open seats. */
  capacity: number;
  localStream: MediaStream | null;
  localStatus: MediaStatus;
  screenStream: MediaStream | null;
  /** Streams received over WebRTC, by peer id. */
  remoteStreams: Record<string, MediaStream>;
  linkStates: Record<string, RTCPeerConnectionState>;
}

function columnsFor(seats: number) {
  if (seats <= 1) return "max-w-2xl";
  if (seats <= 4) return "max-w-5xl sm:grid-cols-2";
  return "max-w-7xl sm:grid-cols-2 xl:grid-cols-3";
}

/** Everyone in the call, pinned up like photos on a corkboard. */
export function VideoWall({
  roomId,
  participants,
  capacity,
  localStream,
  localStatus,
  screenStream,
  remoteStreams,
  linkStates,
}: VideoWallProps) {
  const openSeats = Array.from(
    { length: Math.max(0, capacity - participants.length) },
    (_, i) => participants.length + i,
  );

  return (
    <div className="flex flex-col gap-14">
      {screenStream && <ScreenShareStage stream={screenStream} />}
      {/* The layout is sized for a full room, so it doesn't jump as people join. */}
      <ul
        aria-label="Participants"
        className={cn(
          "mx-auto grid w-full gap-x-8 gap-y-12",
          columnsFor(capacity),
        )}
      >
        {participants.map((participant, index) => (
          <li key={participant.id}>
            <VideoTile
              participant={participant}
              index={index}
              stream={
                participant.isLocal
                  ? localStream
                  : remoteStreams[participant.id]
              }
              mediaStatus={participant.isLocal ? localStatus : undefined}
              linkState={linkStates[participant.id]}
            />
          </li>
        ))}
        {openSeats.map((seatIndex) => (
          <li key={`seat-${seatIndex}`}>
            <EmptySeat roomId={roomId} index={seatIndex} />
          </li>
        ))}
      </ul>
    </div>
  );
}
