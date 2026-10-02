import AxeBuilder from "@axe-core/playwright";
import type { Page, Route } from "@playwright/test";

/**
 * Console errors, uncaught exceptions and failed requests of this site.
 * Ignored: browser-extension noise (wallet providers inject scripts), the
 * Vercel Web Analytics script (it only exists on Vercel), Cloudflare
 * Turnstile (its private-access-token probes answer 401) and the WebGL
 * driver messages of machines without a GPU (CI): the map may not render
 * there, and the scene disables itself without breaking the page.
 */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  const noise = /chrome-extension:|moz-extension:|MetaMask|ethereum|_vercel\/insights|challenges\.cloudflare\.com|WebGL|GPU stall|GroupMarkerNotSet/i;
  page.on("pageerror", (e) => !noise.test(`${e.message} ${e.stack ?? ""}`) && errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = `${m.text()} ${m.location().url}`;
    if (noise.test(text) || m.text().startsWith("Failed to load resource")) return;
    errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() < 400 || noise.test(r.url())) return;
    errors.push(`${r.status()} ${new URL(r.url()).pathname}`);
  });
  return errors;
}

/** Axe (WCAG 2.1 A and AA): only the serious and critical violations fail a test. */
export async function seriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // the WebGL canvas is decorative and may not exist without a GPU
    .exclude("[data-scene-root]")
    .analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ")) }));
}

/** Passes the age gate of the home (the bodegas site asks on every new visit to the map). */
export async function enter(page: Page) {
  const gate = page.getByRole("dialog", { name: "Confirmación de mayoría de edad" });
  await gate.getByRole("button", { name: "Entrar" }).click();
  await gate.waitFor({ state: "detached" });
}

/** Waits until entrance animations settle, so contrast is measured on final colours. */
export async function settle(page: Page, ms = 2000) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(ms);
}

/* Directory of wineries of the API (`GET /api/v1/public/wineries`), intercepted in the browser. */

export const DIRECTORY_ROUTE = "**/api/v1/public/wineries?*";

export interface ProfileBody {
  slug: string;
  tradeName: string;
  region: string;
  category: string;
  logoUrl: string | null;
  publicStory: string | null;
  website: string | null;
}

/** What the development API answers today for the two partners of `src/content` (logos and sites that lead nowhere). */
export const API_PARTNERS: ProfileBody[] = [
  {
    slug: "altos-de-calamuchita",
    tradeName: "Bodega Altos de Calamuchita",
    region: "Valle Central de Tarija · Santa Ana",
    category: "WINERY",
    logoUrl: "/mocks/uploads/logos/altos.png",
    publicStory: "Bodega familiar en las lomas de Santa Ana, con viñedos en Santa Ana la Nueva y Calamuchita. Registra cada lote en el ERP desde la vendimia.",
    website: "https://altos.test",
  },
  {
    slug: "destileria-cinti-viejo",
    tradeName: "Destilería Cinti Viejo",
    region: "Valle de Cinti · Camargo",
    category: "DISTILLERY",
    logoUrl: "/mocks/uploads/logos/cintiviejo.png",
    publicStory: "Destilería del cañón de Cinti, con parrales de Moscatel de Alejandría en Camargo y Palca Grande.",
    website: "https://cintiviejo.test",
  },
];

/** The API's envelope around a page of the directory. */
export const directoryBody = (items: unknown[]) => ({
  success: true,
  statusCode: 200,
  timestamp: "2026-10-02T12:00:00.000Z",
  path: "/v1/public/wineries",
  data: { items, total: items.length, limit: 100, offset: 0 },
});

/** Answers the directory with these profiles (default: the partners of `src/content`). Returns the requests seen. */
export async function mockDirectory(page: Page, items: unknown[] = API_PARTNERS) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  await page.route(DIRECTORY_ROUTE, async (route: Route) => {
    calls.push({ url: route.request().url(), headers: route.request().headers() });
    await route.fulfill({ status: 200, contentType: "application/json; charset=utf-8", body: JSON.stringify(directoryBody(items)) });
  });
  return calls;
}
