import { describe, expect, it } from "vitest";
import { ball, wall as tuning } from "../../src/config/tuning";
import { createWall, wallBlocks } from "../../src/sim/wall";

const centralSpot = { x: 0, y: ball.radius, z: 20 };

describe("createWall", () => {
  it("stands the regulation distance from the ball", () => {
    const wall = createWall({ x: 6, y: ball.radius, z: 22 }, 4);
    expect(Math.hypot(wall.center.x - 6, wall.center.z - 22)).toBeCloseTo(tuning.distance);
  });

  it("stands between the ball and the goal", () => {
    expect(createWall(centralSpot, 4).center.z).toBeCloseTo(20 - tuning.distance);
  });

  it("shifts toward the near post for a spot off to one side", () => {
    const fromRight = createWall({ x: 8, y: ball.radius, z: 20 }, 4);
    const lineX = 8 - (8 / 20) * tuning.distance;
    expect(fromRight.center.x).toBeGreaterThan(lineX);
  });

  it("is as wide as its players", () => {
    expect(createWall(centralSpot, 3).halfWidth).toBeCloseTo(1.5 * tuning.playerWidth);
    expect(createWall(centralSpot, 4).playerOffsets).toHaveLength(4);
  });
});

describe("wallBlocks", () => {
  const wall = createWall(centralSpot, 4);
  const wallZ = wall.center.z;

  it("blocks a low ball crossing the wall in front of a player", () => {
    expect(
      wallBlocks(wall, { x: 0.2, y: 1, z: wallZ + 0.2 }, { x: 0.2, y: 1, z: wallZ - 0.2 }),
    ).toBe(true);
  });

  it("lets a ball over the wall through", () => {
    expect(
      wallBlocks(
        wall,
        { x: 0, y: tuning.height + 0.4, z: wallZ + 0.2 },
        { x: 0, y: 2.3, z: wallZ - 0.2 },
      ),
    ).toBe(false);
  });

  it("lets a ball past the end of the wall through", () => {
    const x = wall.halfWidth + 0.5;
    expect(wallBlocks(wall, { x, y: 1, z: wallZ + 0.2 }, { x, y: 1, z: wallZ - 0.2 })).toBe(false);
  });

  it("ignores a ball that has not reached the wall yet", () => {
    expect(wallBlocks(wall, { x: 0, y: 1, z: wallZ + 2 }, { x: 0, y: 1, z: wallZ + 1.5 })).toBe(
      false,
    );
  });
});
