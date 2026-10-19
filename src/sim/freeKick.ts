import { ball, freeKick as tuning } from "../config/tuning";
import type { Rng } from "./rng";
import { createWall, type Wall } from "./wall";
import type { Vec3 } from "./vec";

export interface FreeKick {
  spot: Vec3;
  // Meters to the goal center, rounded for the HUD.
  distance: number;
  wall: Wall;
}

export function createFreeKick(random: Rng): FreeKick {
  const spot = {
    x: (random() * 2 - 1) * tuning.maxLateral,
    y: ball.radius,
    z: tuning.minZ + random() * (tuning.maxZ - tuning.minZ),
  };
  const exactDistance = Math.hypot(spot.x, spot.z);
  const players =
    exactDistance > tuning.shortWallDistance ? tuning.farWallPlayers : tuning.nearWallPlayers;
  return { spot, distance: Math.round(exactDistance), wall: createWall(spot, players) };
}
