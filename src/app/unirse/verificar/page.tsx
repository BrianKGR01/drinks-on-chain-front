import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VerifyApplicationPage } from "@/components/network/VerifyApplicationPage";
import { readApiOrigin } from "@/lib/api-origin";
import { WINERY_APPLICATION } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Confirmar el correo",
  description: "Confirmación del correo de contacto de una solicitud de alta en la red de Drinks on Chain.",
  // A one-time link from an email: never indexed.
  robots: { index: false, follow: false },
};

export default function Page() {
  // Part of the formal application: without it no verification link was ever sent.
  if (!WINERY_APPLICATION) notFound();
  return <VerifyApplicationPage apiReady={readApiOrigin() !== null} />;
}
