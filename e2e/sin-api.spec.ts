import { expect, test } from "@playwright/test";
import { seriousViolations, settle } from "./support";

// Build without API_ORIGIN (playwright.sin-api.config.ts): there is no proxy
// behind /api/v1, and the forms say so instead of failing after the visitor
// filled them in.

const NOTICE = "La lista de espera todavía no recibe inscripciones desde este sitio.";

test.describe("sin API_ORIGIN", () => {
  test("/lista-de-espera avisa con amabilidad y no deja enviar", async ({ page }) => {
    let calls = 0;
    page.on("request", (r) => {
      if (r.url().includes("/api/v1/")) calls++;
    });
    await page.goto("/lista-de-espera?src=tarija-2026");
    await expect(page.getByRole("heading", { name: "Tu bodega, entre las primeras de la red" })).toBeVisible();
    const notice = page.getByText(NOTICE);
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("bodegas@drinksonchain.bo");
    const button = page.getByRole("button", { name: "Anotar mi bodega" });
    await expect(button).toBeDisabled();
    // The form points at the notice, so a screen reader hears why it cannot be sent.
    await expect(page.locator("#formulario form")).toHaveAccessibleDescription(new RegExp(NOTICE));
    await page.getByLabel("Nombre de la bodega").fill("Viñedos del Sur");
    await page.getByLabel("Nombre de la bodega").press("Enter");
    await expect(page.getByRole("heading", { name: "Tu bodega está en la lista" })).toHaveCount(0);
    expect(calls).toBe(0);
    await settle(page, 500);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("/unirse muestra el mismo aviso en la lista incrustada", async ({ page }) => {
    await page.goto("/unirse");
    await expect(page.getByText(NOTICE)).toBeVisible();
    await expect(page.getByRole("button", { name: "Anotar mi bodega" })).toBeDisabled();
  });

  test("/api/v1 responde 404: no hay proxy", async ({ request }) => {
    test.skip(test.info().project.name !== "escritorio", "no browser involved: one project is enough");
    const res = await request.post("/api/v1/public/waitlist", { data: { type: "WINERY" } });
    expect(res.status()).toBe(404);
  });
});
