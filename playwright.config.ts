import { defineConfig, devices } from "@playwright/test";

// Smoke tests against the production build (`next build && next start`), never
// against a `next dev` the user may be running on 3000.
const PORT = Number(process.env.E2E_PORT ?? 3120);
// Locally the installed Chrome; in CI the Chromium that Playwright installs.
const channel = process.env.CI ? undefined : "chrome";
// CI runners have no GPU: Chromium would draw the WebGL valley in software and
// starve the main thread. There the tests run without WebGL, as a visitor on a
// device without it would (the scene disables itself). Locally the map renders
// unless E2E_NO_WEBGL=1.
const launchOptions = process.env.CI || process.env.E2E_NO_WEBGL ? { args: ["--disable-3d-apis"] } : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-BO",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], channel, launchOptions } },
    { name: "movil", use: { ...devices["Pixel 7"], channel, launchOptions } },
  ],
  webServer: {
    command: `pnpm build && pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
