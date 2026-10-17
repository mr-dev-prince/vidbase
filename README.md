# vidbase

Next.js app (App Router, TypeScript, Tailwind CSS) using Bun and Biome.

## Scripts

```bash
bun install      # install dependencies
bun dev          # start dev server at http://localhost:3000
bun run build    # production build
bun start        # serve production build
bun run lint     # biome check
bun run format   # biome format --write
```

## Database

PostgreSQL via [Prisma](https://www.prisma.io) (`prisma/schema.prisma`, config in `prisma7.config.ts`).

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Add models to `prisma/schema.prisma`, then run `bun run db:migrate`.
3. Import the client with `import { prisma } from "@/lib/prisma"`.

```bash
bun run db:generate  # regenerate the client (also runs on install)
bun run db:migrate   # create and apply a migration
bun run db:push      # sync schema without a migration
bun run db:studio    # open Prisma Studio
```

## Project structure

```text
src/
  app/                 routes only: thin pages that compose features
    (site)/            pages with the site header/footer (home, studio, live/[streamId])
    call/[roomId]/     full-screen call room
  components/
    ui/                design-system primitives (Button, Sticker, TvFrame, Ticket, Receipt…)
    media/             video/reaction building blocks (VideoElement, ReactionLayer…)
    layout/            site header, footer, logo
  features/            one folder per feature, each with its own components/ and hooks/
    home/  call/  stream/  chat/
  hooks/               shared hooks (useLocalMedia, useElapsedSeconds, …)
  lib/                 helpers, theme class maps, mock data, Prisma client
  types/               shared TypeScript types
```

Design tokens (colors, fonts, hard shadows, animations, paper textures) live in `src/app/globals.css`.
Remote participants, streams and chat are mocked in `src/lib/mock-data.ts` until real signaling exists; your own camera, mic and screen share are real.
