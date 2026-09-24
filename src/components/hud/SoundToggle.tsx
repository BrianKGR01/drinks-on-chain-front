"use client";

import { useEffect } from "react";
import { UI } from "@/content/i18n";
import { ambience } from "@/lib/ambience";
import { useExperience } from "@/store/experience";
import styles from "./SoundToggle.module.css";

const STORAGE_KEY = "doc-sound";

/**
 * "Sonido" control shown on every route. Sound starts after the visitor
 * enters (a user gesture), unless it was switched off before; the choice
 * is remembered. The component also drives the ambience from the store.
 */
export function SoundToggle({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const soundOn = useExperience((s) => s.soundOn);
  const entered = useExperience((s) => s.entered);
  const toggleSound = useExperience((s) => s.toggleSound);

  // First entry: honour the remembered preference (default on).
  useEffect(() => {
    if (!entered) return;
    let preferred = true;
    try {
      preferred = window.localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      /* storage unavailable */
    }
    const { soundOn: current } = useExperience.getState();
    if (preferred && !current) useExperience.getState().toggleSound();
  }, [entered]);

  // Store → audio engine.
  useEffect(() => {
    if (soundOn) void ambience.start();
    else ambience.stop();
  }, [soundOn]);

  // UI cues and tab visibility.
  useEffect(() => {
    const unsubSelect = useExperience.subscribe((s, prev) => {
      if (!s.soundOn) return;
      if (s.activeParcelIndex !== prev.activeParcelIndex && s.activeParcelIndex !== null) ambience.pluck();
      else if (s.hoveredParcelId !== prev.hoveredParcelId && s.hoveredParcelId) ambience.tick();
    });
    const onVisibility = () => {
      const { soundOn: on } = useExperience.getState();
      if (!on) return;
      if (document.hidden) ambience.stop();
      else void ambience.start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      unsubSelect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onClick = () => {
    const next = !soundOn;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
    toggleSound();
  };

  const t = UI[lang];
  return (
    <button
      type="button"
      className={`${styles.toggle} ${hidden ? styles.hidden : ""} ${soundOn ? styles.on : ""}`}
      onClick={onClick}
      aria-pressed={soundOn}
      aria-label={`${t.sound}: ${soundOn ? t.soundOn : t.soundOff}`}
    >
      <span className={styles.bars} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className={styles.label}>{t.sound}</span>
    </button>
  );
}
