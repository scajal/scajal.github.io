import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { blogUrl, feedUrl, getLivePosts, postUrl } from "@/lib/blog";
import { PROFILE } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BUILT_LOCALES.map((locale) => ({ locale }));
}

const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Noon in Montevideo, so the day survives any reader's timezone. */
const rfc822 = (day: string) => new Date(`${day}T15:00:00Z`).toUTCString();

/**
 * The blog in one language as RSS 2.0, for feed readers and the aggregators
 * that pick new posts up from it. Only posts that are out are listed.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/[locale]/blog/feed.xml">,
) {
  const { locale } = await params;
  const { blog } = getContent(locale as BuiltLocale);
  const posts = getLivePosts(locale as BuiltLocale);

  const items = posts
    .map((post) =>
      [
        "<item>",
        `<title>${xml(post.title)}</title>`,
        `<link>${postUrl(locale, post.slug)}</link>`,
        `<guid isPermaLink="true">${postUrl(locale, post.slug)}</guid>`,
        `<description>${xml(post.description)}</description>`,
        `<dc:creator>${xml(PROFILE.name)}</dc:creator>`,
        `<pubDate>${rfc822(post.published)}</pubDate>`,
        "</item>",
      ].join(""),
    )
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    `<title>${xml(blog.metaTitle)}</title>`,
    `<link>${blogUrl(locale)}</link>`,
    `<atom:link href="${feedUrl(locale)}" rel="self" type="application/rss+xml"/>`,
    `<description>${xml(blog.description)}</description>`,
    `<language>${locale}</language>`,
    // The channel is as recent as its newest post.
    posts[0] ? `<lastBuildDate>${rfc822(posts[0].published)}</lastBuildDate>` : "",
    items,
    "</channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
