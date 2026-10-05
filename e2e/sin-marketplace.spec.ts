import { expect, test } from "@playwright/test";
import { mockDirectory, seriousViolations, settle, trackErrors } from "./support";

// Build with an API and without NEXT_PUBLIC_URL_APP (playwright.solicitud.config.ts): what
// production runs while the Marketplace has no public URL. The directory still comes from the
// API, and nothing on the site offers a link that would lead nowhere.

const NUEVA = { slug: "vinos-del-sur", tradeName: "Vinos del Sur", region: "Valle de Cinti", category: "WINERY", logoUrl: null, publicStory: "Viñedo familiar.", website: null };

test.describe("sin NEXT_PUBLIC_URL_APP", () => {
  test("/bodegas usa la API y ninguna tarjeta enlaza al Marketplace", async ({ page }) => {
    const errors = trackErrors(page);
    const calls = await mockDirectory(page, [
      { slug: "altos-de-calamuchita", tradeName: "Bodega Altos de Calamuchita", region: "Valle Central de Tarija", category: "WINERY", logoUrl: null, publicStory: null, website: null },
      NUEVA,
    ]);
    await page.goto("/bodegas");
    const list = page.locator("ul[data-directory]");
    await expect(list).toHaveAttribute("data-directory", "api");
    await expect(list.getByRole("heading", { level: 3 })).toHaveText(["Bodega Altos de Calamuchita", "Vinos del Sur", "Viñedos del Guadalquivir", "Casa Uriondo"]);
    expect(calls).toHaveLength(1);

    // The winery this site has a page for keeps its own link; the one only the API knows is plain text.
    const altos = list.getByRole("listitem").filter({ hasText: "Bodega Altos de Calamuchita" });
    await expect(altos.getByRole("link")).toHaveCount(1);
    await expect(altos.getByRole("link")).toHaveAttribute("href", "/bodegas/altos-de-calamuchita");
    const nueva = list.getByRole("listitem").filter({ hasText: "Vinos del Sur" });
    await expect(nueva).toContainText("Viñedo familiar.");
    await expect(nueva.getByRole("link")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Marketplace/ })).toHaveCount(0);

    await settle(page, 800);
    expect(await seriousViolations(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("el pie, el menú y /acceso no ofrecen el Marketplace ni «Verifica una botella»", async ({ page }) => {
    await page.goto("/acceso");
    await expect(page.getByRole("heading", { name: "ERP de trazabilidad" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Marketplace/ })).toHaveCount(0);
    await expect(page.getByText("Verifica una botella")).toHaveCount(0);
    await expect(page.getByText("¿Tienes una botella en la mano?")).toHaveCount(0);
    // The links that were there stay.
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Para consumidores" })).toBeVisible();
    await page.getByRole("button", { name: "MENU" }).click();
    const menu = page.getByRole("dialog", { name: "MENU" });
    await expect(menu.getByRole("link", { name: "Para consumidores →" })).toBeVisible();
    await expect(menu.getByRole("link", { name: /botella/ })).toHaveCount(0);
  });

  test("la ficha de una socia lleva a los vinos de la landing", async ({ page }) => {
    await mockDirectory(page);
    await page.goto("/bodegas/altos-de-calamuchita");
    await expect(page.getByRole("link", { name: "Ver vinos en Drinks on Chain →" })).toHaveAttribute("href", /\/vinos$/);
    await expect(page.getByRole("link", { name: /Marketplace/ })).toHaveCount(0);
  });
});
