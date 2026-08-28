import { BUILT_LOCALES, type BuiltLocale } from "@/content";
import { llmsFull } from "@/lib/agent-text";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BUILT_LOCALES.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/[locale]/llms-full.txt">,
) {
  const { locale } = await params;
  return new Response(llmsFull(locale as BuiltLocale), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
