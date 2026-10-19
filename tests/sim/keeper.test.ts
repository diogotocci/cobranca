import { describe, expect, it } from "vitest";
import { ball, fixedStep, keeper as tuning, pitch } from "../../src/config/tuning";
import { createKeeper, keeperStops, reactToShot, stepKeeper } from "../../src/sim/keeper";

const always = (value: number) => () => value;
const guessRight = always(0.99);
const guessWrong = always(0);

function stepFor(seconds: number, keeper: ReturnType<typeof createKeeper>): void {
  for (let t = 0; t < seconds; t += fixedStep) stepKeeper(keeper, fixedStep);
}

describe("keeper", () => {
  it("starts standing in the middle of the goal", () => {
    const keeper = createKeeper();
    expect(keeper.x).toBe(0);
    expect(keeper.y).toBe(tuning.standHeight);
  });

  it("waits for the reaction delay before moving", () => {
    const keeper = createKeeper();
    reactToShot(keeper, { x: 3, y: 1 }, guessRight);
    stepFor(tuning.reactionDelay * 0.9, keeper);
    expect(keeper.x).toBe(0);
  });

  it("dives toward where the ball will cross when it guesses right", () => {
    const keeper = createKeeper();
    reactToShot(keeper, { x: 2, y: 1.5 }, guessRight);
    stepFor(tuning.reactionDelay + 2, keeper);
    expect(keeper.x).toBeCloseTo(2);
    expect(keeper.y).toBeCloseTo(1.5);
  });

  it("dives to the other side when it guesses wrong", () => {
    const keeper = createKeeper();
    reactToShot(keeper, { x: 2, y: 1.5 }, guessWrong);
    stepFor(tuning.reactionDelay + 2, keeper);
    expect(keeper.x).toBeLessThan(0);
  });

  it("never dives outside the goal frame", () => {
    const keeper = createKeeper();
    reactToShot(keeper, { x: 9, y: 5 }, guessRight);
    stepFor(tuning.reactionDelay + 3, keeper);
    expect(keeper.x).toBeLessThanOrEqual(pitch.goalHalfWidth);
    expect(keeper.y).toBeLessThanOrEqual(pitch.goalHeight);
  });

  it("moves no faster than the dive speed", () => {
    const keeper = createKeeper();
    reactToShot(keeper, { x: 3, y: 1 }, guessRight);
    stepFor(tuning.reactionDelay + 0.2, keeper);
    expect(keeper.x).toBeLessThanOrEqual(tuning.diveSpeed * 0.2 + 0.05);
  });

  it("stops a ball within reach and not one beyond it", () => {
    const keeper = createKeeper();
    expect(keeperStops(keeper, { x: 0.5, y: 0.6, z: tuning.lineZ })).toBe(true);
    expect(
      keeperStops(keeper, { x: tuning.reach + ball.radius + 0.1, y: 1, z: tuning.lineZ }),
    ).toBe(false);
  });
});
