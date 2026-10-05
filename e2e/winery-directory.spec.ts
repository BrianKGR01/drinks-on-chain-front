import { expect, test } from "@playwright/test";
import wineriesData from "../src/content/data/bodegas.json";
import type { Winery } from "../src/content/network";
import { DIRECTORY_PATH, DIRECTORY_TTL_MS, createDirectoryStore, fetchDirectory, usableLogoUrl, usableWebsite, type PublicWinery } from "../src/lib/public-wineries";
import { parseDirectory, parseProfile } from "../src/lib/public-wineries-schema";
import { buildDirectory, summaryOf, villageOfRegion } from "../src/lib/winery-directory";
import { API_PARTNERS, directoryBody } from "./support";

/**
 * Unit tests of the directory of wineries (ORG-11, O2-WEB-1), no browser: what is accepted from
 * `GET /v1/public/wineries`, how it joins `src/content` and when the content is the fallback.
 * Pure logic, so they run once.
 */

test.beforeEach(() => {
  test.skip(test.info().project.name !== "escritorio", "pure logic: one project is enough");
});

const CONTENT = wineriesData as unknown as Winery[];
const [ALTOS, CINTI] = API_PARTNERS;
const NEW = { slug: "vinos-del-sur", tradeName: "Vinos del Sur", region: "Valle de Cinti", category: "WINERY", logoUrl: null, publicStory: null, website: null };
const VILLAGES = [
  { id: "tarija", name: { es: "Valle Central de Tarija", en: "Tarija Central Valley" } },
  { id: "cinti", name: { es: "Valle de Cinti", en: "Cinti Valley" } },
];

const profiles = (...items: unknown[]) => parseDirectory(directoryBody(items)) as PublicWinery[];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test.describe("respuesta de GET /v1/public/wineries", () => {
  test("acepta la forma real de la API y deja fuera los logos y sitios que no llevan a nada", () => {
    expect(parseProfile(ALTOS)).toEqual({
      slug: "altos-de-calamuchita",
      tradeName: "Bodega Altos de Calamuchita",
      region: "Valle Central de Tarija · Santa Ana",
      category: "WINERY",
      logoUrl: null,
      story: ALTOS.publicStory,
      website: null,
    });
    expect(parseProfile({ ...NEW, tradeName: "  Vinos del Sur  ", publicStory: "   ", website: "https://vinosdelsur.bo" })).toMatchObject({
      tradeName: "Vinos del Sur",
      story: null,
      website: "https://vinosdelsur.bo/",
    });
  });

  test("una categoría desconocida no tira el perfil; un perfil sin slug o sin nombre sí", () => {
    expect(parseProfile({ ...NEW, category: "MEADERY" })?.category).toBeNull();
    // The contract says null, but a missing optional field is not worth losing the winery.
    expect(parseProfile({ slug: NEW.slug, tradeName: NEW.tradeName, region: "", category: "WINERY" })).toMatchObject({ logoUrl: null, story: null, website: null });
    for (const bad of [null, "x", {}, { ...NEW, slug: "" }, { ...NEW, slug: "Con Espacios" }, { ...NEW, slug: "../b" }, { ...NEW, tradeName: "  " }, { ...NEW, tradeName: 7 }, { ...NEW, region: null }]) {
      expect(parseProfile(bad), JSON.stringify(bad)).toBeNull();
    }
  });

  test("del sobre salen los perfiles válidos, sin repetidos; sin ninguno, null (respaldo)", () => {
    expect(profiles(ALTOS, { nope: true }, CINTI, ALTOS).map((p) => p.slug)).toEqual(["altos-de-calamuchita", "destileria-cinti-viejo"]);
    for (const body of [null, "<html>", [], {}, directoryBody([]), directoryBody([{ nope: true }]), { success: false, error: { code: "X" } }, { success: true, data: { items: "no" } }, { success: true, data: null }]) {
      expect(parseDirectory(body), JSON.stringify(body)).toBeNull();
    }
  });

  test("logos: solo https de un host real; /mocks/uploads cuenta como sin logo", () => {
    expect(usableLogoUrl("https://cdn.drinksonchain.bo/logos/altos.png")).toBe("https://cdn.drinksonchain.bo/logos/altos.png");
    for (const bad of [null, undefined, "", "/mocks/uploads/logos/altos.png", "/uploads/a.png", "http://cdn.drinksonchain.bo/a.png", "https://cdn.test/a.png", "https://api.example.bo/mocks/uploads/a.png", "data:image/png;base64,AAAA", "https://"]) {
      expect(usableLogoUrl(bad), String(bad)).toBeNull();
    }
  });

  test("sitio web: solo https de un host real", () => {
    expect(usableWebsite(" https://www.bodega.bo/vinos ")).toBe("https://www.bodega.bo/vinos");
    for (const bad of [null, "", "https://altos.test", "https://bodega.example", "http://bodega.bo", "bodega.bo", "javascript:alert(1)", "https://localhost", "https://user:pw@bodega.bo", "mailto:a@bodega.bo"]) {
      expect(usableWebsite(bad), String(bad)).toBeNull();
    }
  });
});

