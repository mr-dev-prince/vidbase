import { UserPlus } from "lucide-react";
import { tilt } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface EmptySeatProps {
  roomId: string;
  /** Position in the wall, used for tilt. */
  index: number;
}

/** A dashed, empty polaroid marking a free spot in the room. */
export function EmptySeat({ roomId, index }: EmptySeatProps) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-ink/50 bg-cream/50 p-2.5 pb-3",
        tilt(index),
      )}
    >
      <div className="grid aspect-[4/3] place-items-center border-2 border-dashed border-ink/40">
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <span className="grid size-16 place-items-center rounded-blob border-2 border-dashed border-ink/60 text-ink/60">
            <UserPlus aria-hidden className="size-7" />
          </span>
          <p className="font-display text-2xl font-extrabold tracking-tight">
            Seat open
          </p>
          <p className="font-mono text-xs text-ink/60">
            share <span className="font-bold text-ink">#{roomId}</span> to fill
            it
          </p>
        </div>
      </div>
      <p className="mt-3 px-1 font-mono text-xs font-bold uppercase leading-7 tracking-widest text-ink/50">
        waiting for someone…
      </p>
    </div>
  );
}
