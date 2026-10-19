import { describe, expect, it } from "vitest";
import { consumeFixedSteps } from "../../src/sim/clock";

describe("consumeFixedSteps", () => {
  it("runs whole steps and carries the remainder", () => {
    const { steps, remainder } = consumeFixedSteps(0, 0.025, 0.01);
    expect(steps).toBe(2);
    expect(remainder).toBeCloseTo(0.005);
  });

  it("adds the carried remainder to the next frame", () => {
    expect(consumeFixedSteps(0.006, 0.005, 0.01).steps).toBe(1);
  });

  it("caps a long frame so a background tab does not fast-forward the game", () => {
    const { steps, remainder } = consumeFixedSteps(0, 5, 0.01);
    expect(steps).toBe(25);
    expect(remainder).toBeLessThan(0.01);
  });
});
