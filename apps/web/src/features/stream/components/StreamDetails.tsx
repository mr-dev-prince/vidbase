import type { StreamInfo } from "@vidbase/shared";
import { Avatar } from "@/components/ui/Avatar";

/** Title, category and host under the player. */
export function StreamDetails({ stream }: { stream: StreamInfo }) {
  const { title, host, category } = stream;

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
      </div>
    </section>
  );
}
