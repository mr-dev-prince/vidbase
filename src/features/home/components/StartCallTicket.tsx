"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { TextField } from "@/components/ui/TextField";
import { Ticket } from "@/components/ui/Ticket";
import { createRoomCode, normalizeRoomCode } from "@/lib/room";

export function StartCallTicket() {
  const router = useRouter();

  const startRoom = () => router.push(`/call/${createRoomCode()}`);

  const joinRoom = (formData: FormData) => {
    const room = normalizeRoomCode(String(formData.get("room") ?? ""));
    if (room) router.push(`/call/${room}`);
  };

  return (
    <Ticket tone="lime" stub="admit ∞ · call" className="-rotate-1">
      <Sticker tone="ink">01</Sticker>
      <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-6xl">
        Start a<br />
        call
      </h2>
      <p className="mt-3 max-w-xs font-mono text-sm">
        Get a fresh room with a ridiculous name. Share the code, wait for faces.
      </p>

      <Button tone="ink" size="lg" onClick={startRoom} className="mt-6">
        <Zap />
        Spin up a room
      </Button>

      <form action={joinRoom} className="mt-6 flex max-w-md flex-wrap gap-2">
        <label htmlFor="room-code" className="sr-only">
          Room code
        </label>
        <TextField
          id="room-code"
          name="room"
          placeholder="wobbly-mango-42"
          autoComplete="off"
          required
          className="flex-1 basis-44"
        />
        <Button type="submit" tone="cream">
          Hop in
          <ArrowRight />
        </Button>
      </form>
    </Ticket>
  );
}
