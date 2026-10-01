import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { JoinPage } from "@/components/network/JoinPage";
import { readApiOrigin } from "@/lib/api-origin";
import { WINERY_APPLICATION } from "@/lib/flags";

export const metadata: Metadata = pageMetadata({
  path: "/unirse",
  title: "Unirse a la red",
  description: `Qué gana una bodega en Drinks on Chain, cómo es el ERP de trazabilidad, los requisitos de Denominación de Origen y ${WINERY_APPLICATION ? "la solicitud de alta" : "la lista de espera para bodegas"}.`,
});

export default function Page() {
  // Same check as the `/api/v1` proxy in src/proxy.ts: without an API the form says so.
  return <JoinPage apiReady={readApiOrigin() !== null} />;
}
