import { round as roundTuning } from "../config/tuning";
import type { ShotResult } from "../sim/shot";
import type { SwipePoint } from "../sim/swipe";
import { kickDots, resultLabel, scoreLabel } from "./scoreboard";

export interface Hud {
  showRound: (results: readonly ShotResult[], distance: number) => void;
  showResult: (result: ShotResult | null) => void;
  showHint: (isVisible: boolean) => void;
  showSwipe: (points: readonly SwipePoint[]) => void;
  showRoundOver: (results: readonly ShotResult[] | null) => void;
  resize: (width: number, height: number) => void;
}

const element = <T extends Element>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`HUD element ${selector} is missing from index.html`);
  return found;
};

export function createHud(onPlayAgain: () => void): Hud {
  const score = element<HTMLElement>("#score");
  const dots = element<HTMLElement>("#dots");
  const distance = element<HTMLElement>("#distance");
  const hint = element<HTMLElement>("#hint");
  const banner = element<HTMLElement>("#banner");
  const trailLayer = element<SVGSVGElement>("#swipe-layer");
  const trail = element<SVGPolylineElement>("#swipe-trail");
  const roundOver = element<HTMLElement>("#round-over");
  const finalScore = element<HTMLElement>("#final-score");
  element<HTMLButtonElement>("#play-again").addEventListener("click", onPlayAgain);

  return {
    showRound(results, meters) {
      score.textContent = scoreLabel(results, roundTuning.kicks);
      dots.replaceChildren(
        ...kickDots(results, roundTuning.kicks).map((state) => {
          const dot = document.createElement("span");
          dot.className = `dot ${state}`;
          return dot;
        }),
      );
      distance.textContent = `FALTA · ${meters} m`;
    },
    showResult(result) {
      banner.hidden = result === null;
      banner.textContent = result === null ? "" : resultLabel(result);
      banner.dataset["result"] = result ?? "";
    },
    showHint(isVisible) {
      hint.hidden = !isVisible;
    },
    showSwipe(points) {
      // The SVG viewBox is one viewport height tall, so swipe points map straight onto it.
      trail.setAttribute("points", points.map((point) => `${point.x},${point.y}`).join(" "));
    },
    showRoundOver(results) {
      roundOver.hidden = results === null;
      if (results !== null) finalScore.textContent = scoreLabel(results, roundTuning.kicks);
    },
    resize(width, height) {
      trailLayer.setAttribute("viewBox", `0 0 ${width / height} 1`);
    },
  };
}
