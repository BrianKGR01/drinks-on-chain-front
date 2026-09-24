"use client";

import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { BottleIllustration, SoilProfile } from "@/components/ui/InkIllustrations";
import { InkPhoto } from "@/components/ui/InkPhoto";
import { IMAGES } from "@/content/images";
import { ZONES } from "@/content/zones";
import { UI } from "@/content/i18n";
import { getParcelContent } from "@/content/parcels";
import type { ParcelSpec, VillageSpec } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import styles from "./Editorial.module.css";

interface ParcelPageProps {
  village: VillageSpec;
  parcel: ParcelSpec;
  next: ParcelSpec;
}

/** Ground sheet + wine sheet of one parcel, like the reference's parcel view. */
export function ParcelPage({ village, parcel, next }: ParcelPageProps) {
  const lang = useExperience((s) => s.lang);
  const t = UI[lang];
  const content = getParcelContent(village, parcel, lang);
  const { ground, wine } = content;
  const facts = ZONES[parcel.id]?.facts;
  const villageIndex = village.parcels.findIndex((p) => p.id === parcel.id);
  const villagePhotos = IMAGES.villages[village.id] ?? [];
  const photos = IMAGES.parcels[parcel.id]?.length
    ? IMAGES.parcels[parcel.id]
    : villagePhotos.length
      ? [villagePhotos[villageIndex % villagePhotos.length]]
      : [];
  const winePhoto = IMAGES.wines[parcel.id];

  return (
    <PageShell eyebrow={village.name[lang]}>
      <nav className={styles.sideNav} aria-label={t.theParcel}>
        <a href="#parcela" aria-current="true">
          {t.theParcel}
        </a>
        <a href="#vino">{t.theWine}</a>
      </nav>

      <section id="parcela" className={styles.section}>
        <header className={styles.groundHeader}>
          <span className="small-heading">{village.region[lang]}</span>
          <span className="heading-separator" aria-hidden="true" />
          <h2 className={styles.parcelTitle}>{parcel.name}</h2>
          <div className={`${styles.specs} specifications`}>
            {ground.specifications.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </header>

        {photos[0] ? (
          <InkPhoto
            src={photos[0].src}
            alt={photos[0].alt[lang]}
            caption={photos[0].caption[lang]}
            credit={photos[0].credit}
            ratio={1.6}
            className={styles.parcelPhoto}
            priority
          />
        ) : null}

        <div className={styles.description}>
          {ground.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className={`${styles.details} specifications`}>
          {ground.details.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {facts ? (
            <>
              <p>
                {lang === "es" ? "Municipio" : "Municipality"} / {facts.municipality}, {facts.province}
              </p>
              <p>
                {lang === "es" ? "Bodegas" : "Wineries"} / {facts.wineries.join(" · ")}
              </p>
            </>
          ) : null}
        </div>

        {photos[1] ? (
          <InkPhoto
            src={photos[1].src}
            alt={photos[1].alt[lang]}
            caption={photos[1].caption[lang]}
            credit={photos[1].credit}
            ratio={1.45}
            className={styles.parcelPhotoSecond}
          />
        ) : null}
      </section>

      <section className={styles.underground}>
        <h3 className={styles.undergroundTitle}>{ground.underground.title}</h3>
        {ground.underground.levels.map((lvl) => (
          <div key={lvl.name} className={styles.entry}>
            <span>{lvl.name}</span>
            <span>{lvl.caption}</span>
          </div>
        ))}
        <SoilProfile levels={ground.underground.levels} className={styles.soil} />
      </section>

      <section id="vino" className={`${styles.section} ${styles.wineSection}`}>
        <header className={styles.wineHeader}>
          <span className="small-heading">{t.theWine}</span>
          <span className="heading-separator" aria-hidden="true" />
          <h2 className={styles.wineTitle}>{wine.name}</h2>
          <div className={`${styles.specs} specifications`} style={{ marginTop: "2rem" }}>
            {wine.specifications.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </header>

        {winePhoto ? (
          <InkPhoto
            src={winePhoto.src}
            alt={winePhoto.alt[lang]}
            caption={winePhoto.caption[lang]}
            credit={winePhoto.credit}
            ratio={0.8}
            className={styles.winePhoto}
          />
        ) : (
          <BottleIllustration
            kind={wine.kind}
            label={wine.name}
            sublabel={wine.kind === "singani" ? `Singani · ${parcel.altitude} m` : `Vino · ${parcel.altitude} m`}
            className={styles.packshot}
          />
        )}

        <div className={styles.wineBlocks}>
          {wine.content.map((block, i) => {
            if (block.type === "columns") {
              return (
                <p key={i} className={styles.columns}>
                  {block.text}
                </p>
              );
            }
            if (block.type === "highlight") {
              return (
                <p key={i} className={`${styles.wineHighlight} highlight`}>
                  {block.text}
                </p>
              );
            }
            return (
              <div key={i} className={`${styles.paragraph} prose-body`}>
                {block.heading ? <h3>{block.heading}</h3> : null}
                <p>{block.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {facts?.sources?.length ? (
        <p className={styles.sources}>
          {lang === "es" ? "Fuentes" : "Sources"}:{" "}
          {facts.sources.slice(0, 4).map((u, i) => (
            <a key={u} href={u} target="_blank" rel="noreferrer">
              {i > 0 ? " · " : ""}
              {new URL(u).hostname.replace(/^www\./, "")}
            </a>
          ))}
        </p>
      ) : null}

      <DiscoverFooter
        href={`/parcelas/${village.slug}/${next.slug}`}
        caption={next.name}
        prepend={t.nextParcel}
      />
    </PageShell>
  );
}
