import { describe, expect, it } from "vitest";
import { ball, fixedStep, shot as tuning } from "../../src/config/tuning";
import { createWall } from "../../src/sim/wall";
import type { FreeKick } from "../../src/sim/freeKick";
import { isShotOver, startShot, stepShot, type ShotState } from "../../src/sim/shot";
import type { Kick } from "../../src/sim/swipe";

const spot = { x: 0, y: ball.radius, z: 22 };
const central: FreeKick = { spot, distance: 22, wall: createWall(spot, 4) };
const neverMoves = () => 0.99;

function play(kick: Kick, random = neverMoves): ShotState {
  const shot = startShot(central, kick, random);
  for (let i = 0; i < 2000 && !isShotOver(shot); i++) stepShot(shot, fixedStep);
  return shot;
}

describe("shot", () => {
  it("is blocked by the wall when struck low and straight", () => {
    expect(play({ speed: 20, elevation: 0.05, yaw: 0, spin: 0 }).result).toBe("blocked");
  });

  it("goes wide when aimed far outside the post", () => {
    expect(play({ speed: 28, elevation: 0.2, yaw: 0.4, spin: 0 }).result).toBe("missed");
  });

  it("bends around the wall with spin", () => {
    expect(play({ speed: 20, elevation: 0.05, yaw: 0, spin: 0 }).result).toBe("blocked");
    expect(play({ speed: 20, elevation: 0.05, yaw: -0.05, spin: -1 }).result).not.toBe("blocked");
  });

  it("goes over the bar when struck too high", () => {
    expect(play({ speed: 32, elevation: 0.5, yaw: 0.1, spin: 0 }).result).toBe("missed");
  });

  it("is saved when it flies at the keeper", () => {
    expect(play({ speed: 24, elevation: 0.36, yaw: 0, spin: 0 }).result).toBe("saved");
  });

  it("scores when it clears the wall into a corner the keeper cannot reach", () => {
    expect(play({ speed: 25, elevation: 0.36, yaw: 0.15, spin: 0 }).result).toBe("goal");
  });

  it("is a miss when the ball dribbles short of the goal", () => {
    expect(play({ speed: 4, elevation: 0, yaw: 0.3, spin: 0 }).result).toBe("missed");
  });

  it("keeps a scored ball inside the net", () => {
    const shot = play({ speed: 25, elevation: 0.36, yaw: 0.15, spin: 0 });
    expect(shot.ball.position.z).toBeGreaterThanOrEqual(-tuning.netDepth);
  });

  it("holds the result on screen before the shot is over", () => {
    const shot = startShot(central, { speed: 20, elevation: 0.05, yaw: 0, spin: 0 }, neverMoves);
    while (shot.result === null) stepShot(shot, fixedStep);
    expect(isShotOver(shot)).toBe(false);
    for (let t = 0; t < tuning.resultHold + fixedStep; t += fixedStep) stepShot(shot, fixedStep);
    expect(isShotOver(shot)).toBe(true);
  });

  it("sends the keeper toward the ball's crossing point at the kick", () => {
    const shot = startShot(central, { speed: 25, elevation: 0.36, yaw: 0.15, spin: 0 }, neverMoves);
    expect(shot.keeper.targetX).toBeGreaterThan(0);
  });
});
