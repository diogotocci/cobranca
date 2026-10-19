---
trigger: always_on
description: Which skills apply to which situation, used automatically without waiting for the owner to ask.
---

# Workflow: skills that apply automatically

Skills live in `.agents/skills/<name>/SKILL.md`, mirrored to `.claude/skills/` for Claude Code (`skills-lock.json` records their source; install or update with `npx skills add <repo> -s <skill> -a claude-code -a codex --copy`). `frontend-design` comes from the `claude-code-plugins` marketplace and is enabled in `.claude/settings.json`.

Before acting, check this table. If a skill may apply, read its `SKILL.md` and follow it. Process skills first (they define how), implementation skills second. The project rules in this folder win where a skill disagrees (for example, a skill that commits on its own still follows `git-workflow.md`, and `frontend-design` stays inside the "Brinquedo" style in `CLAUDE.md`).

| Situation                                                          | Skill                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------- |
| New feature, mechanic, screen or behavior change                   | `brainstorming`, then `writing-plans`                          |
| Game architecture, loop, input, save, performance boundaries       | `game-studio`, then `web-game-foundations`                     |
| 3D rendering, camera, materials, lighting, WebGL performance       | `three-webgl-game`                                             |
| HUD, prompts, overlays, mobile landscape layout                    | `game-ui-frontend` and `frontend-design`                       |
| Review UI, UX or accessibility of a screen                         | `web-design-guidelines`                                        |
| Execute a written plan                                             | `subagent-driven-development` (preferred) or `executing-plans` |
| Two or more independent tasks                                      | `dispatching-parallel-agents`                                  |
| Any logic: physics, keeper AI, scoring, round state, input mapping | `test-driven-development` (always)                             |
| Bug, failing test, odd behavior                                    | `systematic-debugging`                                         |
| Browser check, screenshots, mobile viewport, smoke test            | `game-playtest` and `playwright-cli`                           |
| Before saying "done", "works" or "passes"                          | `verification-before-completion`                               |
| Work finished and needs review / review feedback received          | `requesting-code-review` / `receiving-code-review`             |
| Cross-module discovery or impact analysis                          | `graphify` (see `graphify.md`)                                 |
| Owner says "grill me"                                              | `grill-me` (runs `grilling`)                                   |
| Hand work over to another session                                  | `handoff`                                                      |
| A capability no skill covers                                       | `find-skills`                                                  |

Always-on rules in `.agents/rules/` apply to every task without being invoked.
