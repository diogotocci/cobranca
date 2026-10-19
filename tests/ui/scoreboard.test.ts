import { describe, expect, it } from "vitest";
import { kickDots, resultLabel, scoreLabel } from "../../src/ui/scoreboard";

describe("scoreboard", () => {
  it("marks each kick as scored, missed or pending", () => {
    expect(kickDots(["goal", "saved", "blocked"], 5)).toEqual([
      "scored",
      "missed",
      "missed",
      "pending",
      "pending",
    ]);
  });

  it("shows goals out of the round's kicks", () => {
    expect(scoreLabel(["goal", "missed", "goal"], 5)).toBe("2/5");
  });

  it("names every result in Portuguese for the player", () => {
    expect(resultLabel("goal")).toBe("GOOOL!");
    expect(resultLabel("saved")).toBe("DEFENDEU!");
    expect(resultLabel("blocked")).toBe("NA BARREIRA!");
    expect(resultLabel("missed")).toBe("PRA FORA!");
  });
});
