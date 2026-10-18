"use client";

import { ReactionLayer } from "@/components/media/ReactionLayer";
import { RemoteAudio } from "@/components/media/RemoteAudio";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Loader } from "@/components/ui/Loader";
import { Rays } from "@/components/ui/Rays";
import { Receipt } from "@/components/ui/Receipt";
import { Sticker } from "@/components/ui/Sticker";
import { TvFrame } from "@/components/ui/TvFrame";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { useStreamChat } from "../hooks/useStreamChat";
import { useWatchStream } from "../hooks/useWatchStream";
import { BroadcastScreen } from "./BroadcastScreen";
import { ReactionBar } from "./ReactionBar";
import { StreamDetails } from "./StreamDetails";
import { StreamUnavailable } from "./StreamUnavailable";
import { ViewerCount } from "./ViewerCount";

/** What to show on the TV until the video is flowing. */
function playerNotice(
  status: ReturnType<typeof useWatchStream>["status"],
  mediaState: RTCPeerConnectionState,
) {
  if (status === "reconnecting") return "reconnecting…";
  if (mediaState === "failed") return "can't connect, retrying…";
  if (mediaState !== "connected") return "tuning in…";
  return undefined;
}

/** Watching someone's live stream. */
export function LiveViewer({ streamId }: { streamId: string }) {
  const profile = useGuestProfile();
  const watch = useWatchStream(streamId, profile);
  const { status, stream } = watch;
  const isWatching = status === "watching" || status === "reconnecting";
  const chat = useStreamChat(isWatching, profile);

  if (status === "connecting") return <Loader label="Tuning in" />;
  if (status !== "watching" && status !== "reconnecting") {
    return <StreamUnavailable problem={status} />;
  }
  if (!stream) return <Loader label="Tuning in" />;

  const hasVideo = (watch.media?.getVideoTracks().length ?? 0) > 0;
  const notice = playerNotice(watch.status, watch.mediaState);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* isolate: the rays sit behind everything in this column. */}
      <div className="isolate flex min-w-0 flex-col gap-8">
        <div className="relative">
          <Rays
            tone={stream.host.accent === "sun" ? "tangerine" : "sun"}
            className="top-1/2 left-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60"
          />
          <TvFrame tone={stream.host.accent}>
            <BroadcastScreen
              host={stream.host}
              stream={hasVideo ? watch.media : null}
              caption={notice ?? "live"}
            />
            <LiveBadge className="absolute top-4 left-4" />
            {notice && (
              <Sticker
                tone="cream"
                className="absolute top-14 left-4 -rotate-3"
              >
                {notice}
              </Sticker>
            )}
            <ReactionLayer reactions={chat.reactions} />
          </TvFrame>
          <ViewerCount
            viewers={watch.viewers}
            className="absolute top-2 -right-2 sm:-right-6"
          />
        </div>
        {watch.media && (
          <RemoteAudio
            streams={[watch.media]}
            unlockLabel="Tap to hear the stream"
          />
        )}
        <ReactionBar onReact={chat.react} />
        <StreamDetails stream={stream} />
      </div>

      <Receipt
        title="live chat"
        className="h-136 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]"
      >
        <ChatPanel
          variant="receipt"
          messages={chat.messages}
          onSend={chat.send}
          meName={profile?.name ?? ""}
        />
      </Receipt>
    </div>
  );
}
