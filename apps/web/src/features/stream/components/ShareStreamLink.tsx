"use client";

import { Check, Link } from "lucide-react";
import { useState } from "react";

/** The link viewers open to watch, with a copy button. */
export function ShareStreamLink({ streamId }: { streamId: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/live/${streamId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access denied; the link is on screen to copy by hand.
    }
  };

  return (
    <div className="flex min-w-0 -rotate-1 items-center gap-2 rounded-xl border-2 border-ink bg-cream p-1.5 pl-3 shadow-hard-sm">
      <span className="min-w-0 flex-1 truncate font-mono text-xs font-bold">
        {link}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy stream link"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-ink bg-sky px-2.5 py-1 font-mono text-xs font-bold uppercase transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
      >
        {copied ? (
          <Check aria-hidden className="size-3.5" />
        ) : (
          <Link aria-hidden className="size-3.5" />
        )}
        {copied ? "copied!" : "copy link"}
      </button>
    </div>
  );
}
