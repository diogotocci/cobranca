---
trigger: always_on
description: Coding, testing, language, versioning and attribution standards for every file in this repository.
---

# Coding standards

## Language

All technical content is in English: identifiers, file names, tests and test names, comments, developer-facing errors and logs, script output, configuration and storage keys, documentation, commit messages, PR titles and bodies.

Player-facing text (HUD, prompts, menus) is Brazilian Portuguese. Never put Portuguese in identifiers. Conversation with the owner is in Portuguese.

## Naming and functions

Descriptive English names (`shotPower`, `keeperReactionDelay`, `wallOffset`); booleans read as questions (`isGoal`, `hasCurl`, `canKick`). Functions have one responsibility, no hidden side effects and few parameters (an options object above four). ESLint warns above the size and complexity budgets.

## Comments

Explain why: constraints, invariants, units and coordinate conventions, game-feel decisions from playtests. Do not restate the code or narrate history; Git does that.

## No emojis, no AI attribution

No emojis in code, comments, logs, scripts, tests or config. Use plain status words (`INFO`, `WARN`, `ERROR`, `PASS`, `FAIL`).

Never add AI, assistant or model attribution anywhere in the repository or on GitHub: no `Co-Authored-By` trailers for assistants, no session links, no "Generated with" footers, no tool names in commits, PR bodies, comments, code or docs. Commits appear as normal commits by the configured Git user.

## Architecture invariants

- Simulation (ball physics, keeper AI, score, round state) lives in `src/sim/`; tuning numbers live in `src/config/`. Both are pure TypeScript: no Three.js, DOM, audio, input or browser globals. ESLint enforces it.
- The scene graph is a view layer over simulation state. HUD and menus are DOM over the canvas.
- The simulation is deterministic: fixed time steps, and randomness only from a seeded RNG passed in.
- Every gameplay number (power curve, curl strength, keeper delay, wall distance) lives in `src/config/`.

## Tests and TDD

TDD always (owner rule). Every new piece of logic and every behavior change starts with a failing test, then the minimal code to pass, then refactor (`test-driven-development` skill). A bug fix starts with a failing regression test.

- Unit tests run on Vitest under `tests/`, mirroring `src/` (`tests/sim/ball.test.ts` for `src/sim/ball.ts`).
- Test names are English sentences describing behavior.
- Tests are deterministic: seeded RNG, fixed steps, no arbitrary sleeps, no shared mutable state, no order dependence.
- Rendering and feel that a unit test cannot judge (lighting, camera, animation) are verified in the browser with the `game-playtest` and `playwright-cli` skills at the 844x390 landscape viewport, and the logic behind them is still extracted and tested.

## Errors and external input

Do not swallow errors silently. An empty `catch` is allowed only for expected, harmless failures (blocked storage, missing vibration or fullscreen API, audio autoplay restrictions) and says why in a comment. Treat URL parameters, `localStorage` and device APIs as untrusted and fall back explicitly.

## Type safety

No `any` (use `unknown` at boundaries and validate), no `@ts-ignore`, no casts to silence real errors. If a cast is unavoidable, isolate it and explain why.

## Logging

`src/` does not log to the console (`no-console` is an error). Debug information goes to a `?debug` overlay when one exists.

## Dependencies

Add a dependency only with a reason: necessity, maintenance, license, bundle size on mobile, fit. Prefer the platform (Web APIs, WebAudio, CSS) and what is already installed (see `minimal-code.md`).

## Formatting and linting

Prettier owns formatting (`.prettierrc.json`); ESLint owns correctness and architecture (`eslint.config.mjs`, plus the type-aware tier in `eslint.typed.config.mjs`). Do not disable a rule globally to solve a local problem. Errors block; warnings are refactoring pressure to address when touching the code.

## Versioning

`package.json` `version` follows Semantic Versioning. Every PR bumps it exactly once, by the highest-impact change in the PR. While the version is `0.y.z`: a breaking change for players or saved data bumps the minor; new player-facing behavior (`feat`) bumps the minor; everything else (`fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`) bumps the patch. `1.0.0` is set only when the owner declares the launch. The PR body states the new version.

## Completion

A change is complete only when:

- the behavior is implemented test-first and covered by tests;
- `pnpm check` passes (typecheck, lint, typed lint, tests), plus `pnpm build` once a build exists;
- browser-visible changes were checked in a playtest;
- `graphify update .` ran after the last indexed change (`graphify.md`);
- `docs/handoff.md` records any new decision;
- `package.json` `version` is bumped;
- no unrelated changes are included.
