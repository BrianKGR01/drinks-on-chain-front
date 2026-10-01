import type { Metadata } from "next";
import { WaitlistPage } from "@/components/network/WaitlistPage";
import { readApiOrigin } from "@/lib/api-origin";
import { WAITLIST_OG_ALT, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/lista-de-espera",
  title: "Lista de espera para bodegas",
  description:
    "Anota tu bodega en la lista de espera de Drinks on Chain: trazabilidad verificable de la parcela a la botella, preventa de botellas tokenizadas y puntos de canje. Sé de las primeras bodegas de la red.",
  image: { url: "/lista-de-espera/opengraph-image", alt: WAITLIST_OG_ALT },
});

export default function Page() {
  // Same check as the `/api/v1` proxy in src/proxy.ts: without an API the form says so.
  return <WaitlistPage apiReady={readApiOrigin() !== null} />;
}
