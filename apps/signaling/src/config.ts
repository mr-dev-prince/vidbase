// Settings come from the environment (Bun loads .env automatically).

function parseOrigins(value: string | undefined) {
  return (value ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  /** Most hosts (Railway, Render, Fly…) set PORT for you. */
  port: Number(process.env.PORT ?? 4000),
  /** Web app origins allowed to connect, comma-separated. */
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
} as const;
