import type { Metadata } from "next";
import { HistoryPage } from "@/components/pages/HistoryPage";

export const metadata: Metadata = { title: "Historia" };

export default function Page() {
  return <HistoryPage />;
}