test.describe("lectura por el proxy", () => {
  test("pide una página de 100 a /api/v1, sin cookies, como aplicación pública", async () => {
    const seen: { url: string; init: RequestInit }[] = [];
    const result = await fetchDirectory(async (url, init) => {
      seen.push({ url, init });
      return json(directoryBody([ALTOS]));
    });
    expect(result?.map((p) => p.slug)).toEqual(["altos-de-calamuchita"]);
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe(DIRECTORY_PATH);
    expect(DIRECTORY_PATH).toBe("/api/v1/public/wineries?limit=100&offset=0");
    expect(seen[0].init.credentials).toBe("omit");
    expect(new Headers(seen[0].init.headers).get("x-client-app")).toBe("PUBLIC");
    expect(seen[0].init.signal).toBeInstanceOf(AbortSignal);
  });

  test("cualquier fallo es null y nunca una excepción", async () => {
    expect(await fetchDirectory(async () => json({ success: false }, 500))).toBeNull();
    expect(await fetchDirectory(async () => json(directoryBody([ALTOS]), 404))).toBeNull();
    expect(await fetchDirectory(async () => new Response("<html>502</html>", { status: 200, headers: { "content-type": "text/html" } }))).toBeNull();
    expect(await fetchDirectory(async () => json(directoryBody([])))).toBeNull();
    expect(
      await fetchDirectory(async () => {
        throw new TypeError("Failed to fetch");
      }),
    ).toBeNull();
    expect(
      await fetchDirectory(async () => {
        throw new DOMException("The operation timed out.", "TimeoutError");
      }),
    ).toBeNull();
  });
});

test.describe("caché del directorio", () => {
  test("una respuesta buena se reutiliza durante el TTL y se vuelve a pedir después", async () => {
    let now = 1_000;
    let loads = 0;
    const store = createDirectoryStore(
      async () => {
        loads++;
        return profiles(loads === 1 ? ALTOS : CINTI);
      },
      () => now,
    );
    let notified = 0;
    const off = store.subscribe(() => notified++);

    expect(store.getSnapshot()).toBeNull();
    await Promise.all([store.refresh(), store.refresh()]);
    expect(loads).toBe(1);
    expect(notified).toBe(1);
    expect(store.getSnapshot()?.[0].slug).toBe("altos-de-calamuchita");

    now += DIRECTORY_TTL_MS - 1;
    await store.refresh();
    expect(loads).toBe(1);

    now += 2;
    await store.refresh();
    expect(loads).toBe(2);
    expect(store.getSnapshot()?.[0].slug).toBe("destileria-cinti-viejo");
    expect(notified).toBe(2);
    off();
  });

  test("un fallo no se guarda: la primera vez deja null y se reintenta; después conserva lo último bueno", async () => {
    let now = 0;
    const answers: Array<() => Promise<PublicWinery[] | null>> = [
      async () => null,
      async () => profiles(ALTOS),
      async () => {
        throw new Error("boom");
      },
    ];
    let loads = 0;
    const store = createDirectoryStore(
      () => answers[loads++](),
      () => now,
    );

    await store.refresh();
    expect(store.getSnapshot()).toBeNull();
    await store.refresh();
    expect(loads).toBe(2);
    expect(store.getSnapshot()?.[0].slug).toBe("altos-de-calamuchita");

    now += DIRECTORY_TTL_MS + 1;
    await store.refresh();
    expect(loads).toBe(3);
    expect(store.getSnapshot()?.[0].slug).toBe("altos-de-calamuchita");
  });
});

