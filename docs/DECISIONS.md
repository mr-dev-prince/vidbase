1. **Keep `docs/ARCHITECTURE.md` updated in plain words with Mermaid diagrams**
   - Why: one easy-to-read doc that renders on GitHub and shows how the parts fit together.
2. **Use Socket.IO for signaling**
   - Why: rooms, acknowledgements and auto-reconnect come built in, and it was the requested library.
3. **Put the browser–server contract in one shared package, `@vidbase/shared`**
   - Why: both sides import the same event and payload types, so they can't drift apart.
4. **The server enforces the 5-person room cap (`MAX_PARTICIPANTS`)**
   - Why: the client can't be trusted to limit itself; the UI reads the same constant for display.
5. **Validate every client payload on the server with small hand-written parsers**
   - Why: all socket input is untrusted, and a schema library is overkill for a handful of shapes.
6. **Keep room state in memory (`RoomRegistry`)**
   - Why: simplest way to start; it limits us to one server instance (scaling needs e.g. the Socket.IO Redis adapter).
7. **Zustand store holds call data only; `services/roomSession.ts` is the only code that touches the socket**
   - Why: components stay simple and all socket wiring lives in one place.
8. **Join the room on every socket `connect` event, and only ask for the camera after a seat is granted**
   - Why: one handler covers the first connect and every auto-reconnect; people turned away from a full room are never asked for camera access.
9. **Guest identity (random name + color) per browser tab, stored in `sessionStorage`**
   - Why: there are no accounts yet, and a second tab acting as a second person makes local testing easy.
10. **Run Socket.IO inside Next.js from a Pages Router API route (`pages/api/socket.ts`)**
    - Why: the backend was asked to live in Next's `/api` folder, and App Router route handlers can't keep WebSockets open.
11. **Reverses #10: split into a Turborepo with a standalone signaling app (`apps/signaling`)**
    - Why: Vercel runs API routes as short-lived functions, so WebSockets can't live there; the server deploys separately and the web app reads its URL from `NEXT_PUBLIC_SIGNALING_URL`.
12. **Bun workspaces + Turborepo; `@vidbase/shared` is consumed as TypeScript source (no build step)**
    - Why: Turbopack and Bun both compile workspace TypeScript directly.
13. **Run the signaling server with Bun (`bun src/index.ts`)**
    - Why: it runs TypeScript and loads `.env` without a build step; the host must support Bun.
14. **Keep the in-call chat local-only for now**
    - Why: out of scope for the first backend step; messages aren't sent over the socket yet.
15. **No database: remove Prisma/PostgreSQL**
    - Why: it's a hobby project for learning WebRTC and video calling; rooms, names and media state are short-lived and live in memory or the browser, and there are no accounts.
