import { Sparkles } from "lucide-react";
import { Rays } from "@/components/ui/Rays";
import { Squiggle } from "@/components/ui/Squiggle";
import { Starburst } from "@/components/ui/Starburst";
import { StickerText } from "@/components/ui/StickerText";

export function Hero() {
  return (
    <section className="relative isolate mx-auto w-full max-w-7xl px-5 pt-6 pb-16 sm:px-8 sm:pt-10">
      <Rays tone="sun" className="-top-64 -right-72 w-[58rem] opacity-70" />
      <Rays
        tone="mint"
        className="-bottom-80 -left-96 w-[48rem] opacity-50 [animation-direction:reverse]"
      />
      <Starburst
        tone="tangerine"
        className="absolute top-0 right-3 size-28 sm:right-10 sm:size-44"
      >
        <span className="block text-center font-display text-sm font-extrabold uppercase leading-tight sm:text-xl">
          100%
          <br />
          peer to
          <br />
          peer
        </span>
      </Starburst>

      <p className="mb-6 inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-ink bg-cream px-3 py-1 font-mono text-xs font-bold uppercase shadow-hard-sm">
        <Sparkles aria-hidden className="size-4" />
        Real-time video playground
      </p>

      <h1
        aria-label="Calls, streams & zero boredom."
        className="font-display text-[clamp(3.25rem,12vw,10rem)] font-extrabold uppercase leading-[0.84] tracking-tighter"
      >
        <span aria-hidden="true" className="block">
          Calls<span className="text-flamingo">,</span>
        </span>
        <span aria-hidden="true" className="block py-2">
          <span className="inline-block -rotate-2 rounded-[0.5em] border-[3px] border-ink bg-cobalt px-[0.18em] text-sun shadow-funk text-sticker">
            streams
          </span>
        </span>
        <span aria-hidden="true" className="block">
          <span className="text-sticker text-tangerine">&amp;</span>{" "}
          <span className="text-outline">zero</span>
        </span>
        <span aria-hidden="true" className="block">
          <StickerText text="boredom" offset={1} />
          <span className="text-flamingo text-sticker">.</span>
        </span>
      </h1>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
        <p className="max-w-md font-mono text-sm leading-relaxed sm:text-base">
          vidbase is a playground for real-time video. Spin up a call room in
          one click, or point your camera at the world and go live. No
          downloads, no suits, no beige.
        </p>
        <Squiggle className="hidden w-52 text-grape sm:block" />
      </div>

      {/* Floating confetti blobs. */}
      <span
        aria-hidden
        className="absolute right-[14%] bottom-28 hidden size-24 animate-blob rounded-blob border-[3px] border-ink bg-mint shadow-hard lg:block"
      />
      <span
        aria-hidden
        className="absolute top-[42%] right-[24%] hidden size-12 animate-blob rounded-blob border-[3px] border-ink bg-grape shadow-hard [animation-delay:-3s] lg:block"
      />
      <span
        aria-hidden
        className="absolute top-[30%] right-[8%] hidden size-7 animate-bounce-blob rounded-full border-[3px] border-ink bg-flamingo shadow-hard-sm md:block"
      />
    </section>
  );
}
