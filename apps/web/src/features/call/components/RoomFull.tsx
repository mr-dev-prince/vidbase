"use client";

import type { PeerInfo } from "@vidbase/shared";
import { MAX_PARTICIPANTS } from "@vidbase/shared";
import { DoorOpen, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button, LinkButton } from "@/components/ui/Button";
import { Starburst } from "@/components/ui/Starburst";
import { createRoomCode } from "@/lib/room";
import { tilt } from "@/lib/theme";

interface RoomFullProps {
  roomId: string;
  occupants: PeerInfo[];
  /** Asks the server again, in case someone left. */
  onKnockAgain: () => void;
}

/** Shown instead of the call when every seat is taken. */
export function RoomFull({ roomId, occupants, onKnockAgain }: RoomFullProps) {
  const router = useRouter();

  return (
    <main className="grid min-h-dvh place-items-center overflow-x-clip bg-lilac bg-dots px-5 py-12">
      <section className="relative w-full max-w-lg -rotate-1 rounded-3xl border-[3px] border-ink bg-cream p-8 text-center shadow-funk sm:p-10">
        <Starburst
          tone="tomato"
          className="absolute -top-12 -right-6 size-28 sm:-right-10"
        >
          <span className="font-display text-2xl font-extrabold tabular-nums">
            {occupants.length}/{MAX_PARTICIPANTS}
          </span>
        </Starburst>

        <ul
          className="flex justify-center -space-x-3"
          aria-label="In this room"
        >
          {occupants.map((person, index) => (
            <li key={person.id} className={tilt(index)}>
              <Avatar person={person} size="md" className="shadow-hard-sm" />
              <span className="sr-only">{person.name}</span>
            </li>
          ))}
        </ul>

        <h1 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter">
          Room&apos;s
          <br />
          <span className="text-outline">full!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs font-mono text-sm">
          <span className="font-bold">#{roomId}</span> already has{" "}
          {occupants.length} people, the most a room can hold.
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
