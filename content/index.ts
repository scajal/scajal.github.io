import type { Content } from "./types";
import { en } from "./en";
import { es } from "./es";
import type { Locale } from "@/lib/site";

const dictionaries = { en, es } satisfies Partial<Record<Locale, Content>>;

export type BuiltLocale = keyof typeof dictionaries;
export const BUILT_LOCALES = Object.keys(dictionaries) as BuiltLocale[];

export function getContent(locale: BuiltLocale): Content {
  return dictionaries[locale];
}
