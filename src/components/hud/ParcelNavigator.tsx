"use client";

import { useEffect } from "react";
import { UI } from "@/content/i18n";
import { VILLAGES } from "@/content/villages";
import { selectActiveVillage, useExperience } from "@/store/experience";
import styles from "./ParcelNavigator.module.css";

/**
 * Bottom navigator: a numbered ruler whose red line advances to the active
 * parcel, the row of parcel names underneath, the region caption rotated on
 * the left edge and the "other valley →" jump on the right.
 * Arrow keys step through parcels.
 */
export function ParcelNavigator({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const village = useExperience(selectActiveVillage);
  const active = useExperience((s) => s.activeParcelIndex);
  const hovered = useExperience((s) => s.hoveredParcelId);
  const selectParcel = useExperience((s) => s.selectParcel);
  const nextParcel = useExperience((s) => s.nextParcel);
  const prevParcel = useExperience((s) => s.prevParcel);
  const setHovered = useExperience((s) => s.setHovered);
  const setVillage = useExperience((s) => s.setVillage);
  const menuOpen = useExperience((s) => s.menuOpen);
  const t = UI[lang];

  const n = village.parcels.length;
  const other = VILLAGES.find((v) => v.id !== village.id);
  const progress = active === null ? 0 : (active + 0.5) / n;

  useEffect(() => {
    if (hidden || menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") nextParcel();
      else if (e.key === "ArrowLeft") prevParcel();
      else if (e.key === "Escape" && active !== null) selectParcel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hidden, menuOpen, nextParcel, prevParcel, selectParcel, active]);

  return (
    <>
      <p className={`${styles.region} ${hidden ? styles.hidden : ""}`} aria-hidden="true">
        {village.region[lang]}
      </p>

      <nav
        className={`${styles.nav} ${hidden ? styles.hidden : ""}`}
        aria-label={t.navParcels}
      >
        <div className={styles.ruler} aria-hidden="true">
          <span className={styles.rulerLine} />
          <span className={styles.rulerProgress} style={{ transform: `scaleX(${progress})` }} />
          {village.parcels.map((p, i) => (
            <span
              key={p.id}
              className={`${styles.tick} ${i === active ? styles.tickActive : ""}`}
              style={{ left: `${((i + 0.5) / n) * 100}%` }}
            >
              <span className={styles.tickNumber}>{i + 1}</span>
              <span className={styles.tickMark} />
            </span>
          ))}
        </div>

        <div className={styles.row}>
          <button type="button" className={styles.arrow} onClick={prevParcel} aria-label={t.previous}>
            ←
          </button>
          <ol className={styles.list}>
            {village.parcels.map((p, i) => {
              const isActive = i === active;
              const isHover = hovered === p.id;
              return (
                <li key={p.id} className={styles.item}>
                  <button
                    type="button"
                    className={`${styles.name} ${isActive ? styles.nameActive : ""} ${isHover ? styles.nameHover : ""}`}
                    onClick={() => selectParcel(isActive ? null : i)}
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {p.name}
                  </button>
                </li>
              );
            })}
          </ol>
          <button type="button" className={styles.arrow} onClick={nextParcel} aria-label={t.next}>
            →
          </button>
          {other ? (
            <button
              type="button"
              className={styles.village}
              onClick={() => setVillage(other.id)}
              aria-label={other.name[lang]}
            >
              {t.goToVillage(other.name[lang].replace(/^Valle (Central )?de /i, "").replace(/ Central Valley| Valley/i, ""))}
            </button>
          ) : null}
        </div>
      </nav>
    </>
  );
}
