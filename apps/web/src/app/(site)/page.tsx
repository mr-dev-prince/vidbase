import { GoLiveTicket } from "@/features/home/components/GoLiveTicket";
import { Hero } from "@/features/home/components/Hero";
import { LiveNowWall } from "@/features/home/components/LiveNowWall";
import { LiveTicker } from "@/features/home/components/LiveTicker";
import { StartCallTicket } from "@/features/home/components/StartCallTicket";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveTicker />
      {/* --notch matches the band so the ticket "bites" look cut out. */}
      <section
        id="start"
        className="-mt-6 scroll-mt-8 border-y-[3px] border-ink bg-cobalt bg-dots pt-20 pb-24 [--notch:var(--color-cobalt)]"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <StartCallTicket />
          <GoLiveTicket />
        </div>
      </section>
      <LiveNowWall />
    </>
  );
}
