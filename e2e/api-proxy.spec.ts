import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";
import {
  CLIENT_IP_HEADER,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  canonicalPathWithQuery,
  clientIpFrom,
  proxyApiRequest,
  proxySecret,
} from "../src/lib/api-proxy";

/**
 * Unit tests of the `/api/v1` proxy (O1-OPS-1), no browser: they check the rewrite target and
 * the headers sent upstream (`x-middleware-request-*`). Pure logic, so they run once.
 */

// Test-only values
const SECRET = "test-proxy-secret-0123456789abcdef-aaaa";
const ORIGIN = "https://api.example.bo";
const NOW = 1_790_000_000_000;
const env = { API_ORIGIN: ORIGIN, PROXY_SHARED_SECRET: SECRET };

test.beforeEach(() => {
  test.skip(test.info().project.name !== "escritorio", "pure logic: one project is enough");
});

function req(path: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  return new NextRequest(`https://bodegas.example.bo${path}`, init);
}

function upstreamHeader(res: Response, name: string): string | null {
  const overridden = (res.headers.get("x-middleware-override-headers") ?? "").split(",");
  if (!overridden.includes(name)) return null;
  return res.headers.get(`x-middleware-request-${name}`);
}

function expectedSignature(method: string, path: string, ip: string, ts: string) {
  return createHmac("sha256", SECRET).update(`${method}|${path}|${ip}|${ts}`).digest("hex");
}

test.describe("proxy de /api/v1 con la IP del cliente firmada (O1-OPS-1)", () => {
  test("reescribe a ${API_ORIGIN}/v1/* con la misma ruta y query", () => {
    const res = proxyApiRequest(req("/api/v1/public/winery-applications/verify?token=a%20b"), { env, now: NOW });
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      `${ORIGIN}/v1/public/winery-applications/verify?token=a%20b`,
    );
  });

  test("reenvía las cabeceras de la petición y firma con la IP de la plataforma", () => {
    const res = proxyApiRequest(
      req("/api/v1/public/winery-applications", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-correlation-id": "corr-1",
          "x-real-ip": "203.0.113.7",
          [CLIENT_IP_HEADER]: "6.6.6.6",
        },
        body: "{}",
      }),
      { env, now: NOW },
    );
    const ts = String(NOW / 1000);
    expect(upstreamHeader(res, "content-type")).toBe("application/json");
    expect(upstreamHeader(res, "x-correlation-id")).toBe("corr-1");
    expect(upstreamHeader(res, CLIENT_IP_HEADER)).toBe("203.0.113.7");
    expect(upstreamHeader(res, TIMESTAMP_HEADER)).toBe(ts);
    expect(upstreamHeader(res, SIGNATURE_HEADER)).toBe(
      expectedSignature("POST", "/v1/public/winery-applications", "203.0.113.7", ts),
    );
  });

  test("sin secreto no firma y descarta las X-DOC-* del cliente", () => {
    const res = proxyApiRequest(req("/api/v1/public/x", { headers: { [CLIENT_IP_HEADER]: "6.6.6.6" } }), {
      env: { API_ORIGIN: ORIGIN },
      now: NOW,
    });
    expect(res.headers.get("x-middleware-rewrite")).toBe(`${ORIGIN}/v1/public/x`);
    for (const name of [CLIENT_IP_HEADER, TIMESTAMP_HEADER, SIGNATURE_HEADER]) {
      expect(upstreamHeader(res, name)).toBeNull();
    }
  });

  test("sin API_ORIGIN no reescribe (el formulario dice que no hay envío)", () => {
    const res = proxyApiRequest(req("/api/v1/public/x"), { env: {}, now: NOW });
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  test("query canónica, primer secreto e IP del cliente", () => {
    expect(canonicalPathWithQuery("/v1/x?q=a%20b")).toBe("/v1/x?q=a+b");
    expect(canonicalPathWithQuery("/v1/x")).toBe("/v1/x");
    expect(proxySecret(` ${SECRET} , otro`)).toBe(SECRET);
    expect(proxySecret(undefined)).toBeNull();
    expect(clientIpFrom(new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe("198.51.100.2");
    expect(clientIpFrom(new Headers({ "x-real-ip": "no-es-ip" }))).toBe("127.0.0.1");
  });
});
