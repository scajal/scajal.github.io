import type { CaseSlug } from "@/content/types";

export const SITE_URL = "https://scajal.dev";

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const PROFILE = {
  name: "Santiago Cajal",
  email: "hello@scajal.dev",
  linkedin: "https://linkedin.com/in/scajal",
  github: "https://github.com/scajal",
  location: "Montevideo, Uruguay",
} as const;

/**
 * Each project's own public site, or its source when the code is what is left
 * to visit. It is the same in every locale, so it lives here rather than in the
 * content dictionaries; a project with nothing public to visit is left out.
 */
export const PROJECT_SITES: Partial<Record<CaseSlug, string>> = {
  contamos: "https://github.com/scajal/contamos",
  criptala: "https://criptala.io",
  "rabbit-iot": "https://agro.rabbit.com.uy",
};

/**
 * How a project link reads: the host, plus the path when there is one, so a
 * repository shows as "github.com/scajal/contamos" rather than "github.com".
 */
export function siteLabel(url: string): string {
  const { host, pathname } = new URL(url);

  return host + pathname.replace(/\/+$/, "");
}
