import { describe, expect, it } from "vitest";
import { ball as tuning, fixedStep } from "../../src/config/tuning";
import { launchBall, stepBall, type BallState } from "../../src/sim/ball";
import type { Kick } from "../../src/sim/swipe";

const spot = { x: 0, y: tuning.radius, z: 20 };
const goalCenter = { x: 0, y: 0, z: 0 };
const kick = (overrides: Partial<Kick> = {}): Kick => ({
  speed: 24,
  elevation: 0.2,
  yaw: 0,
  spin: 0,
  ...overrides,
});

// Steps until the ball reaches the goal line and returns the path sampled every step.
function flyToGoalLine(state: BallState): BallState["position"][] {
  const path = [];
  for (let i = 0; i < 1000 && state.position.z > 0; i++) {
    stepBall(state, fixedStep);
    path.push({ ...state.position });
  }
  return path;
}

describe("launchBall", () => {
  it("sends a straight kick along the line from the ball to the goal", () => {
    const state = launchBall({ x: 8, y: tuning.radius, z: 20 }, goalCenter, kick());
    const { x, z } = state.velocity;
    expect(x / z).toBeCloseTo(8 / 20);
    expect(z).toBeLessThan(0);
  });

  it("launches at the kick speed and elevation", () => {
    const state = launchBall(spot, goalCenter, kick());
    const { x, y, z } = state.velocity;
    expect(Math.hypot(x, y, z)).toBeCloseTo(24);
    expect(Math.atan2(y, Math.hypot(x, z))).toBeCloseTo(0.2);
  });

  it("turns positive yaw to the kicker's right", () => {
    expect(launchBall(spot, goalCenter, kick({ yaw: 0.1 })).velocity.x).toBeGreaterThan(0);
  });
});

describe("stepBall", () => {
  it("is pulled down by gravity", () => {
    const state = launchBall(spot, goalCenter, kick());
    const before = state.velocity.y;
    stepBall(state, fixedStep);
    expect(state.velocity.y).toBeLessThan(before);
  });

  it("curls a positively spun ball to the left of its travel", () => {
    const state = launchBall(spot, goalCenter, kick());
    state.spin = 1;
    for (let i = 0; i < 60; i++) stepBall(state, fixedStep);
    expect(state.velocity.x).toBeLessThan(0);
  });

  it("bends a curled shot out and back so it still ends near where it was aimed", () => {
    const straight = flyToGoalLine(launchBall(spot, goalCenter, kick({ yaw: 0.05 })));
    const curled = flyToGoalLine(launchBall(spot, goalCenter, kick({ yaw: 0.05, spin: 1 })));
    const midway = curled[Math.floor(curled.length / 2)]!;
    const straightMidway = straight[Math.floor(straight.length / 2)]!;
    expect(midway.x - straightMidway.x).toBeGreaterThan(0.8);
    expect(Math.abs(curled.at(-1)!.x - straight.at(-1)!.x)).toBeLessThan(0.6);
  });

  it("bounces off the ground without sinking below it", () => {
    const state: BallState = {
      position: { x: 0, y: 2, z: 10 },
      velocity: { x: 0, y: 0, z: 0 },
      spin: 0,
    };
    let lowest = Infinity;
    let bounced = false;
    for (let i = 0; i < 240; i++) {
      stepBall(state, fixedStep);
      lowest = Math.min(lowest, state.position.y);
      if (state.velocity.y > 0) bounced = true;
    }
    expect(bounced).toBe(true);
    expect(lowest).toBeGreaterThanOrEqual(tuning.radius);
  });

  it("loses speed to drag", () => {
    const state = launchBall(spot, goalCenter, kick({ elevation: 0 }));
    state.position.y = 5;
    for (let i = 0; i < 60; i++) stepBall(state, fixedStep);
    expect(Math.abs(state.velocity.z)).toBeLessThan(24);
  });
});
