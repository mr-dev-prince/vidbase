import { LinkButton } from "@/components/ui/Button";
import { Starburst } from "@/components/ui/Starburst";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-6">
        <Starburst tone="tomato" className="size-44">
          <span className="font-display text-5xl font-extrabold">404</span>
        </Starburst>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
          Nothing on
          <br />
          <span className="text-outline">this channel</span>
        </h1>
        <p className="font-mono text-sm">
          That room or stream doesn&apos;t exist (or it wandered off).
        </p>
        <LinkButton href="/" tone="lime" size="lg">
          Take me home
        </LinkButton>
      </div>
    </main>
  );
}
