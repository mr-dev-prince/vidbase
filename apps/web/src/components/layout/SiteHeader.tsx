import Link from "next/link";
import { toneClasses } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";
import { Logo } from "./Logo";

const NAV: { href: string; label: string; tone: Tone; tilt: string }[] = [
  { href: "/#start", label: "Call", tone: "mint", tilt: "-rotate-3" },
  { href: "/#live-now", label: "Watch", tone: "cobalt", tilt: "rotate-2" },
  { href: "/studio", label: "Go live", tone: "flamingo", tilt: "-rotate-1" },
];

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Logo />
      <nav aria-label="Main" className="flex items-center gap-2 sm:gap-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg border-2 border-ink px-2.5 py-1 font-mono text-xs font-bold uppercase shadow-hard-sm transition hover:-translate-y-0.5 hover:rotate-0 hover:shadow-hard sm:px-3 sm:text-sm",
              toneClasses[item.tone],
              item.tilt,
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
