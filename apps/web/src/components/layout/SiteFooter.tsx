import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <Logo />
        <p className="font-mono text-xs uppercase tracking-widest text-paper/70">
          Built by{" "}
          <a
            href="https://devprince.space"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:text-paper hover:underline"
          >
            devprince.space
          </a>
        </p>
      </div>
    </footer>
  );
}
