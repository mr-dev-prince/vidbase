// Keeps live streaming inside Cloudflare's free allowance. Cloudflare bills
// the video its SFU sends to viewers, so we add up viewer-time × the most a
// viewer can receive, and stop streaming before the month's budget runs out.
// It's an estimate on the safe side, not Cloudflare's own meter.

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { STREAM_VIDEO_MAX_BITRATE } from "@vidbase/shared";
import { log } from "./logger";

/** Opus voice is well under this. */
const AUDIO_BITRATE = 64_000;
/** Packet headers, retransmissions and encryption on top of the media. */
const NETWORK_OVERHEAD = 1.15;

/** Most bytes Cloudflare can send one viewer per second. */
export const BYTES_PER_VIEWER_SECOND =
  ((STREAM_VIDEO_MAX_BITRATE + AUDIO_BITRATE) * NETWORK_OVERHEAD) / 8;

/** Cloudflare counts in GB; 10⁹ bytes is the smaller (safer) reading. */
const BYTES_PER_GB = 1e9;

interface SavedUsage {
  /** UTC month, like "2026-10". */
  month: string;
  bytes: number;
}

const currentMonth = () => new Date().toISOString().slice(0, 7);

export class UsageMeter {
  private usage: SavedUsage;
  private isDirty = false;

  constructor(
    private readonly file: string,
    private readonly budgetGb: number,
  ) {
    this.usage = this.load();
  }

  /** Adds `viewerSeconds` of watching (viewers × seconds). */
  addViewerSeconds(viewerSeconds: number) {
    this.rollOverMonth();
    if (viewerSeconds <= 0) return;
    this.usage.bytes += viewerSeconds * BYTES_PER_VIEWER_SECOND;
    this.isDirty = true;
  }

  get isOverBudget() {
    this.rollOverMonth();
    return this.usage.bytes >= this.budgetGb * BYTES_PER_GB;
  }

  /** For /health: this month's estimate against the budget. */
  summary() {
    this.rollOverMonth();
    const usedGb = this.usage.bytes / BYTES_PER_GB;
    const viewerHoursLeft = Math.max(
      0,
      ((this.budgetGb - usedGb) * BYTES_PER_GB) /
        BYTES_PER_VIEWER_SECOND /
        3600,
    );
    return {
      month: this.usage.month,
      usedGb: Math.round(usedGb * 100) / 100,
      budgetGb: this.budgetGb,
      viewerHoursLeft: Math.floor(viewerHoursLeft),
    };
  }

  /** Writes the total to disk if it changed (atomically, via a temp file). */
  save() {
    if (!this.isDirty) return;
    mkdirSync(dirname(this.file), { recursive: true });
    const temp = `${this.file}.tmp`;
    writeFileSync(temp, JSON.stringify(this.usage));
    renameSync(temp, this.file);
    this.isDirty = false;
  }

  private rollOverMonth() {
    const month = currentMonth();
    if (this.usage.month === month) return;
    this.usage = { month, bytes: 0 };
    this.isDirty = true;
  }

  private load(): SavedUsage {
    try {
      const saved = JSON.parse(readFileSync(this.file, "utf8"));
      if (
        typeof saved?.month === "string" &&
        typeof saved?.bytes === "number" &&
        saved.month === currentMonth()
      ) {
        return { month: saved.month, bytes: saved.bytes };
      }
      // A file from an earlier month: this month starts from zero.
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        // Unreadable: we can't know what's been used, so assume all of it
        // rather than risk a bill. Fix or delete the file to stream again.
        log.warn(`can't read ${this.file}; streaming paused for safety`);
        return {
          month: currentMonth(),
          bytes: this.budgetGb * BYTES_PER_GB,
        };
      }
    }
    return { month: currentMonth(), bytes: 0 };
  }
}
