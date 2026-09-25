import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WineryPage } from "@/components/network/WineryPage";
import { WINERIES, getWinery } from "@/content/network";

export const dynamicParams = false;

export function generateStaticParams() {
  return WINERIES.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bodegas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const winery = getWinery(slug);
  if (!winery) return {};
  return {
    title: winery.name,
    description: winery.summary.es,
    alternates: { canonical: `/bodegas/${winery.slug}` },
  };
}

export default async function Page({ params }: PageProps<"/bodegas/[slug]">) {
  const { slug } = await params;
  const winery = getWinery(slug);
  if (!winery) notFound();
  return <WineryPage winery={winery} />;
}
