// Settings come from the environment (Bun loads .env automatically).

import { fileURLToPath } from "node:url";

function parseOrigins(value: string | undefined) {
  return (value ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function sfuCredentials(appId: string | undefined, secret: string | undefined) {
  return appId && secret ? { appId, secret } : null;
}

export const config = {
  /** Most hosts (Railway, Render, Fly…) set PORT for you. */
  port: Number(process.env.PORT ?? 4000),
  /** Web app origins allowed to connect, comma-separated. */
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  /** Cloudflare Realtime SFU app, for live streams. Streaming is off without it. */
  sfu: sfuCredentials(
    process.env.CLOUDFLARE_REALTIME_APP_ID,
    process.env.CLOUDFLARE_REALTIME_APP_SECRET,
  ),
  /**
   * Monthly cap on the video Cloudflare sends viewers, in GB. Cloudflare's
   * free allowance is 1,000 GB; 900 leaves room for our estimate to be off.
   */
  streamBudgetGb: Number(process.env.STREAM_BUDGET_GB ?? 900),
  /** Where this month's streaming usage is saved between restarts. */
  usageFile:
    process.env.USAGE_FILE ??
    fileURLToPath(new URL("../data/usage.json", import.meta.url)),
} as const;
