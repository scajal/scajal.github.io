import type { Content } from "./types";
import { en } from "./en";
import type { Locale } from "@/lib/site";

// Spanish lands in phase 2. Adding `es` here is the only wiring needed.
const dictionaries = { en } satisfies Partial<Record<Locale, Content>>;

export type BuiltLocale = keyof typeof dictionaries;
export const BUILT_LOCALES = Object.keys(dictionaries) as BuiltLocale[];

export function getContent(locale: BuiltLocale): Content {
  return dictionaries[locale];
}
