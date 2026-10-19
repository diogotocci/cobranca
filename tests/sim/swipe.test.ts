import { describe, expect, it } from "vitest";
import { swipe as tuning } from "../../src/config/tuning";
import { swipeToKick, type SwipePoint } from "../../src/sim/swipe";

// Screen-space points in viewport heights, y growing downward like pointer events.
function straightSwipe(dx: number, dy: number, steps = 8): SwipePoint[] {
  return Array.from({ length: steps + 1 }, (_, i) => ({
    x: 0.5 + (dx * i) / steps,
    y: 0.8 + (dy * i) / steps,
  }));
}

// An upward swipe whose middle bows sideways by `bulge` viewport heights (positive = right).
function bowedSwipe(length: number, bulge: number, steps = 10): SwipePoint[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return { x: 0.5 + bulge * 4 * t * (1 - t), y: 0.8 - length * t };
  });
}

describe("swipeToKick", () => {
  it("ignores a tap or a swipe shorter than the minimum length", () => {
    expect(swipeToKick(straightSwipe(0, -tuning.minLength * 0.5))).toBeNull();
    expect(swipeToKick([{ x: 0.5, y: 0.5 }])).toBeNull();
  });

  it("ignores a swipe that moves away from the goal", () => {
    expect(swipeToKick(straightSwipe(0, 0.3))).toBeNull();
  });

  it("aims straight at the goal for a straight upward swipe", () => {
    const kick = swipeToKick(straightSwipe(0, -0.3));
    expect(kick?.yaw).toBeCloseTo(0);
    expect(kick?.spin).toBeCloseTo(0);
  });

  it("aims right for a swipe toward the upper right", () => {
    const kick = swipeToKick(straightSwipe(0.2, -0.3));
    expect(kick?.yaw).toBeGreaterThan(0);
    expect(kick?.yaw).toBeCloseTo(Math.atan2(0.2, 0.3) * tuning.aimGain);
  });

  it("aims left for a swipe toward the upper left", () => {
    const kick = swipeToKick(straightSwipe(-0.2, -0.3));
    expect(kick?.yaw).toBeLessThan(0);
  });

  it("kicks harder and higher for a longer swipe", () => {
    const soft = swipeToKick(straightSwipe(0, -0.15))!;
    const hard = swipeToKick(straightSwipe(0, -0.45))!;
    expect(hard.speed).toBeGreaterThan(soft.speed);
    expect(hard.elevation).toBeGreaterThan(soft.elevation);
  });

  it("caps power at the full-power swipe length", () => {
    const full = swipeToKick(straightSwipe(0, -tuning.fullPowerLength))!;
    const longer = swipeToKick(straightSwipe(0, -tuning.fullPowerLength * 1.5))!;
    expect(full.speed).toBeCloseTo(tuning.maxSpeed);
    expect(longer.speed).toBeCloseTo(tuning.maxSpeed);
    expect(longer.elevation).toBeCloseTo(tuning.maxElevation);
  });

  it("gives positive spin to a gesture that bows to the right", () => {
    const kick = swipeToKick(bowedSwipe(0.4, 0.04))!;
    expect(kick.spin).toBeGreaterThan(0);
  });

  it("gives negative spin to a gesture that bows to the left", () => {
    const kick = swipeToKick(bowedSwipe(0.4, -0.04))!;
    expect(kick.spin).toBeLessThan(0);
  });

  it("clamps spin to the range -1 to 1", () => {
    expect(swipeToKick(bowedSwipe(0.4, 0.5))!.spin).toBe(1);
    expect(swipeToKick(bowedSwipe(0.4, -0.5))!.spin).toBe(-1);
  });
});
