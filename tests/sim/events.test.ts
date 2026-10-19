import { describe, expect, it } from "vitest";
import { fixedStep } from "../../src/config/tuning";
import { roundEvents, snapshotRound } from "../../src/sim/events";
import { createRound, kick, stepRound, type RoundState } from "../../src/sim/round";
import type { Kick } from "../../src/sim/swipe";

const lowKick: Kick = { speed: 20, elevation: 0.05, yaw: 0, spin: 0 };

function collectUntil(round: RoundState, isDone: () => boolean): string[] {
  const events: string[] = [];
  let before = snapshotRound(round);
  for (let i = 0; i < 2000 && !isDone(); i++) {
    stepRound(round, fixedStep);
    events.push(...roundEvents(before, round).map((event) => event.type));
    before = snapshotRound(round);
  }
  return events;
}

describe("roundEvents", () => {
  it("reports nothing while nothing changes", () => {
    const round = createRound(4);
    expect(roundEvents(snapshotRound(round), round)).toEqual([]);
  });

  it("reports the kick", () => {
    const round = createRound(4);
    const before = snapshotRound(round);
    kick(round, lowKick);
    expect(roundEvents(before, round)).toEqual([{ type: "kicked" }]);
  });

  it("reports the result once, then the next free kick", () => {
    const round = createRound(4);
    kick(round, lowKick);
    const events = collectUntil(round, () => round.phase === "aiming");
    expect(events).toEqual(["resolved", "nextKick"]);
  });

  it("reports the end of the round after the last kick", () => {
    const round = createRound(4);
    round.results.push("goal", "goal", "goal", "goal");
    kick(round, lowKick);
    expect(collectUntil(round, () => round.phase === "over")).toEqual(["resolved", "roundOver"]);
  });
});
