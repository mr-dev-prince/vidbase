import type { Metadata } from "next";
import { Studio } from "@/features/stream/components/Studio";

export const metadata: Metadata = { title: "Studio" };

export default function StudioPage() {
  return <Studio />;
}
