import type { MetadataRoute } from "next";
import { BUILT_LOCALES } from "@/content";
import { CASE_SLUGS } from "@/content/types";
import { gitLastModified } from "@/lib/last-modified";
import { DEFAULT_LOCALE, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Sources behind each page, for `lastmod`. Copy lives in content/<locale>.ts
 * and the markup in the route, so a change to either is a real change to the
 * page a crawler would fetch.
 */
function sources(locale: string, slug?: string) {
  return [
    `content/${locale}.ts`,
    slug ? "app/[locale]/work/[slug]/page.tsx" : "app/[locale]/page.tsx",
  ];
}

/**
 * hreflang has to agree with the tags the pages themselves emit, or Google
 * discards the cluster. x-default is the root, which is the language chooser.
 */
function alternates(path: string, xDefault: string) {
  return {
    languages: {
      ...Object.fromEntries(
        BUILT_LOCALES.map((l) => [
          l,
          `${SITE_URL}${path.replace(/^\/[a-z]{2}/, `/${l}`)}/`,
        ]),
      ),
      "x-default": xDefault,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const home = BUILT_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}/`,
    lastModified: gitLastModified(sources(locale)),
    changeFrequency: "monthly" as const,
    priority: 1,
    // The chooser at / is noindex, so it is never its own <loc> here — but it
    // is the right x-default, and the home pages already say so in their tags.
    alternates: alternates(`/${locale}`, `${SITE_URL}/`),
  }));

  const cases = BUILT_LOCALES.flatMap((locale) =>
    CASE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${locale}/work/${slug}/`,
      lastModified: gitLastModified(sources(locale, slug)),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // No chooser this deep, so the default locale is the fallback.
      alternates: alternates(
        `/${locale}/work/${slug}`,
        `${SITE_URL}/${DEFAULT_LOCALE}/work/${slug}/`,
      ),
    })),
  );

  return [...home, ...cases];
}
