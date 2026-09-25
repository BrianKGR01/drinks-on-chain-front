"use client";

import { useEffect } from "react";
import type { VillageSpec } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import { Clouds } from "./Clouds";
import { Forest } from "./Forest";
import type { HeightField } from "./lib/terrain";
import { Parcels } from "./Parcels";
import { Roads } from "./Roads";
import { Terrain } from "./Terrain";
import { Village } from "./Village";
import { WineryAnchors } from "./WineryAnchors";

interface Props {
  village: VillageSpec;
  field: HeightField;
}

/** One village: terrain, parcels, buildings, trees, roads, clouds. Keyed by village id. */
export function World({ village, field }: Props) {
  const setSceneReady = useExperience((s) => s.setSceneReady);

  useEffect(() => {
    const id = requestAnimationFrame(() => setSceneReady(true));
    return () => cancelAnimationFrame(id);
  }, [setSceneReady, village.id]);

  return (
    <group>
      <Terrain field={field} />
      <Parcels village={village} field={field} />
      <Village village={village} field={field} />
      <Forest village={village} field={field} />
      <Roads village={village} field={field} />
      <Clouds village={village} />
      <WineryAnchors village={village} field={field} />
    </group>
  );
}
