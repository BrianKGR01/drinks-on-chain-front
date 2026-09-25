import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { HistoryPage } from "@/components/pages/HistoryPage";

export const metadata: Metadata = pageMetadata({
  path: "/historia",
  title: "Historia",
  description: "Cuatro siglos de vino y singani en los valles de Tarija y Cinti, del Moscatel de Alejandría a la Denominación de Origen.",
});

export default function Page() {
  return <HistoryPage />;
}
