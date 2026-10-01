"use client";

import Link from "next/link";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { LINKS } from "@/lib/links";
import { useExperience } from "@/store/experience";
import styles from "./Network.module.css";
import { WaitlistForm } from "./WaitlistForm";
import w from "./Waitlist.module.css";

const COPY = {
  es: {
    eyebrow: "Lista de espera",
    kicker: "Para bodegas y productores",
    title: "Tu bodega, entre las primeras de la red",
    lead: "Drinks on Chain da a las bodegas de vino y singani de Bolivia trazabilidad verificable de la parcela a la botella, preventa de botellas tokenizadas y una red de puntos de canje. Anota tu bodega y te contactamos para sumarla.",
    cta: "Anotar mi bodega",
    whyEyebrow: "Qué gana tu bodega",
    why: [
      { h: "Trazabilidad verificable", p: "Cada lote queda registrado de la parcela a la botella, y quien la compra lo comprueba con un QR." },
      { h: "Preventa tokenizada", p: "Ofreces las botellas de un lote antes de embotellarlo: cada botella es un token que su comprador sigue hasta recibirla." },
      { h: "Puntos de canje", p: "Las botellas se entregan en licorerías, cavas y restaurantes autorizados de la red." },
    ],
    formEyebrow: "Anota tu bodega",
    more: "¿Quieres ver antes cómo funciona?",
    moreCta: "La propuesta para bodegas",
    next: "Bodegas de la red",
  },
  en: {
    eyebrow: "Waitlist",
    kicker: "For wineries and producers",
    title: "Your winery, among the first in the network",
    lead: "Drinks on Chain gives Bolivia's wine and singani producers verifiable traceability from parcel to bottle, pre-sales of tokenised bottles and a network of redemption points. Add your winery and we will get in touch to bring it in.",
    cta: "Add my winery",
    whyEyebrow: "What your winery gains",
    why: [
      { h: "Verifiable traceability", p: "Every lot is recorded from parcel to bottle, and whoever buys it checks it with a QR." },
      { h: "Tokenised pre-sales", p: "You offer the bottles of a lot before bottling it: each bottle is a token its buyer follows until they receive it." },
      { h: "Redemption points", p: "Bottles are handed over at the network's authorised wine shops, cellars and restaurants." },
    ],
    formEyebrow: "Add your winery",
    more: "Want to see how it works first?",
    moreCta: "The proposal for wineries",
    next: "Wineries of the network",
  },
} as const;

/** /lista-de-espera — waitlist of wineries (contract `o1b-lista-de-espera`). */
export function WaitlistPage({ apiReady }: { apiReady: boolean }) {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];

  return (
    <PageShell eyebrow={c.eyebrow}>
      <header className={`${styles.header} ${w.header}`}>
        <span className="small-heading">{c.kicker}</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.lead}>{c.lead}</p>
        <p className={`${styles.center} ${w.cta}`}>
          <a href="#formulario" className={styles.button}>
            {c.cta}
          </a>
        </p>
      </header>

      <section className={`${styles.section} ${w.section}`} aria-labelledby="waitlist-why">
        <header className={styles.sectionHead}>
          <p id="waitlist-why" className="small-heading">{c.whyEyebrow}</p>
        </header>
        <ul className={styles.grid}>
          {c.why.map((b) => (
            <li key={b.h}>
              <h3>{b.h}</h3>
              <p>{b.p}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.section} ${w.section}`} aria-labelledby="waitlist-form">
        <header className={styles.sectionHead}>
          <p id="waitlist-form" className="small-heading">{c.formEyebrow}</p>
        </header>
        <WaitlistForm id="formulario" lang={lang} privacyHref={LINKS.landingPrivacy} apiReady={apiReady} />
        <p className={w.more}>
          {c.more}{" "}
          <Link href="/unirse" className={styles.textLink}>
            {c.moreCta}
          </Link>
        </p>
      </section>

      <DiscoverFooter href="/bodegas" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
