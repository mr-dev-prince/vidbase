// A small client for Cloudflare's Realtime SFU HTTPS API. The SFU receives a
// broadcaster's camera once and sends it on to every viewer, so the video
// never touches this server. Only this server holds the app secret; browsers
// just exchange SDP with the SFU through us.
// API reference: https://developers.cloudflare.com/realtime/sfu/https-api/

import type { SessionDescription } from "@vidbase/shared";

const API_BASE = "https://rtc.live.cloudflare.com/v1";
const REQUEST_TIMEOUT_MS = 10_000;

export class SfuError extends Error {}

interface SfuTrack {
  location?: "local" | "remote";
  mid?: string;
  sessionId?: string;
  trackName?: string;
  errorCode?: string;
  errorDescription?: string;
}

interface SfuResponse {
  sessionId?: string;
  sessionDescription?: SessionDescription;
  requiresImmediateRenegotiation?: boolean;
  tracks?: SfuTrack[];
  errorCode?: string;
  errorDescription?: string;
}

export class CloudflareSfu {
  constructor(
    private readonly appId: string,
    private readonly secret: string,
  ) {}

  /** A new SFU session: one browser's RTCPeerConnection to Cloudflare. */
  async createSession() {
    const { sessionId } = await this.request("POST", "/sessions/new");
    if (!sessionId) throw new SfuError("no sessionId in response");
    return sessionId;
  }

  /**
   * Publishes the broadcaster's tracks. Takes their offer (with send-only
   * lanes) and returns the SFU's answer.
   */
  async publish(
    sessionId: string,
    offer: SessionDescription,
    tracks: { mid: string; trackName: string }[],
  ) {
    const response = await this.request(
      "POST",
      `/sessions/${sessionId}/tracks/new`,
      {
        sessionDescription: offer,
        tracks: tracks.map((track) => ({ location: "local", ...track })),
      },
    );
    return expectDescription(response, "answer");
  }

  /**
   * Subscribes a viewer's session to the broadcaster's tracks. Returns the
   * SFU's offer; the viewer's answer goes back through `renegotiate`.
   */
  async subscribe(
    sessionId: string,
    publisherSessionId: string,
    trackNames: string[],
  ) {
    const response = await this.request(
      "POST",
      `/sessions/${sessionId}/tracks/new`,
      {
        tracks: trackNames.map((trackName) => ({
          location: "remote",
          sessionId: publisherSessionId,
          trackName,
        })),
      },
    );
    return expectDescription(response, "offer");
  }

  /** Completes a subscription with the viewer's answer. */
  async renegotiate(sessionId: string, answer: SessionDescription) {
    await this.request("PUT", `/sessions/${sessionId}/renegotiate`, {
      sessionDescription: answer,
    });
  }

  private async request(method: string, path: string, body?: unknown) {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/apps/${this.appId}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${this.secret}`,
          "content-type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new SfuError(`${method} ${path}: ${String(error)}`);
    }

    const data = (await response.json().catch(() => ({}))) as SfuResponse;
    if (!response.ok || data.errorCode) {
      throw new SfuError(
        `${method} ${path}: ${response.status} ${data.errorCode ?? ""} ${data.errorDescription ?? ""}`.trim(),
      );
    }
    // A request can succeed overall while single tracks fail.
    const failed = data.tracks?.find((track) => track.errorCode);
    if (failed) {
      throw new SfuError(
        `${method} ${path}: track ${failed.trackName ?? failed.mid}: ${failed.errorCode} ${failed.errorDescription ?? ""}`.trim(),
      );
    }
    return data;
  }
}

function expectDescription(
  response: SfuResponse,
  type: SessionDescription["type"],
): SessionDescription {
  const description = response.sessionDescription;
  if (description?.type !== type || typeof description.sdp !== "string") {
    throw new SfuError(`expected an SDP ${type} from the SFU`);
  }
  return { type, sdp: description.sdp };
}
