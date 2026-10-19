import { maxFrameTime } from "../config/tuning";

export interface FixedSteps {
  steps: number;
  remainder: number;
}

// Splits real frame time into fixed simulation steps so physics is identical at any frame rate.
export function consumeFixedSteps(carried: number, frameSeconds: number, step: number): FixedSteps {
  const available = carried + Math.min(frameSeconds, maxFrameTime);
  const steps = Math.floor(available / step);
  return { steps, remainder: available - steps * step };
}
