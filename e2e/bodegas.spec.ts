import { expect, test, type Page } from "@playwright/test";
import { E2E_MARKETPLACE } from "./env";
import { API_PARTNERS, DIRECTORY_ROUTE, directoryBody, mockDirectory, seriousViolations, settle, trackErrors } from "./support";

// O2-WEB-1 (ORG-11): /bodegas reads the public profiles of the API through /api/v1 and keeps the
// directory of src/content when the API fails, is slow or comes back empty. The API is intercepted
// in the browser (page.route). This build has NEXT_PUBLIC_URL_APP (playwright.config.ts), so the
// links to the Marketplace exist; e2e/sin-marketplace.spec.ts and e2e/sin-api.spec.ts cover the rest.

const [ALTOS] = API_PARTNERS;
/** A winery that only the API knows, in a valley of the map. */
const NUEVA = {
  slug: "vinos-del-sur",
  tradeName: "Vinos del Sur",
  region: "Valle de Cinti · Villa Abecia",
  category: "WINERY",
  logoUrl: "/mocks/uploads/logos/sur.png",
  publicStory: "Viñedo familiar de Villa Abecia.",
  website: null,
};
/** Another one, in a region that is not on the map. */
const LEJANA = { slug: "destileria-del-norte", tradeName: "Destilería del Norte", region: "Samaipata", category: "DISTILLERY", logoUrl: null, publicStory: null, website: null };

const CONTENT_NAMES = ["Bodega Altos de Calamuchita", "Destilería Cinti Viejo", "Viñedos del Guadalquivir", "Casa Uriondo"];

const list = (page: Page) => page.locator("ul[data-directory]");
const cards = (page: Page) => list(page).getByRole("listitem");
const names = (page: Page) => list(page).getByRole("heading", { level: 3 });
const card = (page: Page, name: string) => cards(page).filter({ has: page.getByRole("heading", { level: 3, name, exact: true }) });