test.describe("directorio: API + src/content", () => {
  const slugs = (entries: { slug: string }[]) => entries.map((e) => e.slug);

  test("sin respuesta de la API, el directorio es src/content tal cual (socias primero)", () => {
    for (const none of [null, []]) {
      const directory = buildDirectory(CONTENT, none);
      expect(slugs(directory)).toEqual(["altos-de-calamuchita", "destileria-cinti-viejo", "vinedos-del-guadalquivir", "casa-uriondo"]);
      expect(directory.map((e) => e.status)).toEqual(["socia", "socia", "en-conversacion", "referencia"]);
      expect(directory.every((e) => e.content !== null && e.profile === null)).toBe(true);
    }
  });

  test("con la API, ella decide las socias; las que no son socias siguen saliendo de src/content", () => {
    const directory = buildDirectory(CONTENT, profiles({ ...ALTOS, tradeName: "Altos de Calamuchita S.R.L." }, NEW));
    // Cinti Viejo is "socia" in src/content but the API does not list it: it is not active, so it is left out.
    expect(slugs(directory)).toEqual(["altos-de-calamuchita", "vinos-del-sur", "vinedos-del-guadalquivir", "casa-uriondo"]);
    const [altos, nueva, guadalquivir] = directory;
    expect(altos).toMatchObject({ name: "Altos de Calamuchita S.R.L.", status: "socia" });
    expect(altos.content?.id).toBe("win_altos");
    expect(nueva).toMatchObject({ name: "Vinos del Sur", status: "socia", content: null });
    expect(guadalquivir).toMatchObject({ status: "en-conversacion", profile: null });
  });

  test("una bodega en conversación que la API ya lista pasa a socia", () => {
    const directory = buildDirectory(CONTENT, profiles({ ...NEW, slug: "vinedos-del-guadalquivir", tradeName: "Viñedos del Guadalquivir" }));
    expect(directory[0]).toMatchObject({ slug: "vinedos-del-guadalquivir", status: "socia" });
    expect(directory[0].content?.id).toBe("win_guadalquivir");
    expect(slugs(directory)).toEqual(["vinedos-del-guadalquivir", "casa-uriondo"]);
  });

  test("el valle se reconoce en el texto libre de la región", () => {
    expect(villageOfRegion("Valle Central de Tarija · Santa Ana", VILLAGES)?.id).toBe("tarija");
    expect(villageOfRegion("VALLE DE CINTI", VILLAGES)?.id).toBe("cinti");
    expect(villageOfRegion("Camargo, Cinti", VILLAGES)?.id).toBe("cinti");
    expect(villageOfRegion("Samaipata · Santa Cruz", VILLAGES)).toBeNull();
    expect(villageOfRegion("", VILLAGES)).toBeNull();
  });

  test("el texto de la tarjeta: el de la API en español, la traducción del contenido en inglés", () => {
    const [altos, nueva] = buildDirectory(CONTENT, profiles({ ...ALTOS, publicStory: "Texto de la bodega." }, { ...NEW, publicStory: "Solo en español." }));
    expect(summaryOf(altos, "es")).toEqual({ text: "Texto de la bodega.", lang: "es" });
    expect(summaryOf(altos, "en")).toEqual({ text: altos.content?.summary.en, lang: "en" });
    // Only the API knows this winery: the English page shows its Spanish text, marked as Spanish.
    expect(summaryOf(nueva, "en")).toEqual({ text: "Solo en español.", lang: "es" });
    const [sinTexto] = buildDirectory(CONTENT, profiles(NEW));
    expect(summaryOf(sinTexto, "es")).toBeNull();
    const [, , guadalquivir] = buildDirectory(CONTENT, null);
    expect(summaryOf(guadalquivir, "es")?.text).toBe(guadalquivir.content?.summary.es);
  });
});
