import { Eye } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Tape } from "@/components/ui/Tape";
import { accentAt, accentBg, tilt } from "@/lib/theme";
import { cn, formatCount } from "@/lib/utils";
import type { Broadcast } from "@/types";

interface BroadcastPolaroidProps {
  broadcast: Broadcast;
  index: number;
}

export function BroadcastPolaroid({
  broadcast,
  index,
}: BroadcastPolaroidProps) {
  return (
    <Link
      href={`/live/${broadcast.id}`}
      className={cn(
        "group relative block border-2 border-ink bg-cream p-3 pb-5 shadow-hard transition duration-300",
        "hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-hard-lg focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky",
        tilt(index),
      )}
    >
      {/* Alternate between one strip across the top and two on the corners. */}
      {index % 3 === 1 ? (
        <>
          <Tape tone={accentAt(index + 2)} placement="top-left" seed={index} />
          <Tape
            tone={accentAt(index + 5)}
            placement="top-right"
            seed={index + 1}
          />
        </>
      ) : (
        <Tape tone={accentAt(index + 2)} seed={index} />
      )}

      <div
        className={cn(
          "relative grid aspect-[4/3] place-items-center overflow-hidden border-2 border-ink",
          accentBg[broadcast.accent],
        )}
      >
        <div aria-hidden className="absolute inset-0 bg-dots" />
        <Avatar
          person={broadcast.host}
          size="xl"
          animated
          className="relative transition duration-500 group-hover:scale-110 group-hover:rotate-6"
        />
        <LiveBadge className="absolute top-3 left-3" />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-mono text-xs font-bold">
          <Eye aria-hidden className="size-3.5" />
          {formatCount(broadcast.viewers)}
        </span>
      </div>

      <div className="mt-4 px-1">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
          {broadcast.category} · {broadcast.host.name}
        </p>
        <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">
          {broadcast.title}
        </h3>
      </div>
    </Link>
  );
}
