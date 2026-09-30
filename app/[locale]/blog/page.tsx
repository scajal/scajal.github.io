import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { PostList } from "@/components/post-list";
import { blogUrl, feedUrl, getPosts, postUrl } from "@/lib/blog";
import { DEFAULT_LOCALE, PROFILE, SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  const { blog } = getContent(locale as BuiltLocale);
  const empty = getPosts(locale as BuiltLocale).every((post) => !post.live);

  return {
    title: blog.metaTitle,
    description: blog.description,
    // Until the first post is out the page is an empty shell, which is not
    // worth a crawler's time. It indexes itself on the build that fills it.
    robots: empty ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        ...Object.fromEntries(BUILT_LOCALES.map((l) => [l, `/${l}/blog`])),
        "x-default": `/${DEFAULT_LOCALE}/blog`,
      },
      types: { "application/rss+xml": `/${locale}/blog/feed.xml` },
    },
    openGraph: {
      type: "website",
      locale,
      url: blogUrl(locale),
      title: blog.metaTitle,
      description: blog.description,
      siteName: PROFILE.name,
    },
  };
}

export default async function BlogIndex({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  const content = getContent(locale as BuiltLocale);
  const { blog } = content;
  const posts = getPosts(locale as BuiltLocale);
  const live = posts.filter((post) => post.live);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${blogUrl(locale)}#blog`,
        url: blogUrl(locale),
        name: blog.metaTitle,
        description: blog.description,
        inLanguage: locale,
        author: { "@id": `${SITE_URL}/#person` },
        blogPost: live.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.published,
          url: postUrl(locale, post.slug),
        })),
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
        ],
      },
    ],
  };

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell pb-[clamp(2.5rem,6vw,5rem)] pt-[clamp(1.5rem,4vw,3rem)]">
        <h1 className="display mt-12 max-w-[14ch]">
          <span className="kinetic-line" style={{ animationDelay: "60ms" }}>
            {blog.title}
            <span style={{ color: "var(--ink-accent)" }}>.</span>
          </span>
        </h1>
        <p className="fade-up prose-body mt-7 text-lg" style={{ animationDelay: "180ms" }}>
          {blog.description}
        </p>
        <a
          href={feedUrl(locale)}
          className="fade-up mono mt-6 inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-[var(--ink-accent-text)]"
          style={{ animationDelay: "240ms" }}
        >
          {blog.rss}
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
      </div>

      <section aria-label={blog.title} className="section">
        <div className="shell">
          {posts.length === 0 ? (
            <div>
              <p className="section-title">{blog.empty.title}</p>
              <p className="prose-body mt-4">{blog.empty.body}</p>
            </div>
          ) : (
            <PostList locale={locale} posts={posts} blog={blog} />
          )}
        </div>
      </section>
    </main>
  );
}
