import type { MetadataRoute } from "next";
import { LANGS, LANG_TAG, DEFAULT_LANG, localizedPath, LOCALIZED_PATHS } from "@/lib/i18n/markets";

/**
 * The sitemap, generated rather than served from `public/sitemap.xml`.
 *
 * The static file it replaces listed nine URLs with a hand-typed `lastmod` of
 * 2026-03-27 on every one of them — a date that was already months stale, and
 * that stayed wrong through a full rewrite of the site's copy because nothing
 * connects an XML file in `public/` to the pages it describes. Generating it
 * means a new marketing route is one line here instead of a file nobody
 * remembers exists.
 */

const ORIGIN = "https://fortitudo.agency";

/**
 * When the content of these pages last meaningfully changed.
 *
 * Deliberately one constant rather than `new Date()`. A sitemap that reports
 * "modified just now" on every crawl is not fresh, it is untrustworthy —
 * Google's own guidance is that it discounts `lastmod` wholesale once it
 * catches you doing that, which costs you the signal on the pages where it
 * would have been true. Bump this when the copy actually changes.
 */
const CONTENT_UPDATED = "2026-08-12";

/**
 * Cross-language `hreflang` is withheld for the same reason `src/proxy.ts`
 * withholds the redirect: `/es/*` and `/ru/*` do not exist yet. Advertising
 * them to a crawler earns a lot of 404s and a manual-action-shaped problem,
 * where saying nothing simply leaves the English page indexed on its own.
 *
 * Flip to `true` in the commit that ships the `[lang]` route trees — the same
 * commit that flips `LANG_REDIRECTS_ENABLED`. See `plans/i18n.md`.
 */
const LANG_ALTERNATES_ENABLED: boolean = false;

/**
 * Priority is a hint about relative importance WITHIN this site, not a ranking
 * lever — the home page outranks the pages that sell, which outrank the pages
 * that explain, which outrank the legal pages nobody searches for.
 */
const PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" },
  { path: "/design", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
] as const satisfies ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}>;

/**
 * `hreflang` for one page, or undefined when there is nothing to declare.
 *
 * Only paths in `LOCALIZED_PATHS` get alternates: that list is what "a
 * translation of this page exists" means everywhere else in the codebase, so
 * reading it here keeps the sitemap from claiming more than the router will
 * serve. `x-default` points at English, which is what a crawler should fall
 * back to for a locale we do not publish.
 */
function alternatesFor(path: string): Record<string, string> | undefined {
  if (!LANG_ALTERNATES_ENABLED || !LOCALIZED_PATHS.includes(path)) return undefined;

  const languages: Record<string, string> = { "x-default": `${ORIGIN}${path}` };
  for (const lang of LANGS) {
    languages[LANG_TAG[lang]] = `${ORIGIN}${localizedPath(path, lang)}`;
  }
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const english = PAGES.map((page) => {
    const languages = alternatesFor(page.path);
    return {
      url: `${ORIGIN}${page.path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      ...(languages ? { alternates: { languages } } : {}),
    };
  });

  if (!LANG_ALTERNATES_ENABLED) return english;

  // Every translated page needs its own <url> entry, not just a mention in the
  // English page's alternates — a page that appears only as someone else's
  // hreflang is discoverable but not submitted.
  const translated = PAGES.filter((page) => LOCALIZED_PATHS.includes(page.path)).flatMap((page) =>
    LANGS.filter((lang) => lang !== DEFAULT_LANG).map((lang) => ({
      url: `${ORIGIN}${localizedPath(page.path, lang)}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: alternatesFor(page.path) ?? {} },
    })),
  );

  return [...english, ...translated];
}
