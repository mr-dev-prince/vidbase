import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReceiptProps {
  title: string;
  className?: string;
  children: ReactNode;
}

/** A strip of thermal receipt paper with torn edges. */
export function Receipt({ title, className, children }: ReceiptProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col drop-shadow-[6px_6px_0_var(--color-ink)]",
        className,
      )}
    >
      <div aria-hidden className="zigzag-top" />
      <div className="flex min-h-0 flex-1 flex-col bg-cream font-mono">
        <header className="mx-4 border-b-2 border-dashed border-ink/40 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em]">
            *** {title} ***
          </p>
        </header>
        {children}
      </div>
      <div aria-hidden className="zigzag-bottom" />
    </section>
  );
}
