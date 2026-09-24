"use client";

import { useExperience } from "@/store/experience";
import { UI } from "@/content/i18n";
import styles from "./MainCta.module.css";

/**
 * The 2×2 "ME / NU" button pinned top-left. On hover the four letters slide
 * right, the underline retracts and a vertical hairline draws on the left.
 */
export function MainCta({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const menuOpen = useExperience((s) => s.menuOpen);
  const toggleMenu = useExperience((s) => s.toggleMenu);
  const letters = Array.from(UI[lang].menu);

  return (
    <button
      type="button"
      className={`${styles.cta} ${hidden ? styles.hidden : ""}`}
      onClick={() => toggleMenu(true)}
      aria-haspopup="dialog"
      aria-expanded={menuOpen}
      aria-label={UI[lang].menu}
    >
      {letters.map((ch, i) => (
        <span key={i} className={styles.letter} aria-hidden="true">
          {ch}
        </span>
      ))}
    </button>
  );
}
