import { describe, expect, it } from "vitest";
import { createRng } from "../../src/sim/rng";

describe("createRng", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("produces a different sequence for a different seed", () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it("returns numbers in [0, 1)", () => {
    const next = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