test.describe("/bodegas con la API", () => {
  test("la API decide las socias; lo demás sale de src/content", async ({ page }) => {
    const errors = trackErrors(page);
    const calls = await mockDirectory(page, [{ ...ALTOS, tradeName: "Altos de Calamuchita S.R.L." }, NUEVA, LEJANA]);
    await page.goto("/bodegas");
    await expect(list(page)).toHaveAttribute("data-directory", "api");

    // Cinti Viejo is "socia" in src/content but the API does not list it; the two that are not partners stay.
    await expect(names(page)).toHaveText(["Altos de Calamuchita S.R.L.", "Vinos del Sur", "Destilería del Norte", "Viñedos del Guadalquivir", "Casa Uriondo"]);

    // A winery this site has a page for: its page here, and its page in the Marketplace.
    const altos = card(page, "Altos de Calamuchita S.R.L.");
    await expect(altos.getByRole("link", { name: "Altos de Calamuchita S.R.L.", exact: true })).toHaveAttribute("href", "/bodegas/altos-de-calamuchita");
    await expect(altos.getByRole("link", { name: "Altos de Calamuchita S.R.L. en el Marketplace" })).toHaveAttribute("href", `${E2E_MARKETPLACE}/bodegas/altos-de-calamuchita`);
    await expect(altos.getByText("Socia", { exact: true })).toBeVisible();
    await expect(altos.locator("svg")).toHaveCount(1);

    // A winery only the API knows: straight to the Marketplace, with what the API says about it.
    const nueva = card(page, "Vinos del Sur");
    await expect(nueva.getByRole("link")).toHaveCount(1);
    await expect(nueva.getByRole("link", { name: "Vinos del Sur", exact: true })).toHaveAttribute("href", `${E2E_MARKETPLACE}/bodegas/vinos-del-sur`);
    await expect(nueva).toContainText("Bodega · Valle de Cinti · Villa Abecia");
    await expect(nueva).toContainText("Viñedo familiar de Villa Abecia.");
    await expect(nueva.getByText("Socia", { exact: true })).toBeVisible();
    await expect(nueva.locator("svg")).toHaveCount(1); // the valley named by its region
    const lejana = card(page, "Destilería del Norte");
    await expect(lejana).toContainText("Destilería · Samaipata");
    await expect(lejana.locator("svg")).toHaveCount(0); // a region that is not on the map: no drawing

    // Not partners: no Marketplace page to send anyone to.
    const guadalquivir = card(page, "Viñedos del Guadalquivir");
    await expect(guadalquivir.getByText("En conversación", { exact: true })).toBeVisible();
    await expect(guadalquivir.getByRole("link")).toHaveCount(1);
    await expect(guadalquivir.getByRole("link")).toHaveAttribute("href", "/bodegas/vinedos-del-guadalquivir");

    // One request, same origin, as a public application; the logos of /mocks/uploads are never asked for.
    expect(calls).toHaveLength(1);
    expect(new URL(calls[0].url).pathname + new URL(calls[0].url).search).toBe("/api/v1/public/wineries?limit=100&offset=0");
    expect(calls[0].headers["x-client-app"]).toBe("PUBLIC");
    expect(calls[0].headers.cookie).toBeUndefined();
    await expect(page.locator('main img[src*="uploads"]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("con las mismas socias que src/content la página no cambia de forma", async ({ page }) => {
    await mockDirectory(page);
    await page.goto("/bodegas");
    await expect(list(page)).toHaveAttribute("data-directory", "api");
    await expect(names(page)).toHaveText(CONTENT_NAMES);
    await expect(cards(page).locator("svg")).toHaveCount(4);
    // The sites of the development data (*.test) lead nowhere: no link to them anywhere.
    await expect(page.locator('a[href*=".test"]:not([href^="' + E2E_MARKETPLACE + '"])')).toHaveCount(0);
  });

  test("en inglés: la traducción del contenido, y el texto de la API marcado como español", async ({ page }) => {
    await mockDirectory(page, [ALTOS, NUEVA]);
    await page.goto("/bodegas");
    await page.getByRole("button", { name: "MENU" }).click();
    await page.getByRole("dialog", { name: "MENU" }).getByRole("button", { name: "EN", exact: true }).click();
    await page.getByRole("dialog", { name: "MENU" }).getByRole("button", { name: "Close" }).click();

    await expect(page.getByRole("heading", { level: 2, name: "Wineries" })).toBeVisible();
    const altos = card(page, "Bodega Altos de Calamuchita");
    await expect(altos).toContainText("Family winery on the Santa Ana hills");
    await expect(altos.getByRole("link", { name: "Bodega Altos de Calamuchita on the Marketplace" })).toBeVisible();
    const nueva = card(page, "Vinos del Sur");
    await expect(nueva).toContainText("Winery · Valle de Cinti · Villa Abecia");
    await expect(nueva.getByText("Viñedo familiar de Villa Abecia.")).toHaveAttribute("lang", "es");
  });

  test("teclado: el enlace al Marketplace de una tarjeta se alcanza y muestra el foco", async ({ page }) => {
    await mockDirectory(page);
    await page.goto("/bodegas");
    await expect(list(page)).toHaveAttribute("data-directory", "api");
    const own = card(page, "Bodega Altos de Calamuchita").getByRole("link", { name: "Bodega Altos de Calamuchita", exact: true });
    await own.focus();
    await page.keyboard.press("Tab");
    const market = card(page, "Bodega Altos de Calamuchita").getByRole("link", { name: "Bodega Altos de Calamuchita en el Marketplace" });
    await expect(market).toBeFocused();
    expect(await market.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  });

  test("axe sin violaciones serias con el directorio de la API", async ({ page }) => {
    await mockDirectory(page, [ALTOS, NUEVA, LEJANA]);
    await page.goto("/bodegas");
    await expect(list(page)).toHaveAttribute("data-directory", "api");
    await settle(page, 1000);
    expect(await seriousViolations(page)).toEqual([]);
  });
});

test.describe("/bodegas cuando la API no sirve: respaldo de src/content", () => {
  const fallback = async (page: Page) => {
    await expect(names(page)).toHaveText(CONTENT_NAMES);
    await expect(list(page)).toHaveAttribute("data-directory", "content");
    // The partners of src/content still link to the Marketplace: the variable exists in this build.
    await expect(card(page, "Destilería Cinti Viejo").getByRole("link", { name: "Destilería Cinti Viejo en el Marketplace" })).toHaveAttribute(
      "href",
      `${E2E_MARKETPLACE}/bodegas/destileria-cinti-viejo`,
    );
  };

  test("el HTML ya trae el directorio, sin JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/bodegas");
    await expect(names(page)).toHaveText(CONTENT_NAMES);
    await context.close();
  });

  for (const [name, fulfill] of [
    ["500 de la API", { status: 500, contentType: "application/json", body: JSON.stringify({ success: false, statusCode: 500, error: { code: "INTERNAL", message: "x", details: null } }) }],
    ["500 sin sobre (proxy sin destino)", { status: 500, contentType: "text/plain", body: "Internal Server Error" }],
    ["404 (sin proxy)", { status: 404, contentType: "text/html", body: "<html>404</html>" }],
    ["red vacía", { status: 200, contentType: "application/json", body: JSON.stringify(directoryBody([])) }],
    ["200 con otra forma", { status: 200, contentType: "application/json", body: JSON.stringify({ items: API_PARTNERS }) }],
    ["200 que no es JSON", { status: 200, contentType: "text/html", body: "<html>hola</html>" }],
    ["solo perfiles inválidos", { status: 200, contentType: "application/json", body: JSON.stringify(directoryBody([{ slug: "", tradeName: "" }, null, 7])) }],
  ] as const) {
    test(`${name} → src/content`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      let calls = 0;
      await page.route(DIRECTORY_ROUTE, async (route) => {
        calls++;
        await route.fulfill(fulfill);
      });
      await page.goto("/bodegas");
      await expect.poll(() => calls).toBe(1);
      await settle(page, 300);
      await fallback(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test("sin red → src/content", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await page.route(DIRECTORY_ROUTE, (route) => route.abort("failed"));
    await page.goto("/bodegas");
    await settle(page, 300);
    await fallback(page);
    expect(pageErrors).toEqual([]);
  });

  test("una API lenta no retrasa la página: primero src/content, después la API", async ({ page }) => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    await page.route(DIRECTORY_ROUTE, async (route) => {
      await gate;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(directoryBody([ALTOS, NUEVA])) });
    });
    await page.goto("/bodegas");
    // The API has not answered: the page is complete with the content.
    await fallback(page);
    release();
    await expect(list(page)).toHaveAttribute("data-directory", "api");
    await expect(names(page)).toHaveText(["Bodega Altos de Calamuchita", "Vinos del Sur", "Viñedos del Guadalquivir", "Casa Uriondo"]);
  });

  test("al volver a /bodegas dentro del sitio no se pregunta otra vez", async ({ page }) => {
    const calls = await mockDirectory(page);
    await page.goto("/bodegas");
    await expect(list(page)).toHaveAttribute("data-directory", "api");
    await card(page, "Destilería Cinti Viejo").getByRole("link", { name: "Destilería Cinti Viejo", exact: true }).click();
    await expect(page).toHaveURL("/bodegas/destileria-cinti-viejo");
    await page.getByRole("contentinfo").getByRole("link", { name: "Bodegas", exact: true }).click();
    await expect(page).toHaveURL("/bodegas");
    await expect(list(page)).toHaveAttribute("data-directory", "api");
    expect(calls).toHaveLength(1);
  });
});

