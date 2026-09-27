import type { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

/**
 * P-1 + O1-OPS-1: `/api/v1/*` is rewritten to `${API_ORIGIN}/v1/*` with the client's IP signed
 * (`src/lib/api-proxy.ts`). Without `API_ORIGIN` it does nothing: `/api/v1` answers 404.
 */
export function proxy(request: NextRequest) {
  return proxyApiRequest(request);
}

export const config = {
  matcher: "/api/v1/:path*",
};
