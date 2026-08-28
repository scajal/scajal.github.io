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
