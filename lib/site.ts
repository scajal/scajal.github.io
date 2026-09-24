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
 * Each project's own public site. It is the same in every locale, so it lives
 * here rather than in the content dictionaries; a project with nothing public
 * to visit is simply left out.
 */
export const PROJECT_SITES: Partial<Record<CaseSlug, string>> = {
  contamos: "https://contamos.xyz",
  criptala: "https://criptala.io",
  "rabbit-iot": "https://agro.rabbit.com.uy",
};

/** A site's host, which is how a project link reads: "contamos.xyz". */
export function siteHost(url: string): string {
  return new URL(url).host;
}
