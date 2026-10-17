import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader } from "@/components/ui/Loader";
import { CallRoom } from "@/features/call/components/CallRoom";

export const metadata: Metadata = { title: "In a call" };

type Params = PageProps<"/call/[roomId]">["params"];

export default function CallPage({ params }: PageProps<"/call/[roomId]">) {
  // Params are request-time data, so they're read inside a Suspense boundary.
  return (
    <Suspense
      fallback={<Loader label="Warming up the room" className="min-h-dvh" />}
    >
      <CallRoomForParams params={params} />
    </Suspense>
  );
}

async function CallRoomForParams({ params }: { params: Params }) {
  const { roomId } = await params;
  return <CallRoom roomId={roomId} />;
}
