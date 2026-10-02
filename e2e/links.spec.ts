import { expect, test } from "@playwright/test";
import { buildLinks, siteBase } from "../src/lib/links";

/**
 * Unit tests of the links to the other sites (O2-WEB-1), no browser. Pure logic, so they run once.
 */

test.beforeEach(() => {
  test.skip(test.info().project.name !== "escritorio", "pure logic: one project is enough");
});

const LANDING = "https://drinksonchain.example.bo";

test.describe("enlaces a los otros sitios", () => {
  test("con NEXT_PUBLIC_URL_APP, el Marketplace, el catálogo, el visor y las bodegas salen de ella", () => {
    const links = buildLinks({ landing: LANDING, erp: null, pos: null, app: "https://app.example.bo/" });
    expect(links.app).toBe("https://app.example.bo");
    expect(links.catalog).toBe("https://app.example.bo/catalogo");
    expect(links.verify).toBe("https://app.example.bo/b");
    expect(links.appWineries).toBe("https://app.example.bo/bodegas");
    expect(links.appWinery("altos-de-calamuchita")).toBe("https://app.example.bo/bodegas/altos-de-calamuchita");
    // A slug comes from the API: it is never allowed to change the path.
    expect(links.appWinery("a/../b?x")).toBe("https://app.example.bo/bodegas/a%2F..%2Fb%3Fx");
  });

  test("sin la variable no hay ningún enlace al Marketplace", () => {
    for (const app of [null, "", "   ", "/como-funciona", "marketplace.example.bo", "javascript:alert(1)"]) {
      const links = buildLinks({ landing: LANDING, erp: null, pos: null, app });
      expect(links.app, String(app)).toBeNull();
      expect(links.catalog).toBeNull();
      expect(links.verify).toBeNull();
      expect(links.appWineries).toBeNull();
      expect(links.appWinery("altos-de-calamuchita")).toBeNull();
    }
  });

  test("la landing, el ERP y el POS siguen como estaban", () => {
    const links = buildLinks({ landing: `${LANDING}/`, erp: "http://localhost:3002", pos: "", app: null });
    expect(links.landing).toBe(LANDING);
    expect(links.landingWines).toBe(`${LANDING}/vinos`);
    expect(links.landingPrivacy).toBe(`${LANDING}/privacidad`);
    expect(links.erp).toBe("http://localhost:3002/login");
    expect(links.pos).toBeNull();
  });

  test("siteBase solo acepta http(s) y quita la barra final", () => {
    expect(siteBase(" https://app.example.bo// ")).toBe("https://app.example.bo");
    expect(siteBase("http://localhost:3005")).toBe("http://localhost:3005");
    expect(siteBase("ftp://app.example.bo")).toBeNull();
    expect(siteBase("https://")).toBeNull();
    expect(siteBase(undefined)).toBeNull();
  });
});
