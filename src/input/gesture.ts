import { swipe } from "../config/tuning";
import type { SwipePoint } from "../sim/swipe";

export function toSwipePoint(clientX: number, clientY: number, viewportHeight: number): SwipePoint {
  return { x: clientX / viewportHeight, y: clientY / viewportHeight };
}

export function isNearBall(point: SwipePoint, ballOnScreen: SwipePoint): boolean {
  return Math.hypot(point.x - ballOnScreen.x, point.y - ballOnScreen.y) <= swipe.grabRadius;
}
