import { toneClasses } from "@/lib/theme";
import { cn, formatCount, formatDuration } from "@/lib/utils";
import type { Tone } from "@/types";

interface StudioStatsProps {
  viewers: number;
  elapsedSeconds: number;
  messages: number;
}

export function StudioStats({
  viewers,
  elapsedSeconds,
  messages,
}: StudioStatsProps) {
  const stats: { label: string; value: string; tone: Tone; tilt: string }[] = [
    {
      label: "viewers",
      value: formatCount(viewers),
      tone: "cobalt",
      tilt: "-rotate-2",
    },
    {
      label: "on air",
      value: formatDuration(elapsedSeconds),
      tone: "mint",
      tilt: "rotate-1",
    },
    {
      label: "chats",
      value: formatCount(messages),
      tone: "flamingo",
      tilt: "rotate-3",
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col-reverse rounded-2xl border-2 border-ink p-3 shadow-hard",
            toneClasses[stat.tone],
            stat.tilt,
          )}
        >
          <dt className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {stat.label}
          </dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
