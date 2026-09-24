"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { VillageSpec } from "@/lib/scene-contract";
import { buildRibbon, mergeRibbons } from "./lib/ribbon";
import type { HeightField } from "./lib/terrain";
import { pickUniforms, sharedUniforms } from "./lib/uniforms";
import { RIBBON_VERT, RIVER_FRAG, ROAD_FRAG } from "./shaders/ribbon.glsl";

const shared = sharedUniforms;

interface Props {
  village: VillageSpec;
  field: HeightField;
}

const ROAD_WIDTH = 5.5;
const RIVER_WIDTH = 9;

/** Roads (double ink line) and the river (three wavy soft lines) as terrain-conformed ribbons. */
export function Roads({ village, field }: Props) {
  const built = useMemo(() => {
    const roadGeo = mergeRibbons(village.roads.map((pts) => buildRibbon(pts, ROAD_WIDTH, field, 0.6, 5)));
    const roadMat = new THREE.ShaderMaterial({
      vertexShader: RIBBON_VERT,
      fragmentShader: ROAD_FRAG,
      side: THREE.DoubleSide,
      uniforms: {
        ...pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk", "uDpr"]),
        uWidth: { value: ROAD_WIDTH },
      },
    });
    let riverGeo: THREE.BufferGeometry | null = null;
    let riverMat: THREE.ShaderMaterial | null = null;
    if (village.river) {
      riverGeo = buildRibbon(village.river, RIVER_WIDTH, field, 0.5, 4);
      riverMat = new THREE.ShaderMaterial({
        vertexShader: RIBBON_VERT,
        fragmentShader: RIVER_FRAG,
        side: THREE.DoubleSide,
        uniforms: {
          ...pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk", "uInkSoft", "uDpr"]),
          uWidth: { value: RIVER_WIDTH },
        },
      });
    }
    const dispose = () => {
      roadGeo.dispose();
      roadMat.dispose();
      riverGeo?.dispose();
      riverMat?.dispose();
    };
    return { roadGeo, roadMat, riverGeo, riverMat, dispose };
  }, [village, field]);

  useEffect(() => () => built.dispose(), [built]);

  return (
    <group>
      <mesh geometry={built.roadGeo} material={built.roadMat} frustumCulled={false} />
      {built.riverGeo && built.riverMat && (
        <mesh geometry={built.riverGeo} material={built.riverMat} frustumCulled={false} />
      )}
    </group>
  );
}
