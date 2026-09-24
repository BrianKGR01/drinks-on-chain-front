"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { VillageSpec } from "@/lib/scene-contract";
import {
  buildBodegaGeometry,
  buildChurchGeometry,
  buildEdges,
  buildHouseGeometry,
  buildInstancedEdges,
} from "./lib/geometry";
import { layoutHouses, type Placement } from "./lib/layout";
import { mulberry32 } from "./lib/prng";
import type { HeightField } from "./lib/terrain";
import { pickUniforms, sharedUniforms, type SharedUniforms } from "./lib/uniforms";
import { HOUSE_FRAG, LINE_FRAG, LINE_VERT, OBJECT_VERT } from "./shaders/objects.glsl";

const shared = sharedUniforms;

interface Props {
  village: VillageSpec;
  field: HeightField;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/** Writes placements into an InstancedMesh (+ per-instance seed attribute). */
export function applyPlacements(mesh: THREE.InstancedMesh, placements: Placement[]) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const seeds = new Float32Array(placements.length);
  placements.forEach((p, i) => {
    q.setFromAxisAngle(Y_AXIS, p.rot);
    pos.set(p.x, p.y, p.z);
    scl.set(p.sx, p.sy, p.sz);
    m.compose(pos, q, scl);
    mesh.setMatrixAt(i, m);
    seeds[i] = p.seed;
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  mesh.frustumCulled = false;
}

export function makeLineMaterial(shared: SharedUniforms, instanced: boolean, strength = 0.9) {
  return new THREE.ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    defines: instanced ? { INSTANCED: "" } : {},
    uniforms: {
      ...pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk"]),
      uStrength: { value: strength },
    },
  });
}

/** Instanced ink houses (body + 1px edge outlines) and the landmark buildings. */
export function Village({ village, field }: Props) {
  const built = useMemo(() => {
    const placements = layoutHouses(village, field);
    const houseGeo = buildHouseGeometry();
    const bodyMat = new THREE.ShaderMaterial({
      vertexShader: OBJECT_VERT,
      fragmentShader: HOUSE_FRAG,
      uniforms: pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk", "uLight", "uDpr"]),
    });
    const houses = new THREE.InstancedMesh(houseGeo, bodyMat, Math.max(1, placements.length));
    applyPlacements(houses, placements);
    houses.count = placements.length;

    const lineGeo = buildInstancedEdges(houseGeo, houses.instanceMatrix, placements.length, 20);
    const lineMat = makeLineMaterial(shared, true, 0.92);
    const houseLines = new THREE.LineSegments(lineGeo, lineMat);
    houseLines.frustumCulled = false;

    const rng = mulberry32(village.seed + 77);
    const landmarkGeos: THREE.BufferGeometry[] = [];
    const plainLineMat = makeLineMaterial(shared, false, 0.95);
    const landmarks: THREE.Object3D[] = [];
    for (const l of village.landmarks) {
      if (l.kind === "plaza") continue;
      const geo = l.kind === "church" ? buildChurchGeometry() : buildBodegaGeometry();
      const edges = buildEdges(geo, 20);
      landmarkGeos.push(geo, edges);
      const group = new THREE.Group();
      const [x, z] = l.position;
      group.position.set(x, field.getHeight(x, z) + 0.35, z);
      group.rotation.y = rng() * Math.PI;
      const mesh = new THREE.Mesh(geo, bodyMat);
      const lines = new THREE.LineSegments(edges, plainLineMat);
      group.add(mesh, lines);
      landmarks.push(group);
    }

    const dispose = () => {
      houseGeo.dispose();
      lineGeo.dispose();
      bodyMat.dispose();
      lineMat.dispose();
      plainLineMat.dispose();
      houses.dispose();
      for (const g of landmarkGeos) g.dispose();
    };
    return { houses, houseLines, landmarks, dispose };
  }, [village, field]);

  useEffect(() => () => built.dispose(), [built]);

  return (
    <group>
      <primitive object={built.houses} />
      <primitive object={built.houseLines} />
      {built.landmarks.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </group>
  );
}
