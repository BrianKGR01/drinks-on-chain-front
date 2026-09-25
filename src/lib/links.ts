/**
 * Outbound links to the other sites of the ecosystem. Never hard-code a host
 * in a component: the root domain is not bought yet, and each environment
 * points elsewhere. Production falls back to the current Vercel hosts.
 */
const PROD = process.env.NODE_ENV === "production";
/** Main landing (root domain). */
const LANDING = process.env.NEXT_PUBLIC_URL_LANDING ?? (PROD ? "https://drinks-on-chain-landing.vercel.app" : "http://localhost:3001");
/** S1 ERP and S4 POS are not deployed yet: without a variable, production shows them as "coming soon" (null). */
const ERP = process.env.NEXT_PUBLIC_URL_ERP ?? (PROD ? null : "http://localhost:3003");
const POS = process.env.NEXT_PUBLIC_URL_POS ?? (PROD ? null : "http://localhost:3004");

const join = (base: string, path = "") => `${base.replace(/\/$/, "")}${path}`;

export const LINKS = {
  landing: join(LANDING),
  landingWines: join(LANDING, "/vinos"),
  landingHow: join(LANDING, "/como-funciona"),
  landingHistory: join(LANDING, "/historia"),
  landingPrivacy: join(LANDING, "/privacidad"),
  /** ERP sign-in, or null while the ERP is not deployed. */
  erp: ERP ? join(ERP, "/login") : null,
  /** POS device link, or null while the POS is not deployed. */
  pos: POS ? join(POS) : null,
} as const;

/** True when a link leaves this site (render a plain <a>, not next/link). */
export const isExternal = (href: string) => /^https?:\/\//.test(href);
