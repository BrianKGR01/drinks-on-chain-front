"use client";

import Link from "next/link";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { NETWORK_COPY, WINERIES, getWineryVillage, type WineryStatus } from "@/content/network";
import { useExperience } from "@/store/experience";
import { NetworkMap } from "./NetworkMap";
import styles from "./Network.module.css";

const COPY = {
  es: {
    title: "Bodegas",
    lead: "Las bodegas de la red, cada una con sus parcelas en el mapa de los valles y los lotes que registra desde la vendimia.",
    listEyebrow: "La red",
    join: "¿Tienes una bodega o un viñedo?",
    joinCta: "Unirse a la red",
    next: "Puntos de recojo",
  },
  en: {
    title: "Wineries",
    lead: "The wineries of the network, each with its parcels on the valley map and the lots it records from harvest onwards.",
    listEyebrow: "The network",
    join: "Do you have a winery or a vineyard?",
    joinCta: "Join the network",
    next: "Pick-up points",
  },
} as const;

const ORDER: WineryStatus[] = ["socia", "en-conversacion", "referencia"];

export function StatusBadge({ status, lang }: { status: WineryStatus; lang: "es" | "en" }) {
  return <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>{NETWORK_COPY[lang].status[status]}</span>;
}

/** /bodegas — directory of the network with each winery's place in it. */
export function WineriesPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const n = NETWORK_COPY[lang];
  const t = UI[lang];
  const wineries = [...WINERIES].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));

  return (
    <PageShell eyebrow={c.title}>
      <header className={styles.header}>
        <span className="small-heading">{t.brand}</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.lead}>{c.lead}</p>
        <p className={styles.notice}>{n.testNotice}</p>
        <ul className={styles.legend} aria-label={c.listEyebrow}>
          {ORDER.map((s) => (
            <li key={s}>
              <StatusBadge status={s} lang={lang} />
              <span>{n.statusHint[s]}</span>
            </li>
          ))}
        </ul>
      </header>

      <section className={styles.section} aria-labelledby="wineries-list">
        <header className={styles.sectionHead}>
          <p id="wineries-list" className="small-heading">{c.listEyebrow}</p>
        </header>
        <ul className={styles.wineries}>
          {wineries.map((w) => {
            const village = getWineryVillage(w);
            return (
              <li key={w.id} className={styles.wineryCard}>
                <NetworkMap
                  village={village}
                  highlight={w.parcelIds}
                  markers={[{ id: w.id, x: w.hq[0], z: w.hq[1], label: "", active: true }]}
                  className={styles.wineryMap}
                  detail={false}
                />
                <div className={styles.wineryBody}>
                  <StatusBadge status={w.status} lang={lang} />
                  <h3 className={styles.wineryName}>
                    <Link href={`/bodegas/${w.slug}`}>{w.name}</Link>
                  </h3>
                  <p className={styles.wineryMeta}>
                    {w.town} · {village.name[lang]}
                  </p>
                  <p className={styles.winerySummary}>{w.summary[lang]}</p>
                  <span className={styles.textLink} aria-hidden="true">
                    {t.seeWinery} →
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className={styles.center}>
          <span className={styles.doorAlt}>{c.join}</span>
          <Link href="/unirse" className={styles.button}>
            {c.joinCta}
          </Link>
        </div>
      </section>

      <DiscoverFooter href="/puntos-de-recojo" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
