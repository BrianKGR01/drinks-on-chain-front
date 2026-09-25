"use client";

import { Html } from "@react-three/drei";
import { wineriesInVillage } from "@/content/network";
import type { VillageSpec } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import type { HeightField } from "./lib/terrain";

/**
 * Seats of the network's wineries, floating over the valley on the
 * "bodegas" layer (styled globally via .scene-winery-marker). Each one is a
 * real button: clicking frames the winery's parcels.
 */
export function WineryMarkers({ village, field }: { village: VillageSpec; field: HeightField }) {
  const layer = useExperience((s) => s.layer);
  const mode = useExperience((s) => s.mode);
  const activeId = useExperience((s) => s.activeWineryId);
  const hoveredId = useExperience((s) => s.hoveredWineryId);
  const menuOpen = useExperience((s) => s.menuOpen);
  const shown = layer === "bodegas" && mode !== "intro" && !menuOpen;

  return (
    <>
      {wineriesInVillage(village.id).map((w) => {
        const [x, z] = w.hq;
        const active = w.id === activeId;
        const classes = ["scene-winery-marker", shown && "is-visible", active && "is-active", hoveredId === w.id && "is-hover"];
        return (
          <Html key={w.id} position={[x, field.getHeight(x, z) + 24, z]} center zIndexRange={[4, 3]}>
            <button
              type="button"
              className={classes.filter(Boolean).join(" ")}
              tabIndex={shown ? 0 : -1}
              aria-hidden={!shown}
              aria-pressed={active}
              onClick={() => useExperience.getState().selectWinery(active ? null : w.id)}
              onPointerEnter={() => useExperience.getState().setHoveredWinery(w.id)}
              onPointerLeave={() => {
                const s = useExperience.getState();
                if (s.hoveredWineryId === w.id) s.setHoveredWinery(null);
              }}
            >
              <span className="scene-winery-marker__dot" aria-hidden="true" />
              <span className="scene-winery-marker__name">{w.name}</span>
            </button>
          </Html>
        );
      })}
    </>
  );
}
