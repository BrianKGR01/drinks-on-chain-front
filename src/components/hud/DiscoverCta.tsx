"use client";

import Link from "next/link";
import { UI } from "@/content/i18n";
import { getWinery } from "@/content/network";
import { selectActiveParcel, selectActiveVillage, selectActiveWinery, useExperience } from "@/store/experience";
import styles from "./DiscoverCta.module.css";

/**
 * Bottom-centre caption. While exploring, it names the parcel under the
 * pointer in large type; once a parcel is framed it becomes the link to
 * its page. On the "bodegas" layer it does the same for the wineries.
 */
export function DiscoverCta({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const village = useExperience(selectActiveVillage);
  const parcel = useExperience(selectActiveParcel);
  const hoveredId = useExperience((s) => s.hoveredParcelId);
  const mode = useExperience((s) => s.mode);
  const layer = useExperience((s) => s.layer);
  const winery = useExperience(selectActiveWinery);
  const hoveredWineryId = useExperience((s) => s.hoveredWineryId);
  const t = UI[lang];

  if (layer === "bodegas") {
    const framedW = mode === "winery" && winery !== null;
    const hoveredW = !framedW && hoveredWineryId ? (getWinery(hoveredWineryId) ?? null) : null;
    const shown = !hidden && (framedW || hoveredW !== null);
    return (
      <div className={`${styles.wrap} ${shown ? styles.visible : ""}`} aria-hidden={!shown}>
        {framedW && winery ? (
          <Link href={`/bodegas/${winery.slug}`} className={styles.cta} tabIndex={shown ? 0 : -1}>
            <span className={styles.label}>{t.seeWinery}</span>
            <span className={styles.name}>{winery.name}</span>
          </Link>
        ) : hoveredW ? (
          <span className={styles.static}>
            <span className={styles.label}>{t.layerWineries}</span>
            <span className={styles.name}>{hoveredW.name}</span>
          </span>
        ) : null}
      </div>
    );
  }

  const framed = mode === "parcel" && parcel !== null;
  const hovered = !framed && hoveredId ? village.parcels.find((p) => p.id === hoveredId) ?? null : null;
  const visible = !hidden && (framed || hovered !== null);

  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      {framed && parcel ? (
        <Link
          href={`/valles/${village.slug}/${parcel.slug}`}
          className={styles.cta}
          tabIndex={visible ? 0 : -1}
        >
          <span className={styles.label}>{t.discoverParcel}</span>
          <span className={styles.name}>{parcel.name}</span>
        </Link>
      ) : hovered ? (
        <span className={styles.static}>
          <span className={styles.label}>{t.theParcel}</span>
          <span className={styles.name}>{hovered.name}</span>
        </span>
      ) : null}
    </div>
  );
}
