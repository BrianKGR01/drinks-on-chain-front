"use client";

import Link from "next/link";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import {
  LOT_PATH,
  NETWORK_COPY,
  formatDate,
  getWineryVillage,
  parcelsOf,
  pickupPointsOf,
  productOf,
  wineriesInVillage,
  type Lot,
  type Winery,
} from "@/content/network";
import type { Lang } from "@/lib/scene-contract";
import { LINKS } from "@/lib/links";
import { useExperience } from "@/store/experience";
import { NetworkMap } from "./NetworkMap";
import { StatusBadge } from "./WineriesPage";
import styles from "./Network.module.css";

const COPY = {
  es: {
    founded: "Fundada",
    town: "Sede",
    varieties: "Cepas",
    parcels: "Parcelas",
    network: "En la red",
    mapCaption: "Parcelas de la bodega en el mapa",
    onMap: "Ver en el mapa",
    products: "Productos",
    lots: "Lotes con trazabilidad pública",
    lotsEmpty: {
      "en-conversacion": "La bodega aún no registra lotes en el ERP: su trazabilidad aparecerá aquí desde su primer lote.",
      referencia: "Las bodegas de referencia no registran lotes en la red.",
      socia: "Todavía no hay lotes registrados.",
    },
    bottles: (n: number) => `${n.toLocaleString("es-BO")} botellas`,
    locked: (d: string) => `Candado de reposo hasta el ${d}: el ERP no permite embotellar antes.`,
    pickup: "Dónde retirar",
    erp: "Acceso al ERP",
    erpText: "El equipo de la bodega registra sus lotes en el ERP de trazabilidad.",
    buy: "Ver vinos en Drinks on Chain",
    back: "Todas las bodegas",
  },
  en: {
    founded: "Founded",
    town: "Seat",
    varieties: "Varieties",
    parcels: "Parcels",
    network: "On the network",
    mapCaption: "The winery's parcels on the map",
    onMap: "See it on the map",
    products: "Products",
    lots: "Lots with public traceability",
    lotsEmpty: {
      "en-conversacion": "The winery does not record lots in the ERP yet: its traceability will appear here from its first lot.",
      referencia: "Reference wineries do not record lots on the network.",
      socia: "No lots recorded yet.",
    },
    bottles: (n: number) => `${n.toLocaleString("en-GB")} bottles`,
    locked: (d: string) => `Rest lock until ${d}: the ERP does not allow bottling before then.`,
    pickup: "Where to collect",
    erp: "ERP access",
    erpText: "The winery's team records its lots in the traceability ERP.",
    buy: "See wines on Drinks on Chain",
    back: "All wineries",
  },
} as const;

