import "./style.css";
import { fixedStep, swipe as swipeTuning } from "./config/tuning";
import { createSound } from "./audio/sound";
import { listenForSwipes } from "./input/swipeInput";
import { GameView } from "./render/view";
import { consumeFixedSteps } from "./sim/clock";
import { roundEvents, snapshotRound, type RoundEvent } from "./sim/events";
import { createKeeper } from "./sim/keeper";
import { createRound, kick, stepRound, type RoundState } from "./sim/round";
import { swipeToKick } from "./sim/swipe";
import { createHud } from "./ui/hud";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("index.html is missing the #game canvas");

const view = new GameView(canvas);
const sound = createSound();
const hud = createHud(() => startRound());
const restingKeeper = createKeeper();
let round: RoundState = createRound(newSeed());

function newSeed(): number {
  return Date.now() >>> 0;
}

function startRound(): void {
  round = createRound(newSeed());
  hud.showRoundOver(null);
  showAiming();
}

function showAiming(): void {
  view.showFreeKick(round.freeKick);
  view.showKeeper(restingKeeper);
  hud.showRound(round.results, round.freeKick.distance);
  hud.showResult(null);
  hud.showHint(round.results.length === 0);
}

function react(event: RoundEvent): void {
  switch (event.type) {
    case "kicked":
      hud.showHint(false);
      break;
    case "resolved":
      hud.showResult(event.result);
      hud.showRound([...round.results, event.result], round.freeKick.distance);
      if (event.result === "goal") {
        sound.net();
        sound.cheer();
      } else {
        if (event.result !== "missed") sound.thud();
        sound.groan();
      }
      break;
    case "nextKick":
      showAiming();
      break;
    case "roundOver":
      hud.showRound(round.results, round.freeKick.distance);
      hud.showResult(null);
      hud.showRoundOver(round.results);
      break;
  }
}

function resize(): void {
  const { innerWidth: width, innerHeight: height, devicePixelRatio } = window;
  view.resize(width, height, devicePixelRatio);
  hud.resize(width, height);
}

listenForSwipes(canvas, {
  ballOnScreen: () => view.ballOnScreen(),
  canSwipe: () => round.phase === "aiming",
  onMove: (points) => hud.showSwipe(points),
  onRelease: (points) => {
    const input = swipeToKick(points);
    if (!input) return;
    const before = snapshotRound(round);
    kick(round, input);
    const power =
      (input.speed - swipeTuning.minSpeed) / (swipeTuning.maxSpeed - swipeTuning.minSpeed);
    sound.kick(power);
    roundEvents(before, round).forEach(react);
  },
});
// Audio may only start inside a user gesture.
window.addEventListener("pointerdown", () => sound.unlock());
window.addEventListener("resize", resize);

let carried = 0;
let lastTime = performance.now();
function frame(now: number): void {
  const frameSeconds = (now - lastTime) / 1000;
  lastTime = now;
  const { steps, remainder } = consumeFixedSteps(carried, frameSeconds, fixedStep);
  carried = remainder;
  for (let i = 0; i < steps; i++) {
    const before = snapshotRound(round);
    stepRound(round, fixedStep);
    roundEvents(before, round).forEach(react);
  }
  if (round.shot) {
    view.showBall(round.shot.ball.position, round.shot.ball.velocity, frameSeconds);
    view.showKeeper(round.shot.keeper);
  }
  view.render();
  requestAnimationFrame(frame);
}

resize();
showAiming();
requestAnimationFrame(frame);
