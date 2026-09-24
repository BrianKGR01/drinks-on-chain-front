"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { SCENE_TOKENS } from "@/lib/scene-contract";
import { buildTerrainGeometry, type HeightField } from "./lib/terrain";
import { pickUniforms, sharedUniforms } from "./lib/uniforms";
import { TERRAIN_FRAG, TERRAIN_VERT } from "./shaders/terrain.glsl";

const shared = sharedUniforms;

interface Props {
  field: HeightField;
}

/** Engraved ground: displaced grid + hatch shader, over an infinite paper plane. */
export function Terrain({ field }: Props) {
  const geometry = useMemo(() => buildTerrainGeometry(field), [field]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: TERRAIN_VERT,
        fragmentShader: TERRAIN_FRAG,
        uniforms: pickUniforms(shared, [
          "uCamPos",
          "uFogNear",
          "uFogFar",
          "uExtent",
          "uPaper",
          "uPaperShade",
          "uInk",
          "uLight",
          "uDpr",
          "uTime",
          "uClouds",
        ]),
      }),
    [],
  );

  const paperMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: SCENE_TOKENS.paper }), []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      material.dispose();
      paperMaterial.dispose();
    },
    [material, paperMaterial],
  );

  return (
    <group>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.8} material={paperMaterial}>
        <planeGeometry args={[field.extent * 16, field.extent * 16]} />
      </mesh>
    </group>
  );
}
