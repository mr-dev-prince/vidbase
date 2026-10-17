import type { SignalPayload } from "@vidbase/shared";
import { type LinkRole, PeerLink } from "./PeerLink";

export interface PeerMeshEvents {
  sendSignal: (to: string, payload: SignalPayload) => void;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onLinkState: (peerId: string, state: RTCPeerConnectionState) => void;
}

/**
 * A "mesh": one direct connection to every other person in the room.
 * With 5 people each browser keeps 4 links. Knows nothing about sockets or
 * React; it talks to the outside only through `events`.
 */
export class PeerMesh {
  private readonly links = new Map<string, PeerLink>();
  private localStream: MediaStream | null = null;

  constructor(private readonly events: PeerMeshEvents) {}

  /** We just joined: start a connection to someone already in the room. */
  connectTo(peerId: string) {
    if (!this.links.has(peerId)) this.createLink(peerId, "offerer");
  }

  /** Routes a handshake message to the right link. */
  handleSignal(from: string, payload: SignalPayload) {
    let link = this.links.get(from);
    if (!link) {
      // An offer from someone new means they just joined and are calling us.
      if (payload.type !== "offer") return;
      link = this.createLink(from, "answerer");
    }
    link.handleSignal(payload);
  }

  /** Our camera/mic changed (or became ready): update every link. */
  setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    for (const link of this.links.values()) link.setLocalStream(stream);
  }

  /** Closes links to anyone who isn't in the room anymore. */
  keepOnly(peerIds: string[]) {
    for (const peerId of this.links.keys()) {
      if (!peerIds.includes(peerId)) this.disconnect(peerId);
    }
  }

  closeAll() {
    for (const peerId of [...this.links.keys()]) this.disconnect(peerId);
  }

  private disconnect(peerId: string) {
    this.links.get(peerId)?.close();
    this.links.delete(peerId);
  }

  private createLink(peerId: string, role: LinkRole) {
    const link = new PeerLink(role, this.localStream, {
      sendSignal: (payload) => this.events.sendSignal(peerId, payload),
      onRemoteStream: (stream) => this.events.onRemoteStream(peerId, stream),
      onStateChange: (state) => this.events.onLinkState(peerId, state),
    });
    this.links.set(peerId, link);
    return link;
  }
}
