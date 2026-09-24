"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { ParcelSpec, VillageSpec } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import { buildParcelGeometry } from "./lib/parcel";
import type { HeightField } from "./lib/terrain";
import { pickUniforms, sharedUniforms } from "./lib/uniforms";
import { PARCEL_FRAG, PARCEL_VERT } from "./shaders/parcel.glsl";

const shared = sharedUniforms;

interface Props {
  village: VillageSpec;
  field: HeightField;
}

interface ParcelEntry {
  spec: ParcelSpec;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
}

const canInteract = () => {
  const s = useExperience.getState();
  return s.mode !== "intro" && !s.menuOpen && !s.transitioning;
};

/** Vineyard parcels: draped quads with vine-row hatching; raycast targets. */
export function Parcels({ village, field }: Props) {
  const entries = useMemo<ParcelEntry[]>(
    () =>
      village.parcels.map((spec, i) => {
        const material = new THREE.ShaderMaterial({
          vertexShader: PARCEL_VERT,
          fragmentShader: PARCEL_FRAG,
          uniforms: {
            ...pickUniforms(shared, ["uCamPos", "uFogNear", "uFogFar", "uExtent", "uPaper", "uInk", "uAccent", "uDpr"]),
            uActive: { value: 0 },
            uHover: { value: 0 },
            uSize: { value: new THREE.Vector2(spec.size[0], spec.size[1]) },
            uSeed: { value: (i * 0.173 + village.seed * 0.001) % 1 },
          },
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        });
        return { spec, geometry: buildParcelGeometry(spec, village.seed + i * 131, field), material };
      }),
    [village, field],
  );

  useEffect(
    () => () => {
      for (const e of entries) {
        e.geometry.dispose();
        e.material.dispose();
      }
    },
    [entries],
  );

  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );

  // Highlight animation: lerp the per-parcel uniforms through mesh refs (no React state).
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  useFrame((_, dt) => {
    const s = useExperience.getState();
    const k = 1 - Math.pow(0.0005, Math.min(dt, 0.05));
    const meshes = meshRefs.current;
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      if (!mesh) continue;
      const u = (mesh.material as THREE.ShaderMaterial).uniforms;
      const active = s.activeParcelIndex === i ? 1 : 0;
      const hover = !active && s.hoveredParcelId === mesh.userData.parcelId ? 1 : 0;
      u.uActive.value += (active - u.uActive.value) * k;
      u.uHover.value += (hover - u.uHover.value) * k;
    }
  });

  const onOver = (id: string) => (e: ThreeEvent<PointerEvent>) => {
    if (!canInteract()) return;
    e.stopPropagation();
    useExperience.getState().setHovered(id);
    document.body.style.cursor = "pointer";
  };
  const onOut = (id: string) => () => {
    const s = useExperience.getState();
    if (s.hoveredParcelId === id) s.setHovered(null);
    document.body.style.cursor = "";
  };
  const onClick = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    if (!canInteract() || e.delta > 6) return;
    e.stopPropagation();
    useExperience.getState().selectParcelById(id);
  };

  return (
    <group>
      {entries.map((e, i) => (
        <mesh
          key={e.spec.id}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          userData={{ parcelId: e.spec.id }}
          geometry={e.geometry}
          material={e.material}
          onPointerOver={onOver(e.spec.id)}
          onPointerOut={onOut(e.spec.id)}
          onClick={onClick(e.spec.id)}
        />
      ))}
      <ParcelLabel village={village} field={field} />
    </group>
  );
}

/** Name of the framed parcel, floating above it (styled globally via .scene-parcel-label). */
function ParcelLabel({ village, field }: { village: VillageSpec; field: HeightField }) {
  const mode = useExperience((s) => s.mode);
  const index = useExperience((s) => s.activeParcelIndex);
  const parcel = index !== null ? (village.parcels[index] ?? null) : null;
  // keep the last parcel mounted so the label can fade out
  const [last, setLast] = useState<ParcelSpec | null>(parcel);
  if (parcel && parcel !== last) setLast(parcel);
  const target = parcel ?? last;
  if (!target) return null;
  const visible = parcel !== null && mode === "parcel";
  const [cx, cz] = target.center;
  const y = field.getHeight(cx, cz) + Math.max(target.size[0], target.size[1]) * 0.22 + 18;
  return (
    <Html position={[cx, y, cz]} center zIndexRange={[2, 0]} style={{ pointerEvents: "none" }}>
      <div className={`scene-parcel-label${visible ? " is-visible" : ""}`}>{target.name}</div>
    </Html>
  );
}
