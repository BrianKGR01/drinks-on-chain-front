import { expect, test, type Page, type Route } from "@playwright/test";
import { seriousViolations, settle, trackErrors } from "./support";

// O1-WEB-1: the winery application of /unirse and the email check of
// /unirse/verificar. The API is intercepted in the browser (page.route);
// the run against the real backend belongs to the E2E track.

const APPLY = "**/api/v1/public/winery-applications";
const VERIFY = "**/api/v1/public/winery-applications/verify";

/**
 * Cloudflare Turnstile stand-in: same explicit-render API, issues a token
 * right away and a new one on every reset. Keeps the tests off the network.
 */
const TURNSTILE_STUB = `(() => {
  const widgets = {};
  let n = 0;
  const issue = (id) => setTimeout(() => { const w = widgets[id]; if (w) w.callback("e2e-token-" + (++w.count)); }, 30);
  window.turnstile = {
    render(el, o) { const id = "w" + (++n); widgets[id] = { callback: o.callback, count: 0 }; el.setAttribute("data-sitekey", o.sitekey); issue(id); return id; },
    reset(id) { issue(id); },
    remove(id) { delete widgets[id]; },
  };
})();`;

async function stubTurnstile(page: Page) {
  await page.route("https://challenges.cloudflare.com/turnstile/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE_STUB }),
  );
}

const envelope = (statusCode: number, data: unknown) => ({ success: true, statusCode, timestamp: new Date().toISOString(), path: "/v1/public/winery-applications", data });
const failure = (statusCode: number, code: string, message: string, details: { field: string | null; message: string }[] | null) => ({
  success: false,
  statusCode,
  timestamp: new Date().toISOString(),
  path: "/v1/public/winery-applications",
  error: { code, message, details },
});

async function openForm(page: Page) {
  await stubTurnstile(page);
  await page.goto("/unirse");
  const form = page.locator("#formulario");
  await form.scrollIntoViewIfNeeded();
  // the Turnstile token arrives once the widget is near the viewport
  await expect(page.locator('[data-captcha="ready"]')).toHaveCount(1);
  return form;
}

async function fillForm(page: Page) {
  await page.getByLabel("Razón social").fill("Viñedos del Sur S.R.L.");
  await page.getByLabel("Nombre comercial").fill("Viñedos del Sur");
  await page.getByLabel("NIT", { exact: true }).fill("1029384756");
  await page.getByLabel("Categoría").selectOption("DISTILLERY");
  await page.getByLabel("Región").selectOption("Valle de Cinti");
  await page.getByLabel("Nombre y apellido").fill("Ana Quiroga");
  await page.getByLabel("Correo", { exact: true }).fill("ana@vinedosdelsur.bo");
  await page.getByLabel("Teléfono (opcional)").fill("+591 70000000");
  await page.getByLabel("Cuéntanos sobre tu bodega (opcional)").fill("Singani de altura en Camargo.");
  await page.getByRole("checkbox", { name: /Acepto que Drinks on Chain/ }).check();
}

const submit = (page: Page) => page.getByRole("button", { name: "Enviar solicitud" }).click();

