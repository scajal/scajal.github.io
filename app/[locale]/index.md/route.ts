import { BUILT_LOCALES, type BuiltLocale } from "@/content";
import { homeMarkdown } from "@/lib/agent-text";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BUILT_LOCALES.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/[locale]/index.md">,
) {
  const { locale } = await params;
  return new Response(homeMarkdown(locale as BuiltLocale), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
