import { MAX_VIEWERS } from "@vidbase/shared";
import { LinkButton } from "@/components/ui/Button";
import { Starburst } from "@/components/ui/Starburst";
import type { WatchStatus } from "../services/watchSession";

export type WatchProblem = Exclude<
  WatchStatus,
  "connecting" | "watching" | "reconnecting"
>;

const COPY: Record<
  WatchProblem,
  { badge: string; title: string; outline: string; body: string }
> = {
  "not-found": {
    badge: "off air",
    title: "Nobody's",
    outline: "live here",
    body: "This stream isn't on right now. It may have ended, or the link is off.",
  },
  ended: {
    badge: "that's all",
    title: "Stream",
    outline: "ended",
    body: "The broadcaster wrapped up. Thanks for tuning in!",
  },
  full: {
    badge: `${MAX_VIEWERS}/${MAX_VIEWERS}`,
    title: "Stream's",
    outline: "packed",
    body: `This stream already has ${MAX_VIEWERS} people watching, the most it can hold. Try again in a bit.`,
  },
  "over-budget": {
    badge: "lights out",
    title: "Out of",
    outline: "airtime",
    body: "This month's free streaming time is used up. Streams are back on the 1st of next month.",
  },
  unavailable: {
    badge: "uh oh",
    title: "Streaming",
    outline: "is off",
    body: "Live streaming isn't set up on the server yet.",
  },
  unreachable: {
    badge: "uh oh",
    title: "Can't reach",
    outline: "the server",
    body: "The server isn't answering. We'll keep trying in the background and tune you in as soon as it's back.",
  },
  error: {
    badge: "glitch",
    title: "Couldn't",
    outline: "tune in",
    body: "The video service didn't cooperate. Reload the page to try again.",
  },
};

/** Shown instead of the player when a stream can't be watched. */
export function StreamUnavailable({ problem }: { problem: WatchProblem }) {
  const copy = COPY[problem];

  return (
    <div className="grid min-h-[70dvh] place-items-center overflow-x-clip px-5 py-12">
      <section className="relative w-full max-w-lg rotate-1 rounded-3xl border-[3px] border-ink bg-cream p-8 text-center shadow-funk sm:p-10">
        <Starburst
          tone="sun"
          className="absolute -top-12 -left-6 size-28 sm:-left-10"
        >
          <span className="font-display text-lg font-extrabold uppercase">
            {copy.badge}
          </span>
        </Starburst>

        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter">
          {copy.title}
          <br />
          <span className="text-outline">{copy.outline}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-mono text-sm">{copy.body}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/#live-now" tone="ink" size="lg">
            See who's live
          </LinkButton>
          <LinkButton href="/studio" tone="sun" size="lg">
            Go live yourself
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
