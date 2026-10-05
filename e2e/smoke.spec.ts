import { expect, test } from "@playwright/test";
import { enter, mockDirectory, seriousViolations, settle, trackErrors } from "./support";

// Smoke tests of the bodegas site (plan/04 §1, sitios públicos). The WebGL map
// may not render on a machine without a GPU (CI): these tests check the page
// and its accessible controls, never the canvas.

const WINERY = "destileria-cinti-viejo";

// /bodegas and the winery pages ask the API for the public profiles: here it answers with the
// partners of src/content (e2e/bodegas.spec.ts covers the other answers).
test.beforeEach(async ({ page }) => {
  await mockDirectory(page);
});

test.describe("mapa y barrera de edad", () => {
  // the WebGL scene makes these pages slow to settle on machines without a GPU
  test.describe.configure({ timeout: 60_000 });

  test("la portada carga sin errores y se entra confirmando la edad", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    const gate = page.getByRole("dialog", { name: "Confirmación de mayoría de edad" });
    await expect(gate).toBeVisible();
    await expect(gate.getByRole("button", { name: "Entrar" })).toBeFocused();

    await enter(page);
    // The map's accessible controls: layer switch and the parcel navigator.
    const layers = page.getByRole("group", { name: "Capa del mapa" });
    await expect(layers.getByRole("button", { name: "Parcelas" })).toHaveAttribute("aria-pressed", "true");
    await layers.getByRole("button", { name: "Bodegas" }).click();
    await expect(layers.getByRole("button", { name: "Bodegas" })).toHaveAttribute("aria-pressed", "true");
    await layers.getByRole("button", { name: "Parcelas" }).click();

    // The parcel navigator: choosing a parcel frames it and offers the way back to the valley.
    const nav = page.getByRole("navigation", { name: "Parcelas" });
    await nav.getByRole("button", { name: "Calamuchita" }).click();
    const back = page.getByRole("button", { name: "Volver al valle" });
    await expect(back).toBeVisible();
    await back.click();
    await expect(layers.getByRole("button", { name: "Parcelas" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("sin confirmar la edad no se accede al mapa", async ({ page }) => {
    await page.goto("/");
    const gate = page.getByRole("dialog", { name: "Confirmación de mayoría de edad" });
    await expect(gate).toBeVisible();
    // The HUD stays out of reach: every sibling of the gate is inert and Tab never leaves the dialog.
    await expect(page.locator("main > :not([role=dialog])").first()).toHaveAttribute("inert", "");
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const a = document.activeElement;
        return !a || a === document.body || !!a.closest("[role=dialog]");
      });
      expect(inside).toBe(true);
    }
    // Coming back asks again (the confirmation is not remembered across visits).
    await page.reload();
    await expect(page.getByRole("dialog", { name: "Confirmación de mayoría de edad" })).toBeVisible();
  });

  test("el menú lleva a las páginas de la red", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await enter(page);
    for (const [name, path] of [
      ["Bodegas", "/bodegas"],
      ["Puntos de canje", "/puntos-de-recojo"],
      ["Unirse", "/lista-de-espera"],
      ["Acceso", "/acceso"],
    ] as const) {
      await page.getByRole("button", { name: "MENU" }).click();
      const menu = page.getByRole("dialog", { name: "MENU" });
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
});

test.describe("rutas", () => {
  for (const [path, heading] of [
    ["/bodegas", "Bodegas"],
    [`/bodegas/${WINERY}`, "Destilería Cinti Viejo"],
    ["/puntos-de-recojo", "Puntos de canje"],
    ["/lista-de-espera", "Tu bodega, entre las primeras de la red"],
    ["/unirse", "Unirse a la red"],
    ["/acceso", "Acceso"],
  ] as const) {
    test(`ruta ${path}`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("/acceso muestra las dos puertas y no pide credenciales", async ({ page }) => {
    await page.goto("/acceso");
    await expect(page.getByRole("heading", { name: "ERP de trazabilidad" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aplicación de canje" })).toBeVisible();
    await expect(page.locator("input[type=password]")).toHaveCount(0);
  });

  test("/parcelas/… redirige a /valles/… de forma permanente", async ({ page, request }) => {
    const old = "/parcelas/valle-central-de-tarija/santa-ana-la-vieja";
    const res = await request.get(old, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe("/valles/valle-central-de-tarija/santa-ana-la-vieja");
    await page.goto(old);
    await expect(page).toHaveURL("/valles/valle-central-de-tarija/santa-ana-la-vieja");
    await expect(page.getByRole("heading", { name: /Santa Ana la Vieja/i }).first()).toBeVisible();
  });

  test("/vinos lleva al catálogo de la landing", async ({ request }) => {
    const res = await request.get("/vinos", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toMatch(/\/vinos$/);
  });
});

test.describe("accesibilidad", () => {
  test("axe en la portada", async ({ page }) => {
    await page.goto("/");
    await enter(page);
    await settle(page);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("axe en una página interior", async ({ page }) => {
    await page.goto(`/bodegas/${WINERY}`);
    await settle(page, 1000);
    expect(await seriousViolations(page)).toEqual([]);
  });
});
