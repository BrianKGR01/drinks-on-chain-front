import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { JoinPage } from "@/components/network/JoinPage";
import { readApiOrigin } from "@/lib/api-origin";

export const metadata: Metadata = pageMetadata({
  path: "/unirse",
  title: "Unirse a la red",
  description: "Qué gana una bodega en Drinks on Chain, cómo es el ERP de trazabilidad, los requisitos de Denominación de Origen y la solicitud de alta.",
});

export default function Page() {
  // Same check as the `/api/v1` rewrite in next.config.ts: without an API the form says so.
  return <JoinPage apiReady={readApiOrigin() !== null} />;
}
