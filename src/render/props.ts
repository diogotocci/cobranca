import {
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import { box, capsule, sphere, toyMesh } from "./kit";

type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void;

export function canvasTexture(
  width: number,
  height: number,
  draw: Draw,
  repeat?: [number, number],
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available for procedural textures");
  draw(context, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(...repeat);
  }
  return texture;
}

export function stripeTexture(first: string, second: string, stripes: number): CanvasTexture {
  return canvasTexture(32, 512, (context, width, height) => {
    for (let i = 0; i < stripes; i++) {
      context.fillStyle = i % 2 ? first : second;
      context.fillRect(0, (i * height) / stripes, width, height / stripes + 1);
    }
  });
}

export function netTexture(repeatX: number, repeatY: number): CanvasTexture {
  return canvasTexture(
    64,
    64,
    (context) => {
      context.fillStyle = "rgba(255,255,255,0.95)";
      context.fillRect(0, 0, 64, 4);
      context.fillRect(0, 0, 4, 64);
    },
    [repeatX, repeatY],
  );
}

// Classic black-and-white ball: faces near the 12 icosahedron vertices become the black pentagons.
export function soccerBallGeometry(radius: number): IcosahedronGeometry {
  const geometry = new IcosahedronGeometry(radius, 3);
  const directions = pentagonDirections();
  const positions = geometry.attributes.position!;
  const colors: number[] = [];
  const black = new Color("#1E1B26");
  const white = new Color("#FFFFFF");
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  for (let i = 0; i < positions.count; i += 3) {
    a.fromBufferAttribute(positions, i);
    b.fromBufferAttribute(positions, i + 1);
    c.fromBufferAttribute(positions, i + 2);
    const center = a.add(b).add(c).normalize();
    const closest = Math.max(...directions.map((direction) => center.dot(direction)));
    const color = closest > 0.93 ? black : white;
    for (let j = 0; j < 3; j++) colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

// The 12 distinct corner directions of an icosahedron, one per black pentagon.
function pentagonDirections(): Vector3[] {
  const corners = new IcosahedronGeometry(1, 0).attributes.position!;
  const directions: Vector3[] = [];
  for (let i = 0; i < corners.count; i++) {
    const direction = new Vector3().fromBufferAttribute(corners, i).normalize();
    if (!directions.some((known) => known.distanceTo(direction) < 0.01)) directions.push(direction);
  }
  return directions;
}

export interface KidLook {
  skin: string;
  shirt: string;
  pants: string;
  shoes: string;
  hair: string;
  // Shoulder angles: [forward swing, sideways spread] per arm.
  arms: [number, number];
}

// Big-headed toy player with dot eyes, about 1.75 units tall, facing +z.
export function makeKid(look: KidLook): Group {
  const kid = new Group();
  for (const side of [-1, 1]) {
    kid.add(capsule(0.11, 0.26, look.pants, { position: [side * 0.13, 0.34, 0] }));
    kid.add(
      box({ width: 0.24, height: 0.15, depth: 0.36, radius: 0.07 }, look.shoes, {
        position: [side * 0.13, 0.08, 0.04],
      }),
    );
  }
  kid.add(
    box({ width: 0.58, height: 0.54, depth: 0.4, radius: 0.17 }, look.shirt, {
      position: [0, 0.78, 0],
    }),
  );
  for (const side of [1, -1]) {
    const arm = new Group();
    arm.position.set(side * 0.35, 0.96, 0);
    arm.add(capsule(0.09, 0.28, look.shirt, { position: [0, -0.2, 0] }));
    arm.add(sphere(0.105, look.skin, { position: [0, -0.43, 0] }));
    arm.rotation.set(look.arms[0], 0, side * look.arms[1]);
    kid.add(arm);
  }
  kid.add(sphere(0.37, look.skin, { position: [0, 1.4, 0] }));
  for (const side of [-1, 1]) {
    kid.add(sphere(0.048, "#1E1B26", { position: [side * 0.13, 1.43, 0.33], castShadow: false }));
  }
  kid.add(sphere(0.05, "#E9A07A", { position: [0, 1.36, 0.37], castShadow: false }));
  kid.add(
    toyMesh(new SphereGeometry(0.39, 32, 16, 0, Math.PI * 2, 0, 1.3), look.hair, {
      position: [0, 1.42, -0.03],
      rotation: [-0.35, 0, 0],
    }),
  );
  return kid;
}

export function makeCloud(position: [number, number, number], scale: number): Group {
  const cloud = new Group();
  const puffs: [number, number, number][] = [
    [0, 0, 0.8],
    [0.8, -0.1, 0.6],
    [-0.8, -0.15, 0.55],
    [0.3, 0.4, 0.55],
  ];
  for (const [x, y, radius] of puffs)
    cloud.add(sphere(radius, "#FFFFFF", { position: [x, y, 0], castShadow: false }));
  cloud.position.set(...position);
  cloud.scale.setScalar(scale);
  return cloud;
}
