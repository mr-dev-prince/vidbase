"use client";

import { MAX_PARTICIPANTS, type ReactionEmoji } from "@vidbase/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactionLayer } from "@/components/media/ReactionLayer";
import { RemoteAudio } from "@/components/media/RemoteAudio";
import { Notebook } from "@/components/ui/Notebook";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { useFloatingReactions } from "@/hooks/useFloatingReactions";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import type { Participant } from "@/types";
import { usePeerMesh } from "../hooks/usePeerMesh";
import { useSpeakingPeers } from "../hooks/useSpeakingPeers";
import {
  onReaction,
  sendChatMessage,
  sendReaction,
  shareMediaState,
} from "../services/roomSession";
import { useCallStore } from "../store/callStore";
import type { CallPanel } from "../types";
import { CallTopBar } from "./CallTopBar";
import { ControlDock } from "./ControlDock";
import { PeopleList } from "./PeopleList";
import { VideoWall } from "./VideoWall";

/** The in-call screen. Rendered only once the server has given you a seat. */
export function CallSession({ roomId }: { roomId: string }) {
  const router = useRouter();
  const self = useCallStore((state) => state.self);
  const peers = useCallStore((state) => state.peers);
  const isReconnecting = useCallStore((state) => state.isReconnecting);
  const remoteStreams = useCallStore((state) => state.remoteStreams);
  const linkStates = useCallStore((state) => state.linkStates);
  const chat = useCallStore((state) => state.chat);
  const media = useLocalMedia();
  // Sends your camera/mic to everyone and receives theirs (WebRTC).
  usePeerMesh(media.stream);
  const elapsedSeconds = useElapsedSeconds();
  const { reactions, fire } = useFloatingReactions();
  const speaking = useSpeakingPeers({
    ...remoteStreams,
    ...(self && { [self.id]: media.stream }),
  });
  const [openPanel, setOpenPanel] = useState<CallPanel | null>(null);
  const [isHandRaised, setHandRaised] = useState(false);
  // The newest message you've had a chance to read, for the unread dot.
  const lastChatId = chat.at(-1)?.id;
  const [seenChatId, setSeenChatId] = useState(lastChatId);
  const hasUnreadChat = openPanel !== "chat" && lastChatId !== seenChatId;

  const isMuted = !media.isMicOn;
  const isCameraOff = !media.isCamOn;

  // Tell the room whenever your mic, camera or hand changes.
  useEffect(() => {
    shareMediaState({ isMuted, isCameraOff, isHandRaised });
  }, [isMuted, isCameraOff, isHandRaised]);

  // Other people's emoji float up on your screen too.
  useEffect(() => onReaction(fire), [fire]);

  if (!self) return null;

  const participants: Participant[] = [
    {
      ...self,
      isLocal: true,
      isMuted,
      isCameraOff,
      isHandRaised,
      isSpeaking: speaking.has(self.id),
    },
    ...peers.map((peer) => ({ ...peer, isSpeaking: speaking.has(peer.id) })),
  ];

  const react = (emoji: ReactionEmoji) => {
    fire(emoji);
    sendReaction(emoji);
  };

  // Leaving the chat panel marks everything in it as read.
  const switchPanel = (next: CallPanel | null) => {
    if (openPanel === "chat") setSeenChatId(lastChatId);
    setOpenPanel(next);
  };
  const togglePanel = (panel: CallPanel) =>
    switchPanel(openPanel === panel ? null : panel);
  const closePanel = () => switchPanel(null);

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
            isHandRaised={isHandRaised}
            hasUnreadChat={hasUnreadChat}
            openPanel={openPanel}
            onToggleMic={media.toggleMic}
            onToggleCam={media.toggleCam}
            onToggleHand={() => setHandRaised((raised) => !raised)}
            onReact={react}
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
                  messages={chat}
                  onSend={sendChatMessage}
                  meName={self.name}
                  placeholder={chat.length ? undefined : "Say hi to the room…"}
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
