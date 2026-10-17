import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "vidbase · Calls & streams, but funky",
    template: "%s · vidbase",
  },
  description: "Video calls and live streams with zero beige.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions (Grammarly, ColorZilla, dark-mode tools…) add
    // attributes to <html> and <body> before React loads. This only ignores
    // attribute differences on these two tags, not anything inside them.
    <html
      suppressHydrationWarning
      lang="en"
      className={`${bricolage.variable} ${spaceMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-dvh flex-col overflow-x-clip"
      >
        {children}
      </body>
    </html>
  );
}
