import type { Metadata } from "next";
import { readApiOrigin } from "@/lib/api-origin";
import { pageMetadata } from "@/lib/site";
import { WineriesPage } from "@/components/network/WineriesPage";

export const metadata: Metadata = pageMetadata({
  path: "/bodegas",
  title: "Bodegas",
  description: "Las bodegas de la red Drinks on Chain con sus parcelas en el mapa de los valles de Tarija y Cinti y su estado en la red.",
});

export default function Page() {
  // Same check as the `/api/v1` proxy in src/proxy.ts: without an API the directory of src/content is the page.
  return <WineriesPage apiReady={readApiOrigin() !== null} />;
}
