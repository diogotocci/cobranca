import {
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  type BufferGeometry,
  type ColorRepresentation,
  type Material,
  Mesh,
  MeshStandardMaterial,
  type Texture,
  SphereGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// "Brinquedo" style: soft plastic, no metal, rounded everything (see CLAUDE.md).
const toyRoughness = 0.58;

export interface MeshOptions {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  castShadow?: boolean;
  map?: Texture;
  vertexColors?: boolean;
  emissive?: ColorRepresentation;
  emissiveIntensity?: number;
  material?: Material;
}

export function toyMaterial(
  color: ColorRepresentation,
  options: MeshOptions = {},
): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(color),
    roughness: toyRoughness,
    metalness: 0,
    vertexColors: options.vertexColors ?? false,
  });
  if (options.map) material.map = options.map;
  if (options.emissive !== undefined) {
    material.emissive = new Color(options.emissive);
    material.emissiveIntensity = options.emissiveIntensity ?? 1;
  }
  return material;
}

export function toyMesh(
  geometry: BufferGeometry,
  color: ColorRepresentation,
  options: MeshOptions = {},
): Mesh {
  const mesh = new Mesh(geometry, options.material ?? toyMaterial(color, options));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = true;
  if (options.position) mesh.position.set(...options.position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  if (options.scale) mesh.scale.set(...options.scale);
  return mesh;
}

export interface BoxSize {
  width: number;
  height: number;
  depth: number;
  radius: number;
}

export function box(size: BoxSize, color: ColorRepresentation, options?: MeshOptions): Mesh {
  const { width, height, depth } = size;
  const radius = Math.max(Math.min(size.radius, Math.min(width, height, depth) / 2 - 0.002), 0.001);
  return toyMesh(new RoundedBoxGeometry(width, height, depth, 4, radius), color, options);
}

export function sphere(radius: number, color: ColorRepresentation, options?: MeshOptions): Mesh {
  return toyMesh(new SphereGeometry(radius, 32, 20), color, options);
}

export function capsule(
  radius: number,
  length: number,
  color: ColorRepresentation,
  options?: MeshOptions,
): Mesh {
  return toyMesh(new CapsuleGeometry(radius, length, 8, 20), color, options);
}

export function cylinder(
  radius: number,
  height: number,
  color: ColorRepresentation,
  options?: MeshOptions,
): Mesh {
  return toyMesh(new CylinderGeometry(radius, radius, height, 28), color, options);
}
