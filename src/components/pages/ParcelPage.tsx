"use client";

import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { BottleIllustration, SoilProfile } from "@/components/ui/InkIllustrations";
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

        <div className={styles.description}>
          {ground.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className={`${styles.details} specifications`}>
          {ground.details.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
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

        <BottleIllustration
          kind={wine.kind}
          label={wine.name}
          sublabel={wine.kind === "singani" ? `Singani · ${parcel.altitude} m` : `Vino · ${parcel.altitude} m`}
          className={styles.packshot}
        />

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

      <DiscoverFooter
        href={`/parcelas/${village.slug}/${next.slug}`}
        caption={next.name}
        prepend={t.nextParcel}
      />
    </PageShell>
  );
}
