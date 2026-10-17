import { Mic, MicOff } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Participant } from "@/types";

export function PeopleList({ participants }: { participants: Participant[] }) {
  return (
    <ul className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-2 pr-4 pl-12">
      {participants.map((participant) => (
        <li key={participant.id} className="flex items-center gap-3">
          <Avatar person={participant} />
          <span className="min-w-0 flex-1 truncate font-display text-lg font-bold">
            {participant.name}
          </span>
          {participant.isHandRaised && (
            <span role="img" aria-label="Hand raised" className="text-xl">
              ✋
            </span>
          )}
          {participant.isMuted ? (
            <MicOff aria-label="Muted" className="size-5 text-tomato" />
          ) : (
            <Mic aria-label="Mic on" className="size-5" />
          )}
        </li>
      ))}
    </ul>
  );
}
