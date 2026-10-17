"use client";

import { useState } from "react";
import { ReactionLayer } from "@/components/media/ReactionLayer";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Rays } from "@/components/ui/Rays";
import { Receipt } from "@/components/ui/Receipt";
import { TvFrame } from "@/components/ui/TvFrame";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChat } from "@/features/chat/hooks/useChat";
import { useFloatingReactions } from "@/hooks/useFloatingReactions";
import { AUDIENCE_CHATTER, ME, STREAM_CHAT_SEED } from "@/lib/mock-data";
import type { Broadcast } from "@/types";
import { useAudience } from "../hooks/useAudience";
import { BroadcastScreen } from "./BroadcastScreen";
import { ReactionBar } from "./ReactionBar";
import { StreamDetails } from "./StreamDetails";
import { ViewerCount } from "./ViewerCount";

/** Watching someone else's stream. */
export function LiveViewer({ broadcast }: { broadcast: Broadcast }) {
  const viewers = useAudience(broadcast.viewers);
  const { reactions, fire } = useFloatingReactions();
  const [isFollowing, setFollowing] = useState(false);
  const chat = useChat({
    me: ME,
    initial: STREAM_CHAT_SEED,
    chatter: AUDIENCE_CHATTER,
    chatterEveryMs: 2600,
  });

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* isolate: the rays sit behind everything in this column. */}
      <div className="isolate flex min-w-0 flex-col gap-8">
        <div className="relative">
          <Rays
            tone={broadcast.host.accent === "sun" ? "tangerine" : "sun"}
            className="top-1/2 left-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60"
          />
          <TvFrame tone={broadcast.accent}>
            <BroadcastScreen host={broadcast.host} />
            <LiveBadge className="absolute top-4 left-4" />
            <ReactionLayer reactions={reactions} />
          </TvFrame>
          <ViewerCount
            viewers={viewers}
            className="absolute top-2 -right-2 sm:-right-6"
          />
        </div>
        <ReactionBar onReact={fire} />
        <StreamDetails
          broadcast={broadcast}
          isFollowing={isFollowing}
          onToggleFollow={() => setFollowing((following) => !following)}
        />
      </div>

      <Receipt
        title="live chat"
        className="h-[34rem] lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]"
      >
        <ChatPanel
          variant="receipt"
          messages={chat.messages}
          onSend={chat.send}
          meName={ME.name}
        />
      </Receipt>
    </div>
  );
}
