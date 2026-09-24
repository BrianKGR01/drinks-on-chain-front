import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParcelPage } from "@/components/pages/ParcelPage";
import { VILLAGES, getParcel } from "@/content/villages";

export function generateStaticParams() {
  return VILLAGES.flatMap((v) => v.parcels.map((p) => ({ village: v.slug, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/parcelas/[village]/[slug]">): Promise<Metadata> {
  const { village, slug } = await params;
  const found = getParcel(village, slug);
  if (!found) return {};
  return {
    title: `${found.parcel.name} · ${found.village.name.es}`,
    description: `Parcela ${found.parcel.name} a ${found.parcel.altitude} m s.n.m. en el ${found.village.name.es}.`,
  };
}

export default async function Page({ params }: PageProps<"/parcelas/[village]/[slug]">) {
  const { village, slug } = await params;
  const found = getParcel(village, slug);
  if (!found) notFound();
  const idx = found.village.parcels.findIndex((p) => p.id === found.parcel.id);
  const next = found.village.parcels[(idx + 1) % found.village.parcels.length];
  return <ParcelPage village={found.village} parcel={found.parcel} next={next} />;
}
