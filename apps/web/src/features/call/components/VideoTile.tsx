import { MicOff, VideoOff } from "lucide-react";
import type { ReactNode } from "react";
import { SpeakingBars } from "@/components/media/SpeakingBars";
import { VideoElement } from "@/components/media/VideoElement";
import { Avatar } from "@/components/ui/Avatar";
import { Sticker } from "@/components/ui/Sticker";
import { Tape } from "@/components/ui/Tape";
import type { MediaStatus } from "@/hooks/useLocalMedia";
import { accentAt, accentBg, tilt } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types";

interface VideoTileProps {
  participant: Participant;
  /** Position in the wall, used for tilt and tape color. */
  index: number;
  stream?: MediaStream | null;
  /** Camera permission state, only relevant for the local tile. */
  mediaStatus?: MediaStatus;
  /** WebRTC connection state, only relevant for remote tiles. */
  linkState?: RTCPeerConnectionState;
}

const LOCAL_NOTICE: Partial<Record<MediaStatus, string>> = {
  requesting: "asking for camera…",
  blocked: "camera blocked",
};

/** What to show on a remote tile until video is flowing. */
function linkNotice(state: RTCPeerConnectionState | undefined) {
  switch (state) {
    case "connected":
    case "closed":
      return undefined;
    case "disconnected":
      return "reconnecting…";
    case "failed":
      return "can't connect";
    default:
      return "connecting…";
  }
}

/** A participant pinned to the wall as a polaroid. */
export function VideoTile({
  participant,
  index,
  stream,
  mediaStatus,
  linkState,
}: VideoTileProps) {
  const { isLocal, isMuted, isCameraOff, isSpeaking, isHandRaised } =
    participant;
  const showVideo = stream && !isCameraOff;
  const notice = isLocal
    ? mediaStatus && LOCAL_NOTICE[mediaStatus]
    : linkNotice(linkState);

  return (
    <figure
      className={cn(
        "relative border-2 border-ink bg-cream p-2.5 pb-3 shadow-hard transition-transform duration-300 hover:rotate-0",
        tilt(index),
        isSpeaking && "ring-4 ring-lime ring-offset-4 ring-offset-paper",
      )}
    >
      <Tape tone={accentAt(index + 3)} seed={index + 1} />

      <div
        className={cn(
          "relative grid aspect-[4/3] place-items-center overflow-hidden border-2 border-ink",
          accentBg[participant.accent],
        )}
      >
        {showVideo ? (
          <VideoElement stream={stream} mirrored={isLocal} />
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-dots" />
            <Avatar
              person={participant}
              size="xl"
              animated={isSpeaking}
              className="relative"
            />
          </>
        )}

        {isSpeaking && <SpeakingBars className="absolute top-3 left-3" />}
        {notice && (
          <Sticker tone="cream" className="absolute top-3 left-3 -rotate-3">
            {notice}
          </Sticker>
        )}
        {isLocal && (
          <Sticker tone="lime" className="absolute right-3 bottom-3 rotate-6">
            that's you
          </Sticker>
        )}
      </div>

      <figcaption className="mt-3 flex items-center justify-between gap-2 px-1">
        <span className="truncate font-display text-xl font-extrabold tracking-tight">
          {participant.name}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {isMuted && (
            <StatusChip label="Muted">
              <MicOff className="size-3.5" />
            </StatusChip>
          )}
          {isCameraOff && (
            <StatusChip label="Camera off">
              <VideoOff className="size-3.5" />
            </StatusChip>
          )}
        </span>
      </figcaption>

      {isHandRaised && (
        <span
          role="img"
          aria-label="Hand raised"
          className="absolute -top-5 -right-4 z-10 grid size-12 animate-wobble place-items-center rounded-full border-2 border-ink bg-sun text-2xl shadow-hard-sm"
        >
          ✋
        </span>
      )}
    </figure>
  );
}

function StatusChip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className="grid size-7 place-items-center rounded-full border-2 border-ink bg-tomato"
    >
      {children}
    </span>
  );
}
