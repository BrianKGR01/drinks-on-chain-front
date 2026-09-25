"use client";

import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./Editorial.module.css";

const COPY = {
  es: {
    sectors: [
      { title: "Bodegas", lines: ["¿Produces vino o singani en Bolivia y quieres trazar tus lotes?", "bodegas@drinksonchain.bo"] },
      { title: "Distribución", lines: ["Licorerías, cavas y restaurantes como puntos de recojo.", "puntos@drinksonchain.bo"] },
      { title: "Prensa", lines: ["Material, entrevistas y visitas al valle.", "prensa@drinksonchain.bo"] },
    ],
    address: ["Drinks on Chain", "Tarija, Bolivia", "+591 4 000 0000"],
    next: "Las parcelas",
  },
  en: {
    sectors: [
      { title: "Wineries", lines: ["Do you make wine or singani in Bolivia and want to trace your lots?", "bodegas@drinksonchain.bo"] },
      { title: "Distribution", lines: ["Wine shops, cellars and restaurants as pick-up points.", "puntos@drinksonchain.bo"] },
      { title: "Press", lines: ["Material, interviews and visits to the valley.", "prensa@drinksonchain.bo"] },
    ],
    address: ["Drinks on Chain", "Tarija, Bolivia", "+591 4 000 0000"],
    next: "The parcels",
  },
} as const;

export function ContactPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];
  return (
    <PageShell eyebrow={t.contactTitle}>
      <header className={styles.contactHeader}>
        <span className="small-heading">{t.contactTitle}</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.contactTitle}>Drinks on Chain</h2>
        <div className="specifications" style={{ marginTop: "2.5rem", textAlign: "center" }}>
          {c.address.map((l) => (
            <p key={l} style={{ margin: 0 }}>
              {l}
            </p>
          ))}
        </div>
      </header>

      <div className={styles.sectors}>
        {c.sectors.map((s) => (
          <section key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.lines[0]}</p>
            <p>
              <a href={`mailto:${s.lines[1]}`}>{s.lines[1]}</a>
            </p>
          </section>
        ))}
      </div>

      <div style={{ height: "8rem" }} />
      <DiscoverFooter href="/" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
