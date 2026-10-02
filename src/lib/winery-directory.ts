import type { Winery, WineryStatus } from "@/content/network";
import type { Lang, VillageSpec } from "@/lib/scene-contract";
import type { PublicWinery } from "./public-wineries";

/**
 * The directory of /bodegas: the public profiles of the API (ORG-11) joined, by slug,
 * with what only `src/content` knows (the map, the parcels, the lots, the English
 * texts, the wineries that are not partners yet).
 *
 * - With a good answer of the API, the API decides who is a partner and how it is
 *   called: every profile is listed as "socia"; a winery that `src/content` calls
 *   "socia" and the API does not list is left out (it is not active); the wineries
 *   "en conversación" and "de referencia", which the API never lists, stay.
 * - Without one (API down, slow, empty or not configured), the directory is
 *   `src/content` as it is.
 */
export interface DirectoryEntry {
  slug: string;
  name: string;
  status: WineryStatus;
  /** What this site knows about the winery; null when only the API lists it. */
  content: Winery | null;
  /** Public profile of the API; null when the entry comes from `src/content` alone. */
  profile: PublicWinery | null;
}

export const STATUS_ORDER: WineryStatus[] = ["socia", "en-conversacion", "referencia"];

export function buildDirectory(content: readonly Winery[], profiles: readonly PublicWinery[] | null): DirectoryEntry[] {
  const entries: DirectoryEntry[] = [];
  if (!profiles || profiles.length === 0) {
    for (const w of content) entries.push({ slug: w.slug, name: w.name, status: w.status, content: w, profile: null });
  } else {
    const bySlug = new Map(content.map((w) => [w.slug, w]));
    const listed = new Set<string>();
    for (const profile of profiles) {
      if (listed.has(profile.slug)) continue;
      listed.add(profile.slug);
      entries.push({ slug: profile.slug, name: profile.tradeName, status: "socia", content: bySlug.get(profile.slug) ?? null, profile });
    }
    for (const w of content) {
      if (listed.has(w.slug) || w.status === "socia") continue;
      entries.push({ slug: w.slug, name: w.name, status: w.status, content: w, profile: null });
    }
  }
  // Stable: partners keep the order of the API (by trade name), the rest the order of the content.
  return entries.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
}

/** Lower case, without accents: "Valle de Cinti · Camargo" → "valle de cinti · camargo". */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Valley of a region written as free text by the API, or null when it names none of
 * the map: the API has no valley identifier, so the name of the valley is looked for
 * in the text ("Valle Central de Tarija · Santa Ana" → Tarija).
 */
export function villageOfRegion<V extends Pick<VillageSpec, "id" | "name">>(region: string, villages: readonly V[]): V | null {
  const text = fold(region);
  if (!text) return null;
  return villages.find((v) => text.includes(fold(v.name.es)) || text.includes(fold(v.name.en))) ?? villages.find((v) => text.includes(fold(v.id))) ?? null;
}

/**
 * Text of a card and the language it is written in. The winery's own text of the API
 * is Spanish only, so the English page keeps the translation of `src/content` when
 * there is one, and otherwise shows the Spanish text marked as such (`lang`).
 */
export function summaryOf(entry: DirectoryEntry, lang: Lang): { text: string; lang: Lang } | null {
  const story = entry.profile?.story ?? null;
  if (lang === "es") {
    const text = story ?? entry.content?.summary.es ?? null;
    return text ? { text, lang: "es" } : null;
  }
  if (entry.content) return { text: entry.content.summary.en, lang: "en" };
  return story ? { text: story, lang: "es" } : null;
}
