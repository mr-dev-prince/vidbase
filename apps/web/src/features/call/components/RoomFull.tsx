"use client";

import { MAX_PARTICIPANTS } from "@vidbase/shared";
import { DoorOpen, UserRound, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";
import { Starburst } from "@/components/ui/Starburst";
import { createRoomCode } from "@/lib/room";
import { tilt } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SEATS = Array.from({ length: MAX_PARTICIPANTS }, (_, index) => index);

interface RoomFullProps {
  roomId: string;
  /** Asks the server again, in case someone left. */
  onKnockAgain: () => void;
}

/** Shown instead of the call when every seat is taken. */
export function RoomFull({ roomId, onKnockAgain }: RoomFullProps) {
  const router = useRouter();

  return (
    <main className="grid min-h-dvh place-items-center overflow-x-clip bg-lilac bg-dots px-5 py-12">
      <section className="relative w-full max-w-lg -rotate-1 rounded-3xl border-[3px] border-ink bg-cream p-8 text-center shadow-funk sm:p-10">
        <Starburst
          tone="tomato"
          className="absolute -top-12 -right-6 size-28 sm:-right-10"
        >
          <span className="font-display text-2xl font-extrabold tabular-nums">
            {MAX_PARTICIPANTS}/{MAX_PARTICIPANTS}
          </span>
        </Starburst>

        {/* Faceless on purpose: the server doesn't say who's inside. */}
        <div aria-hidden className="flex justify-center -space-x-3">
          {SEATS.map((seat) => (
            <span
              key={seat}
              className={cn(
                "grid size-14 place-items-center rounded-blob border-2 border-ink bg-cream shadow-hard-sm",
                tilt(seat),
              )}
            >
              <UserRound className="size-6" />
            </span>
          ))}
        </div>

        <h1 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter">
          Room&apos;s
          <br />
          <span className="text-outline">full!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs font-mono text-sm">
          <span className="font-bold">#{roomId}</span> already has{" "}
          {MAX_PARTICIPANTS} people, the most a room can hold.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            tone="ink"
            size="lg"
            onClick={() => router.push(`/call/${createRoomCode()}`)}
          >
            <Zap />
            Start your own
          </Button>
          <Button tone="sun" size="lg" onClick={onKnockAgain}>
            <DoorOpen />
            Knock again
          </Button>
          <LinkButton href="/" tone="cream" size="lg" className="rotate-1">
            Back home
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
