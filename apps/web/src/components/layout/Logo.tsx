import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="vidbase home"
      className={cn(
        "group inline-flex items-center gap-1.5 font-display text-3xl font-extrabold tracking-tighter",
        className,
      )}
    >
      <span className="grid size-9 animate-blob place-items-center rounded-blob border-2 border-ink bg-tangerine shadow-hard-sm transition-transform group-hover:rotate-12">
        <span className="size-3 rounded-full bg-ink" />
      </span>
      vid
      <span className="-ml-0.5 inline-block -rotate-3 rounded-lg border-2 border-ink bg-flamingo px-1.5 leading-tight text-ink shadow-hard-sm transition-transform group-hover:rotate-3">
        base
      </span>
    </Link>
  );
}
