"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReactionLayer } from "@/components/media/ReactionLayer";
import { Notebook } from "@/components/ui/Notebook";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChat } from "@/features/chat/hooks/useChat";
import { useCycle } from "@/hooks/useCycle";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { useFloatingReactions } from "@/hooks/useFloatingReactions";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { CALL_CHAT_SEED, ME, MOCK_PARTICIPANTS } from "@/lib/mock-data";
import type { Participant } from "@/types";
import type { CallPanel } from "../types";
import { CallTopBar } from "./CallTopBar";
import { ControlDock } from "./ControlDock";
import { PeopleList } from "./PeopleList";
import { VideoWall } from "./VideoWall";

export function CallRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const media = useLocalMedia();
  const elapsedSeconds = useElapsedSeconds();
  const { reactions, fire } = useFloatingReactions();
  const chat = useChat({ me: ME, initial: CALL_CHAT_SEED });
  const [openPanel, setOpenPanel] = useState<CallPanel | null>(null);
  const [isHandRaised, setHandRaised] = useState(false);
  // Demo only: pass the "speaking" spotlight between remote participants.
  const speakerIndex = useCycle(MOCK_PARTICIPANTS.length, 3200);

  const participants: Participant[] = [
    {
      id: "local",
      ...ME,
      isLocal: true,
      isMuted: !media.isMicOn,
      isCameraOff: !media.isCamOn,
      isHandRaised,
    },
    ...MOCK_PARTICIPANTS.map((participant, index) => ({
      ...participant,
      isSpeaking: !participant.isMuted && index === speakerIndex,
    })),
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
      />

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <main className="absolute inset-0 overflow-y-auto bg-lilac bg-dots px-5 pt-10 pb-40 sm:px-10">
            <VideoWall
              participants={participants}
              localStream={media.stream}
              localStatus={media.status}
              screenStream={media.screenStream}
            />
          </main>
          <ReactionLayer reactions={reactions} />
          <ControlDock
            className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2"
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
          <aside className="absolute inset-0 z-30 bg-paper/80 p-3 backdrop-blur-sm md:static md:w-[23rem] md:bg-transparent md:p-4 md:pl-0 md:backdrop-blur-none">
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
                title={`People (${participants.length})`}
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
