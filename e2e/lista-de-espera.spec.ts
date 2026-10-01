import { expect, test, type Page, type Route } from "@playwright/test";
import { parseSource } from "../src/lib/waitlist";
import { seriousViolations, settle, trackErrors } from "./support";

// Waitlist of wineries (contract o1b-lista-de-espera): /lista-de-espera, the
// form embedded in /unirse and the links that lead to it. The API is
// intercepted in the browser (page.route); the run against the real backend
// belongs to the E2E track. Build: the default one (no formal application).

const WAITLIST = "**/api/v1/public/waitlist";
const SHARE_URL = /\/lista-de-espera\?src=bodega-amiga$/;

const envelope = (statusCode: number, data: unknown) => ({ success: true, statusCode, timestamp: new Date().toISOString(), path: "/v1/public/waitlist", data });
const failure = (statusCode: number, code: string, message: string, details: { field: string | null; message: string }[] | null) => ({
  success: false,
  statusCode,
  timestamp: new Date().toISOString(),
  path: "/v1/public/waitlist",
  error: { code, message, details },
});

const joined = (position: number) => (route: Route) => route.fulfill({ status: 201, json: envelope(201, { type: "WINERY", position }) });

async function fillForm(page: Page) {
  await page.getByLabel("Nombre de la bodega").fill("Viñedos del Sur");
  await page.getByLabel("Región").selectOption("Valle de Cinti");
  await page.getByRole("radio", { name: "Singani", exact: true }).check();
  await page.getByLabel("Persona de contacto").fill("Ana Quiroga");
  await page.getByLabel("Correo", { exact: true }).fill("ana@vinedosdelsur.bo");
  await page.getByLabel("WhatsApp").fill("+591 70000000");
  await page.getByLabel("Cuéntanos algo de tu bodega (opcional)").fill("Singani de altura en Camargo.");
  await page.getByRole("checkbox", { name: /Acepto que Drinks on Chain me contacte/ }).check();
}

const submit = (page: Page) => page.getByRole("button", { name: "Anotar mi bodega" }).click();
const done = (page: Page) => page.getByRole("heading", { name: "Tu bodega está en la lista" });

