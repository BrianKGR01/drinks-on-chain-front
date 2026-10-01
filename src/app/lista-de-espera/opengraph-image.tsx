import { ogImage } from "@/lib/og-image";
import { WAITLIST_OG_ALT } from "@/lib/site";

/* Share image of the waitlist: it is what a winery sees when another one shares the link. */
export const alt = WAITLIST_OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "LISTA DE ESPERA PARA BODEGAS", tagline: "De la parcela a la botella: anota tu bodega." });
}
