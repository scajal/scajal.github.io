import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getContent, type BuiltLocale } from "@/content";
import {
  blogUrl,
  formatDay,
  getLivePosts,
  getPost,
  getAllPosts,
  minutesRead,
  postPath,
  postUrl,
  render,
  versions,
} from "@/lib/blog";
import { DEFAULT_LOCALE, PROFILE, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  return getAllPosts(params.locale as BuiltLocale).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale as BuiltLocale, slug);
  if (!post) return {};

  // hreflang only names the languages the post can actually be read in, so a
  // missing translation never points a crawler at a 404.
  const found = versions(post);
  const languages: Record<string, string> = Object.fromEntries(
    Object.entries(found).map(([l, s]) => [l, postPath(l, s)]),
  );
  languages["x-default"] = found[DEFAULT_LOCALE]
    ? postPath(DEFAULT_LOCALE, found[DEFAULT_LOCALE])
    : postPath(locale, slug);

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: PROFILE.name, url: `${SITE_URL}/${locale}/` }],
    // A scheduled post is only ever built to preview it.
    robots: post.live ? undefined : { index: false, follow: false },
    alternates: {
      canonical: postPath(locale, slug),
      languages,
      types: {
        "text/markdown": `${postPath(locale, slug)}index.md`,
        "application/rss+xml": `/${locale}/blog/feed.xml`,
      },
    },
    openGraph: {
      type: "article",
      locale,
      url: postUrl(locale, slug),
      title: post.title,
      description: post.description,
      siteName: PROFILE.name,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [`${SITE_URL}/${locale}/`],
    },
  };
}

export default async function BlogPost({
  params,
}: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  const post = getPost(locale as BuiltLocale, slug);
  if (!post) notFound();

  const content = getContent(locale as BuiltLocale);
  const { blog } = content;
  const { html, headings } = render(post);

  // The newest other posts in the same language. Only posts that are out are
  // listed, so a scheduled post is linked the day it comes out, never before.
  const related = getLivePosts(locale as BuiltLocale)
    .filter((other) => other.slug !== slug)
    .slice(0, 3);

  const url = postUrl(locale, slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: post.title,
        description: post.description,
        image: `${url}opengraph-image.png`,
        datePublished: post.published,
        dateModified: post.updated ?? post.published,
        inLanguage: locale,
        wordCount: post.body.split(/\s+/).length,
        articleSection: headings.filter((h) => h.level === 2).map((h) => h.text),
        isPartOf: { "@id": `${blogUrl(locale)}#blog` },
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: PROFILE.name,
          url: `${SITE_URL}/${locale}/`,
        },
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: content.meta.title,
            item: `${SITE_URL}/${locale}/`,
          },
          { "@type": "ListItem", position: 2, name: blog.title, item: blogUrl(locale) },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <main
      id="main"
      className="flex-1"
      // Read by scripts/prune-scheduled.mjs, which deletes the page from the
      // export until the post is out.
      data-scheduled={post.live ? undefined : ""}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell pb-[clamp(2.5rem,6vw,5rem)] pt-[clamp(1.5rem,4vw,3rem)]">
        <Link
          href={`/${locale}/blog`}
          className="mono inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {blog.backToBlog}
        </Link>

        <p className="mono mt-12 flex flex-wrap gap-x-3 gap-y-1 text-subtle-foreground">
          <time dateTime={post.published}>{formatDay(post.published, locale)}</time>
          <span aria-hidden>·</span>
          <span>{minutesRead(blog.minutesRead, post.minutes)}</span>
          {!post.live && (
            <span className="text-[var(--ink-accent-text)]">{blog.scheduled}</span>
          )}
        </p>
        <h1 className="post-title mt-4 max-w-[24ch]">
          <span className="kinetic-line" style={{ animationDelay: "60ms" }}>
            {post.title}
          </span>
        </h1>
        <p className="fade-up prose-body mt-7 text-lg" style={{ animationDelay: "180ms" }}>
          {post.description}
        </p>
      </div>

      <section aria-label={post.title} className="section">
        <div className="shell section-grid">
          {/* The label column holds the table of contents, pinned while the
              post scrolls past it. */}
          <aside className="hidden lg:block">
            {headings.some((h) => h.level === 2) && (
              <nav aria-label={blog.onThisPage} className="sticky top-8">
                <p className="eyebrow">{blog.onThisPage}</p>
                <ol className="mt-4 flex flex-col gap-2.5">
                  {headings
                    .filter((h) => h.level === 2)
                    .map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="block text-[0.8125rem] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                </ol>
              </nav>
            )}
          </aside>

          {/* min-w-0 lets wide code blocks and tables scroll inside their own
              box instead of stretching the grid column past the viewport. */}
          <div className="min-w-0">
            <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />

            <p className="mono mt-12 border-t border-[var(--rule)] pt-6 text-subtle-foreground">
              {PROFILE.name} · {blog.published}{" "}
              <time dateTime={post.published}>{formatDay(post.published, locale)}</time>
              {post.updated && (
                <>
                  {" "}· {blog.updated}{" "}
                  <time dateTime={post.updated}>{formatDay(post.updated, locale)}</time>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="keep-reading" className="section">
          <div className="shell section-grid">
            <h2 id="keep-reading" className="eyebrow lg:pt-2">
              {blog.keepReading}
            </h2>
            <ul className="flex flex-col">
              {related.map((other) => (
                <li key={other.slug} className="border-t border-[var(--rule)] first:border-t-0">
                  <Link
                    href={`/${locale}/blog/${other.slug}`}
                    className="group flex items-start justify-between gap-6 py-5"
                  >
                    <span className="flex flex-col gap-1.5">
                      <span className="text-lg font-medium tracking-tight text-balance">
                        <span className="link decoration-transparent group-hover:decoration-[var(--ink-accent)]">
                          {other.title}
                        </span>
                      </span>
                      <span className="prose-body text-[0.9375rem]">{other.description}</span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-1 group-hover:text-[var(--ink-accent)]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
