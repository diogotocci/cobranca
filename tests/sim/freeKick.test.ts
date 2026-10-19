import { describe, expect, it } from "vitest";
import { ball, freeKick as tuning } from "../../src/config/tuning";
import { createFreeKick } from "../../src/sim/freeKick";
import { createRng } from "../../src/sim/rng";

describe("createFreeKick", () => {
  it("places the ball on the ground outside the penalty area", () => {
    const random = createRng(3);
    for (let i = 0; i < 200; i++) {
      const { spot } = createFreeKick(random);
      expect(spot.y).toBe(ball.radius);
      expect(spot.z).toBeGreaterThanOrEqual(tuning.minZ);
      expect(spot.z).toBeLessThanOrEqual(tuning.maxZ);
      expect(Math.abs(spot.x)).toBeLessThanOrEqual(tuning.maxLateral);
    }
  });

  it("is the same for the same seed", () => {
    expect(createFreeKick(createRng(9))).toEqual(createFreeKick(createRng(9)));
  });

  it("moves the ball between attempts", () => {
    const random = createRng(5);
    expect(createFreeKick(random).spot).not.toEqual(createFreeKick(random).spot);
  });

  it("reports the distance to the goal center in whole meters", () => {
    const { spot, distance } = createFreeKick(createRng(11));
    expect(distance).toBe(Math.round(Math.hypot(spot.x, spot.z)));
  });

  it("uses a shorter wall for far free kicks", () => {
    const random = createRng(21);
    for (let i = 0; i < 200; i++) {
      const { spot, wall } = createFreeKick(random);
      const isFar = Math.hypot(spot.x, spot.z) > tuning.shortWallDistance;
      expect(wall.playerOffsets).toHaveLength(
        isFar ? tuning.farWallPlayers : tuning.nearWallPlayers,
      );
    }
  });
});
