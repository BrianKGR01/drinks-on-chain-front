import { postPublic, type ApiResult } from "./public-api";

/**
 * Waitlist of wineries (contract `o1b-lista-de-espera` §1): this site only
 * sends `type: "WINERY"` to `POST /v1/public/waitlist` through its own
 * `/api/v1` proxy. The server owns the rules (duplicates, limits, honeypot).
 */

export const PRODUCES = ["WINE", "SINGANI", "BOTH", "OTHER"] as const;
export type Produces = (typeof PRODUCES)[number];

export interface WineryWaitlistRequest {
  type: "WINERY";
  wineryName: string;
  /** Contact person. */
  fullName: string;
  email: string;
  phone?: string;
  region?: string;
  produces?: Produces;
  message?: string;
  consent: true;
  locale: "es" | "en";
  source?: string;
  /** Honeypot: must arrive empty. */
  website: string;
}

export interface WaitlistJoinResponse {
  type: "CONSUMER" | "WINERY";
  position: number;
}

export const joinWaitlist = (body: WineryWaitlistRequest): Promise<ApiResult<WaitlistJoinResponse>> =>
  postPublic<WaitlistJoinResponse>("public/waitlist", body);

/** Position of an answer, or null when the API did not send a usable one. */
export function positionOf(data: WaitlistJoinResponse | null): number | null {
  const n = data?.position;
  return typeof n === "number" && Number.isInteger(n) && n > 0 ? n : null;
}

/** Contract: 7–20 characters, digits, spaces and `+ - ( )`. */
export const PHONE_RE = /^[\d\s+\-()]{7,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Origin of the sign-up (`?src=`): which QR, poster or shared link brought the visitor. */

/** Contract: at most 40 characters of `[a-z0-9-]`. */
const SOURCE_RE = /^[a-z0-9-]{1,40}$/;
const SOURCE_KEY = "doc:waitlist:src";
/** Source of the links made by the "share with another winery" button. */
export const SHARE_SOURCE = "bodega-amiga";
export const WAITLIST_PATH = "/lista-de-espera";

/** A valid source (lower-cased), or null: anything else is dropped, never sent. */
export function parseSource(raw: string | null | undefined): string | null {
  const s = raw?.trim().toLowerCase();
  return s && SOURCE_RE.test(s) ? s : null;
}

/**
 * Source of this visit: `?src=` of the current URL when valid (and it is kept
 * in `sessionStorage`, so it survives moving around the site), otherwise the
 * one kept earlier in this tab. Browser only; storage may be blocked.
 */
export function rememberSource(search: string = window.location.search): string | null {
  const fromUrl = parseSource(new URLSearchParams(search).get("src"));
  try {
    if (fromUrl) {
      window.sessionStorage.setItem(SOURCE_KEY, fromUrl);
      return fromUrl;
    }
    return parseSource(window.sessionStorage.getItem(SOURCE_KEY));
  } catch {
    return fromUrl;
  }
}
