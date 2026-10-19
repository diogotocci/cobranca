import { describe, expect, it } from "vitest";
import { cameraPlacement } from "../../src/render/cameraRig";

describe("cameraPlacement", () => {
  it("sits behind the ball on the line from the goal, above the ground", () => {
    const { position } = cameraPlacement({ x: 0, y: 0.11, z: 20 });
    expect(position.x).toBeCloseTo(0);
    expect(position.z).toBeGreaterThan(20);
    expect(position.y).toBeGreaterThan(1);
  });

  it("stays on the goal-to-ball line for a spot off to the side", () => {
    const { position } = cameraPlacement({ x: 8, y: 0.11, z: 20 });
    expect(position.x / position.z).toBeCloseTo(8 / 20);
  });

  it("looks at the goal", () => {
    const { target } = cameraPlacement({ x: 8, y: 0.11, z: 20 });
    expect(target.z).toBeCloseTo(0);
    expect(Math.abs(target.x)).toBeLessThan(1);
  });
});
