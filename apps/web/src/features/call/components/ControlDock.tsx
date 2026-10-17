import {
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
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
  isScreenSharing: boolean;
  isHandRaised: boolean;
  openPanel: CallPanel | null;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreenShare: () => void;
  onToggleHand: () => void;
  onReact: (emoji: string) => void;
  onTogglePanel: (panel: CallPanel) => void;
  onLeave: () => void;
  className?: string;
}

const ICON = "size-5";

/** The floating sticker-board of call controls. */
export function ControlDock({
  isMicOn,
  isCamOn,
  isScreenSharing,
  isHandRaised,
  openPanel,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
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
        "flex w-max max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-center gap-1 rounded-[2rem] border-[3px] border-ink bg-sun p-2 shadow-hard-lg sm:gap-3 sm:p-3",
        className,
      )}
    >
      <IconButton
        label={isMicOn ? "Mute" : "Unmute"}
        tone={isMicOn ? "cream" : "tomato"}
        aria-pressed={!isMicOn}
        onClick={onToggleMic}
        icon={isMicOn ? <Mic className={ICON} /> : <MicOff className={ICON} />}
      />
      <IconButton
        label={isCamOn ? "Camera off" : "Camera on"}
        tone={isCamOn ? "cream" : "tomato"}
        aria-pressed={!isCamOn}
        onClick={onToggleCam}
        icon={
          isCamOn ? <Video className={ICON} /> : <VideoOff className={ICON} />
        }
      />
      {/* Screen sharing isn't available on phones. */}
      <div className="hidden sm:block">
        <IconButton
          label={isScreenSharing ? "Stop sharing" : "Share screen"}
          tone={isScreenSharing ? "mint" : "cream"}
          aria-pressed={isScreenSharing}
          onClick={onToggleScreenShare}
          icon={<MonitorUp className={ICON} />}
        />
      </div>

      <Divider />

      <IconButton
        label={isHandRaised ? "Lower hand" : "Raise hand"}
        tone={isHandRaised ? "tangerine" : "cream"}
        aria-pressed={isHandRaised}
        onClick={onToggleHand}
        icon={<Hand className={ICON} />}
      />
      <ReactionPicker onReact={onReact} />

      <Divider />

      <IconButton
        label="Chat"
        tone={openPanel === "chat" ? "grape" : "cream"}
        aria-pressed={openPanel === "chat"}
        onClick={() => onTogglePanel("chat")}
        icon={<MessageCircle className={ICON} />}
      />
      <IconButton
        label="People"
        tone={openPanel === "people" ? "grape" : "cream"}
        aria-pressed={openPanel === "people"}
        onClick={() => onTogglePanel("people")}
        icon={<Users className={ICON} />}
      />

      <IconButton
        label="Leave call"
        tone="tomato"
        size="lg"
        onClick={onLeave}
        icon={<PhoneOff className="size-6" />}
        className="sm:ml-2"
      />
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-8 w-0.5 rounded-full bg-ink/40 sm:block"
    />
  );
}
