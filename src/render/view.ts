import {
  ACESFilmicToneMapping,
  Group,
  type Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ball as ballTuning, keeper as keeperTuning, wall as wallTuning } from "../config/tuning";
import type { FreeKick } from "../sim/freeKick";
import type { KeeperState } from "../sim/keeper";
import type { SwipePoint } from "../sim/swipe";
import type { Vec3 } from "../sim/vec";
import { cameraPlacement } from "./cameraRig";
import { toyMesh } from "./kit";
import { makeKid, soccerBallGeometry } from "./props";
import { buildStadium } from "./stadium";

const maxPixelRatio = 2;
const wallSkins = ["#F5C49A", "#C99064", "#8A5A3A", "#E8B48A"];
// Height of the toy figure from makeKid, feet to the top of the hair.
const figureHeight = 1.8;
// The keeper is drawn a little taller than the wall so the dive reads at 25 m.
const keeperScale = 1.1;

// The simulation tracks the keeper's body center, so the figure hangs from a pivot there and
// dives by rotating around it instead of around its feet.
function makeKeeper(): Group {
  const figure = makeKid({
    skin: "#C99064",
    shirt: "#F2D33D",
    pants: "#1F2A4A",
    shoes: "#1E1B26",
    hair: "#2A1A10",
    arms: [0, 1.35],
  });
  figure.position.y = -keeperTuning.standHeight / keeperScale;
  const pivot = new Group();
  pivot.add(figure);
  pivot.scale.setScalar(keeperScale);
  return pivot;
}

export class GameView {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(30, 1, 0.1, 400);
  private readonly composer: EffectComposer;
  private readonly ball: Mesh;
  private readonly keeper: Group;
  private readonly wallPlayers: Group[];
  private readonly projected = new Vector3();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    buildStadium(this.scene);
    this.ball = toyMesh(soccerBallGeometry(ballTuning.radius), "#FFFFFF", { vertexColors: true });
    this.keeper = makeKeeper();
    this.wallPlayers = wallSkins.map((skin, i) => {
      const player = makeKid({
        skin,
        shirt: "#E0393E",
        pants: "#FFFFFF",
        shoes: "#1E1B26",
        hair: i % 2 ? "#1E1B26" : "#5A3A22",
        arms: [-0.5, -0.35],
      });
      player.scale.setScalar(wallTuning.height / figureHeight);
      return player;
    });
    this.scene.add(this.ball, this.keeper, ...this.wallPlayers);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const ambientOcclusion = new GTAOPass(this.scene, this.camera);
    ambientOcclusion.updateGtaoMaterial({
      radius: 0.55,
      distanceExponent: 1,
      thickness: 1,
      scale: 1,
      samples: 12,
    });
    this.composer.addPass(ambientOcclusion);
    this.composer.addPass(new OutputPass());
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    const pixelRatio = Math.min(devicePixelRatio, maxPixelRatio);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Frames a new free kick: camera behind the ball, wall lined up, keeper back in the middle.
  showFreeKick(freeKick: FreeKick): void {
    const { position, target } = cameraPlacement(freeKick.spot);
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(target.x, target.y, target.z);
    this.camera.updateMatrixWorld();

    const { wall } = freeKick;
    const facing = Math.atan2(wall.normal.x, wall.normal.z);
    this.wallPlayers.forEach((player, i) => {
      const offset = wall.playerOffsets[i];
      player.visible = offset !== undefined;
      if (offset === undefined) return;
      player.position.set(
        wall.center.x + wall.along.x * offset,
        0,
        wall.center.z + wall.along.z * offset,
      );
      player.rotation.y = facing;
    });
    this.ball.rotation.set(0, 0, 0);
    this.showBall(freeKick.spot, null);
  }

  showBall(position: Vec3, velocity: Vec3 | null, dt = 0): void {
    this.ball.position.set(position.x, position.y, position.z);
    if (velocity) {
      // Rolls the ball around the axis across its travel, at the speed it covers ground.
      this.ball.rotation.x += (velocity.z / ballTuning.radius) * dt * 0.5;
      this.ball.rotation.z -= (velocity.x / ballTuning.radius) * dt * 0.5;
    }
  }

  showKeeper(keeper: KeeperState): void {
    this.keeper.position.set(keeper.x, keeper.y, keeperTuning.lineZ);
    // Tips over into the dive: the wider or lower the save, the more horizontal the body.
    const tilt = Math.min(
      1.4,
      Math.abs(keeper.x) / 1.5 + Math.max(0, keeperTuning.standHeight - keeper.y) * 1.5,
    );
    this.keeper.rotation.z = keeper.x < 0 ? tilt : -tilt;
  }

  // The ball's position on screen, in viewport heights from the top-left corner.
  ballOnScreen(): SwipePoint {
    this.projected.copy(this.ball.position).project(this.camera);
    const aspect = this.camera.aspect;
    return { x: ((this.projected.x + 1) / 2) * aspect, y: (1 - this.projected.y) / 2 };
  }

  render(): void {
    this.composer.render();
  }
}
