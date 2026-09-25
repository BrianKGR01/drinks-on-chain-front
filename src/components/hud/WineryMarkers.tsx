"use client";

import { wineriesInVillage } from "@/content/network";
import { registerWineryMarker } from "@/lib/winery-markers";
import { useExperience } from "@/store/experience";

/**
 * Seats of the network's wineries over the valley on the "bodegas" layer
 * (styled globally via .scene-winery-marker). Plain buttons in the HUD; the
 * scene positions them every frame (components/scene/WineryAnchors).
 * Clicking one frames the winery's parcels.
 */
export function WineryMarkers({ hidden = false }: { hidden?: boolean }) {
  const layer = useExperience((s) => s.layer);
  const villageId = useExperience((s) => s.villageId);
  const activeId = useExperience((s) => s.activeWineryId);
  const hoveredId = useExperience((s) => s.hoveredWineryId);
  const transitioning = useExperience((s) => s.transitioning);
  const shown = layer === "bodegas" && !hidden && !transitioning;

  return (
    // inline pointer-events: the home <main> re-enables them on its direct children
    <div className="scene-winery-markers" style={{ pointerEvents: "none" }} aria-hidden={!shown}>
      {wineriesInVillage(villageId).map((w) => {
        const active = w.id === activeId;
        const classes = ["scene-winery-marker", shown && "is-visible", active && "is-active", hoveredId === w.id && "is-hover"];
        return (
          <button
            key={w.id}
            ref={(el) => {
              registerWineryMarker(w.id, el);
              return () => registerWineryMarker(w.id, null);
            }}
            type="button"
            className={classes.filter(Boolean).join(" ")}
            tabIndex={shown ? 0 : -1}
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
        );
      })}
    </div>
  );
}
