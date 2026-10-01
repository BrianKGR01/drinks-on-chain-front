import { defineConfig, devices } from "@playwright/test";

// Tests run against the production build (`next build && next start`), never
// against a `next dev` the user may be running on 3000.
//
// Two things are decided when the site is built, so each combination under
// test needs its own build (one after another: they share `.next`):
//   lista      what production runs: the waitlist takes the place of the formal
//              application, with an API behind the proxy. Every spec but the two below.
//   solicitud  NEXT_PUBLIC_FLAG_WINERY_APPLICATION=1: the formal application of
//              /unirse and /unirse/verificar (e2e/unirse.spec.ts).
//   sin-api    no API_ORIGIN: the forms say sending is unavailable (e2e/sin-api.spec.ts).
// `pnpm e2e` runs the three; `pnpm e2e:<variant>` runs one.
// Each variant has its own port (E2E_PORT, default 3120, plus 10 and 20: the ports right after
// 3120 belong to the e2e of other repos), so a server left running is never taken for another build.
type Variant = { offset: number; application: boolean; api: boolean; testMatch?: string[]; testIgnore?: string[] };
const VARIANTS = {
  lista: { offset: 0, application: false, api: true, testIgnore: ["**/unirse.spec.ts", "**/sin-api.spec.ts"] },
  solicitud: { offset: 10, application: true, api: true, testMatch: ["**/unirse.spec.ts"] },
  "sin-api": { offset: 20, application: false, api: false, testMatch: ["**/sin-api.spec.ts"] },
} satisfies Record<string, Variant>;

// Locally the installed Chrome; in CI the Chromium that Playwright installs.
const channel = process.env.CI ? undefined : "chrome";
// CI runners have no GPU: Chromium would draw the WebGL valley in software and
// starve the main thread. There the tests run without WebGL, as a visitor on a
// device without it would (the scene disables itself). Locally the map renders
// unless E2E_NO_WEBGL=1.
const launchOptions = process.env.CI || process.env.E2E_NO_WEBGL ? { args: ["--disable-3d-apis"] } : {};

export function e2eConfig(variant: keyof typeof VARIANTS) {
  const v: Variant = VARIANTS[variant];
  const port = Number(process.env.E2E_PORT ?? 3120) + v.offset;
  return defineConfig({
    testDir: "./e2e",
    testMatch: v.testMatch,
    testIgnore: v.testIgnore,
    outputDir: `test-results/${variant}`,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: `playwright-report/${variant}` }]] : "list",
    use: {
      baseURL: `http://localhost:${port}`,
      locale: "es-BO",
      trace: "retain-on-failure",
    },
    projects: [
      { name: "escritorio", use: { ...devices["Desktop Chrome"], channel, launchOptions } },
      { name: "movil", use: { ...devices["Pixel 7"], channel, launchOptions } },
    ],
    webServer: {
      command: `pnpm build && pnpm exec next start --port ${port}`,
      env: {
        ...(process.env as Record<string, string>),
        // The tests intercept /api/v1 in the browser (page.route): the rewrite target is never reached,
        // but it must exist for the forms to offer sending. Empty values win over a local .env file.
        API_ORIGIN: v.api ? (process.env.E2E_API_ORIGIN ?? "http://127.0.0.1:9") : "",
        NEXT_PUBLIC_FLAG_WINERY_APPLICATION: v.application ? "1" : "",
      },
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  });
}

export default e2eConfig("lista");
