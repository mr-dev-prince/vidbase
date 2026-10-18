"use client";

import { Radio } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { StickerText } from "@/components/ui/StickerText";
import { formatCount } from "@/lib/utils";
import { useLiveStreams } from "../hooks/useLiveStreams";
import { BroadcastPolaroid } from "./BroadcastPolaroid";

export function LiveNowWall() {
  const streams = useLiveStreams();
  const totalViewers =
    streams?.reduce((sum, stream) => sum + stream.viewers, 0) ?? 0;

  return (
    <section id="live-now" className="scroll-mt-8 bg-sun bg-dots">
      <div className="mx-auto w-full max-w-7xl px-5 pt-20 pb-28 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
            <StickerText text="Live" offset={4} />
            <br />
            <span className="text-outline">right now</span>
          </h2>
          {streams && streams.length > 0 && (
            <Sticker tone="ink" className="rotate-3 text-sm">
              {streams.length} {streams.length === 1 ? "stream" : "streams"} ·{" "}
              {formatCount(totalViewers)} watching
            </Sticker>
          )}
        </div>

        {streams && streams.length > 0 ? (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((stream, index) => (
              <li key={stream.id}>
                <BroadcastPolaroid stream={stream} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto flex max-w-md -rotate-1 flex-col items-center gap-5 rounded-3xl border-[3px] border-dashed border-ink bg-cream/70 px-8 py-12 text-center">
            <p className="font-display text-3xl font-extrabold uppercase tracking-tight">
              {streams ? "Nobody's on air" : "Checking the airwaves…"}
            </p>
            {streams && (
              <>
                <p className="font-mono text-sm">
                  It's quiet out here. Point your camera at something and be the
                  first.
                </p>
                <LinkButton href="/studio" tone="tomato" size="lg">
                  <Radio />
                  Go live
                </LinkButton>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
