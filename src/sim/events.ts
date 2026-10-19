import type { RoundPhase, RoundState } from "./round";
import type { ShotResult } from "./shot";

// What the view, HUD and audio need to react to between two moments of a round.
export type RoundEvent =
  | { type: "kicked" }
  | { type: "resolved"; result: ShotResult }
  | { type: "nextKick" }
  | { type: "roundOver" };

export interface RoundSnapshot {
  phase: RoundPhase;
  result: ShotResult | null;
}

export function snapshotRound(round: RoundState): RoundSnapshot {
  return { phase: round.phase, result: round.shot?.result ?? null };
}

export function roundEvents(before: RoundSnapshot, round: RoundState): RoundEvent[] {
  const events: RoundEvent[] = [];
  if (before.phase === "aiming" && round.phase === "flying") events.push({ type: "kicked" });
  const result = before.result === null ? newResult(before, round) : null;
  if (result !== null) events.push({ type: "resolved", result });
  if (before.phase === "flying" && round.phase === "aiming") events.push({ type: "nextKick" });
  if (before.phase !== "over" && round.phase === "over") events.push({ type: "roundOver" });
  return events;
}

// A shot that resolves and finishes within one step is already in the results, not on the shot.
function newResult(before: RoundSnapshot, round: RoundState): ShotResult | null {
  if (round.shot?.result) return round.shot.result;
  const hasFinishedShot = before.phase === "flying" && round.phase !== "flying";
  return hasFinishedShot ? (round.results.at(-1) ?? null) : null;
}
