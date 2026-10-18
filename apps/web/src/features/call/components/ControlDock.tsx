import type { ReactionEmoji } from "@vidbase/shared";
import {
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";
import type { CallPanel } from "../types";
import { ReactionPicker } from "./ReactionPicker";

interface ControlDockProps {
  isMicOn: boolean;
  isCamOn: boolean;
  isHandRaised: boolean;
  /** New chat messages since you last had the chat open. */
  hasUnreadChat: boolean;
  openPanel: CallPanel | null;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleHand: () => void;
  onReact: (emoji: ReactionEmoji) => void;
  onTogglePanel: (panel: CallPanel) => void;
  onLeave: () => void;
  className?: string;
}

const ICON = "size-5";

/**
 * The floating sticker-board of call controls: a row along the bottom on
 * small screens, a column down the right side from `md` up.
 */
export function ControlDock({
  isMicOn,
  isCamOn,
  isHandRaised,
  hasUnreadChat,
  openPanel,
  onToggleMic,
  onToggleCam,
  onToggleHand,
  onReact,
  onTogglePanel,
  onLeave,
  className,
}: ControlDockProps) {
  return (
    <div
      role="toolbar"
      aria-label="Call controls"
      className={cn(
        "flex w-max max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-center gap-1 rounded-[2rem] border-[3px] border-ink bg-sun p-2 shadow-hard-lg sm:gap-3 sm:p-3 md:max-w-none md:flex-col md:flex-nowrap",
        className,
      )}
    >
      <IconButton
        tooltipSide="left-md"
        label={isMicOn ? "Mute" : "Unmute"}
        tone={isMicOn ? "cream" : "tomato"}
        aria-pressed={!isMicOn}
        onClick={onToggleMic}
        icon={isMicOn ? <Mic className={ICON} /> : <MicOff className={ICON} />}
      />
      <IconButton
        tooltipSide="left-md"
        label={isCamOn ? "Camera off" : "Camera on"}
        tone={isCamOn ? "cream" : "tomato"}
        aria-pressed={!isCamOn}
        onClick={onToggleCam}
        icon={
          isCamOn ? <Video className={ICON} /> : <VideoOff className={ICON} />
        }
      />

      <Divider />

      <IconButton
        tooltipSide="left-md"
        label={isHandRaised ? "Lower hand" : "Raise hand"}
        tone={isHandRaised ? "tangerine" : "cream"}
        aria-pressed={isHandRaised}
        onClick={onToggleHand}
        icon={<Hand className={ICON} />}
      />
      <ReactionPicker onReact={onReact} />

      <Divider />

      <div className="relative">
        <IconButton
          tooltipSide="left-md"
          label={hasUnreadChat ? "Chat (new messages)" : "Chat"}
          tone={openPanel === "chat" ? "grape" : "cream"}
          aria-pressed={openPanel === "chat"}
          onClick={() => onTogglePanel("chat")}
          icon={<MessageCircle className={ICON} />}
        />
        {hasUnreadChat && (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1 -right-1 size-4 animate-bounce-blob rounded-full border-2 border-ink bg-tomato"
          />
        )}
      </div>
      <IconButton
        tooltipSide="left-md"
        label="People"
        tone={openPanel === "people" ? "grape" : "cream"}
        aria-pressed={openPanel === "people"}
        onClick={() => onTogglePanel("people")}
        icon={<Users className={ICON} />}
      />

      <IconButton
        tooltipSide="left-md"
        label="Leave call"
        tone="tomato"
        size="lg"
        onClick={onLeave}
        icon={<PhoneOff className="size-6" />}
        className="sm:ml-2 md:mt-2 md:ml-0"
      />
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-8 w-0.5 rounded-full bg-ink/40 sm:block md:h-0.5 md:w-8"
    />
  );
}
