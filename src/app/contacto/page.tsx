import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = pageMetadata({
  path: "/contacto",
  title: "Contacto",
  description: "Contacto del equipo de Drinks on Chain para bodegas, puntos de recojo y prensa.",
});

export default function Page() {
  return <ContactPage />;
}
