import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <Logo />
        <p className="font-mono text-xs uppercase tracking-widest text-paper/70">
          Built with getUserMedia &amp; questionable taste
        </p>
      </div>
    </footer>
  );
}
