/**
 * Public profiles of the wineries of the network (ORG-11): `GET /v1/public/wineries`
 * (only `ACTIVE` wineries, by trade name) read through this site's own `/api/v1` proxy
 * (`src/proxy.ts`), like every other call of the browser to the API.
 *
 * The answer is validated before it reaches the page (`public-wineries-schema.ts`):
 * a profile that does not match the contract is dropped, and when nothing usable is
 * left the caller keeps the directory of `src/content` (see `winery-directory.ts`).
 * The page never waits for the API and never breaks because of it.
 */

export const WINERY_CATEGORIES = ["WINERY", "BREWERY", "DISTILLERY", "OTHER"] as const;
export type WineryCategory = (typeof WINERY_CATEGORIES)[number];

/** A profile as the pages use it: validated, trimmed, with only the links that lead somewhere. */
export interface PublicWinery {
  slug: string;
  tradeName: string;
  /** Free text of the API ("Valle Central de Tarija · Santa Ana"); may be empty. */
  region: string;
  /** Null for a category this site does not know yet. */
  category: WineryCategory | null;
  /** Logo that can be requested, or null (see `usableLogoUrl`). */
  logoUrl: string | null;
  /** The winery's own text, in the language it was written in (Spanish today). */
  story: string | null;
  /** The winery's website, or null (see `usableWebsite`). */
  website: string | null;
}

/** Hosts that never resolve (RFC 2606 / 6761): the seed data of development uses `*.test`. */
const RESERVED_TLD = /\.(test|example|invalid|localhost|local)$/i;

/**
 * Logo URL that can be requested, or null. The data of the development environment
 * points at `/mocks/uploads/…`, which nobody serves: those count as "no logo", like
 * any relative path (this site has no uploads of its own) and anything but https.
 */
export function usableLogoUrl(raw: string | null | undefined): string | null {
  const url = raw?.trim();
  if (!url || !url.startsWith("https://")) return null;
  try {
    const { hostname, pathname, href } = new URL(url);
    if (RESERVED_TLD.test(hostname) || pathname.startsWith("/mocks/")) return null;
    return href;
  } catch {
    return null;
  }
}

/** Website worth a link (https, a real host), or null: no link that leads nowhere. */
export function usableWebsite(raw: string | null | undefined): string | null {
  const url = raw?.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    if (!parsed.hostname.includes(".") || RESERVED_TLD.test(parsed.hostname)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/** The network of the MVP fits in one page (the API allows up to 100). */
export const DIRECTORY_PATH = "/api/v1/public/wineries?limit=100&offset=0";
/** A slow API is the same as no API: the page already shows the directory of `src/content`. */
const TIMEOUT_MS = 8_000;

type Fetcher = (input: string, init: RequestInit) => Promise<Response>;

/** Reads the directory through the proxy; null on any failure (never throws). */
export async function fetchDirectory(fetcher: Fetcher = fetch): Promise<PublicWinery[] | null> {
  try {
    const res = await fetcher(DIRECTORY_PATH, {
      headers: { Accept: "application/json", "X-Client-App": "PUBLIC" },
      credentials: "omit",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    // The schema (zod) is its own chunk, asked for only here: it never weighs on the first load of a page.
    const { parseDirectory } = await import("./public-wineries-schema");
    return parseDirectory(await res.json());
  } catch {
    return null;
  }
}

/* A small store, so every page shares one answer and a visit asks at most once per TTL. */

/** How long an answer is served before asking again. */
export const DIRECTORY_TTL_MS = 5 * 60_000;

export interface DirectoryStore {
  subscribe: (listener: () => void) => () => void;
  /** Last good answer, or null while there is none. */
  getSnapshot: () => PublicWinery[] | null;
  /**
   * Asks the API unless a fresh answer or a request in flight exists. A failed
   * revalidation keeps the previous answer; a failed first request leaves null.
   */
  refresh: () => Promise<void>;
}

export function createDirectoryStore(
  load: () => Promise<PublicWinery[] | null> = () => fetchDirectory(),
  now: () => number = Date.now,
): DirectoryStore {
  let snapshot: PublicWinery[] | null = null;
  let loadedAt = Number.NEGATIVE_INFINITY;
  let inFlight: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    refresh() {
      if (inFlight) return inFlight;
      if (now() - loadedAt < DIRECTORY_TTL_MS) return Promise.resolve();
      inFlight = load()
        .catch(() => null)
        .then((profiles) => {
          if (!profiles) return;
          snapshot = profiles;
          loadedAt = now();
          for (const listener of listeners) listener();
        })
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    },
  };
}

/** The directory shared by the pages of this site (browser only). */
export const directoryStore = createDirectoryStore();