test.describe("/lista-de-espera · inscripción", () => {
  test("desde el QR: sin barrera de edad, se anota y ve su número de orden", async ({ page }) => {
    const errors = trackErrors(page);
    let body: Record<string, unknown> | null = null;
    let headers: Record<string, string> = {};
    await page.route(WAITLIST, async (route) => {
      body = route.request().postDataJSON();
      headers = route.request().headers();
      await joined(7)(route);
    });
    // A cold visit, as from the QR of the event.
    await page.goto("/lista-de-espera?src=tarija-2026");
    await expect(page.getByRole("heading", { name: "Tu bodega, entre las primeras de la red" })).toBeVisible();
    // The age gate belongs to the map: nothing stands between the QR and the form.
    await expect(page.getByRole("dialog", { name: "Confirmación de mayoría de edad" })).toHaveCount(0);
    await expect(page.locator("[inert]:not([role=dialog])")).toHaveCount(0);
    for (const benefit of ["Trazabilidad verificable", "Preventa tokenizada", "Puntos de canje"]) {
      await expect(page.getByRole("heading", { name: benefit })).toBeVisible();
    }

    await page.getByRole("link", { name: "Anotar mi bodega" }).click();
    await expect(page.locator("#formulario")).toBeInViewport();
    await fillForm(page);
    // Keyboard: submitting from a field with Enter.
    await page.getByLabel("Persona de contacto").press("Enter");

    await expect(done(page)).toBeVisible();
    await expect(done(page)).toBeFocused();
    await expect(page.getByText("Número de orden", { exact: true })).toBeVisible();
    await expect(page.getByTestId("waitlist-position")).toHaveText("N.º 7");
    await expect(page.getByText("Anotamos a Viñedos del Sur.")).toBeVisible();
    await expect(page.getByText("se pondrá en contacto contigo por WhatsApp o por correo para conocer la bodega")).toBeVisible();
    await expect(page.getByText("Damos de alta tu cuenta.")).toBeVisible();
    expect(body).toEqual({
      type: "WINERY",
      wineryName: "Viñedos del Sur",
      fullName: "Ana Quiroga",
      email: "ana@vinedosdelsur.bo",
      phone: "+591 70000000",
      region: "Valle de Cinti",
      produces: "SINGANI",
      message: "Singani de altura en Camargo.",
      consent: true,
      locale: "es",
      source: "tarija-2026",
      website: "",
    });
    expect(headers["x-client-app"]).toBe("PUBLIC");
    expect(headers.cookie).toBeUndefined();
    expect(errors).toEqual([]);

    // Another winery starts from an empty form.
    await page.getByRole("button", { name: "Anotar otra bodega" }).click();
    await expect(page.getByLabel("Nombre de la bodega")).toHaveValue("");
  });

  test("sin mensaje ni origen: no envía campos vacíos", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route(WAITLIST, async (route) => {
      body = route.request().postDataJSON();
      await joined(1)(route);
    });
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await page.getByLabel("Cuéntanos algo de tu bodega (opcional)").fill("   ");
    await submit(page);
    await expect(done(page)).toBeVisible();
    expect(body).not.toHaveProperty("message");
    expect(body).not.toHaveProperty("source");
    expect(body).toMatchObject({ type: "WINERY", locale: "es", consent: true, website: "" });
  });

  test("valida en el cliente sin enviar y lleva el foco al primer error", async ({ page }) => {
    let calls = 0;
    await page.route(WAITLIST, (route) => {
      calls++;
      return route.abort();
    });
    await page.goto("/lista-de-espera");
    await page.getByLabel("Correo", { exact: true }).fill("no-es-un-correo");
    await page.getByLabel("WhatsApp").fill("abc");
    await submit(page);
    const name = page.getByLabel("Nombre de la bodega");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("Este campo es obligatorio.");
    await expect(page.getByLabel("Región")).toHaveAccessibleDescription("Elige una opción.");
    await expect(page.getByRole("radiogroup", { name: "Qué produce" })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Correo", { exact: true })).toHaveAccessibleDescription("Escribe un correo válido.");
    await expect(page.getByLabel("WhatsApp")).toHaveAccessibleDescription(/Escribe un número de 7 a 20 caracteres/);
    await expect(page.getByText("Necesitamos tu conformidad para poder contactarte.")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Revisa los campos marcados." })).toBeVisible();
    // Typing clears the field's error.
    await name.fill("Viñedos del Sur");
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    expect(calls).toBe(0);
  });

  test("marca en su campo los errores 422 del servidor", async ({ page }) => {
    let calls = 0;
    await page.route(WAITLIST, (route) => {
      calls++;
      return route.fulfill({
        status: 422,
        json: failure(422, "VALIDATION_ERROR", "Datos no válidos", [
          { field: "email", message: "El correo no es válido" },
          { field: "wineryName", message: "El nombre de la bodega debe tener entre 2 y 160 caracteres" },
          { field: "source", message: "El origen no es válido" },
        ]),
      });
    });
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await submit(page);

    // Focus goes to the first field of the form with an error, whatever the order of the details.
    const name = page.getByLabel("Nombre de la bodega");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("El nombre de la bodega debe tener entre 2 y 160 caracteres");
    await expect(page.getByLabel("Correo", { exact: true })).toHaveAccessibleDescription("El correo no es válido");
    // A detail that is not a field of the form is said next to the button.
    await expect(page.getByRole("status").filter({ hasText: "Revisa los campos marcados. El origen no es válido" })).toBeVisible();
    await expect(done(page)).toHaveCount(0);
    // The data stays for the next attempt.
    await expect(page.getByLabel("Persona de contacto")).toHaveValue("Ana Quiroga");
    await name.fill("Viñedos del Sur S.R.L.");
    await submit(page);
    await expect.poll(() => calls).toBe(2);
  });

  test("429: dice cuánto esperar y conserva los datos", async ({ page }) => {
    await page.route(WAITLIST, (route) =>
      route.fulfill({
        status: 429,
        headers: { "Retry-After": "90" },
        json: failure(429, "TOO_MANY_REQUESTS", "Demasiadas solicitudes", null),
      }),
    );
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("status").filter({ hasText: "Vuelve a intentarlo en 2 minutos" })).toBeVisible();
    await expect(done(page)).toHaveCount(0);
    await expect(page.getByLabel("Nombre de la bodega")).toHaveValue("Viñedos del Sur");
  });

  test("error de red: avisa y conserva los datos", async ({ page }) => {
    await page.route(WAITLIST, (route) => route.abort("internetdisconnected"));
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("status").filter({ hasText: "No pudimos conectar con el servidor." })).toBeVisible();
    await expect(page.getByLabel("Nombre de la bodega")).toHaveValue("Viñedos del Sur");
  });

  test("la API deja de responder detrás del proxy: aviso amable con el correo de contacto", async ({ page }) => {
    await page.route(WAITLIST, (route) => route.fulfill({ status: 404, contentType: "text/html", body: "<!doctype html><title>404</title>" }));
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await submit(page);
    await expect(page.getByRole("status").filter({ hasText: "La lista de espera no está disponible en este momento." })).toContainText("bodegas@drinksonchain.bo");
  });

  test("el campo trampa está fuera de la vista, del tabulador y de la accesibilidad", async ({ page }) => {
    await page.goto("/lista-de-espera");
    const trap = page.locator('input[name="website"]');
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("autocomplete", "off");
    await expect(page.locator('[aria-hidden="true"] input[name="website"]')).toHaveCount(1);
    await expect(trap).not.toBeInViewport();
    await page.getByLabel("Cuéntanos algo de tu bodega (opcional)").focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.getAttribute("name"))).not.toBe("website");
    }
  });
});

