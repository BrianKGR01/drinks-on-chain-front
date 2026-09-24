import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/LegalPage";

export const metadata: Metadata = { title: "Aviso legal" };

export default function Page() {
  return <LegalPage />;
}
