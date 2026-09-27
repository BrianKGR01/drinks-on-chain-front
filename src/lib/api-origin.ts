/**
 * Origin of the backend API, read on the server only (`API_ORIGIN`, never
 * `NEXT_PUBLIC_…`). The browser never talks to it directly: `next.config.ts`
 * rewrites `/api/v1/*` of this site to `${API_ORIGIN}/v1/*` (plan/03 §6, P-1),
 * so every request stays same-origin. Without a valid value there is no
 * rewrite and the public forms say that sending is not available.
 *
 * Kept dependency-free: `next.config.ts` imports it.
 */
export function readApiOrigin(value: string | undefined = process.env.API_ORIGIN): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin + url.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}
