import type { Metadata } from "next";
import { AccessPage } from "@/components/network/AccessPage";

export const metadata: Metadata = {
  title: "Acceso",
  description: "Acceso a los sistemas de la red: el ERP de trazabilidad para las bodegas y la aplicación de entregas para los puntos de recojo.",
  alternates: { canonical: "/acceso" },
};

export default function Page() {
  return <AccessPage />;
}
