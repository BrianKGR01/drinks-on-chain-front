import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { AccessPage } from "@/components/network/AccessPage";

export const metadata: Metadata = pageMetadata({
  path: "/acceso",
  title: "Acceso",
  description: "Acceso a los sistemas de la red: el ERP de trazabilidad para las bodegas y la aplicación de canje para los puntos de canje.",
});

export default function Page() {
  return <AccessPage />;
}
