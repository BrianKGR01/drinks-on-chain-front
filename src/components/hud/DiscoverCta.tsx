"use client";

import Link from "next/link";
import { UI } from "@/content/i18n";
import { selectActiveParcel, selectActiveVillage, useExperience } from "@/store/experience";
import styles from "./DiscoverCta.module.css";

/**
 * Bottom-centre caption. While exploring, it names the parcel under the
 * pointer in large type; once a parcel is framed it becomes the link to
 * its page.
 */
export function DiscoverCta({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const village = useExperience(selectActiveVillage);
  const parcel = useExperience(selectActiveParcel);
  const hoveredId = useExperience((s) => s.hoveredParcelId);
  const mode = useExperience((s) => s.mode);
  const t = UI[lang];

  const framed = mode === "parcel" && parcel !== null;
  const hovered = !framed && hoveredId ? village.parcels.find((p) => p.id === hoveredId) ?? null : null;
  const visible = !hidden && (framed || hovered !== null);

  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      {framed && parcel ? (
        <Link
          href={`/parcelas/${village.slug}/${parcel.slug}`}
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
