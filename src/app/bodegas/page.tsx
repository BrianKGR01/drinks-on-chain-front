import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { WineriesPage } from "@/components/network/WineriesPage";

export const metadata: Metadata = pageMetadata({
  path: "/bodegas",
  title: "Bodegas",
  description: "Las bodegas de la red Drinks on Chain con sus parcelas en el mapa de los valles de Tarija y Cinti y su estado en la red.",
});

export default function Page() {
  return <WineriesPage />;
}
