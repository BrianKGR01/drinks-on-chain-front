"use client";

import Link from "next/link";
import { UI } from "@/content/i18n";
import { selectActiveParcel, selectActiveVillage, useExperience } from "@/store/experience";
import styles from "./DiscoverCta.module.css";

/** Appears above the navigator once a parcel is framed. */
export function DiscoverCta({ hidden = false }: { hidden?: boolean }) {
  const lang = useExperience((s) => s.lang);
  const village = useExperience(selectActiveVillage);
  const parcel = useExperience(selectActiveParcel);
  const mode = useExperience((s) => s.mode);
  const visible = !hidden && parcel !== null && mode === "parcel";
  const t = UI[lang];

  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      {parcel ? (
        <Link
          href={`/parcelas/${village.slug}/${parcel.slug}`}
          className={styles.cta}
          tabIndex={visible ? 0 : -1}
        >
          <span className={styles.label}>{t.discoverParcel}</span>
          <span className={styles.name}>{parcel.name}</span>
        </Link>
      ) : null}
    </div>
  );
}
