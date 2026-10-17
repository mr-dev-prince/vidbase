import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

const RING_IDS = Array.from({ length: 9 }, (_, i) => `ring-${i}`);

interface NotebookProps {
  title: string;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

/** A spiral-bound sheet of lined paper, used for side panels. */
export function Notebook({
  title,
  onClose,
  className,
  children,
}: NotebookProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border-[3px] border-ink bg-notebook shadow-hard-lg",
        className,
      )}
    >
      <div
        aria-hidden
        className="flex justify-around border-b-[3px] border-ink bg-paper-deep px-4 py-2"
      >
        {RING_IDS.map((id) => (
          <span
            key={id}
            className="size-3 rounded-full border-2 border-ink bg-paper"
          />
        ))}
      </div>
      <header className="flex items-center justify-between gap-3 py-3 pr-3 pl-12">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        {onClose && (
          <IconButton
            label="Close"
            icon={<X className="size-5" />}
            onClick={onClose}
            size="sm"
          />
        )}
      </header>
      {children}
    </section>
  );
}
