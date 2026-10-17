<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Record your decisions

Whenever you make a decision (architecture, library choice, trade-off, convention, deviation from the obvious approach), append it to `docs/DECISIONS.md`:

- Number each entry sequentially, continuing from the last number in the file.
- Keep it short and point-wise: one line for **what** you decided, one line for **why**.
- Never rewrite or renumber past entries; if a decision is reversed, add a new entry that references the old number.

Format:

```md
1. **<Decision>**
   - Why: <reason>
```

## Keep the architecture doc current

Whenever you add or change how the app is put together (new modules, data flow, signaling/media paths, external services), update `docs/ARCHITECTURE.md`:

- Use simple, plain words — explain it so someone new to the project can follow.
- Show structure and flow with Mermaid diagrams (` ```mermaid ` blocks): e.g. `flowchart` for components, `sequenceDiagram` for connection/signaling steps.
- Keep each diagram small and focused; split big ones into several.
- Edit the existing sections to match the code — don't just append. Remove anything that is no longer true.
