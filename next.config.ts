import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
/** Main landing: the wines catalogue lives there (see src/lib/links.ts for the same fallback). */
const LANDING = (process.env.NEXT_PUBLIC_URL_LANDING ?? (isDev ? "http://localhost:3001" : "https://drinks-on-chain-landing.vercel.app")).replace(/\/$/, "");

/**
 * Content Security Policy without nonces: the site is static and holds no
 * user data, and a nonce would force every page to render on the server.
 * Inline scripts stay allowed for Next's bootstrap; every other source is
 * this origin only. `blob:` covers WebGL textures and the audio worklet.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
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
