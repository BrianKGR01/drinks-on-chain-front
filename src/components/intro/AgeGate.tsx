"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/brand/Logo";
import { LetterSplit } from "@/components/ui/LetterSplit";
import { GlassBottleOrnament } from "@/components/intro/GlassBottleOrnament";
import { VineOrnament } from "@/components/intro/VineOrnament";
import { LANGS, UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./AgeGate.module.css";

const LEAVE_MS = 900;

const subscribe = (cb: () => void) => useExperience.subscribe(cb);
/** True once the visitor entered in this session. Server snapshot: false. */
const useEntered = () => useSyncExternalStore(subscribe, () => useExperience.getState().entered, () => false);

/**
 * Full-screen age confirmation shown before the experience. The entrance
 * choreography (logo, statement, "Entrar", bar) is pure CSS animation, so it
 * plays from the server HTML even before React hydrates; JS only leaves it.
 */
export function AgeGate() {
  const lang = useExperience((s) => s.lang);
  const setLang = useExperience((s) => s.setLang);
  const enter = useExperience((s) => s.enter);
  const t = UI[lang];

  const entered = useEntered();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const handleEnter = useCallback(() => {
    if (leaving) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setLeaving(true);
    enter();
    window.setTimeout(() => setGone(true), LEAVE_MS);
  }, [enter, leaving]);

  if (gone || (entered && !leaving)) return null;

  return (
    <div
      // gate-root: globals.css locks document scrolling while this is mounted
      className={`gate-root ${styles.intro} ${leaving ? styles.leaving : ""}`}
      // wheel and touch gestures stop here: nothing underneath (page or camera) may move
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={t.ageGateAria}
    >
      <div className={`${styles.ornament} ${styles.ornamentTopLeft}`} aria-hidden="true">
        <VineOrnament flip delay={0.2} />
      </div>
      <div className={`${styles.ornament} ${styles.ornamentBottomRight}`} aria-hidden="true">
        <GlassBottleOrnament delay={0.8} />
      </div>

      <div className={styles.logo}>
        <Logo link={false} />
      </div>

      <div className={styles.content}>
        <p className={styles.contentInner}>
          <LetterSplit text={t.certify} />
        </p>
      </div>

      <button type="button" className={styles.enter} onClick={handleEnter} autoFocus>
        <span className={styles.label}>
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
