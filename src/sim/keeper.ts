import { ball, keeper as tuning, pitch } from "../config/tuning";
import type { Rng } from "./rng";
import type { Vec3 } from "./vec";

// The keeper moves in the plane z = keeper.lineZ; x and y locate the center of the body.
export interface KeeperState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  reactionLeft: number;
}

export interface GoalPoint {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function createKeeper(): KeeperState {
  return { x: 0, y: tuning.standHeight, targetX: 0, targetY: tuning.standHeight, reactionLeft: 0 };
}

// Picks a dive target from where the ball is heading, sometimes guessing the wrong side.
export function reactToShot(keeper: KeeperState, crossing: GoalPoint, random: Rng): void {
  const isWrongGuess = random() < tuning.wrongGuessChance;
  const maxX = pitch.goalHalfWidth - tuning.frameMargin;
  keeper.targetX = clamp(isWrongGuess ? -crossing.x : crossing.x, -maxX, maxX);
  keeper.targetY = clamp(crossing.y, tuning.frameMargin, pitch.goalHeight - tuning.frameMargin);
  keeper.reactionLeft = tuning.reactionDelay;
}

export function stepKeeper(keeper: KeeperState, dt: number): void {
  if (keeper.reactionLeft > 0) {
    keeper.reactionLeft -= dt;
    return;
  }
  const dx = keeper.targetX - keeper.x;
  const dy = keeper.targetY - keeper.y;
  const distance = Math.hypot(dx, dy);
  const travel = tuning.diveSpeed * dt;
  if (distance <= travel) {
    keeper.x = keeper.targetX;
    keeper.y = keeper.targetY;
    return;
  }
  keeper.x += (dx / distance) * travel;
  keeper.y += (dy / distance) * travel;
}

export function keeperStops(keeper: KeeperState, ballPosition: Vec3): boolean {
  return (
    Math.hypot(ballPosition.x - keeper.x, ballPosition.y - keeper.y) <= tuning.reach + ball.radius
  );
}
