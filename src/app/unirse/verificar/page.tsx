import type { Metadata } from "next";
import { VerifyApplicationPage } from "@/components/network/VerifyApplicationPage";
import { readApiOrigin } from "@/lib/api-origin";

export const metadata: Metadata = {
  title: "Confirmar el correo",
  description: "Confirmación del correo de contacto de una solicitud de alta en la red de Drinks on Chain.",
  // A one-time link from an email: never indexed.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <VerifyApplicationPage apiReady={readApiOrigin() !== null} />;
}
