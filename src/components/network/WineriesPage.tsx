"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { NETWORK_COPY, WINERIES, getWineryVillage, type WineryStatus } from "@/content/network";
import { VILLAGES } from "@/content/villages";
import { JOIN_HREF } from "@/lib/flags";
import { LINKS } from "@/lib/links";
import type { WineryCategory } from "@/lib/public-wineries";
import { usePublicWineries } from "@/lib/use-public-wineries";
import { STATUS_ORDER as ORDER, buildDirectory, summaryOf, villageOfRegion } from "@/lib/winery-directory";
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
    next: "Puntos de canje",
    market: "Ver en el Marketplace",
    marketOf: (name: string) => `${name} en el Marketplace`,
    category: { WINERY: "Bodega", DISTILLERY: "Destilería", BREWERY: "Cervecería", OTHER: null } satisfies Record<WineryCategory, string | null>,
  },
  en: {
    title: "Wineries",
    lead: "The wineries of the network, each with its parcels on the valley map and the lots it records from harvest onwards.",
    listEyebrow: "The network",
    join: "Do you have a winery or a vineyard?",
    joinCta: "Join the network",
    next: "Redemption points",
    market: "See it on the Marketplace",
    marketOf: (name: string) => `${name} on the Marketplace`,
    category: { WINERY: "Winery", DISTILLERY: "Distillery", BREWERY: "Brewery", OTHER: null } satisfies Record<WineryCategory, string | null>,
  },
} as const;

export function StatusBadge({ status, lang }: { status: WineryStatus; lang: "es" | "en" }) {
  return <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>{NETWORK_COPY[lang].status[status]}</span>;
}

/**
 * /bodegas — directory of the network with each winery's place in it.
 *
 * The HTML carries the directory of `src/content`; once the page is alive it asks the
 * API for the public profiles (ORG-11, through `/api/v1`) and, with a good answer,
 * the API decides which wineries are partners (`winery-directory.ts`). Without one
 * the page stays as it was served.
 */
export function WineriesPage({ apiReady }: { apiReady: boolean }) {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const n = NETWORK_COPY[lang];
  const t = UI[lang];
  const profiles = usePublicWineries(apiReady);
  const directory = useMemo(() => buildDirectory(WINERIES, profiles), [profiles]);

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
        <ul className={styles.wineries} data-directory={profiles ? "api" : "content"}>
          {directory.map((entry) => {
            // A winery this site has a page for links to it; one that only the API lists, to the Marketplace.
            const w = entry.content;
            const village = w ? getWineryVillage(w) : villageOfRegion(entry.profile?.region ?? "", VILLAGES);
            const summary = summaryOf(entry, lang);
            const market = entry.status === "socia" ? LINKS.appWinery(entry.slug) : null;
            const category = entry.profile?.category ? c.category[entry.profile.category] : null;
            const meta = w ? `${w.town} · ${getWineryVillage(w).name[lang]}` : [category, entry.profile?.region].filter(Boolean).join(" · ");
            return (
              <li key={entry.slug} className={`${styles.wineryCard} ${village ? "" : styles.wineryCardPlain}`}>
                {village ? (
                  <NetworkMap
                    village={village}
                    highlight={w?.parcelIds}
                    markers={w ? [{ id: w.id, x: w.hq[0], z: w.hq[1], label: "", active: true }] : []}
                    className={styles.wineryMap}
                    detail={false}
                  />
                ) : null}
                <div className={styles.wineryBody}>
                  <StatusBadge status={entry.status} lang={lang} />
                  <h3 className={styles.wineryName}>
                    {w ? <Link href={`/bodegas/${w.slug}`}>{entry.name}</Link> : market ? <a href={market}>{entry.name}</a> : entry.name}
                  </h3>
                  {meta ? <p className={styles.wineryMeta}>{meta}</p> : null}
                  {summary ? (
                    <p className={styles.winerySummary} lang={summary.lang === lang ? undefined : summary.lang}>
                      {summary.text}
                    </p>
                  ) : null}
                  {w ? (
                    <span className={styles.wineryLinks}>
                      <span className={styles.textLink} aria-hidden="true">
                        {t.seeWinery} →
                      </span>
                      {market ? (
                        <a href={market} className={`${styles.textLink} ${styles.wineryMarket}`} aria-label={c.marketOf(entry.name)}>
                          {c.market} →
                        </a>
                      ) : null}
                    </span>
                  ) : market ? (
                    <span className={styles.textLink} aria-hidden="true">
                      {c.market} →
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <div className={styles.center}>
          <span className={styles.doorAlt}>{c.join}</span>
          <Link href={JOIN_HREF} className={styles.button}>
            {c.joinCta}
          </Link>
        </div>
      </section>

      <DiscoverFooter href="/puntos-de-recojo" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
