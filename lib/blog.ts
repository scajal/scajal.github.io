/**
 * The blog: Markdown files with front matter under content/blog/<locale>/,
 * one file per post. A post lives in its own language, and may name its
 * translation under another slug in its front matter.
 *
 * Posts are scheduled by date. The site is a static export, so "published"
 * means "published as of the build": a post dated in the future is left out
 * of every list, feed, sitemap and index until a build runs on or after its
 * date — which is what the daily scheduled deploy is for.
 *
 * Every post still gets a page built, scheduled or not: a static export
 * refuses a dynamic route with no params, which is what the blog would be
 * before its first post is out. A scheduled post's page is marked
 * `data-scheduled` and scripts/prune-scheduled.mjs deletes it from the
 * export, so it never ships. Under `next dev` nothing is pruned, and a
 * scheduled post can be previewed at its own URL.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { BUILT_LOCALES, type BuiltLocale } from "@/content";
import { gitLastModified } from "@/lib/last-modified";
import { SITE_URL } from "@/lib/site";

const ROOT = join(process.cwd(), "content/blog");

/** The words a reader gets through in a minute. */
const WORDS_PER_MINUTE = 200;

/**
 * Dates in front matter are calendar days in the author's timezone, so the
 * day a post comes out is decided there rather than in the build runner's UTC.
 */
const TIMEZONE = "America/Montevideo";

/** Outside a production build every post is visible, for previewing. */
const PREVIEW = process.env.NODE_ENV !== "production";

export type Heading = { id: string; text: string; level: 2 | 3 };

export type Post = {
  locale: BuiltLocale;
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  published: string;
  /** YYYY-MM-DD, when the post was revised after it came out. */
  updated?: string;
  /** Other languages the post is written in, by locale, as slugs. */
  translations: Partial<Record<BuiltLocale, string>>;
  /** Out as of this build. False only ever shows up in preview. */
  live: boolean;
  minutes: number;
  /** The Markdown body as written, without front matter. */
  body: string;
  file: string;
};

/**
 * Today's date in the author's timezone, as YYYY-MM-DD. `BLOG_TODAY` pins it,
 * to build the site as it will look on a later day.
 */
