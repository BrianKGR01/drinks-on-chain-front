"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { VillageSpec } from "@/lib/scene-contract";
import { buildTreeGeometry } from "./lib/geometry";
import { layoutTrees } from "./lib/layout";
import type { HeightField } from "./lib/terrain";
import { pickUniforms, sharedUniforms } from "./lib/uniforms";
import { HULL_FRAG, HULL_VERT, OBJECT_VERT, TREE_FRAG } from "./shaders/objects.glsl";
import { applyPlacements } from "./Village";

const shared = sharedUniforms;

interface Props {
  village: VillageSpec;
  field: HeightField;
}

/** Instanced scribbled tree canopies (body + constant-pixel inverted-hull outline). */
export function Forest({ village, field }: Props) {
  const built = useMemo(() => {
    const placements = layoutTrees(village, field);
    const geo = buildTreeGeometry();
    const bodyMat = new THREE.ShaderMaterial({
      vertexShader: OBJECT_VERT,
      fragmentShader: TREE_FRAG,
      uniforms: pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk", "uLight", "uDpr"]),
    });
    const trees = new THREE.InstancedMesh(geo, bodyMat, Math.max(1, placements.length));
    applyPlacements(trees, placements);
    trees.count = placements.length;

    const hullMat = new THREE.ShaderMaterial({
      vertexShader: HULL_VERT,
      fragmentShader: HULL_FRAG,
      side: THREE.BackSide,
      uniforms: {
        ...pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk", "uPxScale", "uDpr"]),
        uThickness: { value: 1.15 },
      },
    });
    const hull = new THREE.InstancedMesh(geo, hullMat, Math.max(1, placements.length));
    hull.instanceMatrix = trees.instanceMatrix;
    hull.count = placements.length;
    hull.frustumCulled = false;

    const dispose = () => {
      geo.dispose();
      bodyMat.dispose();
      hullMat.dispose();
      trees.dispose();
      hull.dispose();
    };
    return { trees, hull, dispose };
  }, [village, field]);

  useEffect(() => () => built.dispose(), [built]);

  return (
    <group>
      <primitive object={built.trees} />
      <primitive object={built.hull} />
    </group>
  );
}
