import type { NextConfig } from "next";
import { readApiOrigin } from "./src/lib/api-origin";

const isDev = process.env.NODE_ENV === "development";
/** Main landing: the wines catalogue lives there (see src/lib/links.ts for the same fallback). */
const LANDING = (process.env.NEXT_PUBLIC_URL_LANDING ?? (isDev ? "http://localhost:3001" : "https://drinks-on-chain-landing.vercel.app")).replace(/\/$/, "");
/** Backend API (server variable). The browser calls `/api/v1/*` of this site and Next proxies it (plan/03 §6, P-1). */
const API_ORIGIN = readApiOrigin();
if (process.env.API_ORIGIN && !API_ORIGIN) console.warn(`API_ORIGIN is not an http(s) URL; /api/v1 stays off: ${process.env.API_ORIGIN}`);
/** Cloudflare Turnstile (anti-bot check of the public forms): its script and its iframe. */
const TURNSTILE = "https://challenges.cloudflare.com";

/**
 * Content Security Policy without nonces: the site is static and holds no
 * user data, and a nonce would force every page to render on the server.
 * Inline scripts stay allowed for Next's bootstrap; every other source is
 * this origin only (Vercel Web Analytics is same-origin; its debug script
 * comes from va.vercel-scripts.com in development only). `blob:` covers
 * WebGL textures. Cloudflare Turnstile needs its script and its iframe.
 * The API is same-origin (`/api/v1` rewrite), so `connect-src` stays 'self'.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TURNSTILE}${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  `frame-src ${TURNSTILE}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  logging: {
    // Do not mirror the browser console into the terminal: extensions such as
    // wallet providers inject noisy scripts that have nothing to do with the app.
    browserToTerminal: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    // Without API_ORIGIN there is no proxy: /api/v1 answers 404 and the forms say sending is unavailable.
    return API_ORIGIN ? [{ source: "/api/v1/:path*", destination: `${API_ORIGIN}/v1/:path*` }] : [];
  },
  async redirects() {
    return [
      // Parcel pages moved under the valleys (02-plan-landing-ecosistema §4).
      { source: "/parcelas/:village/:slug", destination: "/valles/:village/:slug", permanent: true },
      { source: "/parcelas", destination: "/", permanent: true },
      // The wines catalogue belongs to the main landing; not permanent while the root domain is not bought.
      { source: "/vinos", destination: `${LANDING}/vinos`, permanent: false },
    ];
  },
};

export default nextConfig;
