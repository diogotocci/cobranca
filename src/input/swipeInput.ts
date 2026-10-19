import type { SwipePoint } from "../sim/swipe";
import { isNearBall, toSwipePoint } from "./gesture";

export interface SwipeHandlers {
  // Where the ball is on screen right now, in viewport heights.
  ballOnScreen: () => SwipePoint;
  canSwipe: () => boolean;
  onMove: (points: readonly SwipePoint[]) => void;
  onRelease: (points: readonly SwipePoint[]) => void;
}

// Tracks one drag that starts on the ball. Other fingers and drags elsewhere are ignored.
export function listenForSwipes(surface: HTMLElement, handlers: SwipeHandlers): void {
  let pointerId: number | null = null;
  let points: SwipePoint[] = [];
  const pointFrom = (event: PointerEvent): SwipePoint =>
    toSwipePoint(event.clientX, event.clientY, window.innerHeight);

  surface.addEventListener("pointerdown", (event) => {
    if (pointerId !== null || !handlers.canSwipe()) return;
    const point = pointFrom(event);
    if (!isNearBall(point, handlers.ballOnScreen())) return;
    pointerId = event.pointerId;
    points = [point];
    surface.setPointerCapture(event.pointerId);
    handlers.onMove(points);
  });

  surface.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    // Coalesced events keep the curve of a fast flick that a single sample per frame would flatten.
    for (const sample of event.getCoalescedEvents?.() ?? [event]) points.push(pointFrom(sample));
    handlers.onMove(points);
  });

  const finish = (event: PointerEvent, isCancelled: boolean): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (!isCancelled) {
      points.push(pointFrom(event));
      handlers.onRelease(points);
    }
    points = [];
    handlers.onMove(points);
  };
  surface.addEventListener("pointerup", (event) => finish(event, false));
  surface.addEventListener("pointercancel", (event) => finish(event, true));
}
