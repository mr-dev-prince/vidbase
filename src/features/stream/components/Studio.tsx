"use client";

import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useState } from "react";
import { ReactionLayer } from "@/components/media/ReactionLayer";
import { IconButton } from "@/components/ui/IconButton";
import { Rays } from "@/components/ui/Rays";
import { Receipt } from "@/components/ui/Receipt";
import { Sticker } from "@/components/ui/Sticker";
import { TvFrame } from "@/components/ui/TvFrame";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChat } from "@/features/chat/hooks/useChat";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { useFloatingReactions } from "@/hooks/useFloatingReactions";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { AUDIENCE_CHATTER, ME, SYSTEM } from "@/lib/mock-data";
import { REACTION_EMOJIS } from "@/lib/reactions";
import { randomItem } from "@/lib/utils";
import { useAudience } from "../hooks/useAudience";
import { BroadcastScreen } from "./BroadcastScreen";
import { GoLiveButton } from "./GoLiveButton";
import { OnAirSign } from "./OnAirSign";
import {
  STREAM_CATEGORIES,
  type StreamCategory,
  StreamSetup,
} from "./StreamSetup";
import { StudioStats } from "./StudioStats";
import { ViewerCount } from "./ViewerCount";

/** The broadcaster's desk: preview, controls, setup and chat. */
export function Studio() {
  const media = useLocalMedia();
  const [isLive, setLive] = useState(false);
  const [title, setTitle] = useState("My extremely cool stream");
  const [category, setCategory] = useState<StreamCategory>(
    STREAM_CATEGORIES[0],
  );
  const elapsedSeconds = useElapsedSeconds(isLive);
  const viewers = useAudience(0, { enabled: isLive, trend: 4 });
  const { reactions, fire } = useFloatingReactions();
  const chat = useChat({
    me: ME,
    chatter: AUDIENCE_CHATTER,
    chatterEveryMs: 2200,
    chatterEnabled: isLive,
  });

  // Demo only: the "audience" throws emoji while you're live.
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => fire(randomItem(REACTION_EMOJIS)), 1800);
    return () => clearInterval(timer);
  }, [isLive, fire]);

  const toggleLive = () => {
    const next = !isLive;
    setLive(next);
    chat.post({
      kind: "system",
      author: SYSTEM,
      text: next ? `you're live: ${title || "untitled"}` : "stream ended",
    });
  };

  const preview = media.isCamOn ? media.stream : null;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* isolate: the rays sit behind everything in this column. */}
      <div className="isolate flex min-w-0 flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-6xl font-extrabold uppercase leading-none tracking-tighter sm:text-7xl">
            Studio<span className="text-tomato">.</span>
          </h1>
          <OnAirSign isLive={isLive} elapsedSeconds={elapsedSeconds} />
        </header>

        <div className="relative">
          <Rays
            tone={isLive ? "flamingo" : "mint"}
            className="top-1/2 left-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60 transition-colors"
          />
          <TvFrame tone="grape">
            <BroadcastScreen
              host={ME}
              stream={preview}
              mirrored
              caption={isLive ? "you're live" : "preview"}
            />
            <ReactionLayer reactions={reactions} />
            {media.status !== "ready" && (
              <Sticker tone="cream" className="absolute top-4 left-4 -rotate-3">
                {media.status === "blocked"
                  ? "camera blocked: check permissions"
                  : "asking for camera…"}
              </Sticker>
            )}
          </TvFrame>
          {isLive && (
            <ViewerCount
              viewers={viewers}
              className="absolute top-2 -right-2 sm:-right-6"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <IconButton
              label={media.isMicOn ? "Mute" : "Unmute"}
              tone={media.isMicOn ? "cream" : "tomato"}
              size="lg"
              aria-pressed={!media.isMicOn}
              onClick={media.toggleMic}
              icon={
                media.isMicOn ? (
                  <Mic className="size-6" />
                ) : (
                  <MicOff className="size-6" />
                )
              }
            />
            <IconButton
              label={media.isCamOn ? "Camera off" : "Camera on"}
              tone={media.isCamOn ? "cream" : "tomato"}
              size="lg"
              aria-pressed={!media.isCamOn}
              onClick={media.toggleCam}
              icon={
                media.isCamOn ? (
                  <Video className="size-6" />
                ) : (
                  <VideoOff className="size-6" />
                )
              }
            />
            <p className="max-w-[22ch] font-mono text-xs font-bold uppercase leading-snug text-ink/60">
              {category} · {isLive ? "broadcasting" : "not live yet"}
            </p>
          </div>
          <GoLiveButton isLive={isLive} onClick={toggleLive} />
        </div>
      </div>

      <aside className="flex flex-col gap-8">
        <StreamSetup
          title={title}
          onTitleChange={setTitle}
          category={category}
          onCategoryChange={setCategory}
        />
        <StudioStats
          viewers={viewers}
          elapsedSeconds={elapsedSeconds}
          messages={chat.messages.length}
        />
        <Receipt title="your chat" className="h-[26rem]">
          <ChatPanel
            variant="receipt"
            messages={chat.messages}
            onSend={chat.send}
            meName={ME.name}
            disabled={!isLive}
            placeholder={isLive ? "Talk to chat…" : "Go live to chat"}
          />
        </Receipt>
      </aside>
    </div>
  );
}
