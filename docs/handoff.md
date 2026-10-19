# Handoff: Cobrança!

Context carried over from the brainstorming session where this game was chosen. Written 2026-10-19.

## Where this came from

Diogo wanted new browser games inspired by classic PS1 / Master System / Phantom System / Mega Drive /
SNES hits. Four ideas were mocked up:

| Game | Inspired by | One line |
|---|---|---|
| Moleque Jokenpô | Alex Kidd (Master System) | Side-scroller, punch blocks, bosses beaten at rock-paper-scissors |
| **Cobrança!** | Penalty / free-kick games | Camera behind the ball: aim, power and curl past the wall |
| Fuga do Forte | Prince of Persia | Precision jumps, collapsing floors, sword duels against the clock |
| Corre, Capivara! | Crash Bandicoot (PS1) | Into-the-screen runner, crates, mangoes, spin attack |

**Cobrança! is the first one to be built**, in this repository. The other three stay as ideas.

## Visual style decision

The first mockups (flat CSS pseudo-3D blocks) looked bad and were dropped. All four scenes were then
rebuilt in real Three.js in three styles: Brinquedo (toy), Cel-shading, Diorama.
**Diogo chose Brinquedo.** Details in `CLAUDE.md`.

- `docs/reference/estilos-comparacao.jpg`: 4 games x 3 styles side by side (rows: Jokenpô, Cobrança,
  Fuga, Capivara; columns: Brinquedo, Cel-shading, Diorama).
- `docs/reference/cobranca-brinquedo.jpg`: the chosen look for this game.
- `docs/reference/prova-estilos.html`: the working Three.js code that produced them. Loads three@0.169.0
  from jsDelivr via import map. Reuse `Kit` (rounded primitives + materials), `makeKid` (characters),
  `ballGeo` (soccer ball with vertex colors), `stripeTex` / `netTex` (pitch and net textures),
  `setupScene` (lights, shadows), `makeComposer` (GTAO + output pass) and `buildCobranca` (pitch, goal,
  keeper, wall, ball, crowd as InstancedMesh, floodlights). The cel-shading and diorama branches can be
  dropped.
- Live pages from the brainstorming (private to Diogo's account):
  - Style comparison: https://claude.ai/artifact/4HGTgQv7FaCzvkzbvEqrwe
  - First flat mockups (rejected look, HUD layout still useful): https://claude.ai/artifact/X71ytBVr41rUQawkMzMHsT

## Gameplay proposal for the first playable prototype

Proposed, not yet confirmed by Diogo:

- **Kick by swipe**: drag from the ball. Direction = aim, length = power, a curve in the gesture = spin
  (ball bends around the wall).
- **Free kicks**: ball position and wall change every attempt.
- **CPU keeper**: reacts to the shot with a delay and sometimes guesses wrong. That delay is the
  difficulty knob later.
- **Short round**: 5 kicks with a score, to test whether people want to play again.
- Out of scope for now: levels, progression, sound, menus. First prove the kick feels good.

HUD from the earlier mockup: score "VOCÊ 2 × 1 CPU" with 5 dots for the kicks (scored / missed /
pending), distance label ("FALTA · 22 m"), and the hint "Arraste para mirar · segure para dar força".

## Open questions

1. Does the player only kick, or also defend (alternating with the CPU like a real shootout)?
   This changes the core loop and was the last question asked.
2. Later: levels, difficulty curve, retention (Diogo explicitly deferred these).

## Suggested skills for the next session

From github.com/obra/superpowers: `brainstorming` (settle the open questions first), `writing-plans`,
`test-driven-development` (ball physics and keeper logic are pure functions worth testing),
`verification-before-completion`.
From github.com/openai/plugins (game-studio): `three-webgl-game`, `game-ui-frontend`, `game-playtest`,
`web-3d-asset-pipeline` (when real models replace the procedural ones).
