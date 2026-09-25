"use client";

import { UI } from "@/content/i18n";
import type { MapLayer } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import styles from "./LayerSwitch.module.css";

const LAYERS: MapLayer[] = ["parcelas", "bodegas"];

/**
 * "Parcelas / Bodegas" switch, top centre: what the map shows on top of the
 * valley. A gold hairline slides under the active layer. It gives way to
 * "Volver al valle" while something is framed.
 */
export function LayerSwitch({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const layer = useExperience((s) => s.layer);
  const setLayer = useExperience((s) => s.setLayer);
  const mode = useExperience((s) => s.mode);
  const t = UI[lang];
  // while a parcel or winery is framed, "Volver al valle" takes this slot
  const off = hidden || mode === "parcel" || mode === "winery";
  const labels: Record<MapLayer, string> = { parcelas: t.layerParcels, bodegas: t.layerWineries };

  return (
    <div
      className={`${styles.switch} ${off ? styles.hidden : ""}`}
      role="group"
      aria-label={t.layerSwitch}
      style={{ ["--at" as string]: LAYERS.indexOf(layer) }}
    >
      {LAYERS.map((l) => (
        <button
          key={l}
          type="button"
          className={styles.option}
          aria-pressed={layer === l}
          tabIndex={off ? -1 : 0}
          onClick={() => setLayer(l)}
        >
          {labels[l]}
        </button>
      ))}
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
