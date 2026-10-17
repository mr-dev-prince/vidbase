import type { MediaStatus } from "@/hooks/useLocalMedia";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types";
import { ScreenShareStage } from "./ScreenShareStage";
import { VideoTile } from "./VideoTile";

interface VideoWallProps {
  participants: Participant[];
  localStream: MediaStream | null;
  localStatus: MediaStatus;
  screenStream: MediaStream | null;
}

function columnsFor(count: number) {
  if (count <= 1) return "max-w-2xl";
  if (count <= 4) return "max-w-5xl sm:grid-cols-2";
  return "max-w-7xl sm:grid-cols-2 xl:grid-cols-3";
}

/** Everyone in the call, pinned up like photos on a corkboard. */
export function VideoWall({
  participants,
  localStream,
  localStatus,
  screenStream,
}: VideoWallProps) {
  return (
    <div className="flex flex-col gap-14">
      {screenStream && <ScreenShareStage stream={screenStream} />}
      <ul
        aria-label="Participants"
        className={cn(
          "mx-auto grid w-full gap-x-8 gap-y-12",
          columnsFor(participants.length),
        )}
      >
        {participants.map((participant, index) => (
          <li key={participant.id}>
            <VideoTile
              participant={participant}
              index={index}
              stream={participant.isLocal ? localStream : null}
              mediaStatus={participant.isLocal ? localStatus : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
