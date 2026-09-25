import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PickupPointsPage } from "@/components/network/PickupPointsPage";

export const metadata: Metadata = pageMetadata({
  path: "/puntos-de-recojo",
  title: "Puntos de recojo",
  description: "Licorerías, cavas y bodegas donde se retiran las botellas de la red: qué es un punto autorizado, cómo se habilita y los puntos activos.",
});

export default function Page() {
  return <PickupPointsPage />;
}
