import { ball, wall as tuning } from "../config/tuning";
import type { Vec3 } from "./vec";

export interface Wall {
  // On the ground, midway along the wall.
  center: Vec3;
  // Horizontal unit vector pointing from the wall toward the ball.
  normal: Vec3;
  // Horizontal unit vector along the wall, toward the kicker's right.
  along: Vec3;
  halfWidth: number;
  // Each player's center as a distance along `along` from `center`.
  playerOffsets: number[];
}

// Lines the wall up between the ball and a point beside the near post, as a keeper would set it.
export function createWall(spot: Vec3, players: number): Wall {
  const coverX = Math.sign(spot.x) * tuning.coverOffsetFromCenter;
  const toCoverX = coverX - spot.x;
  const toCoverZ = -spot.z;
  const length = Math.hypot(toCoverX, toCoverZ);
  const directionX = toCoverX / length;
  const directionZ = toCoverZ / length;

  return {
    center: {
      x: spot.x + directionX * tuning.distance,
      y: 0,
      z: spot.z + directionZ * tuning.distance,
    },
    normal: { x: -directionX, y: 0, z: -directionZ },
    along: { x: -directionZ, y: 0, z: directionX },
    halfWidth: (players * tuning.playerWidth) / 2,
    playerOffsets: Array.from(
      { length: players },
      (_, i) => (i - (players - 1) / 2) * tuning.playerWidth,
    ),
  };
}

// True when the ball, moving from `from` to `to` this step, runs into the wall.
export function wallBlocks(wall: Wall, from: Vec3, to: Vec3): boolean {
  const before = distanceInFront(wall, from) - ball.radius;
  const after = distanceInFront(wall, to) - ball.radius;
  if (before < 0 || after > 0) return false;

  const t = before / (before - after);
  const crossing = {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    z: from.z + (to.z - from.z) * t,
  };
  const sideways =
    (crossing.x - wall.center.x) * wall.along.x + (crossing.z - wall.center.z) * wall.along.z;
  return (
    Math.abs(sideways) <= wall.halfWidth + ball.radius && crossing.y <= tuning.height + ball.radius
  );
}

function distanceInFront(wall: Wall, point: Vec3): number {
  return (point.x - wall.center.x) * wall.normal.x + (point.z - wall.center.z) * wall.normal.z;
}
