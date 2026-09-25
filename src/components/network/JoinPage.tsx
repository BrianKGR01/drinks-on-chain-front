"use client";

import { Suspense } from "react";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { LINKS } from "@/lib/links";
import { useExperience } from "@/store/experience";
import { JoinForm } from "./JoinForm";
import styles from "./Network.module.css";

const COPY = {
  es: {
    title: "Unirse a la red",
    lead: "Drinks on Chain conecta a las bodegas de altura de Bolivia con quienes quieren sus vinos y singanis: registra cada lote de la parcela a la botella y lo ofrece a precio de bodega, con retiro en puntos autorizados.",
    whyEyebrow: "Qué gana la bodega",
    why: [
      { h: "Precio de bodega", p: "Vendes tus lotes directamente a la tribu, sin intermediarios en la primera venta, y cobras en moneda local." },
      { h: "Preventa de lotes", p: "Ofreces un lote antes de embotellarlo y financias la cosecha con quienes ya lo esperan." },
      { h: "Trazabilidad que se ve", p: "Cada botella lleva un QR con la historia de su lote: parcela, vendimia, crianza o destilación, embotellado." },
      { h: "Tu lugar en el mapa", p: "Tu bodega, tus parcelas y tus lotes aparecen en el mapa grabado de los valles, con tu historia." },
    ],
    erpEyebrow: "Cómo es el ERP",
    erp: [
      { h: "Origen", p: "Tus terroirs con altitud, cepa y geolocalización; el sistema marca los aptos para la Denominación de Origen." },
      { h: "Vendimia y laboratorio", p: "Pesaje en báscula con la tablet de planta y análisis de Brix, pH y acidez con aprobación del enólogo." },
      { h: "Vinificación", p: "Mapa de tanques, bitácora diaria de temperatura y densidad, y la bifurcación entre vino y destilado." },
      { h: "Crianza o destilación", p: "Barricas con cuenta regresiva, cortes del alambique y candados de reposo que el propio sistema hace cumplir." },
      { h: "Embotellado y QR", p: "Conciliación de kilos, litros y botellas, y exportación del archivo de códigos para la imprenta." },
      { h: "Emisión", p: "Cuando el lote está listo, el equipo de Drinks on Chain lo revisa, fija el precio con la bodega y lo publica." },
    ],
    doEyebrow: "Requisitos de Denominación de Origen",
    doText: "Para el Singani con Denominación de Origen el ERP valida en cada lote lo que exige la norma boliviana:",
    doList: [
      "Uva Moscatel de Alejandría como única cepa.",
      "Viñedos por encima de los 1.600 metros sobre el nivel del mar.",
      "Destilación del vino base de la propia cosecha.",
      "Reposo mínimo de seis meses para las categorías Gran Reserva; el embotellado queda bloqueado hasta cumplirlo.",
    ],
    stepsEyebrow: "Proceso de alta",
    steps: [
      { h: "Contacto", p: "Nos escribes con este formulario o a bodegas@drinksonchain.bo." },
      { h: "Visita y acuerdo", p: "Visitamos la bodega, revisamos terroirs y procesos y firmamos el acuerdo de la red." },
      { h: "Alta en la red", p: "Damos de alta la bodega y su cuenta institucional; no tienes que manejar criptomonedas." },
      { h: "Credenciales y primer lote", p: "Tu equipo recibe sus accesos al ERP y registra su primer lote desde la parcela." },
    ],
    formEyebrow: "Escríbenos",
    next: "Puntos de recojo",
  },
  en: {
    title: "Join the network",
    lead: "Drinks on Chain connects Bolivia's high-altitude wineries with the people who want their wines and singanis: it records every lot from parcel to bottle and offers it at winery price, with pick-up at authorised points.",
    whyEyebrow: "What the winery gains",
    why: [
      { h: "Winery price", p: "You sell your lots straight to the tribe, with no middlemen on the first sale, and get paid in local currency." },
      { h: "Lot pre-sales", p: "You offer a lot before bottling it and fund the harvest with the people already waiting for it." },
      { h: "Visible traceability", p: "Every bottle carries a QR with its lot's story: parcel, harvest, ageing or distillation, bottling." },
      { h: "Your place on the map", p: "Your winery, parcels and lots appear on the etched map of the valleys, with your story." },
    ],
    erpEyebrow: "What the ERP is like",
    erp: [
      { h: "Origin", p: "Your terroirs with altitude, variety and location; the system flags those eligible for the Designation of Origin." },
      { h: "Harvest and lab", p: "Weighing on the cellar tablet and Brix, pH and acidity analyses approved by the winemaker." },
      { h: "Winemaking", p: "Tank map, daily temperature and density log, and the fork between wine and spirit." },
      { h: "Ageing or distillation", p: "Barrels with countdowns, still cuts and rest locks that the system itself enforces." },
      { h: "Bottling and QR", p: "Kilos, litres and bottles reconciled, and the code file exported for the printer." },
      { h: "Issuance", p: "When the lot is ready, the Drinks on Chain team reviews it, sets the price with the winery and publishes it." },
    ],
    doEyebrow: "Designation of Origin requirements",
    doText: "For Singani with Designation of Origin, the ERP checks on every lot what Bolivian regulation requires:",
    doList: [
      "Muscat of Alexandria as the only variety.",
      "Vineyards above 1,600 metres above sea level.",
      "Distillation of base wine from the house's own harvest.",
      "At least six months of rest for Gran Reserva categories; bottling stays locked until then.",
    ],
    stepsEyebrow: "How to join",
    steps: [
      { h: "Contact", p: "Write to us with this form or at bodegas@drinksonchain.bo." },
      { h: "Visit and agreement", p: "We visit the winery, review terroirs and processes and sign the network agreement." },
      { h: "Onboarding", p: "We register the winery and its institutional account; you do not need to handle cryptocurrency." },
      { h: "Credentials and first lot", p: "Your team receives its ERP access and records its first lot from the parcel." },
    ],
    formEyebrow: "Write to us",
    next: "Pick-up points",
  },
} as const;

