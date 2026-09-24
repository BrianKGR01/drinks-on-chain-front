"use client";

import { UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./BackToValley.module.css";

/** Top-centre escape hatch shown while a parcel is framed. */
export function BackToValley({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const mode = useExperience((s) => s.mode);
  const selectParcel = useExperience((s) => s.selectParcel);
  const visible = !hidden && mode === "parcel";
  return (
    <button
      type="button"
      className={`${styles.cta} ${visible ? styles.visible : ""}`}
      onClick={() => selectParcel(null)}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <span className={styles.glyph} aria-hidden="true">←</span>
      {UI[lang].backToValley}
      <span className={styles.hint} aria-hidden="true">esc</span>
    </button>
  );
}
