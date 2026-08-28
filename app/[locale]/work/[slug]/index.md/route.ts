import { BUILT_LOCALES, type BuiltLocale } from "@/content";
import { CASE_SLUGS, type CaseSlug } from "@/content/types";
import { caseMarkdown } from "@/lib/agent-text";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BUILT_LOCALES.flatMap((locale) =>
    CASE_SLUGS.map((slug) => ({ locale, slug })),
  );
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/[locale]/work/[slug]/index.md">,
) {
  const { locale, slug } = await params;
  return new Response(caseMarkdown(locale as BuiltLocale, slug as CaseSlug), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
