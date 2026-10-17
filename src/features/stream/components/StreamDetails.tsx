import { Heart } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { accentAt, tilt } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Broadcast } from "@/types";

interface StreamDetailsProps {
  broadcast: Broadcast;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export function StreamDetails({
  broadcast,
  isFollowing,
  onToggleFollow,
}: StreamDetailsProps) {
  const { title, host, category, tags } = broadcast;

  return (
    <section className="flex flex-col gap-5 rounded-3xl border-[3px] border-ink bg-cream p-6 shadow-hard-lg sm:flex-row sm:items-start">
      <Avatar person={host} size="lg" animated />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
          {category}
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-1 font-mono text-sm">
          by <strong>{host.name}</strong>
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <li key={tag} className={tilt(index)}>
              <Sticker tone={accentAt(index + 1)}>#{tag}</Sticker>
            </li>
          ))}
        </ul>
      </div>
      <Button
        tone={isFollowing ? "lime" : "tomato"}
        aria-pressed={isFollowing}
        onClick={onToggleFollow}
      >
        <Heart className={cn(isFollowing && "fill-ink")} />
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </section>
  );
}
