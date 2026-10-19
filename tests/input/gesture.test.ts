import { describe, expect, it } from "vitest";
import { isNearBall, toSwipePoint } from "../../src/input/gesture";

describe("toSwipePoint", () => {
  it("measures pointer positions in viewport heights", () => {
    expect(toSwipePoint(390, 195, 390)).toEqual({ x: 1, y: 0.5 });
  });
});

describe("isNearBall", () => {
  const ball = { x: 1, y: 0.8 };

  it("accepts a touch on or around the ball", () => {
    expect(isNearBall({ x: 1.05, y: 0.85 }, ball)).toBe(true);
  });

  it("rejects a touch far from the ball", () => {
    expect(isNearBall({ x: 0.3, y: 0.2 }, ball)).toBe(false);
  });
});
