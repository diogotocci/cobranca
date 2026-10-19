import {
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PlaneGeometry,
  type Scene,
  SphereGeometry,
} from "three";
import { pitch } from "../config/tuning";
import { createRng } from "../sim/rng";
import { box, cylinder, toyMaterial, toyMesh } from "./kit";
import { makeCloud, netTexture, stripeTexture } from "./props";

const sky = "#8FD0F2";
const lineColor = "#F4F4F0";
const netDepth = 1.7;
const standWidth = 56;

// Static stadium around the goal at z = 0 (see the coordinate note in src/config/tuning.ts).
export function buildStadium(scene: Scene): void {
  scene.background = new Color(sky);
  scene.fog = new Fog(sky, 40, 110);
  addPitch(scene);
  addGoal(scene);
  addStands(scene);
  addLights(scene);
  scene.add(makeCloud([-14, 16, -42], 2.2), makeCloud([16, 18, -48], 2.6));
}

function addPitch(scene: Scene): void {
  const width = 80;
  const depth = 90;
  scene.add(
    toyMesh(new PlaneGeometry(width, depth), "#FFFFFF", {
      map: stripeTexture("#4DAA55", "#43994B", Math.round(depth / 2.5)),
      rotation: [-Math.PI / 2, 0, 0],
      position: [0, 0, depth / 2 - 8],
      castShadow: false,
    }),
  );
  const line = (width: number, depth: number, x: number, z: number): void => {
    scene.add(
      box({ width, height: 0.02, depth, radius: 0.005 }, lineColor, {
        position: [x, 0.012, z],
        castShadow: false,
      }),
    );
  };
  line(width - 2, 0.12, 0, 0);
  // Penalty area (16.5 m) and goal area (5.5 m) at regulation size.
  line(40.3, 0.12, 0, 16.5);
  line(0.12, 16.5, -20.15, 8.25);
  line(0.12, 16.5, 20.15, 8.25);
  line(18.3, 0.12, 0, 5.5);
  line(0.12, 5.5, -9.15, 2.75);
  line(0.12, 5.5, 9.15, 2.75);
}

function addGoal(scene: Scene): void {
  const { goalHalfWidth, goalHeight } = pitch;
  for (const side of [-1, 1]) {
    scene.add(
      cylinder(0.07, goalHeight, "#FFFFFF", {
        position: [side * goalHalfWidth, goalHeight / 2, 0],
      }),
    );
    scene.add(
      cylinder(0.035, 2.9, "#D9DEE6", {
        position: [side * goalHalfWidth, goalHeight / 2, -netDepth / 2],
        rotation: [0.6, 0, 0],
      }),
    );
  }
  scene.add(
    cylinder(0.07, goalHalfWidth * 2 + 0.14, "#FFFFFF", {
      position: [0, goalHeight, 0],
      rotation: [0, 0, Math.PI / 2],
    }),
  );
  const net = (repeatX: number, repeatY: number): MeshBasicMaterial =>
    new MeshBasicMaterial({
      map: netTexture(repeatX, repeatY),
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
    });
  const netOptions = { castShadow: false };
  scene.add(
    toyMesh(new PlaneGeometry(goalHalfWidth * 2, goalHeight), "", {
      ...netOptions,
      material: net(30, 10),
      position: [0, goalHeight / 2, -netDepth],
    }),
    toyMesh(new PlaneGeometry(goalHalfWidth * 2, netDepth), "", {
      ...netOptions,
      material: net(30, 7),
      position: [0, goalHeight, -netDepth / 2],
      rotation: [-Math.PI / 2, 0, 0],
    }),
  );
  for (const side of [-1, 1]) {
    scene.add(
      toyMesh(new PlaneGeometry(netDepth, goalHeight), "", {
        ...netOptions,
        material: net(7, 10),
        position: [side * goalHalfWidth, goalHeight / 2, -netDepth / 2],
        rotation: [0, Math.PI / 2, 0],
      }),
    );
  }
}

function addStands(scene: Scene): void {
  const adColors = ["#2E5BD8", "#F2B33D", "#E0393E", "#45B377", "#FFFFFF", "#8C5BE0"];
  for (let i = 0; i < 14; i++) {
    scene.add(
      box({ width: 3.6, height: 0.8, depth: 0.16, radius: 0.06 }, adColors[i % adColors.length]!, {
        position: [(i - 6.5) * 3.8, 0.4, -3.4],
      }),
    );
  }
  const crowdSeats: [number, number, number][] = [];
  const jitter = createRng(2026);
  for (let tier = 0; tier < 4; tier++) {
    const z = -5.2 - tier * 1.6;
    const height = 0.9 + tier * 0.9;
    scene.add(
      box(
        { width: standWidth, height, depth: 1.6, radius: 0.12 },
        tier % 2 ? "#3B4566" : "#465275",
        {
          position: [0, height / 2, z],
        },
      ),
    );
    for (let x = -standWidth / 2 + 0.4; x < standWidth / 2 - 0.3; x += 0.55) {
      crowdSeats.push([x + (jitter() - 0.5) * 0.1, height + 0.25, z + 0.1]);
    }
  }
  addCrowd(scene, crowdSeats);
  for (const side of [-1, 1]) {
    scene.add(cylinder(0.3, 12, "#9AA3AD", { position: [side * (standWidth / 2 + 1), 6, -8] }));
    scene.add(
      box({ width: 2.6, height: 1.4, depth: 0.5, radius: 0.15 }, "#F4F4F0", {
        position: [side * (standWidth / 2 + 1), 12.3, -7.8],
        rotation: [0.3, 0, 0],
        emissive: "#FFF6D8",
        emissiveIntensity: 1.4,
      }),
    );
  }
}

// One draw call for the whole crowd.
function addCrowd(scene: Scene, seats: [number, number, number][]): void {
  const crowd = new InstancedMesh(
    new SphereGeometry(0.22, 12, 8),
    toyMaterial("#FFFFFF"),
    seats.length,
  );
  const shirtColors = ["#E0393E", "#F2B33D", "#FFFFFF", "#2E5BD8", "#45B377", "#F5C49A"];
  const matrix = new Matrix4();
  const color = new Color();
  seats.forEach(([x, y, z], i) => {
    crowd.setMatrixAt(i, matrix.makeTranslation(x, y, z));
    crowd.setColorAt(i, color.set(shirtColors[(i * 7 + (i >> 3)) % shirtColors.length]!));
  });
  crowd.castShadow = true;
  crowd.receiveShadow = true;
  scene.add(crowd);
}

function addLights(scene: Scene): void {
  scene.add(new HemisphereLight("#E2F1FF", "#C9A27A", 1.15));
  const sun = new DirectionalLight("#FFF4E0", 2.6);
  // The shadow box covers the goal, the wall and every possible free-kick spot.
  const extent = 26;
  sun.position.set(-14, 28, 34);
  sun.target.position.set(0, 0, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -extent,
    right: extent,
    top: extent,
    bottom: -extent,
    near: 1,
    far: 100,
  });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 5;
  scene.add(sun, sun.target);
}
