"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { VillageSpec } from "@/lib/scene-contract";
import { mulberry32, range } from "./lib/prng";
import { LIGHT_DIR, MAX_CLOUDS, pickUniforms, sharedUniforms } from "./lib/uniforms";
import { CLOUD_FRAG, CLOUD_VERT } from "./shaders/cloud.glsl";

const shared = sharedUniforms;

interface Props {
  village: VillageSpec;
}

interface CloudDef {
  x0: number;
  z: number;
  y: number;
  sx: number;
  sz: number;
  speed: number;
  seed: number;
  strength: number;
}

const CLOUD_ALTITUDE = 300;

/** Soft drifting cloud planes; their positions feed the terrain's fake shadow wash. */
export function Clouds({ village }: Props) {
  const built = useMemo(() => {
    const rng = mulberry32(village.seed + 909);
    const E = village.extent;
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);
    const defs: CloudDef[] = [];
    const meshes: THREE.Mesh[] = [];
    const materials: THREE.ShaderMaterial[] = [];
    for (let i = 0; i < MAX_CLOUDS; i++) {
      const def: CloudDef = {
        x0: range(rng, -1.6 * E, 1.6 * E),
        z: range(rng, -1.1 * E, 1.1 * E),
        y: CLOUD_ALTITUDE + i * 7,
        sx: range(rng, 0.42 * E, 0.7 * E),
        sz: range(rng, 0.26 * E, 0.42 * E),
        speed: range(rng, 6, 12),
        seed: rng(),
        strength: range(rng, 0.5, 0.9),
      };
      defs.push(def);
      const material = new THREE.ShaderMaterial({
        vertexShader: CLOUD_VERT,
        fragmentShader: CLOUD_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          ...pickUniforms(shared, ["uTime", "uCloudOpacity", "uPaperShade"]),
          uSeed: { value: def.seed },
        },
      });
      materials.push(material);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(def.sx, 1, def.sz);
      mesh.position.set(def.x0, def.y, def.z);
      mesh.renderOrder = 10;
      mesh.frustumCulled = false;
      meshes.push(mesh);
    }
    const dispose = () => {
      geometry.dispose();
      for (const m of materials) m.dispose();
    };
    return { defs, meshes, dispose };
  }, [village]);

  useEffect(() => () => built.dispose(), [built]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    const E = village.extent;
    const span = 3.4 * E;
    // shadow offset: opposite the light, scaled down so it stays on the map
    const ox = (-LIGHT_DIR.x / LIGHT_DIR.y) * CLOUD_ALTITUDE * 0.45;
    const oz = (-LIGHT_DIR.z / LIGHT_DIR.y) * CLOUD_ALTITUDE * 0.45;
    for (let i = 0; i < built.defs.length; i++) {
      const d = built.defs[i];
      let x = d.x0 + t * d.speed + 1.7 * E;
      x = ((x % span) + span) % span - 1.7 * E;
      const mesh = group.children[i];
      if (mesh) mesh.position.x = x;
      shared.uClouds.value[i].set(x + ox, d.z + oz, Math.min(d.sx, d.sz) * 0.42, d.strength);
    }
  });

  return (
    <group ref={groupRef}>
      {built.meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  );
}
