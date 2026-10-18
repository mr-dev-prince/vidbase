"use client";

import { MAX_PARTICIPANTS } from "@vidbase/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactionLayer } from "@/components/media/ReactionLayer";
import { Notebook } from "@/components/ui/Notebook";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChat } from "@/features/chat/hooks/useChat";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { useFloatingReactions } from "@/hooks/useFloatingReactions";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { CALL_CHAT_SEED, ME } from "@/lib/mock-data";
import type { Participant } from "@/types";
import { usePeerMesh } from "../hooks/usePeerMesh";
import { shareMediaState } from "../services/roomSession";
import { useCallStore } from "../store/callStore";
import type { CallPanel } from "../types";
import { CallTopBar } from "./CallTopBar";
import { ControlDock } from "./ControlDock";
import { PeopleList } from "./PeopleList";
import { RemoteAudio } from "./RemoteAudio";
import { VideoWall } from "./VideoWall";

/** The in-call screen. Rendered only once the server has given you a seat. */
export function CallSession({ roomId }: { roomId: string }) {
  const router = useRouter();
  const self = useCallStore((state) => state.self);
  const peers = useCallStore((state) => state.peers);
  const isReconnecting = useCallStore((state) => state.isReconnecting);
  const remoteStreams = useCallStore((state) => state.remoteStreams);
  const linkStates = useCallStore((state) => state.linkStates);
  const media = useLocalMedia();
  // Sends your camera/mic to everyone and receives theirs (WebRTC).
  usePeerMesh(media.stream);
  const elapsedSeconds = useElapsedSeconds();
  const { reactions, fire } = useFloatingReactions();
  // Chat is still local-only; it isn't sent over the socket yet.
  const chat = useChat({ me: ME, initial: CALL_CHAT_SEED });
  const [openPanel, setOpenPanel] = useState<CallPanel | null>(null);
  const [isHandRaised, setHandRaised] = useState(false);

  const isMuted = !media.isMicOn;
  const isCameraOff = !media.isCamOn;

  // Tell the room whenever your mic, camera or hand changes.
  useEffect(() => {
    shareMediaState({ isMuted, isCameraOff, isHandRaised });
  }, [isMuted, isCameraOff, isHandRaised]);

  if (!self) return null;

  const participants: Participant[] = [
    { ...self, isLocal: true, isMuted, isCameraOff, isHandRaised },
    ...peers,
  ];

  const togglePanel = (panel: CallPanel) =>
    setOpenPanel((current) => (current === panel ? null : panel));
  const closePanel = () => setOpenPanel(null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <CallTopBar
        roomId={roomId}
        elapsedSeconds={elapsedSeconds}
        peopleCount={participants.length}
        capacity={MAX_PARTICIPANTS}
        isReconnecting={isReconnecting}
      />

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <main className="absolute inset-0 overflow-y-auto bg-lilac bg-dots px-5 pt-10 pb-40 sm:px-10 md:pr-36 md:pb-10">
            <VideoWall
              participants={participants}
              localStream={media.stream}
              localStatus={media.status}
              screenStream={media.screenStream}
              remoteStreams={remoteStreams}
              linkStates={linkStates}
            />
          </main>
          <RemoteAudio streams={Object.values(remoteStreams)} />
          <ReactionLayer reactions={reactions} />
          <ControlDock
            className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 md:top-1/2 md:right-5 md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2"
            isMicOn={media.isMicOn}
            isCamOn={media.isCamOn}
            isScreenSharing={media.isScreenSharing}
            isHandRaised={isHandRaised}
            openPanel={openPanel}
            onToggleMic={media.toggleMic}
            onToggleCam={media.toggleCam}
            onToggleScreenShare={media.toggleScreenShare}
            onToggleHand={() => setHandRaised((raised) => !raised)}
            onReact={fire}
            onTogglePanel={togglePanel}
            onLeave={() => router.push("/")}
          />
        </div>

        {openPanel && (
          <aside className="absolute inset-0 z-30 bg-paper/80 p-3 backdrop-blur-sm md:static md:w-92 md:bg-transparent md:p-4 md:pl-0 md:backdrop-blur-none">
            {openPanel === "chat" ? (
              <Notebook
                title="Group chat"
                onClose={closePanel}
                className="h-full"
              >
                <ChatPanel
                  messages={chat.messages}
                  onSend={chat.send}
                  meName={ME.name}
                />
              </Notebook>
            ) : (
              <Notebook
                title={`People (${participants.length}/${MAX_PARTICIPANTS})`}
                onClose={closePanel}
                className="h-full"
              >
                <PeopleList participants={participants} />
              </Notebook>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
