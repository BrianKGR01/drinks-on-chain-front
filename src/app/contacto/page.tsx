import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = { title: "Contacto" };

export default function Page() {
  return <ContactPage />;
}
