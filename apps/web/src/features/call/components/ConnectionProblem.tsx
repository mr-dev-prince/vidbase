import { LinkButton } from "@/components/ui/Button";
import { Starburst } from "@/components/ui/Starburst";

interface ConnectionProblemProps {
  problem: "unreachable" | "invalid";
  roomId: string;
}

const COPY = {
  unreachable: {
    badge: "uh oh",
    title: "Can't reach",
    outline: "the server",
    body: "The call server isn't answering. We'll keep trying in the background and drop you in as soon as it's back.",
  },
  invalid: {
    badge: "huh?",
    title: "That's not",
    outline: "a room code",
    body: "Room codes are lowercase words and numbers joined by dashes, like wobbly-mango-42.",
  },
} as const;

export function ConnectionProblem({ problem, roomId }: ConnectionProblemProps) {
  const copy = COPY[problem];

  return (
    <main className="grid min-h-dvh place-items-center overflow-x-clip bg-lilac bg-dots px-5 py-12">
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
        <p className="mt-3 font-mono text-xs text-ink/60">room: #{roomId}</p>

        <div className="mt-8 flex justify-center">
          <LinkButton href="/" tone="ink" size="lg">
            Back home
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
