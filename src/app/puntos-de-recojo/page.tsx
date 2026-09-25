import type { Metadata } from "next";
import { PickupPointsPage } from "@/components/network/PickupPointsPage";

export const metadata: Metadata = {
  title: "Puntos de recojo",
  description: "Licorerías, cavas y bodegas donde se retiran las botellas de la red: qué es un punto autorizado, cómo se habilita y los puntos activos.",
  alternates: { canonical: "/puntos-de-recojo" },
};

export default function Page() {
  return <PickupPointsPage />;
}
