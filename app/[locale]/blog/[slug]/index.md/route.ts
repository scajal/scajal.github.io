import { BUILT_LOCALES, type BuiltLocale } from "@/content";
import { getAllPosts, getPost, postMarkdown } from "@/lib/blog";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BUILT_LOCALES.flatMap((locale) =>
    getAllPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/[locale]/blog/[slug]/index.md">,
) {
  const { locale, slug } = await params;
  const post = getPost(locale as BuiltLocale, slug);
  if (!post) return new Response("Not found", { status: 404 });

  return new Response(postMarkdown(post), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
