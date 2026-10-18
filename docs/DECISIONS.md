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
16. **Static `app/robots.txt` that keeps crawlers out of `/call/` and `/studio`**
    - Why: call rooms are private, short-lived links and the studio is a tool, not content; it's not security (room codes still have to be unguessable), and with no site URL yet there's no sitemap, so a generated `robots.ts` isn't needed.
17. **Mesh topology: every browser connects directly to every other browser**
    - Why: no media server to run or pay for, and it's the clearest way to learn WebRTC; fine for the 5-person cap (4 uploads per person).
18. **Only the newcomer makes offers; people already in the room only answer**
    - Why: two sides can never offer at the same time ("glare"), so we don't need the more complex "perfect negotiation" pattern.
19. **Two fixed transceivers (audio + video) per connection; change media with `replaceTrack`**
    - Why: the camera often becomes ready after the connection starts, and swapping tracks needs no renegotiation, which keeps the handshake one-way.
20. **Apply incoming signals one at a time per connection (promise chain)**
    - Why: WebRTC calls are async, and an ICE candidate applied before its offer would throw.
21. **Google's public STUN servers by default; TURN only via optional `NEXT_PUBLIC_TURN_*` env**
    - Why: STUN is free and enough for most home networks; TURN relays media and costs bandwidth, so it's opt-in.
22. **Play remote audio through hidden `<audio>` elements; keep every `<video>` muted**
    - Why: you still hear people whose camera is off, and the browser's autoplay block is handled in one place ("Tap to hear everyone").
23. **Start a fresh mesh on every (re)join, keyed by a `joinId` counter in the store**
    - Why: a reconnect gives you a new socket id, so others treat you as a newcomer; rebuilding is simpler than patching old connections.
17. **`suppressHydrationWarning` on `<html>` and `<body>` in the root layout**
    - Why: the hydration error came from browser extensions adding attributes to those tags (pages hydrate cleanly in a browser without extensions); the flag only ignores those two tags' own attributes, so real mismatches inside the page still show up.
24. **Call screen shows only joined people, in one column on the right in join order; screen share sits on the left (replaces the fixed 5-seat grid with "Seat open" placeholders)**
    - Why: empty seats took up most of the screen in small calls; a right-hand column grows naturally as people join and leaves the main area free for the shared screen.
25. **Reverses the column part of #24: tiles form a centered grid sized by headcount (1 big, 2 side by side, 3–4 two-by-two, 5 as 3+2); only joined people still get a tile; the control dock moves to a vertical bar on the right from `md` up (bottom row on phones)**
    - Why: the column-on-the-right came from a misread; a grid sized by headcount fills the screen in small calls, and a side dock stops covering the tiles. The grid's max width is tied to the viewport height (`100dvh`) so every tile fits on screen without scrolling.
26. **The room-code button in the call top bar copies just the code (e.g. `cosmic-noodle-55`), not the page URL**
    - Why: the button shows the code, so it should copy what it shows; the code is what people type into "join with code" on the home page.
27. **Host the signaling server on a home Raspberry Pi 5, run by systemd, instead of Railway/Render/Fly**
    - Why: the server is light (signaling only, no media), the Pi is already running other services, and it costs nothing extra; systemd restarts it on crash or reboot.
28. **Publish it at `vidbase-signal.devprince.space` through a Cloudflare Tunnel (not Tailscale Funnel or router port-forwarding)**
    - Why: Funnel only serves `*.ts.net` names; a tunnel needs no open ports or public IP, gives HTTPS on our own domain, and passes WebSockets through.
29. **Serve the web app at `vidbase.devprince.space`: CNAME in Cloudflare to Vercel with proxy off ("DNS only")**
    - Why: Vercel needs to issue the HTTPS certificate and runs its own CDN; putting Cloudflare's proxy in front can block the certificate and adds a second cache.
27. **Add a separate "copy link" button to the call top bar that copies `<origin>/call/<roomId>`; the code chip keeps copying just the code (#26)**
    - Why: opening `/call/<roomId>` already joins the room, so a link lets friends hop in with one click; the link is built from `window.location.origin` (no site-URL env var needed), and dropping the page's query/hash keeps it clean.
30. **Drop screen sharing; calls stream only camera + mic**
    - Why: it's a learning project, not a full product; the share was only ever shown locally (never sent over WebRTC), so removing it deletes UI and state without touching the connection code.
31. **In-call chat and reactions go through the signaling server (`chat:send` → `chat:message`, `reaction:send` → `reaction`), not WebRTC data channels**
    - Why: the socket is already open and the server knows who's in the room, so it can fill in the author (no faking names), cap length (280 chars) and allow only the six reaction emoji; data channels would need one per peer and their own checks.
32. **The sender shows their own chat message/reaction immediately; the server relays only to others (no echo), and there's no chat history for latecomers**
    - Why: instant feedback with no round trip, and no message store on the server, which keeps it stateless beyond the room list (see #15).
33. **"Who's speaking" is measured in the browser with a Web Audio `AnalyserNode` per stream (RMS > 0.02, held 400 ms), polled every 100 ms**
    - Why: works the same for your own mic and remote streams with no extra signaling; a muted mic sends silence so it never lights up; the hold stops the ring flickering between words.
34. **Room codes are `adjective-noun-xxxxxx` (32 × 32 words + 6 chars from a 31-letter alphabet without 0/o/1/l), picked with `crypto.getRandomValues`**
    - Why: the code is the only key to a room; the old `word-word-NN` format had just 5,760 options and used `Math.random`. ~900 billion options plus the join limit (#36) makes guessing hopeless; old codes still work since the format check is unchanged.
35. **A full room answers just `full`, without the names of who's inside**
    - Why: anyone with (or guessing) a code could see who was in a call; the count is always the max, so the "room full" screen shows faceless seats.
36. **Token-bucket rate limits in the signaling server: per IP for connections (20 open, burst 20, +1 per 3 s) and `room:join` (burst 10, +1 per 2 s); per socket for chat (5, +1/s), reactions (10, +5/s), `peer:update` (10, +5/s) and `signal` (200, +50/s)**
    - Why: reconnecting gives a fresh socket, so joins and connections must be limited per IP to stop code guessing and connection floods; per-socket limits are enough for messages because every socket has to join through the IP limit. Over-limit messages are dropped silently; a limited join gets a `rate-limited` reply and the browser retries after 5 s.
37. **Read the client IP from `cf-connecting-ip` only when the connection comes from loopback**
    - Why: in production every connection arrives from `cloudflared` on the Pi, so the socket address alone would put all users behind one IP; trusting the header only on loopback stops anyone who reaches the server directly from faking it, with no config needed.
38. **Cap floating reactions at 30 on screen in the browser**
    - Why: the server limit is per socket, so several sockets (or IPs) can still add up to a flood; dropping the oldest emoji keeps the page from freezing.
