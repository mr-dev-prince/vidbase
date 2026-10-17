import { Sticker } from "@/components/ui/Sticker";
import { StickerText } from "@/components/ui/StickerText";
import { formatCount } from "@/lib/utils";
import type { Broadcast } from "@/types";
import { BroadcastPolaroid } from "./BroadcastPolaroid";

export function LiveNowWall({ broadcasts }: { broadcasts: Broadcast[] }) {
  const totalViewers = broadcasts.reduce((sum, b) => sum + b.viewers, 0);

  return (
    <section id="live-now" className="scroll-mt-8 bg-sun bg-dots">
      <div className="mx-auto w-full max-w-7xl px-5 pt-20 pb-28 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
            <StickerText text="Live" offset={4} />
            <br />
            <span className="text-outline">right now</span>
          </h2>
          <Sticker tone="ink" className="rotate-3 text-sm">
            {broadcasts.length} streams · {formatCount(totalViewers)} watching
          </Sticker>
        </div>

        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {broadcasts.map((broadcast, index) => (
            <li key={broadcast.id}>
              <BroadcastPolaroid broadcast={broadcast} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
