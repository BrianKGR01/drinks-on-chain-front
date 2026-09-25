"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { wineriesInVillage } from "@/content/network";
import type { VillageSpec } from "@/lib/scene-contract";
import { wineryMarkerEls } from "@/lib/winery-markers";
import type { HeightField } from "./lib/terrain";

const v = new THREE.Vector3();

/**
 * Projects the seat of every winery of the valley to the screen each frame
 * and moves its DOM marker there (see lib/winery-markers). Renders nothing.
 */
export function WineryAnchors({ village, field }: { village: VillageSpec; field: HeightField }) {
  const anchors = useMemo(
    () =>
      wineriesInVillage(village.id).map((w) => ({
        id: w.id,
        pos: new THREE.Vector3(w.hq[0], field.getHeight(w.hq[0], w.hq[1]) + 24, w.hq[1]),
      })),
    [village, field],
  );

  useFrame(({ camera, size }) => {
    // CameraRig already refreshed it this frame; cheap insurance against frame order.
    camera.updateMatrixWorld();
    for (const a of anchors) {
      const el = wineryMarkerEls.get(a.id);
      if (!el) continue;
      v.copy(a.pos).project(camera);
      const behind = v.z > 1;
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.visibility = behind ? "hidden" : "";
    }
  });

  return null;
}
