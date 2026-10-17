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
