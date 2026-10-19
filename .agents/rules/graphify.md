---
trigger: always_on
description: Consult the graphify knowledge graph at graphify-out/ for codebase and architecture questions, and refresh it after changes.
---

# Graphify

Graphify builds a knowledge graph of the repository in `graphify-out/` with local parsing (TypeScript, JavaScript, JSON, shell, Markdown headings): no API key, a few seconds. `.graphifyignore` excludes vendored skills, lockfiles and the reference prototype.

The graph is not committed (`graphify-out/` is in `.gitignore`): it is rewritten whole on every build, so tracking it would put a large diff and a merge conflict in every PR. Each environment builds its own: cloud sessions build it at start (`.agents/hooks/session-start.sh`); locally, run `graphify update .` once after cloning.

Install once: `uv tool install graphifyy==0.9.92` (or `pipx install graphifyy==0.9.92`). The pinned version lives in the session-start hook; bump both together. The `graphify` skill in `.agents/skills/` and `.claude/skills/` comes from `graphify install --platform agents` and `--platform claude` of that version, and `.agents/workflows/graphify.md` from `graphify antigravity install`.

## Discovery

- Applicable: cross-module changes, architecture questions, data flow ("how does a swipe reach the ball?", "what reads the keeper delay?"), impact analysis before refactors. When `graphify-out/graph.json` exists, start with `graphify query "<question>"`; use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for one concept.
- Not applicable (skipping is fine): single-file edits, CSS tweaks, balance numbers, copy changes, documentation wording.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain are not enough.
- Graphify never overrides raw source, Git history, tests or official docs. Do not claim Graphify usage when it was not used.

## Refresh

After modifying indexed files in a session, run `graphify update .` so later queries see the current code. If it fails, report `GRAPHIFY_UPDATE_FAILED` with the error instead of continuing as if the graph were current.
