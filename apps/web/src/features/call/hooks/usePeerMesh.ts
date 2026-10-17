"use client";

import { useEffect, useRef } from "react";
import { onSignal, sendSignal } from "../services/roomSession";
import { useCallStore } from "../store/callStore";
import { PeerMesh } from "../webrtc/PeerMesh";

/**
 * Runs the WebRTC mesh while you're in a call: sends your camera/mic to
 * everyone and puts their streams in the store.
 */
export function usePeerMesh(localStream: MediaStream | null) {
  const joinId = useCallStore((state) => state.joinId);
  const peers = useCallStore((state) => state.peers);
  const meshRef = useRef<PeerMesh | null>(null);
  // Read inside the join effect without making it re-run on every stream change.
  const localStreamRef = useRef(localStream);

  // A fresh mesh for every (re)join. After a reconnect we have a new id, so
  // everyone treats us as a newcomer and old connections are useless.
  useEffect(() => {
    if (joinId === 0) return;
    const store = useCallStore.getState();

    const mesh = new PeerMesh({
      sendSignal,
      onRemoteStream: store.setRemoteStream,
      onLinkState: store.setLinkState,
    });
    mesh.setLocalStream(localStreamRef.current);
    meshRef.current = mesh;

    const stopListening = onSignal((from, payload) =>
      mesh.handleSignal(from, payload),
    );

    // We're the newcomer: call everyone who was already here. People who
    // join after us will call us instead, and the mesh answers them.
    for (const peer of store.peers) mesh.connectTo(peer.id);

    return () => {
      stopListening();
      mesh.closeAll();
      meshRef.current = null;
      store.clearMedia();
    };
  }, [joinId]);

  // Camera/mic became ready or changed: swap it into every connection.
  useEffect(() => {
    localStreamRef.current = localStream;
    meshRef.current?.setLocalStream(localStream);
  }, [localStream]);

  // Someone left: close their connection.
  useEffect(() => {
    meshRef.current?.keepOnly(peers.map(({ id }) => id));
  }, [peers]);
}
