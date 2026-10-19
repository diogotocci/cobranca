# Cobrança!

Browser soccer free-kick / penalty game for phones, in landscape. Part of a series of retro-inspired games
(Alex Kidd, Prince of Persia, Crash Bandicoot, a football shootout) rebuilt in a soft "toy" 3D style.
Full context and decisions: `docs/handoff.md`. Read it before starting any feature work.

## Agent rules

Always-on rules live in `.agents/rules/` (also read by Antigravity) and skills in `.agents/skills/`,
mirrored to `.claude/skills/`. They are part of these instructions:

@.agents/rules/project.md
@.agents/rules/coding-standards.md
@.agents/rules/minimal-code.md
@.agents/rules/workflow.md
@.agents/rules/git-workflow.md
@.agents/rules/graphify.md

## Conventions

- All code, identifiers, comments and commit messages in English. No emojis in code.
- All player-facing text (HUD, menus, prompts) in Brazilian Portuguese.
- Deliver complete files, never partial snippets.
- Owner's usual stack is Flask + vanilla JS + Neon Postgres on Vercel via GitHub. The game itself is
  client-side; only add a backend when something needs one (leaderboards, accounts).

## Tech

- Plain Three.js (no React), TypeScript, Vite for dev/build, deploy as a static site on Vercel.
- pnpm, Vitest for unit tests, ESLint + Prettier. `pnpm check` runs typecheck, lint, typed lint and tests.
- Keep simulation (ball physics, keeper AI, score, round state) separate from Three.js objects.
  The scene graph is a view layer over game state.
- HUD and menus are DOM over the canvas, not drawn in WebGL.
- Assets: GLB / glTF 2.0 when real models replace the procedural ones.

## Visual style: "Brinquedo" (toy)

Chosen over cel-shading and diorama after comparing all three (see `docs/reference/`).

- Chunky rounded shapes everywhere (RoundedBoxGeometry, capsules, spheres). No hard edges.
- Saturated but soft colors; light sky tint in the shadows (HemisphereLight).
- Soft shadows (PCFSoftShadowMap, radius ~5) plus ambient occlusion (GTAOPass) for the plastic-toy look.
- ACES filmic tone mapping, MeshStandardMaterial with roughness ~0.58, metalness 0.
- Big-headed characters with dot eyes.
- Reference implementation of materials, lighting, post-processing and the stadium scene:
  `docs/reference/prova-estilos.html` (`Kit`, `setupScene`, `makeComposer`, `buildCobranca`).

## Target

Mobile browser first: touch controls, 60 fps on mid-range Android, landscape 844x390 as the design viewport.
Watch draw calls: use InstancedMesh for crowds and repeated props.
