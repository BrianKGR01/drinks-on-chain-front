import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { NextResponse, type NextRequest } from "next/server";
import { readApiOrigin } from "./api-origin";

/**
 * API proxy with the client's real IP (O1-OPS-1, Wave 1 contract §11 bis). Server only: used by
 * `src/proxy.ts`.
 *
 * The browser calls this site's own `/api/v1/*` (P-1) and this rewrites it to
 * `${API_ORIGIN}/v1/*` (external rewrite: method, streamed body, cookies and the response —status,
 * `Set-Cookie`, `Retry-After`— pass through untouched). On Vercel the connection to the backend
 * comes from Vercel, so signed headers carry the client's IP to the backend's rate limits and
 * captcha check:
 *
 * - `X-DOC-Client-IP`: the IP given by the platform (`x-real-ip` / `x-forwarded-for`);
 * - `X-DOC-Proxy-Timestamp`: Unix seconds;
 * - `X-DOC-Proxy-Signature`: hex HMAC-SHA256, keyed with `PROXY_SHARED_SECRET`, of
 *   `METHOD|PATH_WITH_QUERY|IP|TIMESTAMP` (the path as the backend receives it, `/v1/…?…`, with the
 *   query in canonical form: see `canonicalPathWithQuery`).
 *
 * The backend trusts the IP only when the signature is valid (±60 s); without a secret here
 * nothing is signed and the backend uses the connection's IP, as before. `X-DOC-*` headers sent by
 * the client are always dropped.
 */

export const CLIENT_IP_HEADER = "x-doc-client-ip";
export const TIMESTAMP_HEADER = "x-doc-proxy-timestamp";
export const SIGNATURE_HEADER = "x-doc-proxy-signature";
const PROXY_HEADERS = [CLIENT_IP_HEADER, TIMESTAMP_HEADER, SIGNATURE_HEADER] as const;

const PUBLIC_PREFIX = "/api/v1";

/**
 * Signing secret (`PROXY_SHARED_SECRET`, server variable, never `NEXT_PUBLIC_`). When it holds
 * several comma-separated values (the backend's rotation format) the site signs with the first.
 * Empty = no signature.
 */
export function proxySecret(raw: string | undefined): string | null {
  const first = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .find((s) => s.length > 0);
  return first ?? null;
}

/**
 * Client IP as given by the platform. On Vercel, `x-real-ip` and `x-forwarded-for` are set by
 * the platform itself (it replaces whatever the client sent). Locally Next fills
 * `x-forwarded-for` with the socket's IP; with nothing, `127.0.0.1`. Outside Vercel a proxy in
 * front must rewrite `x-forwarded-for`.
 */
export function clientIpFrom(headers: Headers): string {
  const candidates = [headers.get("x-real-ip"), headers.get("x-forwarded-for")?.split(",")[0]];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isIP(ip) !== 0) return ip;
  }
  return "127.0.0.1";
}

/**
 * Path with the query in canonical form (same as the backend): the path as is and the query
 * re-serialised with `URLSearchParams` (same order; space → `+`). Next and Vercel may re-encode
 * the query when forwarding it (`%20` ↔ `+`); this keeps the signature independent of that.
 */
export function canonicalPathWithQuery(pathWithQuery: string): string {
  const index = pathWithQuery.indexOf("?");
  if (index === -1) return pathWithQuery;
  const query = new URLSearchParams(pathWithQuery.slice(index + 1)).toString();
  const path = pathWithQuery.slice(0, index);
  return query === "" ? path : `${path}?${query}`;
}

/** Hex HMAC-SHA256 of `METHOD|PATH_WITH_QUERY|IP|TIMESTAMP` (canonical path). */
export function signProxyRequest(
  secret: string,
  method: string,
  pathWithQuery: string,
  ip: string,
  timestamp: string,
): string {
  return createHmac("sha256", secret)
    .update(`${method.toUpperCase()}|${canonicalPathWithQuery(pathWithQuery)}|${ip}|${timestamp}`)
    .digest("hex");
}

/** `/api/v1/x?y` → `${origin}/v1/x?y`, keeping the path and query as they came. */
export function upstreamUrl(url: URL, origin: string): URL {
  return new URL(`${origin}${url.pathname.slice("/api".length)}${url.search}`);
}

type ProxyEnv = { API_ORIGIN?: string; PROXY_SHARED_SECRET?: string };

export type ProxyOptions = {
  env?: ProxyEnv;
  /** Unix milliseconds (injectable in tests). */
  now?: number;
};

/** Rewrites a `/api/v1/*` request to the backend with the signed headers. */
export function proxyApiRequest(request: NextRequest, options: ProxyOptions = {}): NextResponse {
  const env = options.env ?? {
    API_ORIGIN: process.env.API_ORIGIN,
    PROXY_SHARED_SECRET: process.env.PROXY_SHARED_SECRET,
  };
  const { pathname } = request.nextUrl;
  if (pathname !== PUBLIC_PREFIX && !pathname.startsWith(`${PUBLIC_PREFIX}/`)) return NextResponse.next();

  // Without API_ORIGIN there is no proxy: /api/v1 answers 404 and the forms say sending is unavailable.
  const origin = readApiOrigin(env.API_ORIGIN);
  if (!origin) return NextResponse.next();

  const target = upstreamUrl(request.nextUrl, origin);
  const headers = new Headers(request.headers);
  for (const name of PROXY_HEADERS) headers.delete(name);

  const secret = proxySecret(env.PROXY_SHARED_SECRET);
  if (secret) {
    const ip = clientIpFrom(request.headers);
    const timestamp = String(Math.floor((options.now ?? Date.now()) / 1000));
    headers.set(CLIENT_IP_HEADER, ip);
    headers.set(TIMESTAMP_HEADER, timestamp);
    headers.set(
      SIGNATURE_HEADER,
      signProxyRequest(secret, request.method, `${target.pathname}${target.search}`, ip, timestamp),
    );
  }

  return NextResponse.rewrite(target, { request: { headers } });
}
