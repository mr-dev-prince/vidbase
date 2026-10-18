"use client";

import { STREAM_CATEGORIES, type StreamCategory } from "@vidbase/shared";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useState } from "react";
import { ReactionLayer } from "@/components/media/ReactionLayer";
import { IconButton } from "@/components/ui/IconButton";
import { Rays } from "@/components/ui/Rays";
import { Receipt } from "@/components/ui/Receipt";
import { Sticker } from "@/components/ui/Sticker";
import { TvFrame } from "@/components/ui/TvFrame";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { SYSTEM_AUTHOR } from "@/features/chat/system";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { type BroadcastProblem, useBroadcast } from "../hooks/useBroadcast";
import { useStreamChat } from "../hooks/useStreamChat";
import { BroadcastScreen } from "./BroadcastScreen";
import { GoLiveButton } from "./GoLiveButton";
import { OnAirSign } from "./OnAirSign";
import { ShareStreamLink } from "./ShareStreamLink";
import { StreamSetup } from "./StreamSetup";
import { StudioStats } from "./StudioStats";
import { ViewerCount } from "./ViewerCount";

const PROBLEMS: Record<BroadcastProblem, string> = {
  unavailable: "streaming isn't set up on the server yet",
  "sfu-error": "couldn't reach the video service, try again",
  "rate-limited": "too many tries, wait a few seconds",
  unreachable: "can't reach the server",
  lost: "connection lost, your stream ended",
  "over-budget": "this month's free streaming time is used up, back on the 1st",
  "invalid-request": "something went wrong, try again",
  "not-found": "something went wrong, try again",
  full: "something went wrong, try again",
};

/** The broadcaster's desk: preview, controls, setup and chat. */
export function Studio() {
  const media = useLocalMedia();
  const profile = useGuestProfile();
  const [title, setTitle] = useState("My extremely cool stream");
  const [category, setCategory] = useState<StreamCategory>(
    STREAM_CATEGORIES[0],
  );
  const broadcast = useBroadcast(media.stream);
  const isLive = broadcast.status === "live";
  const elapsedSeconds = useElapsedSeconds(isLive);
  const chat = useStreamChat(isLive, profile);

  const toggleLive = async () => {
    if (isLive) {
      broadcast.end();
      chat.post({
        kind: "system",
        author: SYSTEM_AUTHOR,
        text: "stream ended",
      });
      return;
    }
    if (!profile) return;
    const details = { title: title.trim() || "Untitled stream", category };
    if (await broadcast.goLive(details, profile)) {
      chat.post({
        kind: "system",
        author: SYSTEM_AUTHOR,
        text: `you're live: ${details.title}`,
      });
    }
  };

  const preview = media.isCamOn ? media.stream : null;
  const isConnectingVideo = isLive && broadcast.mediaState !== "connected";
  const host = profile ?? { name: "You", accent: "lime" as const };

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
              host={host}
              stream={preview}
              mirrored
              caption={isLive ? "you're live" : "preview"}
            />
            <ReactionLayer reactions={chat.reactions} />
            {media.status !== "ready" ? (
              <Sticker tone="cream" className="absolute top-4 left-4 -rotate-3">
                {media.status === "blocked"
                  ? "camera blocked: check permissions"
                  : "asking for camera…"}
              </Sticker>
            ) : (
              isConnectingVideo && (
                <Sticker
                  tone="cream"
                  className="absolute top-4 left-4 -rotate-3"
                >
                  sending video…
                </Sticker>
              )
            )}
          </TvFrame>
          {isLive && (
            <ViewerCount
              viewers={broadcast.viewers}
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
              {category} ·{" "}
              {broadcast.status === "starting"
                ? "going live…"
                : isLive
                  ? "broadcasting"
                  : "not live yet"}
            </p>
          </div>
          <GoLiveButton
            isLive={isLive}
            onClick={toggleLive}
            disabled={
              !profile || !media.stream || broadcast.status === "starting"
            }
          />
        </div>

        {broadcast.problem && !isLive && (
          <p role="alert" className="self-start">
            <Sticker tone="tomato" className="-rotate-1 text-sm">
              {PROBLEMS[broadcast.problem]}
            </Sticker>
          </p>
        )}
        {broadcast.stream && <ShareStreamLink streamId={broadcast.stream.id} />}
      </div>

      <aside className="flex flex-col gap-8">
        <StreamSetup
          title={title}
          onTitleChange={setTitle}
          category={category}
          onCategoryChange={setCategory}
          disabled={broadcast.status !== "idle"}
        />
        <StudioStats
          viewers={broadcast.viewers}
          elapsedSeconds={elapsedSeconds}
          messages={chat.messages.length}
        />
        <Receipt title="your chat" className="h-[26rem]">
          <ChatPanel
            variant="receipt"
            messages={chat.messages}
            onSend={chat.send}
            meName={host.name}
            disabled={!isLive}
            placeholder={isLive ? "Talk to chat…" : "Go live to chat"}
          />
        </Receipt>
      </aside>
    </div>
  );
}
