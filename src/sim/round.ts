import { round as tuning } from "../config/tuning";
import { createFreeKick, type FreeKick } from "./freeKick";
import { createRng, type Rng } from "./rng";
import { isShotOver, startShot, stepShot, type ShotResult, type ShotState } from "./shot";
import type { Kick } from "./swipe";

export type RoundPhase = "aiming" | "flying" | "over";

export interface RoundState {
  phase: RoundPhase;
  freeKick: FreeKick;
  shot: ShotState | null;
  results: ShotResult[];
  random: Rng;
}

export function createRound(seed: number): RoundState {
  const random = createRng(seed);
  return { phase: "aiming", freeKick: createFreeKick(random), shot: null, results: [], random };
}

export function kick(round: RoundState, input: Kick): void {
  if (round.phase !== "aiming") return;
  round.shot = startShot(round.freeKick, input, round.random);
  round.phase = "flying";
}

export function stepRound(round: RoundState, dt: number): void {
  if (round.phase !== "flying" || round.shot === null) return;
  stepShot(round.shot, dt);
  if (!isShotOver(round.shot) || round.shot.result === null) return;

  round.results.push(round.shot.result);
  round.shot = null;
  if (round.results.length >= tuning.kicks) {
    round.phase = "over";
    return;
  }
  round.freeKick = createFreeKick(round.random);
  round.phase = "aiming";
}

export function goals(round: RoundState): number {
  return round.results.filter((result) => result === "goal").length;
}
