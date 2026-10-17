import { VideoElement } from "@/components/media/VideoElement";
import { Avatar } from "@/components/ui/Avatar";
import { Marquee } from "@/components/ui/Marquee";
import { accentBg } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface BroadcastScreenProps {
  host: Person;
  /** When present the real video is shown; otherwise a funky placeholder. */
  stream?: MediaStream | null;
  mirrored?: boolean;
  /** Text scrolling along the bottom of the placeholder. */
  caption?: string;
}

const CRAWL_IDS = ["a", "b", "c", "d"];

/** What's playing on the TV: a live video, or the host's "test card". */
export function BroadcastScreen({
  host,
  stream,
  mirrored,
  caption = "on air",
}: BroadcastScreenProps) {
  if (stream) return <VideoElement stream={stream} mirrored={mirrored} />;

  return (
    <div
      className={cn(
        "relative grid size-full place-items-center overflow-hidden",
        accentBg[host.accent],
      )}
    >
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="size-full animate-spin-slow bg-[conic-gradient(var(--color-tomato),var(--color-tangerine),var(--color-sun),var(--color-lime),var(--color-mint),var(--color-sky),var(--color-cobalt),var(--color-grape),var(--color-flamingo),var(--color-tomato))] opacity-50" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-dots" />
      <Avatar
        person={host}
        size="xl"
        animated
        className="relative shadow-hard-lg"
      />

      <div className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-ink py-1.5 text-paper">
        <Marquee>
          {CRAWL_IDS.map((id) => (
            <span
              key={id}
              className="mx-4 font-mono text-xs font-bold uppercase tracking-[0.3em]"
            >
              {caption} ✺ {host.name} ✺
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
