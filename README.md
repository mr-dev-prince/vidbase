# vidbase

Funky video calls for up to 5 people. A Turborepo monorepo using Bun, TypeScript and Biome.

| Package | What it is |
| --- | --- |
| `apps/web` | Next.js app (App Router, Tailwind, Zustand). Deploys to Vercel. |
| `apps/signaling` | Socket.IO signaling server, run with Bun. Deploys to any host that keeps a process running. |
| `packages/shared` | `@vidbase/shared`: socket event types and room rules used by both apps. |

How it all fits together: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Why things are the way they are: [docs/DECISIONS.md](docs/DECISIONS.md).

## Getting started

```bash
bun install
cp apps/web/.env.example apps/web/.env
cp apps/signaling/.env.example apps/signaling/.env
bun run dev        # web on http://localhost:3000, signaling on http://localhost:4000
```

Open a room in two browser tabs to see two people in the same call.

## Scripts (run from the repo root)

```bash
bun run dev        # start every app in watch mode
bun run build      # build everything
bun run typecheck  # type-check every package
bun run lint       # biome check
bun run format     # biome format --write
```

Run one app only: `bunx turbo run dev --filter=@vidbase/web` (or `@vidbase/signaling`).

## Environment

| Variable | App | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SIGNALING_URL` | web | `http://localhost:4000` (set before building) |
| `NEXT_PUBLIC_TURN_URL`, `_USERNAME`, `_CREDENTIAL` | web | empty (optional TURN relay; STUN-only without it) |
| `PORT` | signaling | `4000` |
| `CORS_ORIGIN` | signaling | `http://localhost:3000` (comma-separated list) |

## Deploying

1. **Signaling server:** runs on a Raspberry Pi as a systemd service (`bun src/index.ts` in `apps/signaling`), published at `https://vidbase-signal.devprince.space` through a Cloudflare Tunnel. Set `CORS_ORIGIN` to your web app's URL. Any host that keeps a Bun process running works too.
2. **Web app:** deploy to Vercel with root directory `apps/web`. Set `NEXT_PUBLIC_SIGNALING_URL=https://vidbase-signal.devprince.space`, then redeploy. Served at `https://vidbase.devprince.space` (CNAME in Cloudflare, DNS only).
