import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { LegalPage } from "@/components/pages/LegalPage";

export const metadata: Metadata = pageMetadata({
  path: "/aviso-legal",
  title: "Aviso legal",
  description: "Aviso legal del sitio de las bodegas de Drinks on Chain.",
});

export default function Page() {
  return <LegalPage />;
}
