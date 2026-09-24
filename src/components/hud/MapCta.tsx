"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useExperience } from "@/store/experience";
import { UI } from "@/content/i18n";
import styles from "./MapCta.module.css";

/**
 * "MAPA" toggle pinned top-right with a compass needle under the caption.
 * Hover replays the reference's GSAP micro-animation: the needle squashes and
 * the letters step outwards from the centre in three discrete jumps.
 */
export function MapCta({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const mode = useExperience((s) => s.mode);
  const toggleMap = useExperience((s) => s.toggleMap);
  const rootRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const label = mode === "map" ? UI[lang].valley : UI[lang].map;
  const letters = Array.from(label);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const needle = root.querySelector<SVGElement>("svg");
    const els = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.letter}`));
    const tl = gsap.timeline({ paused: true });
    if (needle) tl.to(needle, { scaleX: 0.625, duration: 0.5, ease: "sine.inOut" }, "a");
    tl.to(
      els,
      {
        xPercent: 100,
        duration: 0.5,
        ease: "steps(3)",
        modifiers: {
          xPercent: (value: number, target: HTMLElement) => {
            const idx = Number(target.dataset.idx ?? 0) - 0.5 * (els.length - 1);
            return 0.2 * value * idx;
          },
        },
        stagger: { from: "edges", amount: 0.2 },
      },
      "a",
    );
    tlRef.current = tl;
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [label]);

  return (
    <button
      ref={rootRef}
      type="button"
      className={`${styles.cta} ${hidden ? styles.hidden : ""}`}
      onClick={toggleMap}
      onMouseEnter={() => tlRef.current?.play()}
      onMouseLeave={() => tlRef.current?.reverse()}
      onFocus={() => tlRef.current?.play()}
      onBlur={() => tlRef.current?.reverse()}
      aria-pressed={mode === "map"}
      aria-label={label}
    >
      <span className={styles.caption} aria-hidden="true">
        {letters.map((ch, i) => (
          <span key={`${label}-${i}`} className={styles.letter} data-idx={i}>
            {ch}
          </span>
        ))}
      </span>
      <svg
        className={styles.needle}
        viewBox="0 0 74 20"
        width="74"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <line x1="1" y1="10" x2="73" y2="10" stroke="currentColor" strokeWidth="1" />
        <path d="M37 2 L45 10 L37 18 L29 10 Z" fill="var(--paper)" stroke="currentColor" strokeWidth="1" />
        <path d="M37 2 L45 10 L37 10 Z" fill="var(--accent)" />
        <circle cx="1" cy="10" r="1.5" fill="currentColor" />
      </svg>
    </button>
  );
}
