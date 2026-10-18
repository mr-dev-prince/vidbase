// Connecting a browser to Cloudflare's SFU. Unlike calls (browser to
// browser), every stream connection goes browser ↔ Cloudflare, so the
// Cloudflare STUN server is the natural one to use.

const SFU_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.cloudflare.com:3478" },
];

/** Long enough for STUN on a slow network, short enough not to stall. */
const ICE_GATHERING_TIMEOUT_MS = 3_000;

export function createSfuConnection() {
  return new RTCPeerConnection({
    iceServers: SFU_ICE_SERVERS,
    // One network path for audio and video, which is what the SFU expects.
    bundlePolicy: "max-bundle",
  });
}

/**
 * Waits until the browser has found its network addresses, so they're all
 * inside the SDP. The SFU API takes one SDP per request (no trickle ICE).
 */
export function waitForIceGathering(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    };
    const onChange = () => {
      if (pc.iceGatheringState === "complete") done();
    };
    // Send whatever was found so far rather than hanging.
    const timer = setTimeout(done, ICE_GATHERING_TIMEOUT_MS);
    pc.addEventListener("icegatheringstatechange", onChange);
  });
}

/** The local description as plain JSON for the socket. */
export function localDescription(pc: RTCPeerConnection) {
  const description = pc.localDescription;
  if (
    !description ||
    (description.type !== "offer" && description.type !== "answer")
  ) {
    throw new Error("no local offer/answer");
  }
  return { type: description.type, sdp: description.sdp };
}
