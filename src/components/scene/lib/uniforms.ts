import * as THREE from "three";
import { SCENE_TOKENS } from "@/lib/scene-contract";

/**
 * Converts a CSS hex colour to a raw (non colour-managed) vec3 so the custom
 * shaders output exactly the design token values on screen.
 */
export function hexToVec3(hex: string): THREE.Vector3 {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return new THREE.Vector3(r, g, b);
}

export const INK = {
  paper: hexToVec3(SCENE_TOKENS.paper),
  paperShade: hexToVec3(SCENE_TOKENS.paperShade),
  ink: hexToVec3(SCENE_TOKENS.ink),
  inkSoft: hexToVec3(SCENE_TOKENS.inkSoft),
  accent: hexToVec3(SCENE_TOKENS.accent),
  hatchDark: hexToVec3(SCENE_TOKENS.hatchDark),
} as const;

export const MAX_CLOUDS = 6;

/** Fixed "engraver's light" direction (from the upper-left, slightly north). */
export const LIGHT_DIR = new THREE.Vector3(-0.55, 0.62, -0.48).normalize();

/**
 * Uniform objects shared by every scene material. Updating `.value` once
 * (in the camera rig / clouds) updates all materials that reference them.
 */
export interface SharedUniforms {
  uCamPos: THREE.IUniform<THREE.Vector3>;
  uFogNear: THREE.IUniform<number>;
  uFogFar: THREE.IUniform<number>;
  uExtent: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  uDpr: THREE.IUniform<number>;
  /** 2·tan(fov/2) / viewportHeight(px): world units per device pixel at depth 1. */
  uPxScale: THREE.IUniform<number>;
  uClouds: THREE.IUniform<THREE.Vector4[]>;
  uCloudOpacity: THREE.IUniform<number>;
  uLight: THREE.IUniform<THREE.Vector3>;
  uPaper: THREE.IUniform<THREE.Vector3>;
  uPaperShade: THREE.IUniform<THREE.Vector3>;
  uInk: THREE.IUniform<THREE.Vector3>;
  uInkSoft: THREE.IUniform<THREE.Vector3>;
  uAccent: THREE.IUniform<THREE.Vector3>;
}

export function createSharedUniforms(extent: number): SharedUniforms {
  return {
    uCamPos: { value: new THREE.Vector3(0, 1000, 1000) },
    uFogNear: { value: extent * 1.2 },
    uFogFar: { value: extent * 2.4 },
    uExtent: { value: extent },
    uTime: { value: 0 },
    uDpr: { value: 1 },
    uPxScale: { value: 0.001 },
    uClouds: { value: Array.from({ length: MAX_CLOUDS }, () => new THREE.Vector4(0, 0, 0, 0)) },
    uCloudOpacity: { value: 1 },
    uLight: { value: LIGHT_DIR.clone() },
    uPaper: { value: INK.paper.clone() },
    uPaperShade: { value: INK.paperShade.clone() },
    uInk: { value: INK.ink.clone() },
    uInkSoft: { value: INK.inkSoft.clone() },
    uAccent: { value: INK.accent.clone() },
  };
}

/** Pick the subset of shared uniforms a material needs (same object refs). */
export function pickUniforms<K extends keyof SharedUniforms>(
  shared: SharedUniforms,
  keys: readonly K[],
): Pick<SharedUniforms, K> {
  const out = {} as Pick<SharedUniforms, K>;
  for (const k of keys) out[k] = shared[k];
  return out;
}

/**
 * Module-level singleton: one scene at a time. Materials reference these
 * uniform objects; the camera rig / clouds mutate `.value` each frame.
 */
export const sharedUniforms: SharedUniforms = createSharedUniforms(900);
