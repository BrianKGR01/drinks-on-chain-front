import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WineryPage } from "@/components/network/WineryPage";
import { WINERIES, getWinery } from "@/content/network";
import { pageMetadata } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return WINERIES.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bodegas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const winery = getWinery(slug);
  if (!winery) return {};
  return pageMetadata({ path: `/bodegas/${winery.slug}`, title: winery.name, description: winery.summary.es });
}

export default async function Page({ params }: PageProps<"/bodegas/[slug]">) {
  const { slug } = await params;
  const winery = getWinery(slug);
  if (!winery) notFound();
  return <WineryPage winery={winery} />;
}
