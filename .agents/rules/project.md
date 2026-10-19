---
trigger: always_on
description: What this project is and where its decisions live.
---

# Project

Cobrança! is a browser free-kick game for phones in landscape, built with plain Three.js, TypeScript and Vite, deployed as a static site on Vercel. `CLAUDE.md` holds the stack, visual style and performance targets; `docs/handoff.md` holds the design history and the confirmed gameplay decisions.

Before feature work:

1. Read `CLAUDE.md` and `docs/handoff.md`.
2. Query Graphify for cross-module questions (see `graphify.md`).
3. Read only the source files relevant to the task.
4. Do not change confirmed gameplay decisions (swipe control, 5-kick round, keeper behavior) unless the owner asks.

When the owner settles a new decision, record it in `docs/handoff.md` in the same PR.
