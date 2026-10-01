/**
 * Build-time flags (`NEXT_PUBLIC_FLAG_*`, inlined when the site is built:
 * changing one needs a new deployment).
 */

/**
 * Formal winery application of /unirse (`JoinForm` and `/unirse/verificar`).
 * Off by default: it needs a verification email and there is no mail provider
 * yet, so the waitlist of /lista-de-espera takes its place. On with
 * `NEXT_PUBLIC_FLAG_WINERY_APPLICATION=1`.
 */
export const WINERY_APPLICATION = process.env.NEXT_PUBLIC_FLAG_WINERY_APPLICATION === "1";

/** Where "Unirse" (menu, footer, calls to action) takes a winery. */
export const JOIN_HREF = WINERY_APPLICATION ? "/unirse" : "/lista-de-espera";
