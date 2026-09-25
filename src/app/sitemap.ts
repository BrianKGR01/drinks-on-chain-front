import type { MetadataRoute } from "next";
import { WINERIES } from "@/content/network";
import { VILLAGES } from "@/content/villages";
import { siteUrl } from "@/lib/site";

type Freq = "weekly" | "monthly" | "yearly";

const STATIC: { path: string; changeFrequency: Freq; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/bodegas", changeFrequency: "weekly", priority: 0.9 },
  { path: "/puntos-de-recojo", changeFrequency: "weekly", priority: 0.8 },
  { path: "/unirse", changeFrequency: "monthly", priority: 0.8 },
  { path: "/acceso", changeFrequency: "monthly", priority: 0.6 },
  { path: "/historia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contacto", changeFrequency: "yearly", priority: 0.5 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.2 },
];

/** Public pages: sections, winery profiles and every parcel page (under /valles). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const wineries = WINERIES.map((w) => ({ path: `/bodegas/${w.slug}`, changeFrequency: "weekly" as Freq, priority: 0.7 }));
  const parcels = VILLAGES.flatMap((v) =>
    v.parcels.map((p) => ({ path: `/valles/${v.slug}/${p.slug}`, changeFrequency: "monthly" as Freq, priority: 0.6 })),
  );
  return [...STATIC, ...wineries, ...parcels].map(({ path, changeFrequency, priority }) => ({
    url: siteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
