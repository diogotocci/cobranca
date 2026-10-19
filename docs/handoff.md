# Handoff: Cobrança!

Context carried over from the brainstorming session where this game was chosen. Written 2026-10-19.

## Where this came from

Diogo wanted new browser games inspired by classic PS1 / Master System / Phantom System / Mega Drive /
SNES hits. Four ideas were mocked up:

| Game             | Inspired by               | One line                                                          |
| ---------------- | ------------------------- | ----------------------------------------------------------------- |
| Moleque Jokenpô  | Alex Kidd (Master System) | Side-scroller, punch blocks, bosses beaten at rock-paper-scissors |
| **Cobrança!**    | Penalty / free-kick games | Camera behind the ball: aim, power and curl past the wall         |
| Fuga do Forte    | Prince of Persia          | Precision jumps, collapsing floors, sword duels against the clock |
| Corre, Capivara! | Crash Bandicoot (PS1)     | Into-the-screen runner, crates, mangoes, spin attack              |

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

## Gameplay for the first playable prototype

Confirmed by Diogo on 2026-10-19:

- **Player only kicks.** No defending in the prototype; defending may come later.
- **Free kicks**: ball position and wall change every attempt.
- **Kick by swipe**: drag from the ball. Direction = aim, length = power, a curve in the gesture = spin
  (ball bends around the wall).
- **CPU keeper**: reacts to the shot with a delay and sometimes guesses wrong. That delay is the
  difficulty knob later.
- **Short round**: 5 kicks, scored as goals out of 5, to test whether people want to play again.
- **Sound is in scope**: kick, net, crowd.
- Out of scope for now: levels, progression, difficulty curve, retention, menus.

HUD: goals out of 5 (e.g. "3/5") with 5 dots for the kicks (scored / missed / pending), distance label
("FALTA · 22 m"), and a hint matching the swipe control, e.g. "Arraste a partir da bola para chutar".
The old mockup's "VOCÊ 2 × 1 CPU" score and "Arraste para mirar · segure para dar força" hint are dropped:
the CPU does not kick, and the control is a single swipe, not aim + hold.

## Future ideas (not in the prototype)

- **Penalty mode**: penalty kicks as a separate game mode, not as a tiebreak for free kicks.
- Defending (alternating with the CPU like a real shootout).
- Levels, difficulty curve, retention (Diogo explicitly deferred these).

## Skills

The skills suggested here at handoff are now installed in `.agents/skills/`; `.agents/rules/workflow.md`
maps each situation to its skill. `web-3d-asset-pipeline` waits until real models replace the procedural ones.
