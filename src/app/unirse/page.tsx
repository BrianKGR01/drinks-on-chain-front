import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { JoinPage } from "@/components/network/JoinPage";

export const metadata: Metadata = pageMetadata({
  path: "/unirse",
  title: "Unirse a la red",
  description: "Qué gana una bodega en Drinks on Chain, cómo es el ERP de trazabilidad, los requisitos de Denominación de Origen y el proceso de alta.",
});

export default function Page() {
  return <JoinPage />;
}
