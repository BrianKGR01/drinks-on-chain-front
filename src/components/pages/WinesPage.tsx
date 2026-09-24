"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/pages/PageShell";
import { BottleIllustration } from "@/components/ui/InkIllustrations";
import { InkPhoto } from "@/components/ui/InkPhoto";
import { IMAGES } from "@/content/images";
import { UI } from "@/content/i18n";
import { getParcelContent, grapeOf, wineKindOf } from "@/content/parcels";
import { VILLAGES } from "@/content/villages";
import { useExperience } from "@/store/experience";
import styles from "./Wines.module.css";

/**
 * Wine showcase: fixed list on the left, packshot centred, details on the
 * right, "Descubrir" underneath. Arrow keys and the mobile arrows step
 * through the range.
 */
export function WinesPage({ initialSlug }: { initialSlug?: string }) {
  const lang = useExperience((s) => s.lang);
  const t = UI[lang];

  const wines = useMemo(
    () =>
      VILLAGES.flatMap((village) =>
        village.parcels.map((parcel) => ({
          village,
          parcel,
          kind: wineKindOf(parcel.id),
          grape: grapeOf(parcel.id),
        })),
      ),
    [],
  );

  const initialIndex = Math.max(
    0,
    wines.findIndex((w) => w.parcel.slug === initialSlug),
  );
  const [index, setIndex] = useState(initialIndex);
  const current = wines[index];
  const content = getParcelContent(current.village, current.parcel, lang);
  const photo = IMAGES.wines[current.parcel.id];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % wines.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + wines.length) % wines.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wines.length]);

  return (
    <PageShell eyebrow={t.winesTitle} className={styles.page}>
      <div className={styles.content}>
        <ul className={styles.list} aria-label={t.winesTitle}>
          {wines.map((w, i) => (
            <li key={w.parcel.id}>
              <button
                type="button"
                className={`${styles.listCta} ${i === index ? styles.listActive : ""}`}
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
              >
                <span className={styles.listKind}>{w.kind === "singani" ? "Singani" : "Vino"}</span>
                {getParcelContent(w.village, w.parcel, lang).wine.name}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.packshot} key={current.parcel.id}>
          {photo ? (
            <InkPhoto
              src={photo.src}
              alt={photo.alt[lang]}
              credit={photo.credit}
              ratio={0.75}
              className={styles.photo}
              sizes="(max-width: 767px) 60vw, 26vw"
            />
          ) : (
            <BottleIllustration
              kind={current.kind}
              label={content.wine.name}
              sublabel={`${current.parcel.name} · ${current.parcel.altitude} m`}
              className={styles.bottle}
            />
          )}
        </div>

        <div className={styles.details}>
          <h2 className={styles.title}>{content.wine.name}</h2>
          <div className={styles.entries}>
            <span>
              {current.parcel.name} · {current.village.name[lang]}
            </span>
            <span>{current.grape}</span>
            {content.wine.specifications.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={`${styles.arrow} ${styles.left}`}
              onClick={() => setIndex((i) => (i - 1 + wines.length) % wines.length)}
              aria-label={t.previous}
            >
              →
            </button>
            <Link
              href={`/parcelas/${current.village.slug}/${current.parcel.slug}#vino`}
              className={styles.discover}
            >
              {t.discover}
            </Link>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => setIndex((i) => (i + 1) % wines.length)}
              aria-label={t.next}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <p className={styles.notice}>
        {lang === "es"
          ? "Consuma con moderación. Venta prohibida a menores de 18 años."
          : "Drink responsibly. Not for sale to under-18s."}
      </p>
    </PageShell>
  );
}
