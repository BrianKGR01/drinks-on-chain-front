import type { Metadata } from "next";
import { WinesPage } from "@/components/pages/WinesPage";

export const metadata: Metadata = { title: "Vinos" };

export default async function Page({ searchParams }: PageProps<"/vinos">) {
  const { v } = await searchParams;
  return <WinesPage initialSlug={typeof v === "string" ? v : undefined} />;
}
