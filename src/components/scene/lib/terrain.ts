import * as THREE from "three";
import type { VillageSpec } from "@/lib/scene-contract";
import { createNoise2D, fbm2D } from "./noise";
import { smoothstep, clamp } from "./prng";

/** Number of segments per side of the terrain grid. */
export const TERRAIN_SEGMENTS = 256;
/** Terrain mesh half-size as a multiple of `village.extent`. */
export const TERRAIN_HALF_FACTOR = 1.15;

export interface HeightField {
  /** Half-size of the mesh in metres. */
  half: number;
  segments: number;
  extent: number;
  heights: Float32Array;
  maxHeight: number;
  /**
   * Height of the *rendered mesh* at (x, z): interpolated on the same
   * triangulation as the geometry, so objects sit exactly on the surface.
   */
  getHeight: (x: number, z: number) => number;
}

type ReliefFn = (x: number, z: number) => number;

function makeRelief(v: VillageSpec): ReliefFn {
  const n1 = createNoise2D(v.seed);
  const n2 = createNoise2D(v.seed * 7 + 13);
  const H = v.reliefHeight;
  const E = v.extent;
  const f = (x: number, z: number, s: number, o: number) => fbm2D(n1, x * s, z * s, o);

  let relief: ReliefFn;
  switch (v.relief) {
    case "valley":
      relief = (x, z) => {
        const rc = Math.min(Math.hypot(x, z) / E, 1.3);
        const bowl = Math.pow(smoothstep(0.12, 1.02, rc), 1.9);
        const ridge = 0.5 + 0.5 * n2(Math.atan2(z, x) * 1.6 + 3.1, rc * 1.7);
        const big = f(x, z, 0.0011, 3);
        const med = f(x, z, 0.0036, 3);
        const fine = f(x, z, 0.012, 2);
        const amp = 0.12 + 0.88 * Math.min(1, rc * rc);
        return H * (0.04 + 0.96 * bowl * (0.5 + 0.6 * ridge)) + H * amp * (0.24 * big + 0.09 * med + 0.02 * fine);
      };
      break;
    case "canyon":
      relief = (x, z) => {
        const wob = n2(z * 0.0016, 0.5) * 110 + n2(z * 0.005, 7.3) * 25;
        const cx = x + wob;
        const floorW = 150 + 35 * n2(z * 0.003, 2.2);
        const wall = smoothstep(floorW, floorW + 240, Math.abs(cx));
        const wallShape = Math.pow(wall, 1.4);
        const rim = f(x, z, 0.0025, 3) * 0.14 + f(x, z, 0.008, 2) * 0.04;
        const floor = f(x, z, 0.01, 2) * 0.012 + (z / E) * 0.03;
        return H * (0.02 + wallShape * 0.86 + wall * rim + (1 - wall) * floor);
      };
      break;
    default:
      relief = (x, z) => H * (0.25 + 0.35 * f(x, z, 0.0016, 3) + 0.12 * f(x, z, 0.005, 3) + 0.03 * f(x, z, 0.015, 2));
  }

  // Beyond the playable extent the land sinks to the paper plane (hidden by the ink fade).
  return (x, z) => {
    const r = Math.hypot(x, z);
    const fade = smoothstep(E * 1.0, E * 1.14, r);
    return relief(x, z) * (1 - fade);
  };
}

export function createHeightField(village: VillageSpec): HeightField {
  const N = TERRAIN_SEGMENTS;
  const half = village.extent * TERRAIN_HALF_FACTOR;
  const cell = (half * 2) / N;
  const relief = makeRelief(village);
  const heights = new Float32Array((N + 1) * (N + 1));
  let maxHeight = 0;
  for (let iz = 0; iz <= N; iz++) {
    const z = -half + iz * cell;
    for (let ix = 0; ix <= N; ix++) {
      const x = -half + ix * cell;
      const h = relief(x, z);
      heights[iz * (N + 1) + ix] = h;
      if (h > maxHeight) maxHeight = h;
    }
  }

  const getHeight = (x: number, z: number): number => {
    const gx = (x + half) / cell;
    const gz = (z + half) / cell;
    if (gx < 0 || gz < 0 || gx >= N || gz >= N) return 0;
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;
    const row = N + 1;
    const ha = heights[iz * row + ix];
    const hb = heights[(iz + 1) * row + ix];
    const hc = heights[(iz + 1) * row + ix + 1];
    const hd = heights[iz * row + ix + 1];
    if (fx + fz <= 1) return ha + (hd - ha) * fx + (hb - ha) * fz;
    return hc + (hb - hc) * (1 - fx) + (hd - hc) * (1 - fz);
  };

  return { half, segments: N, extent: village.extent, heights, maxHeight, getHeight };
}

/** Builds the displaced ground mesh matching `HeightField.getHeight` exactly. */
export function buildTerrainGeometry(field: HeightField): THREE.BufferGeometry {
  const N = field.segments;
  const half = field.half;
  const cell = (half * 2) / N;
  const row = N + 1;
  const positions = new Float32Array(row * row * 3);
  for (let iz = 0; iz <= N; iz++) {
    for (let ix = 0; ix <= N; ix++) {
      const i = iz * row + ix;
      positions[i * 3] = -half + ix * cell;
      positions[i * 3 + 1] = field.heights[i];
      positions[i * 3 + 2] = -half + iz * cell;
    }
  }
  const indices = new Uint32Array(N * N * 6);
  let k = 0;
  for (let iz = 0; iz < N; iz++) {
    for (let ix = 0; ix < N; ix++) {
      const a = iz * row + ix;
      const b = (iz + 1) * row + ix;
      const c = (iz + 1) * row + ix + 1;
      const d = iz * row + ix + 1;
      indices[k++] = a;
      indices[k++] = b;
      indices[k++] = d;
      indices[k++] = b;
      indices[k++] = c;
      indices[k++] = d;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/** Approximate slope magnitude (dy/dxz) at (x, z) using central differences. */
export function sampleSlope(field: HeightField, x: number, z: number, d = 6): number {
  const dx = field.getHeight(x + d, z) - field.getHeight(x - d, z);
  const dz = field.getHeight(x, z + d) - field.getHeight(x, z - d);
  return clamp(Math.hypot(dx, dz) / (2 * d), 0, 10);
}
