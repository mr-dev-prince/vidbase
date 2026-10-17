import { VideoElement } from "@/components/media/VideoElement";
import { Sticker } from "@/components/ui/Sticker";
import { TvFrame } from "@/components/ui/TvFrame";

/** Your screen share, shown on a big TV above the wall. */
export function ScreenShareStage({ stream }: { stream: MediaStream }) {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <TvFrame tone="cobalt">
        <VideoElement stream={stream} fit="contain" />
      </TvFrame>
      <Sticker tone="sun" className="absolute top-6 -left-2 -rotate-6 text-sm">
        you're sharing your screen
      </Sticker>
    </div>
  );
}
