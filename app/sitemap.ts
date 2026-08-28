import type { MetadataRoute } from "next";
import { BUILT_LOCALES } from "@/content";
import { CASE_SLUGS } from "@/content/types";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = BUILT_LOCALES.flatMap((locale) => [
    `/${locale}`,
    ...CASE_SLUGS.map((slug) => `/${locale}/work/${slug}`),
  ]);

  return paths.map((path) => ({
    url: `${SITE_URL}${path}/`,
    changeFrequency: "monthly",
    priority: path.includes("/work/") ? 0.7 : 1,
    alternates: {
      languages: Object.fromEntries(
        BUILT_LOCALES.map((l) => [
          l,
          `${SITE_URL}${path.replace(/^\/[a-z]{2}/, `/${l}`)}/`,
        ]),
      ),
    },
  }));
}
