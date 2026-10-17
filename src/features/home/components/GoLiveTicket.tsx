import { Eye, Radio } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { Ticket } from "@/components/ui/Ticket";

export function GoLiveTicket() {
  return (
    <Ticket tone="flamingo" stub="on air · no. 0042" className="rotate-1">
      <Sticker tone="ink">02</Sticker>
      <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-6xl">
        Go
        <br />
        live
      </h2>
      <p className="mt-3 max-w-xs font-mono text-sm">
        Point your camera at something interesting (or your cat). Anyone with
        the link can tune in.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/studio" tone="sun" size="lg">
          <Radio />
          Open studio
        </LinkButton>
        <LinkButton href="/#live-now" tone="cream" size="lg">
          <Eye />
          Just watch
        </LinkButton>
      </div>
    </Ticket>
  );
}
