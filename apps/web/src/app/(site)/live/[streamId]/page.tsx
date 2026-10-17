import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader } from "@/components/ui/Loader";
import { LiveViewer } from "@/features/stream/components/LiveViewer";
import { getBroadcast } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Live" };

type Params = PageProps<"/live/[streamId]">["params"];

export default function LivePage({ params }: PageProps<"/live/[streamId]">) {
  // Params are request-time data, so they're read inside a Suspense boundary.
  return (
    <Suspense fallback={<Loader label="Tuning in" />}>
      <LiveViewerForParams params={params} />
    </Suspense>
  );
}

async function LiveViewerForParams({ params }: { params: Params }) {
  const { streamId } = await params;
  const broadcast = getBroadcast(streamId);
  if (!broadcast) notFound();

  return <LiveViewer broadcast={broadcast} />;
}