test.describe("/lista-de-espera · origen de la inscripción (?src=)", () => {
  test("el origen sobrevive a moverse por el sitio y llega también desde /unirse", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route(WAITLIST, async (route) => {
      body = route.request().postDataJSON();
      await joined(3)(route);
    });
    await page.goto("/lista-de-espera?src=Tarija-2026");
    await page.getByRole("link", { name: "La propuesta para bodegas" }).click();
    await expect(page).toHaveURL("/unirse");
    await fillForm(page);
    await submit(page);
    await expect(done(page)).toBeVisible();
    expect(body).toMatchObject({ type: "WINERY", source: "tarija-2026" });
  });

  test("un origen no válido se descarta", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route(WAITLIST, async (route) => {
      body = route.request().postDataJSON();
      await joined(3)(route);
    });
    await page.goto("/lista-de-espera?src=%3Cscript%3E");
    await fillForm(page);
    await submit(page);
    await expect(done(page)).toBeVisible();
    expect(body).not.toHaveProperty("source");
  });

  test("parseSource: solo [a-z0-9-] de 1 a 40 caracteres", () => {
    test.skip(test.info().project.name !== "escritorio", "pure logic: one project is enough");
    expect(parseSource("tarija-2026")).toBe("tarija-2026");
    expect(parseSource("  Bodega-Amiga ")).toBe("bodega-amiga");
    expect(parseSource("a".repeat(40))).toBe("a".repeat(40));
    for (const bad of [null, undefined, "", "a".repeat(41), "tarija 2026", "tarija_2026", "<script>", "ñandú", "a/b"]) {
      expect(parseSource(bad)).toBeNull();
    }
  });
});

test.describe("/lista-de-espera · compartir con otra bodega", () => {
  async function join(page: Page) {
    await page.route(WAITLIST, joined(12));
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await submit(page);
    await expect(done(page)).toBeVisible();
  }

  test("con Web Share comparte el enlace con el origen bodega-amiga", async ({ page }) => {
    await page.addInitScript(() => {
      const shared: unknown[] = [];
      Object.assign(window, { __shared: shared });
      Object.defineProperty(navigator, "share", { configurable: true, value: (data: unknown) => (shared.push(data), Promise.resolve()) });
    });
    await join(page);
    await page.getByRole("button", { name: "Compartir con otra bodega" }).click();
    const shared = await page.evaluate(() => (window as unknown as { __shared: { title: string; text: string; url: string }[] }).__shared);
    expect(shared).toHaveLength(1);
    expect(shared[0].url).toMatch(SHARE_URL);
    expect(shared[0].title).toContain("Drinks on Chain");
    expect(shared[0].text).toContain("lista de espera");
  });

  test("sin Web Share ofrece WhatsApp y copiar el enlace", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { configurable: true, value: undefined }));
    await join(page);
    await expect(page.getByRole("button", { name: "Compartir con otra bodega" })).toHaveCount(0);
    const whatsapp = page.getByRole("link", { name: "Compartir por WhatsApp" });
    const href = new URL((await whatsapp.getAttribute("href")) ?? "");
    expect(href.origin).toBe("https://wa.me");
    expect(href.searchParams.get("text")).toMatch(SHARE_URL);
    await expect(whatsapp).toHaveAttribute("rel", /noopener/);

    await page.getByRole("button", { name: "Copiar el enlace" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Enlace copiado." })).toHaveCount(1);
    await expect(page.getByText("Enlace copiado.")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(SHARE_URL);
  });
});

