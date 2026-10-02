import { array, literal, maxLength, minLength, nullish, object, regex, string, trim, unknown } from "zod/mini";
import { WINERY_CATEGORIES, usableLogoUrl, usableWebsite, type PublicWinery, type WineryCategory } from "./public-wineries";

/**
 * Validation of `GET /v1/public/wineries` (ORG-11) with zod. Kept apart from
 * `public-wineries.ts`, which loads it on demand: zod reaches the browser only when a
 * page actually reads the directory, after it is interactive. `zod/mini` on purpose.
 */

/** `PublicWineryProfileDto` of the backend's OpenAPI. */
const ProfileSchema = object({
  slug: string().check(regex(/^[a-z0-9][a-z0-9-]{0,119}$/)),
  tradeName: string().check(trim(), minLength(1), maxLength(200)),
  region: string(),
  category: string(),
  logoUrl: nullish(string()),
  publicStory: nullish(string()),
  website: nullish(string()),
});

/** Page of the directory inside the API envelope (`{ success, data }`). */
const EnvelopeSchema = object({
  success: literal(true),
  data: object({ items: array(unknown()) }),
});

const isCategory = (value: string): value is WineryCategory => (WINERY_CATEGORIES as readonly string[]).includes(value);

/** One item of the directory, or null when it does not match the contract. */
export function parseProfile(raw: unknown): PublicWinery | null {
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) return null;
  const p = parsed.data;
  return {
    slug: p.slug,
    tradeName: p.tradeName,
    region: p.region.trim(),
    category: isCategory(p.category) ? p.category : null,
    logoUrl: usableLogoUrl(p.logoUrl),
    story: p.publicStory?.trim() || null,
    website: usableWebsite(p.website),
  };
}

/**
 * Profiles of an answer of `GET /v1/public/wineries`, or null when the answer is not
 * the API's envelope or holds no usable profile (an empty network included): null
 * means "keep the directory of `src/content`". Invalid and repeated items are dropped.
 */
export function parseDirectory(body: unknown): PublicWinery[] | null {
  const envelope = EnvelopeSchema.safeParse(body);
  if (!envelope.success) return null;
  const seen = new Set<string>();
  const profiles = envelope.data.data.items.flatMap((item) => {
    const profile = parseProfile(item);
    if (!profile || seen.has(profile.slug)) return [];
    seen.add(profile.slug);
    return [profile];
  });
  return profiles.length > 0 ? profiles : null;
}
