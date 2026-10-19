import type { ShotResult } from "../sim/shot";

export type KickDot = "scored" | "missed" | "pending";

const labels: Record<ShotResult, string> = {
  goal: "GOOOL!",
  saved: "DEFENDEU!",
  blocked: "NA BARREIRA!",
  missed: "PRA FORA!",
};

export function kickDots(results: readonly ShotResult[], kicks: number): KickDot[] {
  return Array.from({ length: kicks }, (_, i): KickDot => {
    const result = results[i];
    if (result === undefined) return "pending";
    return result === "goal" ? "scored" : "missed";
  });
}

export function scoreLabel(results: readonly ShotResult[], kicks: number): string {
  return `${results.filter((result) => result === "goal").length}/${kicks}`;
}

export function resultLabel(result: ShotResult): string {
  return labels[result];
}
