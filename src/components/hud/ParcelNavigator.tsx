"use client";

import { useEffect } from "react";
import { UI } from "@/content/i18n";
import { wineriesInVillage } from "@/content/network";
import { VILLAGES } from "@/content/villages";
import { selectActiveVillage, useExperience } from "@/store/experience";
import styles from "./ParcelNavigator.module.css";

/**
 * Bottom navigator: a numbered ruler whose red line advances to the active
 * parcel, the row of parcel names underneath, the region caption rotated on
 * the left edge and the "other valley →" jump on the right.
 * Arrow keys step through parcels. On the "bodegas" layer the same ruler
 * lists the partner wineries of the valley instead.
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
  const layer = useExperience((s) => s.layer);
  const activeWineryId = useExperience((s) => s.activeWineryId);
  const hoveredWineryId = useExperience((s) => s.hoveredWineryId);
  const selectWinery = useExperience((s) => s.selectWinery);
  const nextWinery = useExperience((s) => s.nextWinery);
  const prevWinery = useExperience((s) => s.prevWinery);
  const setHoveredWinery = useExperience((s) => s.setHoveredWinery);
  const t = UI[lang];

  // One ruler, two lists: the valley's parcels or its partner wineries.
  const byWinery = layer === "bodegas";
  const wineries = wineriesInVillage(village.id);
  const items = byWinery ? wineries.map((w) => ({ id: w.id, name: w.name })) : village.parcels.map((p) => ({ id: p.id, name: p.name }));
  const wineryIndex = wineries.findIndex((w) => w.id === activeWineryId);
  const current = byWinery ? (wineryIndex < 0 ? null : wineryIndex) : active;
  const hoverId = byWinery ? hoveredWineryId : hovered;
  const select = (i: number | null) => (byWinery ? selectWinery(i === null ? null : wineries[i].id) : selectParcel(i));
  const next = byWinery ? nextWinery : nextParcel;
  const prev = byWinery ? prevWinery : prevParcel;
  const hover = (id: string | null) => (byWinery ? setHoveredWinery(id) : setHovered(id));

  const n = items.length;
  const other = VILLAGES.find((v) => v.id !== village.id);
  const progress = current === null ? 0 : (current + 0.5) / n;

  useEffect(() => {
    if (hidden || menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape" && current !== null) select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <p className={`${styles.region} ${hidden ? styles.hidden : ""}`} aria-hidden="true">
        {village.region[lang]}
      </p>

      <nav
        className={`${styles.nav} ${hidden ? styles.hidden : ""}`}
        aria-label={byWinery ? t.layerWineries : t.navParcels}
      >
        <div className={styles.ruler} aria-hidden="true">
          <span className={styles.rulerLine} />
          <span className={styles.rulerProgress} style={{ transform: `scaleX(${progress})` }} />
          {items.map((p, i) => (
            <span
              key={p.id}
              className={`${styles.tick} ${i === current ? styles.tickActive : ""}`}
              style={{ left: `${((i + 0.5) / n) * 100}%` }}
            >
              <span className={styles.tickNumber}>{i + 1}</span>
              <span className={styles.tickMark} />
            </span>
          ))}
        </div>

        <div className={styles.row}>
          <button type="button" className={styles.arrow} onClick={prev} aria-label={t.previous}>
            ←
          </button>
          <ol className={styles.list}>
            {items.map((p, i) => {
              const isActive = i === current;
              const isHover = hoverId === p.id;
              return (
                <li key={p.id} className={styles.item}>
                  <button
                    type="button"
                    className={`${styles.name} ${isActive ? styles.nameActive : ""} ${isHover ? styles.nameHover : ""}`}
                    onClick={() => select(isActive ? null : i)}
                    onMouseEnter={() => hover(p.id)}
                    onMouseLeave={() => hover(null)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {p.name}
                  </button>
                </li>
              );
            })}
          </ol>
          <button type="button" className={styles.arrow} onClick={next} aria-label={t.next}>
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
