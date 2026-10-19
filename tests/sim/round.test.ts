import { describe, expect, it } from "vitest";
import { fixedStep, round as tuning } from "../../src/config/tuning";
import { createRound, goals, kick, stepRound, type RoundState } from "../../src/sim/round";
import type { Kick } from "../../src/sim/swipe";

const blockedKick: Kick = { speed: 20, elevation: 0.05, yaw: 0, spin: 0 };

function finishShot(round: RoundState): void {
  for (let i = 0; i < 2000 && round.phase === "flying"; i++) stepRound(round, fixedStep);
}

describe("round", () => {
  it("starts aiming the first of five kicks", () => {
    const round = createRound(1);
    expect(round.phase).toBe("aiming");
    expect(round.results).toEqual([]);
    expect(tuning.kicks).toBe(5);
  });

  it("flies the ball after a kick and records the result", () => {
    const round = createRound(1);
    kick(round, blockedKick);
    expect(round.phase).toBe("flying");
    finishShot(round);
    expect(round.results).toHaveLength(1);
    expect(round.phase).toBe("aiming");
  });

  it("ignores a kick while the ball is already flying", () => {
    const round = createRound(1);
    kick(round, blockedKick);
    const shot = round.shot;
    kick(round, blockedKick);
    expect(round.shot).toBe(shot);
  });

  it("sets up a new free kick after each attempt", () => {
    const round = createRound(1);
    const first = round.freeKick;
    kick(round, blockedKick);
    finishShot(round);
    expect(round.freeKick.spot).not.toEqual(first.spot);
  });

  it("ends after five kicks", () => {
    const round = createRound(1);
    for (let i = 0; i < tuning.kicks; i++) {
      kick(round, blockedKick);
      finishShot(round);
    }
    expect(round.phase).toBe("over");
    expect(round.results).toHaveLength(tuning.kicks);
    kick(round, blockedKick);
    expect(round.phase).toBe("over");
  });

  it("counts goals among the results", () => {
    const round = createRound(1);
    round.results.push("goal", "saved", "goal", "missed");
    expect(goals(round)).toBe(2);
  });
});
