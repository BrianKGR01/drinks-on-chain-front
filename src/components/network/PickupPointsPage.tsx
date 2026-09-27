"use client";

import Link from "next/link";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { NETWORK_COPY, PICKUP_POINTS, wineriesOfPickup } from "@/content/network";
import { useExperience } from "@/store/experience";
import styles from "./Network.module.css";

const COPY = {
  es: {
    title: "Puntos de canje",
    lead: "Licorerías, cavas, vinotecas y las propias bodegas donde los compradores canjean sus botellas. El punto escanea el pase de canje, entrega la botella y su NFT se quema en la red.",
    whatEyebrow: "Qué es un punto autorizado",
    what: [
      { h: "Canje verificado", p: "Cada pase de canje se valida contra la red antes de entregar: si ya se usó, caducó o es de otro punto, la pantalla lo dice en rojo." },
      { h: "Sin inventario nuevo", p: "El punto entrega las botellas que le hacen llegar las bodegas con las que trabaja; la red solo registra qué se canjeó, a quién y cuándo." },
      { h: "Turnos conciliados", p: "Cada canje se suma al turno del cajero; al cerrar, el resumen cuadra con lo que la red registró." },
    ],
    howEyebrow: "Cómo se habilita",
    how: [
      { h: "Lo pide la tienda o la bodega", p: "Una licorería que quiere ser punto se postula, o una bodega propone a su distribuidor; el equipo de Drinks on Chain también puede darlo de alta." },
      { h: "Alta enlazada a una bodega", p: "El punto queda enlazado a una o varias bodegas, que lo autorizan, y a los lotes que puede entregar." },
      { h: "Tablet vinculada y PIN", p: "La tablet del mostrador se vincula con un código de alta y cada cajero entra con su PIN personal." },
    ],
    listEyebrow: "Puntos activos",
    delivers: "Entrega",
    contact: "Quiero ser punto de canje",
    access: "Acceso al POS",
    next: "Acceso",
  },
  en: {
    title: "Redemption points",
    lead: "Wine shops, cellars, wine bars and the wineries themselves, where buyers redeem their bottles. The point scans the redemption pass, hands the bottle over and its NFT is burned on the network.",
    whatEyebrow: "What a redemption point is",
    what: [
      { h: "Verified redemption", p: "Every redemption pass is checked against the network before the handover: if it was used, expired or belongs to another point, the screen says so in red." },
      { h: "No new stock", p: "The point hands over the bottles its partner wineries send it; the network only records what was redeemed, by whom and when." },
      { h: "Reconciled shifts", p: "Every redemption adds to the cashier's shift; at closing, the summary matches what the network recorded." },
    ],
    howEyebrow: "How a point is enabled",
    how: [
      { h: "The shop or the winery asks", p: "A wine shop that wants to be a point applies, or a winery puts forward its distributor; the Drinks on Chain team can also enable it." },
      { h: "Linked to a winery", p: "The point is linked to one or more wineries, which authorise it, and to the lots it may hand over." },
      { h: "Linked tablet and PIN", p: "The counter tablet is linked with an enrolment code and each cashier signs in with a personal PIN." },
    ],
    listEyebrow: "Active points",
    delivers: "Delivers",
    contact: "I want to be a redemption point",
    access: "POS access",
    next: "Access",
  },
} as const;

/** /puntos-de-recojo — what an authorised point is, how it is enabled, the active points. */
export function PickupPointsPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const n = NETWORK_COPY[lang];
  const t = UI[lang];

  return (
    <PageShell eyebrow={c.title}>
      <header className={styles.header}>
        <span className="small-heading">{t.brand}</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.lead}>{c.lead}</p>
      </header>

      <section className={styles.section} aria-labelledby="pp-what">
        <header className={styles.sectionHead}>
          <p id="pp-what" className="small-heading">
            {c.whatEyebrow}
          </p>
        </header>
        <ul className={styles.grid}>
          {c.what.map((w) => (
            <li key={w.h}>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="pp-how">
        <header className={styles.sectionHead}>
          <p id="pp-how" className="small-heading">
            {c.howEyebrow}
          </p>
        </header>
        <ol className={`${styles.grid} ${styles.numbered}`}>
          {c.how.map((w) => (
            <li key={w.h}>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="pp-list">
        <header className={styles.sectionHead}>
          <p id="pp-list" className="small-heading">
            {c.listEyebrow}
          </p>
          <p className={styles.notice}>{n.testNotice}</p>
        </header>
        <ul className={styles.points}>
          {PICKUP_POINTS.map((p) => (
            <li key={p.id} className={styles.point}>
              <span className={styles.pointKind}>{n.pickupKind[p.kind]}</span>
              <h3 className={styles.pointName}>{p.name}</h3>
              <p className={styles.pointLine}>{p.city}</p>
              <p className={styles.pointLine}>{p.address}</p>
              <p className={styles.pointLine}>{p.hours[lang]}</p>
              <p className={styles.pointWineries}>
                {c.delivers}:{" "}
                {wineriesOfPickup(p).map((w, i) => (
                  <span key={w.id}>
                    {i > 0 ? ", " : ""}
                    <Link href={`/bodegas/${w.slug}`}>{w.name}</Link>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.center}>
          <Link href="/unirse?tipo=punto#formulario" className={styles.button}>
            {c.contact}
          </Link>
          <Link href="/acceso#pos" className={styles.textLink}>
            {c.access}
          </Link>
        </div>
      </section>

      <DiscoverFooter href="/acceso" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
