import type { Metadata } from "next";
import { WineriesPage } from "@/components/network/WineriesPage";

export const metadata: Metadata = {
  title: "Bodegas",
  description: "Las bodegas de la red Drinks on Chain con sus parcelas en el mapa de los valles de Tarija y Cinti y su estado en la red.",
  alternates: { canonical: "/bodegas" },
};

export default function Page() {
  return <WineriesPage />;
}
