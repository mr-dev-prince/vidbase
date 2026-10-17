const time = () => new Date().toISOString().slice(11, 19);

/** Tiny prefixed console logger for the signaling server. */
export const log = {
  info: (message: string) => console.log(`[signal ${time()}] ${message}`),
  warn: (message: string) => console.warn(`[signal ${time()}] ${message}`),
  error: (message: string, error?: unknown) =>
    console.error(`[signal ${time()}] ${message}`, error ?? ""),
};
