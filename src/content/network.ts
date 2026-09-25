import type { Lang, Localized } from "@/lib/scene-contract";
import { VILLAGES } from "./villages";
import wineriesData from "./data/bodegas.json";
import pickupData from "./data/puntos-de-recojo.json";

/**
 * The partner network shown on the bodegas site: wineries and pick-up points.
 *
 * The data is the test catalogue of the ecosystem (docs/08-datos-de-prueba.md
 * §3) with the same identifiers as `@doc/mocks`, so this site, the
 * Marketplace and the Backoffice show the same network. Every winery here is
 * fictional; none has an agreement. The main landing keeps a copy of this
 * file and of data/*.json (edit here, copy there). When the mocks package
 * exists, these JSON files are replaced by its fixtures.
 */

/** Place of a winery in the network (never a real commercial claim while the network is a test). */
export type WineryStatus = "socia" | "en-conversacion" | "referencia";

/** Lot state machine shared with the ERP (docs/01 §7). */
export type LotStatus =
  | "origen"
  | "vendimia"
  | "fermentacion"
  | "crianza"
  | "destilacion"
  | "reposo"
  | "embotellado"
  | "listo"
  | "tokenizado";

export interface Product {
  id: string;
  name: string;
  kind: "vino" | "singani";
  variety: string;
  vintage: number;
}

export interface Lot {
  id: string;
  productId: string;
  status: LotStatus;
  /** Bottles filled; null until the lot is bottled. */
  bottles: number | null;
  /** Rest or ageing lock (ISO date), when the ERP keeps the lot from bottling. */
  unlockAt?: string;
  history: Array<{ status: LotStatus; at: string }>;
}

export interface Winery {
  id: string;
  slug: string;
  name: string;
  status: WineryStatus;
  villageId: string;
  town: string;
  founded: number;
  /** Seat of the winery on the village map (village-local XZ). */
  hq: [x: number, z: number];
  parcelIds: string[];
  varieties: string[];
  summary: Localized;
  story: Record<Lang, string[]>;
  products: Product[];
  lots: Lot[];
  pickupPointIds: string[];
  /** Whether the winery's team signs in to the ERP. */
  erpAccess: boolean;
}

export type PickupKind = "bodega" | "licoreria" | "vinoteca" | "cava";

export interface PickupPoint {
  id: string;
  slug: string;
  name: string;
  kind: PickupKind;
  city: string;
  address: string;
  hours: Localized;
  wineryIds: string[];
  status: "activo" | "pendiente";
}

export const WINERIES = wineriesData as Winery[];
export const PICKUP_POINTS = pickupData as PickupPoint[];

export const getWinery = (slug: string) => WINERIES.find((w) => w.slug === slug || w.id === slug);
export const getWineryVillage = (w: Winery) => VILLAGES.find((v) => v.id === w.villageId) ?? VILLAGES[0];
export const wineriesInVillage = (villageId: string) => WINERIES.filter((w) => w.villageId === villageId);
/** Wineries that farm a parcel of the map. */
export const wineriesOfParcel = (parcelId: string) => WINERIES.filter((w) => w.parcelIds.includes(parcelId));
export const pickupPointsOf = (w: Winery) => PICKUP_POINTS.filter((p) => w.pickupPointIds.includes(p.id));
export const wineriesOfPickup = (p: PickupPoint) => WINERIES.filter((w) => p.wineryIds.includes(w.id));
export const parcelsOf = (w: Winery) => {
  const village = getWineryVillage(w);
  return village.parcels.filter((p) => w.parcelIds.includes(p.id));
};
export const productOf = (w: Winery, lot: Lot) => w.products.find((p) => p.id === lot.productId);

/** Wine path and spirit path of the lot state machine, in order. */
export const LOT_PATH: Record<Product["kind"], LotStatus[]> = {
  vino: ["origen", "vendimia", "fermentacion", "crianza", "embotellado", "listo", "tokenizado"],
  singani: ["origen", "vendimia", "fermentacion", "destilacion", "reposo", "embotellado", "listo", "tokenizado"],
};

export const NETWORK_COPY = {
  es: {
    status: { socia: "Socia", "en-conversacion": "En conversación", referencia: "Referencia" } satisfies Record<WineryStatus, string>,
    statusHint: {
      socia: "Registra sus lotes en el ERP y los ofrece a precio de bodega.",
      "en-conversacion": "Preparando su ingreso; aún sin lotes registrados.",
      referencia: "Aparece por contexto histórico, sin relación comercial.",
    } satisfies Record<WineryStatus, string>,
    lot: {
      origen: "Origen",
      vendimia: "Vendimia",
      fermentacion: "Fermentación",
      crianza: "Crianza",
      destilacion: "Destilación",
      reposo: "Reposo",
      embotellado: "Embotellado",
      listo: "Listo para emitir",
      tokenizado: "En la red",
    } satisfies Record<LotStatus, string>,
    pickupKind: { bodega: "Bodega", licoreria: "Licorería", vinoteca: "Vinoteca", cava: "Cava" } satisfies Record<PickupKind, string>,
    kind: { vino: "Vino", singani: "Singani" },
    testNotice: "Red de prueba: las bodegas y los puntos de recojo de esta página son ficticios mientras se cierran los primeros acuerdos.",
  },
  en: {
    status: { socia: "Partner", "en-conversacion": "In talks", referencia: "Reference" } satisfies Record<WineryStatus, string>,
    statusHint: {
      socia: "Records its lots in the ERP and offers them at winery price.",
      "en-conversacion": "Preparing to join; no lots recorded yet.",
      referencia: "Shown for historical context, no commercial relationship.",
    } satisfies Record<WineryStatus, string>,
    lot: {
      origen: "Origin",
      vendimia: "Harvest",
      fermentacion: "Fermentation",
      crianza: "Ageing",
      destilacion: "Distillation",
      reposo: "Rest",
      embotellado: "Bottled",
      listo: "Ready to issue",
      tokenizado: "On the network",
    } satisfies Record<LotStatus, string>,
    pickupKind: { bodega: "Winery", licoreria: "Wine shop", vinoteca: "Wine bar", cava: "Cellar" } satisfies Record<PickupKind, string>,
    kind: { vino: "Wine", singani: "Singani" },
    testNotice: "Test network: the wineries and pick-up points on this page are fictional while the first agreements are closed.",
  },
} as const;

export const formatDate = (iso: string, lang: Lang) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === "es" ? "es-BO" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
