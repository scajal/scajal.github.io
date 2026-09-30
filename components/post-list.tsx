import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogContent } from "@/content/types";
import { formatDay, minutesRead, type Post } from "@/lib/blog";

/** The list of posts, shared by the blog index and the home page section. */
export function PostList({
  locale,
  posts,
  blog,
  heading: Heading = "h2",
}: {
  locale: string;
  posts: Post[];
  blog: BlogContent;
  /** h2 on the blog index; one level under the section title elsewhere. */
  heading?: "h2" | "h4";
}) {
  return (
    <ol className="flex flex-col">
      {posts.map((post) => (
        <li key={post.slug} className="group relative border-t border-[var(--rule)]">
          <article className="grid gap-x-8 gap-y-2 py-8 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
            <p className="mono text-subtle-foreground md:pt-1.5">
              <time dateTime={post.published}>{formatDay(post.published, locale)}</time>
              {!post.live && (
                <span className="ml-2 text-[var(--ink-accent-text)]">{blog.scheduled}</span>
              )}
            </p>
            <div className="flex items-start justify-between gap-6">
              <div>
                <Heading className="text-xl font-medium tracking-tight text-balance">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="link decoration-transparent after:absolute after:inset-0 group-hover:decoration-[var(--ink-accent)]"
                  >
                    {post.title}
                  </Link>
                </Heading>
                <p className="prose-body mt-3 text-[1rem]">{post.description}</p>
                <p className="mono mt-3 text-muted-foreground">
                  {minutesRead(blog.minutesRead, post.minutes)}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden
                className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-1 group-hover:text-[var(--ink-accent)]"
              />
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
