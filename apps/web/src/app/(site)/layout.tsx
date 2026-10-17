import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Clips oversized decorations (rays) so they never widen or lengthen the page. */}
      <div className="flex flex-1 flex-col overflow-clip">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
      <SiteFooter />
    </>
  );
}
