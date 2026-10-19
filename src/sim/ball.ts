import { ball as tuning, pitch, swipe } from "../config/tuning";
import type { Kick } from "./swipe";
import type { Vec3 } from "./vec";

export interface BallState {
  position: Vec3;
  velocity: Vec3;
  // -1 to 1, see Kick.spin.
  spin: number;
}

// Kicks the ball from `spot` toward `target` (on the ground), turned by the kick's yaw.
export function launchBall(spot: Vec3, target: Vec3, kick: Kick): BallState {
  const toTargetX = target.x - spot.x;
  const toTargetZ = target.z - spot.z;
  const distance = Math.hypot(toTargetX, toTargetZ);
  const horizontalSpeed = kick.speed * Math.cos(kick.elevation);

  // Constant sideways acceleration a over a flight of distance D at speed v drifts the ball by
  // a * D^2 / (2 v^2); starting out by the matching angle a * D / (2 v^2) on the other side
  // brings it back to the aim line, so the path bows out like the gesture did.
  const curlCompensation =
    (swipe.curlAimCompensation * kick.spin * tuning.curlAcceleration * distance) /
    (2 * horizontalSpeed ** 2);
  const heading = Math.atan2(toTargetX, toTargetZ) - kick.yaw - curlCompensation;

  return {
    position: { ...spot },
    velocity: {
      x: Math.sin(heading) * horizontalSpeed,
      y: Math.sin(kick.elevation) * kick.speed,
      z: Math.cos(heading) * horizontalSpeed,
    },
    spin: kick.spin,
  };
}

export function stepBall(state: BallState, dt: number): void {
  const { position, velocity } = state;
  const horizontalSpeed = Math.hypot(velocity.x, velocity.z);

  // Magnus force: sideways to the horizontal travel, toward the travel's left for positive spin.
  if (horizontalSpeed > 0) {
    const lateral = (state.spin * tuning.curlAcceleration * dt) / horizontalSpeed;
    const { x, z } = velocity;
    velocity.x += z * lateral;
    velocity.z -= x * lateral;
  }

  const dragFactor = 1 - tuning.drag * dt;
  velocity.x *= dragFactor;
  velocity.z *= dragFactor;
  velocity.y = velocity.y * dragFactor - (pitch.gravity + tuning.dip) * dt;

  position.x += velocity.x * dt;
  position.y += velocity.y * dt;
  position.z += velocity.z * dt;

  if (position.y < tuning.radius) bounceOnGround(state);
}

function bounceOnGround({ position, velocity }: BallState): void {
  position.y = tuning.radius;
  velocity.y = velocity.y < 0 ? -velocity.y * tuning.bounceRestitution : velocity.y;
  // Tiny bounces would jitter forever; let the ball settle and roll.
  if (velocity.y < 0.5) velocity.y = 0;
  const friction = 1 - tuning.groundFriction * (1 / 60);
  velocity.x *= friction;
  velocity.z *= friction;
}