function LotTimeline({ lot, kind, lang }: { lot: Lot; kind: "vino" | "singani"; lang: Lang }) {
  const n = NETWORK_COPY[lang];
  const path = LOT_PATH[kind];
  const reached = new Map(lot.history.map((h) => [h.status, h.at]));
  const current = path.indexOf(lot.status);
  return (
    <ol className={styles.timeline} style={{ ["--steps" as string]: path.length }}>
      {path.map((s, i) => {
        const at = reached.get(s);
        const done = i <= current;
        return (
          <li
            key={s}
            className={`${styles.stage} ${done ? styles.stageDone : ""} ${i === current ? styles.stageCurrent : ""}`}
            aria-current={i === current ? "step" : undefined}
          >
            <span className={styles.stageName}>{n.lot[s]}</span>
            {at ? <span className={styles.stageDate}>{formatDate(at, lang)}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

/** /bodegas/[slug] — profile of one winery: story, parcels on the map, products, lots, pick-up points. */
export function WineryPage({ winery: w }: { winery: Winery }) {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const n = NETWORK_COPY[lang];
  const t = UI[lang];
  const village = getWineryVillage(w);
  const parcels = parcelsOf(w);
  const points = pickupPointsOf(w);
  const neighbours = wineriesInVillage(village.id).filter((x) => x.id !== w.id);

  return (
    <PageShell eyebrow={t.navWineries}>
      <header className={styles.header}>
        <span className="small-heading">
          {w.town} · {village.name[lang]}
        </span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.title}>{w.name}</h2>
        <p style={{ marginTop: "2rem" }}>
          <StatusBadge status={w.status} lang={lang} />
        </p>
        <p className={styles.lead}>{w.summary[lang]}</p>
      </header>

      <div className={styles.profile}>
        <figure className={styles.profileMap} style={{ margin: 0 }}>
          <NetworkMap
            village={village}
            highlight={w.parcelIds}
            markers={[
              ...neighbours.map((x) => ({ id: x.id, x: x.hq[0], z: x.hq[1], label: x.name })),
              { id: w.id, x: w.hq[0], z: w.hq[1], label: w.name, active: true },
            ]}
            title={`${c.mapCaption}: ${w.name}`}
          />
          <figcaption className={styles.caption}>
            {c.mapCaption} ·{" "}
            <Link href="/" className={styles.textLink} onClick={() => useExperience.getState().selectWinery(w.id)}>
              {c.onMap}
            </Link>
          </figcaption>
        </figure>

        <div>
          <div className={styles.story}>
            {w.story[lang].map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className={styles.facts}>
            <dt>{c.network}</dt>
            <dd>{n.statusHint[w.status]}</dd>
            <dt>{c.founded}</dt>
            <dd>{w.founded}</dd>
            <dt>{c.town}</dt>
            <dd>{w.town}</dd>
            <dt>{c.varieties}</dt>
            <dd>{w.varieties.join(" · ")}</dd>
            <dt>{c.parcels}</dt>
            <dd className={styles.parcelLinks}>
              {parcels.map((p) => (
                <Link key={p.id} href={`/valles/${village.slug}/${p.slug}`}>
                  {p.name} · {p.altitude.toLocaleString(lang === "es" ? "es-BO" : "en-GB")} m
                </Link>
              ))}
            </dd>
          </dl>
          {w.erpAccess ? (
            <div className={styles.doorActions} style={{ marginTop: "2.5rem" }}>
              <Link href="/acceso#erp" className={styles.buttonGhost}>
                {c.erp}
              </Link>
              <span className={styles.doorAlt}>{c.erpText}</span>
            </div>
          ) : null}
        </div>
      </div>

      <section className={styles.section} aria-labelledby="winery-products">
        <header className={styles.sectionHead}>
          <p id="winery-products" className="small-heading">{c.products}</p>
        </header>
        <ul className={styles.products}>
          {w.products.map((p) => (
            <li key={p.id} className={styles.product}>
              <span className={styles.productKind}>{n.kind[p.kind]}</span>
              <h3 className={styles.productName}>{p.name}</h3>
              <p className={styles.productMeta}>
                {p.variety} · {p.vintage}
              </p>
            </li>
          ))}
        </ul>
        {w.status === "socia" ? (
          <div className={styles.center}>
            <a href={LINKS.landingWines} className={styles.textLink}>
              {c.buy} →
            </a>
          </div>
        ) : null}
      </section>

      <section className={styles.section} aria-labelledby="winery-lots">
        <header className={styles.sectionHead}>
          <p id="winery-lots" className="small-heading">{c.lots}</p>
        </header>
        {w.lots.length === 0 ? (
          <p className={styles.notice} style={{ marginTop: 0 }}>{c.lotsEmpty[w.status]}</p>
        ) : (
          <ul className={styles.lots}>
            {w.lots.map((lot) => {
              const product = productOf(w, lot);
              if (!product) return null;
              return (
                <li key={lot.id} className={styles.lot}>
                  <div className={styles.lotHead}>
                    <h3 className={styles.lotName}>{product.name}</h3>
                    <span className={styles.lotId}>{lot.id}</span>
                  </div>
                  <p className={styles.lotNote}>
                    {n.lot[lot.status]}
                    {lot.bottles ? ` · ${c.bottles(lot.bottles)}` : ""}
                  </p>
                  {lot.unlockAt ? <p className={styles.lotNote}>{c.locked(formatDate(lot.unlockAt, lang))}</p> : null}
                  <LotTimeline lot={lot} kind={product.kind} lang={lang} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {points.length > 0 ? (
        <section className={styles.section} aria-labelledby="winery-points">
          <header className={styles.sectionHead}>
            <p id="winery-points" className="small-heading">{c.pickup}</p>
          </header>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p.id} className={styles.point}>
                <span className={styles.pointKind}>{n.pickupKind[p.kind]}</span>
                <h3 className={styles.pointName}>{p.name}</h3>
                <p className={styles.pointLine}>{p.city}</p>
                <p className={styles.pointLine}>{p.address}</p>
                <p className={styles.pointLine}>{p.hours[lang]}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DiscoverFooter href="/bodegas" caption={c.back} prepend={t.discover} />
    </PageShell>
  );
}
