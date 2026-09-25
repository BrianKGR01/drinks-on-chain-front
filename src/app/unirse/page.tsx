import type { Metadata } from "next";
import { JoinPage } from "@/components/network/JoinPage";

export const metadata: Metadata = {
  title: "Unirse a la red",
  description: "Qué gana una bodega en Drinks on Chain, cómo es el ERP de trazabilidad, los requisitos de Denominación de Origen y el proceso de alta.",
  alternates: { canonical: "/unirse" },
};

export default function Page() {
  return <JoinPage />;
}
