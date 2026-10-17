import { cn } from "@/lib/utils";

const BLOBS = [
  { id: "tomato", className: "bg-tomato" },
  { id: "sun", className: "bg-sun [animation-delay:150ms]" },
  { id: "lime", className: "bg-lime [animation-delay:300ms]" },
  { id: "lilac", className: "bg-lilac [animation-delay:450ms]" },
];

export function Loader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <output className={cn("grid min-h-[60dvh] place-items-center", className)}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-3">
          {BLOBS.map((blob) => (
            <span
              key={blob.id}
              className={cn(
                "size-8 animate-bounce-blob rounded-blob border-2 border-ink shadow-hard-sm",
                blob.className,
              )}
            />
          ))}
        </div>
        <p className="font-mono text-sm font-bold uppercase tracking-widest">
          {label}…
        </p>
      </div>
    </output>
  );
}