test.describe("/unirse · solicitud de alta", () => {
  test("envía la solicitud con captcha y campo trampa y explica los siguientes pasos", async ({ page }) => {
    const errors = trackErrors(page);
    let body: Record<string, unknown> | null = null;
    let headers: Record<string, string> = {};
    await page.route(APPLY, async (route: Route) => {
      body = route.request().postDataJSON();
      headers = route.request().headers();
      await route.fulfill({ status: 202, json: envelope(202, { id: "app_1", status: "UNVERIFIED" }) });
    });
    await openForm(page);
    await fillForm(page);
    // Keyboard: submitting from a field with Enter.
    await page.getByLabel("Nombre comercial").press("Enter");

    const done = page.getByRole("heading", { name: "Revisa tu correo" });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(page.getByText("Enviamos un enlace de confirmación a ana@vinedosdelsur.bo")).toBeVisible();
    for (const step of ["Confirma tu correo", "Revisión", "Reunión", "Invitación"]) {
      await expect(page.getByText(step, { exact: true })).toBeVisible();
    }
    expect(body).toEqual({
      legalName: "Viñedos del Sur S.R.L.",
      tradeName: "Viñedos del Sur",
      taxId: "1029384756",
      category: "DISTILLERY",
      region: "Valle de Cinti",
      contactName: "Ana Quiroga",
      contactEmail: "ana@vinedosdelsur.bo",
      contactPhone: "+591 70000000",
      message: "Singani de altura en Camargo.",
      captchaToken: "e2e-token-1",
      website: "",
    });
    expect(headers["x-client-app"]).toBe("PUBLIC");
    expect(headers.cookie).toBeUndefined();
    expect(errors).toEqual([]);

    // Another application starts from an empty form.
    await page.getByRole("button", { name: "Enviar otra solicitud" }).click();
    await expect(page.getByLabel("Razón social")).toHaveValue("");
  });

  test("el campo trampa está fuera de la vista, del tabulador y de la accesibilidad", async ({ page }) => {
    await openForm(page);
    const trap = page.locator('input[name="website"]');
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("autocomplete", "off");
    await expect(page.locator('[aria-hidden="true"] input[name="website"]')).toHaveCount(1);
    await expect(trap).not.toBeInViewport();
    // Tab from the message goes past the trap.
    await page.getByLabel("Cuéntanos sobre tu bodega (opcional)").focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.getAttribute("name"))).not.toBe("website");
    }
  });

  test("valida en el cliente sin enviar y lleva el foco al primer error", async ({ page }) => {
    let calls = 0;
    await page.route(APPLY, (route) => {
      calls++;
      return route.abort();
    });
    await openForm(page);
    await page.getByLabel("Correo", { exact: true }).fill("no-es-un-correo");
    await submit(page);
    const legal = page.getByLabel("Razón social");
    await expect(legal).toBeFocused();
    await expect(legal).toHaveAttribute("aria-invalid", "true");
    await expect(legal).toHaveAccessibleDescription("Este campo es obligatorio.");
    await expect(page.getByLabel("Correo", { exact: true })).toHaveAccessibleDescription("Escribe un correo válido.");
    await expect(page.getByText("Necesitamos tu conformidad para gestionar la solicitud.")).toBeVisible();
    await expect(page.getByText("Revisa los campos marcados.")).toBeVisible();
    // Typing clears the field's error.
    await legal.fill("Viñedos del Sur S.R.L.");
    await expect(legal).not.toHaveAttribute("aria-invalid", "true");
    expect(calls).toBe(0);
  });

  test("marca en su campo los errores 422 del servidor", async ({ page }) => {
    let calls = 0;
    await page.route(APPLY, (route) => {
      calls++;
      return route.fulfill({
        status: 422,
        json: failure(422, "VALIDATION_ERROR", "Datos no válidos", [
          { field: "taxId", message: "El NIT debe tener entre 5 y 15 dígitos" },
          { field: "contactEmail", message: "El correo no es válido" },
        ]),
      });
    });
    await openForm(page);
    await fillForm(page);
    await submit(page);

    const nit = page.getByLabel("NIT", { exact: true });
    await expect(nit).toBeFocused();
    await expect(nit).toHaveAttribute("aria-invalid", "true");
    await expect(nit).toHaveAccessibleDescription("El NIT debe tener entre 5 y 15 dígitos");
    await expect(page.getByLabel("Correo", { exact: true })).toHaveAccessibleDescription("El correo no es válido");
    await expect(page.getByRole("status").filter({ hasText: "Revisa los campos marcados." })).toBeVisible();
    // The data stays, and a fresh captcha token is issued for the next attempt.
    await expect(page.getByLabel("Razón social")).toHaveValue("Viñedos del Sur S.R.L.");
    await expect(page.locator('[data-captcha="ready"]')).toHaveCount(1);
    await nit.fill("1029384756");
    await submit(page);
    await expect.poll(() => calls).toBe(2);
  });

  test("429: dice cuánto esperar", async ({ page }) => {
    await page.route(APPLY, (route) =>
      route.fulfill({
        status: 429,
        headers: { "Retry-After": "120" },
        json: failure(429, "TOO_MANY_REQUESTS", "Demasiadas solicitudes", null),
      }),
    );
    await openForm(page);
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("status").filter({ hasText: "Vuelve a intentarlo en 2 minutos." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Revisa tu correo" })).toHaveCount(0);
  });

  test("error de red: avisa y conserva los datos", async ({ page }) => {
    await page.route(APPLY, (route) => route.abort("internetdisconnected"));
    await openForm(page);
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("status").filter({ hasText: "No pudimos conectar con el servidor." })).toBeVisible();
    await expect(page.getByLabel("Nombre comercial")).toHaveValue("Viñedos del Sur");
  });

  test("sin API detrás del proxy: el envío no está disponible", async ({ page }) => {
    await page.route(APPLY, (route) => route.fulfill({ status: 404, contentType: "text/html", body: "<!doctype html><title>404</title>" }));
    await openForm(page);
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("status").filter({ hasText: "El envío de solicitudes no está disponible en este momento." })).toBeVisible();
  });

  test("un punto de canje recibe el correo de contacto en lugar del formulario", async ({ page }) => {
    await stubTurnstile(page);
    await page.goto("/unirse?tipo=punto#formulario");
    await expect(page.getByRole("radio", { name: "Un punto de canje" })).toBeChecked();
    await expect(page.getByRole("link", { name: "puntos@drinksonchain.bo" })).toBeVisible();
    await expect(page.getByLabel("Razón social")).toHaveCount(0);
    await page.getByRole("radio", { name: "Una bodega o destilería" }).check();
    await expect(page.getByLabel("Razón social")).toBeVisible();
  });

  test("axe sin violaciones serias en el formulario y en el éxito", async ({ page }) => {
    await page.route(APPLY, (route) => route.fulfill({ status: 202, json: envelope(202, { id: "app_1", status: "UNVERIFIED" }) }));
    await openForm(page);
    await submit(page); // with the client errors on screen
    await settle(page, 500);
    expect(await seriousViolations(page)).toEqual([]);
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("heading", { name: "Revisa tu correo" })).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
});