test.describe("ficha de una bodega", () => {
  test("socia según la API: enlaza a su página del Marketplace y muestra su sitio web", async ({ page }) => {
    const errors = trackErrors(page);
    await mockDirectory(page, [{ ...ALTOS, website: "https://www.altosdecalamuchita.bo/" }]);
    await page.goto("/bodegas/altos-de-calamuchita");
    await expect(page.getByRole("link", { name: "Ver la bodega en el Marketplace →" })).toHaveAttribute("href", `${E2E_MARKETPLACE}/bodegas/altos-de-calamuchita`);
    const site = page.getByRole("link", { name: "altosdecalamuchita.bo" });
    await expect(site).toHaveAttribute("href", "https://www.altosdecalamuchita.bo/");
    await expect(site).toHaveAttribute("rel", /noopener/);
    expect(errors).toEqual([]);
  });

  test("la API no la lista: no hay página del Marketplace, quedan los vinos de la landing", async ({ page }) => {
    await mockDirectory(page, [ALTOS]);
    await page.goto("/bodegas/destileria-cinti-viejo");
    await expect(page.getByRole("link", { name: "Ver vinos en Drinks on Chain →" })).toHaveAttribute("href", /\/vinos$/);
    await expect(page.getByRole("link", { name: /Marketplace →/ })).toHaveCount(0);
  });

  test("API caída: la ficha es la de src/content y la socia enlaza al Marketplace", async ({ page }) => {
    await page.route(DIRECTORY_ROUTE, (route) => route.fulfill({ status: 500, contentType: "text/plain", body: "Internal Server Error" }));
    await page.goto("/bodegas/destileria-cinti-viejo");
    await expect(page.getByRole("heading", { name: "Destilería Cinti Viejo" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver la bodega en el Marketplace →" })).toHaveAttribute("href", `${E2E_MARKETPLACE}/bodegas/destileria-cinti-viejo`);
    await expect(page.getByText("Sitio web")).toHaveCount(0);
  });

  test("una bodega que no es socia no enlaza al Marketplace", async ({ page }) => {
    await mockDirectory(page);
    await page.goto("/bodegas/casa-uriondo");
    await expect(page.getByRole("heading", { name: "Casa Uriondo" }).first()).toBeVisible();
    await expect(page.locator(`a[href^="${E2E_MARKETPLACE}/bodegas"]`)).toHaveCount(0);
  });
});

test.describe("enlaces al Marketplace", () => {
  test("el pie ofrece el Marketplace y «Verifica una botella»", async ({ page }) => {
    await mockDirectory(page);
    await page.goto("/bodegas");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Marketplace", exact: true })).toHaveAttribute("href", E2E_MARKETPLACE);
    await expect(footer.getByRole("link", { name: "Verifica una botella", exact: true })).toHaveAttribute("href", `${E2E_MARKETPLACE}/b`);
  });

  test("el menú y /acceso ofrecen «Verifica una botella»", async ({ page }) => {
    await page.goto("/acceso");
    await expect(page.getByRole("main").getByRole("link", { name: "Verifica una botella", exact: true })).toHaveAttribute("href", `${E2E_MARKETPLACE}/b`);
    await page.getByRole("button", { name: "MENU" }).click();
    const menu = page.getByRole("dialog", { name: "MENU" });
    const verify = menu.getByRole("link", { name: "Verifica una botella →" });
    await expect(verify).toHaveAttribute("href", `${E2E_MARKETPLACE}/b`);
    // On a phone the menu's footer stacks its outbound links: none is pushed off the screen.
    await expect(verify).toBeInViewport({ ratio: 1 });
    await settle(page, 800);
    expect(await seriousViolations(page)).toEqual([]);
  });
});
