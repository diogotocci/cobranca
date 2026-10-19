import type { Vec3 } from "../sim/vec";

const distanceBehindBall = 5.5;
const height = 1.25;
const lookHeight = 0.9;

export interface CameraPlacement {
  position: Vec3;
  target: Vec3;
}

// Puts the camera behind the ball on the line from the goal center, looking at the goal,
// so every free kick opens with the same framing whatever its angle.
export function cameraPlacement(spot: Vec3): CameraPlacement {
  const distance = Math.hypot(spot.x, spot.z);
  const scale = (distance + distanceBehindBall) / distance;
  return {
    position: { x: spot.x * scale, y: height, z: spot.z * scale },
    target: { x: 0, y: lookHeight, z: 0 },
  };
}
