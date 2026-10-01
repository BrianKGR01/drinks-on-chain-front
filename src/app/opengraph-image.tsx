import { ogImage } from "@/lib/og-image";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/* Default share image for every route (see src/lib/og-image.tsx). */
export const alt = `${SITE_NAME} · ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "BODEGAS · TARIJA · VALLE DE CINTI", tagline: SITE_TAGLINE });
}