test.describe("/unirse/verificar · confirmación del correo", () => {
  test("token válido: confirma el correo", async ({ page }) => {
    const errors = trackErrors(page);
    let body: unknown = null;
    await page.route(VERIFY, (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({ status: 204 });
    });
    await page.goto("/unirse/verificar?token=apv_valido");
    const heading = page.getByRole("heading", { name: "Correo confirmado" });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    expect(body).toEqual({ token: "apv_valido" });
    expect(errors).toEqual([]);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("token inválido o caducado: lo dice y ofrece una nueva solicitud", async ({ page }) => {
    await page.route(VERIFY, (route) =>
      route.fulfill({
        status: 422,
        json: failure(422, "APPLICATION_TOKEN_INVALID", "El enlace de verificación no es válido o ya se usó", [
          { field: "token", message: "El enlace de verificación no es válido o ya se usó" },
        ]),
      }),
    );
    await page.goto("/unirse/verificar?token=apv_caducado");
    await expect(page.getByRole("heading", { name: "Enlace no válido" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enviar una nueva solicitud" })).toHaveAttribute("href", "/unirse#formulario");
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("sin token no llama a la API", async ({ page }) => {
    let calls = 0;
    await page.route(VERIFY, (route) => {
      calls++;
      return route.fulfill({ status: 204 });
    });
    await page.goto("/unirse/verificar");
    await expect(page.getByRole("heading", { name: "Enlace no válido" })).toBeVisible();
    expect(calls).toBe(0);
  });

  test("error de red: permite reintentar con el mismo enlace", async ({ page }) => {
    let calls = 0;
    await page.route(VERIFY, (route) => (++calls === 1 ? route.abort("internetdisconnected") : route.fulfill({ status: 204 })));
    await page.goto("/unirse/verificar?token=apv_valido");
    await expect(page.getByText("No pudimos conectar con el servidor.")).toBeVisible();
    await page.getByRole("button", { name: "Volver a intentarlo" }).click();
    await expect(page.getByRole("heading", { name: "Correo confirmado" })).toBeVisible();
  });

  test("la página de verificación no se indexa", async ({ page }) => {
    await page.route(VERIFY, (route) => route.fulfill({ status: 204 }));
    await page.goto("/unirse/verificar?token=x");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
