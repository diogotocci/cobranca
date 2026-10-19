import {
  fixedStep,
  keeper as keeperTuning,
  pitch,
  ball as ballTuning,
  shot as tuning,
} from "../config/tuning";
import { launchBall, stepBall, type BallState } from "./ball";
import type { FreeKick } from "./freeKick";
import { createKeeper, keeperStops, reactToShot, stepKeeper, type KeeperState } from "./keeper";
import type { Rng } from "./rng";
import type { Kick } from "./swipe";
import { wallBlocks, type Wall } from "./wall";
import type { Vec3 } from "./vec";

export type ShotResult = "goal" | "saved" | "blocked" | "missed";

export interface ShotState {
  ball: BallState;
  keeper: KeeperState;
  wall: Wall;
  result: ShotResult | null;
  elapsed: number;
  resolvedAt: number;
}

const goalCenter: Vec3 = { x: 0, y: 0, z: 0 };

export function startShot(freeKick: FreeKick, kick: Kick, random: Rng): ShotState {
  const ball = launchBall(freeKick.spot, goalCenter, kick);
  const keeper = createKeeper();
  reactToShot(keeper, predictCrossing(ball), random);
  return { ball, keeper, wall: freeKick.wall, result: null, elapsed: 0, resolvedAt: 0 };
}

export function stepShot(shot: ShotState, dt: number): void {
  const from = { ...shot.ball.position };
  stepBall(shot.ball, dt);
  stepKeeper(shot.keeper, dt);
  shot.elapsed += dt;

  if (shot.result === null) {
    const result = resolve(shot, from);
    if (result !== null) {
      shot.result = result;
      shot.resolvedAt = shot.elapsed;
    }
  }
  if (shot.result === "goal") keepInNet(shot.ball);
}

export function isShotOver(shot: ShotState): boolean {
  return shot.result !== null && shot.elapsed - shot.resolvedAt >= tuning.resultHold;
}

function resolve(shot: ShotState, from: Vec3): ShotResult | null {
  const { ball } = shot;
  const to = ball.position;
  if (wallBlocks(shot.wall, from, to)) {
    rebound(ball, from, shot.wall.normal);
    return "blocked";
  }
  if (from.z > keeperTuning.lineZ && to.z <= keeperTuning.lineZ && keeperStops(shot.keeper, to)) {
    rebound(ball, from, { x: 0, y: 0, z: 1 });
    return "saved";
  }
  if (from.z > 0 && to.z <= 0) return isInsideFrame(to) ? "goal" : "missed";
  if (shot.elapsed >= tuning.timeout) return "missed";
  return null;
}

function isInsideFrame(position: Vec3): boolean {
  return (
    Math.abs(position.x) < pitch.goalHalfWidth - ballTuning.radius &&
    position.y < pitch.goalHeight - ballTuning.radius
  );
}

// Reflects the velocity off a surface with the given normal and puts the ball back in front of it.
function rebound(ball: BallState, from: Vec3, normal: Vec3): void {
  const { velocity } = ball;
  const into = velocity.x * normal.x + velocity.y * normal.y + velocity.z * normal.z;
  const factor = (1 + tuning.reboundRestitution) * into;
  velocity.x = (velocity.x - factor * normal.x) * tuning.reboundRestitution;
  velocity.y = (velocity.y - factor * normal.y) * tuning.reboundRestitution;
  velocity.z = (velocity.z - factor * normal.z) * tuning.reboundRestitution;
  ball.position = { ...from };
  ball.spin = 0;
}

function keepInNet(ball: BallState): void {
  if (ball.position.z > -tuning.netDepth) return;
  ball.position.z = -tuning.netDepth;
  ball.velocity.x *= 0.5;
  ball.velocity.z = 0;
}

// Where the ball would cross the keeper's line if nothing were in the way.
function predictCrossing(launched: BallState): { x: number; y: number } {
  const ghost: BallState = {
    position: { ...launched.position },
    velocity: { ...launched.velocity },
    spin: launched.spin,
  };
  for (let t = 0; t < tuning.timeout && ghost.position.z > keeperTuning.lineZ; t += fixedStep) {
    stepBall(ghost, fixedStep);
  }
  return { x: ghost.position.x, y: ghost.position.y };
}