function today(): string {
  if (process.env.BLOG_TODAY) return process.env.BLOG_TODAY;
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** gray-matter parses unquoted YAML dates into Date objects. */
function day(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return undefined;
}

function read(locale: BuiltLocale, slug: string): Post {
  const file = `content/blog/${locale}/${slug}.md`;
  const { data, content } = matter(readFileSync(join(ROOT, locale, `${slug}.md`), "utf8"));

  const published = day(data.published);
  // A post without a date has no place in an index ordered by it.
  if (!published) throw new Error(`${file}: missing or malformed "published" date`);
  if (typeof data.title !== "string" || typeof data.description !== "string") {
    throw new Error(`${file}: "title" and "description" are required`);
  }

  const translations: Post["translations"] = {};
  for (const [other, otherSlug] of Object.entries(data.translations ?? {})) {
    if ((BUILT_LOCALES as string[]).includes(other) && typeof otherSlug === "string") {
      translations[other as BuiltLocale] = otherSlug;
    }
  }

  const body = content.trim();

  return {
    locale,
    slug,
    title: data.title,
    description: data.description,
    published,
    updated: day(data.updated),
    translations,
    live: data.draft !== true && published <= today(),
    minutes: Math.max(1, Math.ceil(body.split(/\s+/).length / WORDS_PER_MINUTE)),
    body,
    file,
  };
}

function slugsIn(locale: BuiltLocale): string[] {
  try {
    return readdirSync(join(ROOT, locale))
      .filter((name) => name.endsWith(".md"))
      .map((name) => name.slice(0, -3));
  } catch {
    return [];
  }
}

/** Every post in the given locale, scheduled or not, newest first. */
export function getAllPosts(locale: BuiltLocale): Post[] {
  return slugsIn(locale)
    .map((slug) => read(locale, slug))
    .sort((a, b) => b.published.localeCompare(a.published));
}

/**
 * The posts a reader may find in the given locale, newest first. In preview
 * that includes posts that are not out yet; `live` tells them apart.
 */
export function getPosts(locale: BuiltLocale): Post[] {
  return getAllPosts(locale).filter((post) => post.live || PREVIEW);
}

/** Only the posts that are out, for anything listing or linking to them. */
export function getLivePosts(locale: BuiltLocale): Post[] {
  return getPosts(locale).filter((post) => post.live);
}

/** The post with the given slug, scheduled or not. */
export function getPost(locale: BuiltLocale, slug: string): Post | undefined {
  return getAllPosts(locale).find((post) => post.slug === slug);
}

export const blogUrl = (locale: string) => `${SITE_URL}/${locale}/blog/`;
export const postPath = (locale: string, slug: string) => `/${locale}/blog/${slug}/`;
export const postUrl = (locale: string, slug: string) => `${SITE_URL}${postPath(locale, slug)}`;
export const postMd = (locale: string, slug: string) => `${postUrl(locale, slug)}index.md`;
export const feedUrl = (locale: string) => `${blogUrl(locale)}feed.xml`;

/**
 * The post's translations that can actually be read, itself included, keyed
 * by locale. A translation that is missing or not out yet is left out, so
 * hreflang never points at a 404.
 */
export function versions(post: Post): Partial<Record<BuiltLocale, string>> {
  const found: Partial<Record<BuiltLocale, string>> = { [post.locale]: post.slug };
  for (const [locale, slug] of Object.entries(post.translations) as [BuiltLocale, string][]) {
    const translation = getPost(locale, slug);
    // A scheduled post may name its scheduled translation (both are only
    // ever previewed), but a live one only names translations that are out.
    if (translation && (translation.live || !post.live || PREVIEW)) found[locale] = slug;
  }
  return found;
}

/**
 * `lastmod` for the sitemap. A scheduled post is committed before it comes
 * out, so the commit date alone would predate the post; the later of the two
 * is when the page a crawler fetches last changed.
 */
export function lastModified(post: Post): string {
  const committed = gitLastModified([post.file])?.slice(0, 10);
  const dates = [post.published, post.updated, committed].filter(
    (date): date is string => Boolean(date),
  );
  return dates.sort().at(-1)!;
}

/** A blog post link that leads nowhere yet: `/es/blog/<slug>/` not out. */
function isUnpublishedPost(href: string): boolean {
  const match = /^\/([a-z]{2})\/blog\/([^/#?]+)\/?(?:[#?].*)?$/.exec(href);
  if (!match || !(BUILT_LOCALES as string[]).includes(match[1])) return false;
  const post = getPost(match[1] as BuiltLocale, match[2]);
  return !post || (!post.live && !PREVIEW);
}

const attr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function slugify(text: string, seen: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z#0-9]+;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count ? `${base}-${count}` : base;
}

/**
 * Render a post's Markdown to HTML, collecting its second- and third-level
 * headings for the table of contents. Raw HTML in the source is escaped: the
 * posts are ours, but a Markdown file is no place for markup.
 */
export function render(post: Post): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const marked = new Marked({ gfm: true });

  marked.use({
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      },
      heading({ tokens, depth }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        // A post's title is its only h1, so a stray one in the body drops a level.
        const level = Math.max(2, depth);
        const plain = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        const id = slugify(plain, seen);
        if (level === 2 || level === 3) headings.push({ id, text: plain, level });
        return `<h${level} id="${id}"><a href="#${id}" class="anchor" aria-hidden="true" tabindex="-1">#</a>${inner}</h${level}>\n`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        // A link to a scheduled post would 404 until its day, so it reads as
        // plain text until then and becomes a link in the build that
        // publishes the target.
        if (isUnpublishedPost(href)) return inner;
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE_URL);
        const attrs = [
          `href="${attr(href)}"`,
          title ? `title="${attr(title)}"` : "",
          external ? 'target="_blank" rel="noreferrer noopener"' : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<a ${attrs}>${inner}</a>`;
      },
      table(token: Tokens.Table) {
        // Wide tables scroll inside their own box instead of the page.
        const header = token.header
          .map((cell) => this.tablecell(cell))
          .join("");
        const rows = token.rows
          .map((row) => `<tr>${row.map((cell) => this.tablecell(cell)).join("")}</tr>`)
          .join("\n");
        return `<div class="table-scroll"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });

  const html = marked.parse(post.body, { async: false });
  return { html, headings };
}

/**
 * The post as Markdown, for agents: its title as the only h1, the body as
 * written, root-relative links made absolute so they survive being copied
 * elsewhere, and links to posts that are not out yet reduced to their text.
 */
export function postMarkdown(post: Post): string {
  const body = post.body.replace(
    /\[([^\]]+)\]\((\/[^)\s]+)\)/g,
    (_, text: string, href: string) =>
      isUnpublishedPost(href) ? text : `[${text}](${SITE_URL}${href})`,
  );

  return [
    `# ${post.title}`,
    "",
    `> ${post.description}`,
    "",
    `- Canonical page: ${postUrl(post.locale, post.slug)}`,
    `- Published: ${post.published}`,
    ...(post.updated ? [`- Updated: ${post.updated}`] : []),
    "",
    body,
    "",
  ].join("\n");
}

/** A YYYY-MM-DD day as the locale writes it: "6 October 2026". */
export function formatDay(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export function minutesRead(template: string, minutes: number): string {
  return template.replace("{minutes}", String(minutes));
}
