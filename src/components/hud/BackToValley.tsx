"use client";

import { UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./BackToValley.module.css";

/**
 * Top-centre escape hatch shown while a parcel or a winery is framed. It
 * shares the slot with the layer switch, which steps aside meanwhile.
 */
export function BackToValley({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const mode = useExperience((s) => s.mode);
  const selectParcel = useExperience((s) => s.selectParcel);
  const selectWinery = useExperience((s) => s.selectWinery);
  const visible = !hidden && (mode === "parcel" || mode === "winery");
  return (
    <button
      type="button"
      className={`${styles.cta} ${visible ? styles.visible : ""}`}
      onClick={() => (mode === "winery" ? selectWinery(null) : selectParcel(null))}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <span className={styles.glyph} aria-hidden="true">←</span>
      {UI[lang].backToValley}
      <span className={styles.hint} aria-hidden="true">esc</span>
    </button>
  );
}
