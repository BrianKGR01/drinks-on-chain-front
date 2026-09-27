/**
 * Client for the public, sessionless routes of the backend (`/v1/public/*`).
 * The browser calls this site's own `/api/v1/*`, which `src/proxy.ts` rewrites
 * to the API (see `api-proxy.ts`). No cookies: this site signs no one in, so the
 * requests go with `credentials: "omit"`.
 *
 * Responses follow the backend envelope (contract of Wave 0 §1):
 *   ok    { success: true,  statusCode, data }
 *   error { success: false, statusCode, error: { code, message, details: [{ field, message }] | null } }
 */

/** Cloudflare's public test site key: always passes (only for development and tests). */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || TURNSTILE_TEST_SITE_KEY;

export interface FieldIssue {
  field: string | null;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; status: number; data: T | null }
  /** 400/422 with details: the server rejected some fields. */
  | { ok: false; kind: "validation"; code: string | null; message: string | null; details: FieldIssue[] }
  /** 429: `retryAfter` in seconds when the server says it (`Retry-After`). */
  | { ok: false; kind: "rate-limited"; retryAfter: number | null }
  /** No API behind the rewrite, or the API is down (404/5xx without the envelope, 501). */
  | { ok: false; kind: "unavailable" }
  /** The request never got an answer (offline, timeout, blocked). */
  | { ok: false; kind: "network" }
  /** Any other answer of the API. */
  | { ok: false; kind: "error"; status: number; code: string | null; message: string | null };

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
}

const TIMEOUT_MS = 20_000;

/** `Retry-After` is either seconds or an HTTP date. */
export function parseRetryAfter(header: string | null, now = Date.now()): number | null {
  if (!header) return null;
  const s = header.trim();
  if (/^\d+$/.test(s)) return Number(s);
  const at = Date.parse(s);
  return Number.isNaN(at) ? null : Math.max(0, Math.ceil((at - now) / 1000));
}

function toIssues(details: unknown): FieldIssue[] {
  if (!Array.isArray(details)) return [];
  return details.flatMap((d): FieldIssue[] => {
    if (d && typeof d === "object" && "message" in d) {
      const { field, message } = d as { field?: unknown; message?: unknown };
      return [{ field: typeof field === "string" && field ? field : null, message: String(message ?? "") }];
    }
    // Older backends send "field: message" strings.
    if (typeof d === "string") {
      const m = /^([\w.]+):\s*(.*)$/.exec(d);
      return [m ? { field: m[1], message: m[2] } : { field: null, message: d }];
    }
    return [];
  });
}

/** POST a JSON body to `/api/v1/<path>` of this site and classify the answer. */
export async function postPublic<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/v1/${path.replace(/^\/+/, "")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-Client-App": "PUBLIC" },
      body: JSON.stringify(body),
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  let envelope: Envelope<T> | null = null;
  if ((res.headers.get("content-type") ?? "").includes("json")) {
    try {
      envelope = (await res.json()) as Envelope<T>;
    } catch {
      envelope = null;
    }
  }
  const isEnvelope = !!envelope && typeof envelope.success === "boolean";

  if (res.ok) return { ok: true, status: res.status, data: isEnvelope ? (envelope?.data ?? null) : null };
  if (res.status === 429) return { ok: false, kind: "rate-limited", retryAfter: parseRetryAfter(res.headers.get("retry-after")) };
  // Without the envelope the answer is not the API's: no rewrite (404 of this site) or a proxy failure.
  if (!isEnvelope && (res.status === 404 || res.status === 405 || res.status >= 500)) return { ok: false, kind: "unavailable" };
  if (res.status === 501 || res.status === 503) return { ok: false, kind: "unavailable" };

  const error = envelope?.error;
  const code = error?.code ?? null;
  const message = error?.message ?? null;
  const details = toIssues(error?.details);
  if ((res.status === 422 || res.status === 400) && details.length > 0) return { ok: false, kind: "validation", code, message, details };
  return { ok: false, kind: "error", status: res.status, code, message };
}
