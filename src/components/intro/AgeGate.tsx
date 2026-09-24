"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LetterSplit } from "@/components/ui/LetterSplit";
import { LANGS, UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./AgeGate.module.css";

const LEAVE_MS = 1100;

/**
 * Full-screen age confirmation shown before the experience.
 * Replicates the reference choreography: logo + statement fade in over 2 s,
 * the "Entrar" letters follow, then the thin red bar draws down. Hovering the
 * button crossfades the red letters to black; entering fades everything out.
 */
export function AgeGate() {
  const lang = useExperience((s) => s.lang);
  const setLang = useExperience((s) => s.setLang);
  const enter = useExperience((s) => s.enter);
  const t = UI[lang];

  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // Already entered on mount (e.g. coming back from a content page): skip the gate.
  const [gone, setGone] = useState(() => useExperience.getState().entered);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleEnter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    enter();
    window.setTimeout(() => setGone(true), LEAVE_MS);
  }, [enter, leaving]);

  if (gone) return null;

  return (
    <div
      className={`${styles.intro} ${shown ? styles.in : ""} ${leaving ? styles.leaving : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.ageGateAria}
    >
      <div className={styles.logo}>
        <Logo link={false} />
      </div>

      <div className={styles.content}>
        <p className={styles.contentInner}>
          <LetterSplit text={t.certify} />
        </p>
      </div>

      <button type="button" className={styles.enter} onClick={handleEnter} autoFocus>
        <span className={`${styles.label} ${styles.red}`} aria-hidden="true">
          <LetterSplit text={t.enter} />
        </span>
        <span className={`${styles.label} ${styles.black}`}>
          <LetterSplit text={t.enter} />
        </span>
        <span className={styles.icon} aria-hidden="true">
          <span className={styles.bar1} />
          <span className={styles.bar2} />
        </span>
      </button>

      <nav className={styles.nav} aria-label="Idioma y avisos">
        <div className={styles.langs}>
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className="underline-anim"
              aria-current={lang === code ? "true" : undefined}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <Link href="/aviso-legal" className="underline-anim">
          {t.legalNotice}
        </Link>
      </nav>
    </div>
  );
}
