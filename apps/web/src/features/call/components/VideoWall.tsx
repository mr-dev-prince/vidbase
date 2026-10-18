import { Sticker } from "@/components/ui/Sticker";
import type { MediaStatus } from "@/hooks/useLocalMedia";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types";
import { VideoTile } from "./VideoTile";

interface VideoWallProps {
  /** Everyone in the call, in the order they joined. */
  participants: Participant[];
  localStream: MediaStream | null;
  localStatus: MediaStatus;
  /** Streams received over WebRTC, by peer id. */
  remoteStreams: Record<string, MediaStream>;
  linkStates: Record<string, RTCPeerConnectionState>;
}

/**
 * How the wall is laid out for a given number of people: `wall` caps the
 * total width so the tiles fit the screen's height, `tile` sets each tile's
 * width (columns). Rows are centered, so an odd one out sits in the middle.
 */
function layoutFor(count: number) {
  // 1 person: one big tile (with room below it for the waiting note).
  if (count <= 1) {
    return {
      wall: "max-w-[clamp(20rem,calc((100dvh_-_20rem)_*_4/3),56rem)]",
      tile: "w-full",
    };
  }
  // 2 people: side by side.
  if (count === 2) {
    return {
      wall: "max-w-[clamp(20rem,calc((100dvh_-_16rem)_*_8/3_+_2rem),80rem)]",
      tile: "w-full sm:w-[calc(50%_-_1rem)]",
    };
  }
  // 3–4 people: two rows of two.
  if (count <= 4) {
    return {
      wall: "max-w-[clamp(20rem,calc((100dvh_-_24rem)_*_4/3_+_2rem),64rem)]",
      tile: "w-full sm:w-[calc(50%_-_1rem)]",
    };
  }
  // 5 people: three on top, two below.
  return {
    wall: "max-w-[clamp(20rem,calc((100dvh_-_24rem)_*_2_+_4rem),80rem)]",
    tile: "w-full sm:w-[calc(50%_-_1rem)] lg:w-[calc((100%_-_4rem)/3)]",
  };
}

/** Everyone in the call, pinned up like photos on a corkboard. */
export function VideoWall({
  participants,
  localStream,
  localStatus,
  remoteStreams,
  linkStates,
}: VideoWallProps) {
  const layout = layoutFor(participants.length);
  const isAlone = participants.length <= 1;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6">
      <ul
        aria-label="Participants"
        className={cn(
          "mx-auto flex w-full flex-wrap justify-center gap-x-8 gap-y-12",
          layout.wall,
        )}
      >
        {participants.map((participant, index) => (
          <li key={participant.id} className={layout.tile}>
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
      </ul>
      {isAlone && (
        <output>
          <Sticker tone="cream" className="-rotate-2 px-3 py-2 text-sm">
            <span
              aria-hidden
              className="size-2 animate-blink rounded-full bg-tomato"
            />
            waiting for others to join…
          </Sticker>
        </output>
      )}
    </div>
  );
}
