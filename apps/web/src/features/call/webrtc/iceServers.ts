// ICE servers help two browsers find a network path to each other.
//
// STUN: tells a browser its public address ("you look like 203.0.113.7:62000
//   from out here"). Cheap, and Google runs free public ones.
// TURN: relays the actual video when no direct path exists (strict firewalls,
//   symmetric NAT). Costs bandwidth, so it's optional and configured via env.

const STUN_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

function turnServer(): RTCIceServer | null {
  const urls = process.env.NEXT_PUBLIC_TURN_URL;
  if (!urls) return null;
  return {
    urls,
    username: process.env.NEXT_PUBLIC_TURN_USERNAME,
    credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
  };
}

const turn = turnServer();

export const ICE_SERVERS: RTCIceServer[] = turn
  ? [...STUN_SERVERS, turn]
  : STUN_SERVERS;