test.describe("/lista-de-espera · inglés", () => {
  test("la página, el envío y la confirmación en inglés", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route(WAITLIST, async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({
        status: 422,
        json: failure(422, "VALIDATION_ERROR", "Datos no válidos", [{ field: "phone", message: "El teléfono no es válido" }]),
      });
    });
    await page.goto("/lista-de-espera");
    await page.getByRole("button", { name: "MENU" }).click();
    const menu = page.getByRole("dialog", { name: "MENU" });
    await menu.getByRole("button", { name: "EN", exact: true }).click();
    await menu.getByRole("button", { name: "Close" }).click();

    await expect(page.getByRole("heading", { name: "Your winery, among the first in the network" })).toBeVisible();
    await page.getByLabel("Winery name").fill("Viñedos del Sur");
    await page.getByLabel("Region").selectOption({ label: "Cinti Valley" });
    await page.getByRole("radio", { name: "Both", exact: true }).check();
    await page.getByLabel("Contact person").fill("Ana Quiroga");
    await page.getByLabel("Email", { exact: true }).fill("ana@vinedosdelsur.bo");
    await page.getByLabel("WhatsApp").fill("+591 70000000");
    await page.getByRole("checkbox", { name: /I agree that Drinks on Chain contacts me/ }).check();
    await page.getByRole("button", { name: "Add my winery" }).click();

    // The server answers in Spanish: an English visitor gets the form's own wording.
    await expect(page.getByLabel("WhatsApp")).toHaveAccessibleDescription(/Check this field\./);
    await expect(page.getByRole("status").filter({ hasText: "Check the highlighted fields." })).toBeVisible();
    // Values stay in Spanish for the back office; the language goes in `locale`.
    expect(body).toMatchObject({ type: "WINERY", locale: "en", region: "Valle de Cinti", produces: "BOTH" });

    await page.unroute(WAITLIST);
    await page.route(WAITLIST, joined(42));
    await page.getByRole("button", { name: "Add my winery" }).click();
    await expect(page.getByRole("heading", { name: "Your winery is on the list" })).toBeFocused();
    await expect(page.getByTestId("waitlist-position")).toHaveText("No. 42");
    await expect(page.getByText("will get in touch by WhatsApp or email")).toBeVisible();
  });
});

