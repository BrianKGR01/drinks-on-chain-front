/**
 * Outbound links to the other sites of the ecosystem. Never hard-code a host
 * in a component: the root domain is not bought yet, and each environment
 * points elsewhere. Production falls back to the current Vercel host of the
 * landing; a site that is not deployed yet has no fallback there, so its links
 * are `null` and the components hide them (or say "coming soon").
 */

const join = (base: string, path = "") => `${base.replace(/\/+$/, "")}${path}`;

/** A usable base URL (`http(s)://…`), or null: an empty or malformed variable counts as absent. */
export function siteBase(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw || !/^https?:\/\/[^/\s]+/i.test(raw)) return null;
  return raw.replace(/\/+$/, "");
}

export interface SiteUrls {
  /** Main landing (root domain). */
  landing: string;
  /** S1 ERP; null while it is not deployed. */
  erp: string | null;
  /** S4 POS; null while it is not deployed. */
  pos: string | null;
  /** S2 Marketplace (`NEXT_PUBLIC_URL_APP`); null while it has no public URL. */
  app: string | null;
}

/** Links for the hosts of one environment (injectable in tests). */
export function buildLinks(urls: SiteUrls) {
  const app = siteBase(urls.app);
  const erp = siteBase(urls.erp);
  const pos = siteBase(urls.pos);
  return {
    landing: join(urls.landing),
    landingWines: join(urls.landing, "/vinos"),
    landingHow: join(urls.landing, "/como-funciona"),
    landingHistory: join(urls.landing, "/historia"),
    landingPrivacy: join(urls.landing, "/privacidad"),
    /** ERP sign-in, or null while the ERP is not deployed. */
    erp: erp ? join(erp, "/login") : null,
    /** POS device link, or null while the POS is not deployed. */
    pos: pos ? join(pos) : null,
    /** Marketplace home, or null while the Marketplace has no public URL. */
    app: app ? join(app) : null,
    /** Marketplace catalogue. */
    catalog: app ? join(app, "/catalogo") : null,
    /** "Verifica una botella": the public viewer of a bottle or lot code (`/b`). */
    verify: app ? join(app, "/b") : null,
    /** Directory of wineries in the Marketplace. */
    appWineries: app ? join(app, "/bodegas") : null,
    /** Page of one winery in the Marketplace. */
    appWinery: (slug: string) => (app ? join(app, `/bodegas/${encodeURIComponent(slug)}`) : null),
  } as const;
}

const PROD = process.env.NODE_ENV === "production";
/** Local default of a site in development; nothing in production. */
const local = (url: string) => (PROD ? null : url);

export const LINKS = buildLinks({
  landing: siteBase(process.env.NEXT_PUBLIC_URL_LANDING) ?? (PROD ? "https://drinks-on-chain-landing.vercel.app" : "http://localhost:3001"),
  // `??`, not `||`: an empty variable switches the link off, also in development.
  erp: process.env.NEXT_PUBLIC_URL_ERP ?? local("http://localhost:3002"),
  pos: process.env.NEXT_PUBLIC_URL_POS ?? local("http://localhost:3004"),
  app: process.env.NEXT_PUBLIC_URL_APP ?? local("http://localhost:3005"),
});

/** WhatsApp share intent with a prefilled text (the visitor chooses the chat). */
export const whatsappShare = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** True when a link leaves this site (render a plain <a>, not next/link). */
export const isExternal = (href: string) => /^https?:\/\//.test(href);
