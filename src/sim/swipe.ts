import { swipe as tuning } from "../config/tuning";

// A pointer sample in viewport heights, with y growing downward like screen coordinates.
export interface SwipePoint {
  x: number;
  y: number;
}

export interface Kick {
  speed: number;
  // Radians above the ground.
  elevation: number;
  // Radians away from the line between the ball and the goal center, positive to the kicker's right.
  yaw: number;
  // -1 to 1. Positive when the gesture bows right: the ball starts right and curls back left.
  spin: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

// Maps a drag from the ball to a kick: chord direction aims, chord length sets power,
// and the gesture's sideways bulge off the chord sets spin.
export function swipeToKick(points: readonly SwipePoint[]): Kick | null {
  const start = points[0];
  const end = points[points.length - 1];
  if (!start || !end) return null;

  // Flip y so "up the screen" (toward the goal) is positive.
  const dx = end.x - start.x;
  const dy = start.y - end.y;
  const length = Math.hypot(dx, dy);
  if (length < tuning.minLength || dy <= 0) return null;

  const power = Math.min(length / tuning.fullPowerLength, 1);
  return {
    speed: lerp(tuning.minSpeed, tuning.maxSpeed, power),
    elevation: lerp(tuning.minElevation, tuning.maxElevation, power),
    yaw: Math.atan2(dx, dy) * tuning.aimGain,
    spin: clamp(
      largestBulge(points, dx / length, dy / length) / length / tuning.fullSpinBulge,
      -1,
      1,
    ),
  };
}

// Signed distance of the point farthest from the chord, positive to the right of its direction.
function largestBulge(points: readonly SwipePoint[], dirX: number, dirY: number): number {
  const start = points[0]!;
  let bulge = 0;
  for (const point of points) {
    const offset = (point.x - start.x) * dirY - (start.y - point.y) * dirX;
    if (Math.abs(offset) > Math.abs(bulge)) bulge = offset;
  }
  return bulge;
}