test.describe("/lista-de-espera · móvil primero y accesibilidad", () => {
  test("cómodo en 360 px: sin desbordes, teclados adecuados y controles grandes", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/lista-de-espera?src=tarija-2026");
    await settle(page, 300);
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);

    const email = page.getByLabel("Correo", { exact: true });
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("inputmode", "email");
    await expect(email).toHaveAttribute("autocomplete", "email");
    await expect(email).toHaveAttribute("autocapitalize", "none");
    const phone = page.getByLabel("WhatsApp");
    await expect(phone).toHaveAttribute("type", "tel");
    await expect(phone).toHaveAttribute("inputmode", "tel");
    await expect(phone).toHaveAttribute("autocomplete", "tel");
    await expect(page.getByLabel("Nombre de la bodega")).toHaveAttribute("autocomplete", "organization");
    await expect(page.getByLabel("Persona de contacto")).toHaveAttribute("autocomplete", "name");

    // Text of at least 16 px (iOS zooms into smaller fields) and targets of at least 44 px.
    for (const control of [page.getByLabel("Nombre de la bodega"), page.getByLabel("Región"), email, phone, page.getByLabel("Cuéntanos algo de tu bodega (opcional)")]) {
      expect(await control.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
      expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    const button = await page.getByRole("button", { name: "Anotar mi bodega" }).boundingBox();
    expect(button?.height).toBeGreaterThanOrEqual(48);
    expect(button?.width).toBeGreaterThanOrEqual(300);
    for (const option of ["Vino", "Singani", "Ambos", "Otra bebida"]) {
      const label = await page.locator("label").filter({ hasText: new RegExp(`^${option}$`) }).boundingBox();
      expect(label?.height).toBeGreaterThanOrEqual(40);
    }

    // The confirmation fits too.
    await page.route(WAITLIST, joined(1234));
    await fillForm(page);
    await submit(page);
    await expect(done(page)).toBeVisible();
    await settle(page, 300);
    expect(await overflow()).toBeLessThanOrEqual(0);
  });

  test("axe sin violaciones serias en la página y con los errores a la vista", async ({ page }) => {
    test.setTimeout(60_000); // two full-page scans
    await page.goto("/lista-de-espera");
    await settle(page, 500);
    expect(await seriousViolations(page)).toEqual([]);
    await submit(page); // with the client errors on screen
    await expect(page.getByLabel("Nombre de la bodega")).toHaveAttribute("aria-invalid", "true");
    await settle(page, 500);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("axe sin violaciones serias en la confirmación", async ({ page }) => {
    test.setTimeout(60_000);
    await page.route(WAITLIST, joined(7));
    await page.goto("/lista-de-espera");
    await fillForm(page);
    await submit(page);
    await expect(done(page)).toBeVisible();
    await settle(page, 800); // the entrance animation ends before colours are measured
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("metadatos, imagen para compartir y sitemap", async ({ page, request }) => {
    await page.goto("/lista-de-espera");
    await expect(page).toHaveTitle("Lista de espera para bodegas · Drinks on Chain");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Anota tu bodega en la lista de espera/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/lista-de-espera$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Lista de espera para bodegas · Drinks on Chain");
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/lista-de-espera\/opengraph-image/);
    const image = await request.get("/lista-de-espera/opengraph-image");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toMatch(/<loc>[^<]+\/lista-de-espera<\/loc>/);
  });
});

test.describe("/unirse sin la solicitud formal (bandera apagada)", () => {
  test("conserva la propuesta y lleva a la lista de espera, sin el formulario formal", async ({ page }) => {
    const errors = trackErrors(page);
    await page.route(WAITLIST, joined(5));
    await page.goto("/unirse");
    await expect(page.getByRole("heading", { name: "Unirse a la red" }).first()).toBeVisible();
    for (const kept of ["Venta directa", "Vendimia y laboratorio", "Lista de espera", "Alta en la red"]) {
      await expect(page.getByRole("heading", { name: kept, exact: true })).toBeVisible();
    }
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /la lista de espera para bodegas/);
    // The formal application (NIT, captcha) is not offered.
    await expect(page.getByLabel("Razón social")).toHaveCount(0);
    await expect(page.getByLabel("NIT", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-captcha]")).toHaveCount(0);

    await page.getByRole("link", { name: "Lista de espera", exact: true }).click();
    await expect(page.locator("#formulario")).toBeInViewport();
    await fillForm(page);
    await submit(page);
    await expect(done(page)).toBeVisible();
    await expect(page.getByTestId("waitlist-position")).toHaveText("N.º 5");
    expect(errors).toEqual([]);
  });

  test("un punto de canje sigue recibiendo el correo de contacto", async ({ page }) => {
    await page.goto("/unirse?tipo=punto#formulario");
    await expect(page.getByRole("radio", { name: "Un punto de canje" })).toBeChecked();
    await expect(page.getByRole("link", { name: "puntos@drinksonchain.bo" })).toBeVisible();
    await expect(page.getByLabel("Nombre de la bodega")).toHaveCount(0);
    await page.getByRole("radio", { name: "Una bodega o destilería" }).check();
    await expect(page.getByLabel("Nombre de la bodega")).toBeVisible();
  });

  test("/unirse/verificar no existe sin la solicitud formal", async ({ request }) => {
    expect((await request.get("/unirse/verificar?token=apv_x")).status()).toBe(404);
  });

  test("el menú, /acceso, /bodegas y el pie llevan a la lista de espera", async ({ page }) => {
    await page.goto("/acceso");
    await expect(page.locator("#erp").getByRole("link", { name: "Unirse" })).toHaveAttribute("href", "/lista-de-espera");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Unirse", exact: true })).toHaveAttribute("href", "/lista-de-espera");
    await expect(page.getByRole("link", { name: "Unirse a la red" })).toHaveAttribute("href", "/lista-de-espera");

    await page.goto("/bodegas");
    await expect(page.getByRole("main").locator('a[href="/lista-de-espera"]')).toHaveCount(1);
    await expect(page.getByRole("main").locator('a[href="/unirse"]')).toHaveCount(0);

    await page.getByRole("button", { name: "MENU" }).click();
    const menu = page.getByRole("dialog", { name: "MENU" });
    await menu.getByRole("link", { name: "Unirse", exact: true }).click();
    await expect(page).toHaveURL("/lista-de-espera");
    // "Unirse" stays marked as the current section on both pages.
    await page.getByRole("button", { name: "MENU" }).click();
    await expect(menu.getByRole("link", { name: "Unirse", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("axe sin violaciones serias en /unirse con la lista incrustada", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/unirse");
    await page.locator("#formulario").scrollIntoViewIfNeeded();
    await settle(page, 500);
    expect(await seriousViolations(page)).toEqual([]);
  });
});