/** /unirse — proposal for wineries and the (demo) contact form. */
export function JoinPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];

  return (
    <PageShell eyebrow={c.title}>
      <header className={styles.header}>
        <span className="small-heading">{t.brand}</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.lead}>{c.lead}</p>
        <p className={styles.center} style={{ marginTop: "3rem" }}>
          <a href="#formulario" className={styles.button}>
            {c.formEyebrow}
          </a>
        </p>
      </header>

      <section className={styles.section} aria-labelledby="join-why">
        <header className={styles.sectionHead}>
          <p id="join-why" className="small-heading">{c.whyEyebrow}</p>
        </header>
        <ul className={`${styles.grid} ${styles.cols4}`}>
          {c.why.map((w) => (
            <li key={w.h}>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="join-erp">
        <header className={styles.sectionHead}>
          <p id="join-erp" className="small-heading">{c.erpEyebrow}</p>
        </header>
        <ol className={`${styles.grid} ${styles.numbered}`}>
          {c.erp.map((w) => (
            <li key={w.h}>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="join-do">
        <header className={styles.sectionHead}>
          <p id="join-do" className="small-heading">{c.doEyebrow}</p>
        </header>
        <div className={styles.story} style={{ maxWidth: "44rem", margin: "0 auto" }}>
          <p>{c.doText}</p>
          <ul className={styles.doorList} style={{ marginTop: "1.5rem", fontSize: "1.125rem" }}>
            {c.doList.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="join-steps">
        <header className={styles.sectionHead}>
          <p id="join-steps" className="small-heading">{c.stepsEyebrow}</p>
        </header>
        <ol className={`${styles.grid} ${styles.numbered} ${styles.cols4}`}>
          {c.steps.map((w) => (
            <li key={w.h}>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="join-form">
        <header className={styles.sectionHead}>
          <p id="join-form" className="small-heading">{c.formEyebrow}</p>
        </header>
        {/* useSearchParams (?tipo=punto) needs a Suspense boundary to keep the page static */}
        <Suspense fallback={null}>
          <JoinForm lang={lang} privacyHref={LINKS.landingPrivacy} />
        </Suspense>
      </section>

      <DiscoverFooter href="/puntos-de-recojo" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
