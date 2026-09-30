/**
 * Every blog post gets a page built, scheduled or not, because a static
 * export refuses a dynamic route with no params — which the blog would be
 * before its first post is out (see lib/blog.ts). A post that is not out yet
 * renders with `data-scheduled` on <main>; this deletes its whole directory
 * (page, Markdown twin, OG image, RSC payloads) so it never ships.
 *
 * Everything that lists or links to posts already reads only the ones that
 * are out, so nothing left behind points at what this removes.
 */
import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";

let pruned = 0;
for (const locale of await readdir(OUT, { withFileTypes: true })) {
  if (!locale.isDirectory()) continue;
  const blog = join(OUT, locale.name, "blog");

  let posts;
  try {
    posts = await readdir(blog, { withFileTypes: true });
  } catch {
    continue;
  }

  for (const post of posts) {
    if (!post.isDirectory()) continue;
    const dir = join(blog, post.name);
    const html = await readFile(join(dir, "index.html"), "utf8").catch(() => "");
    if (/<main\b[^>]*\bdata-scheduled\b/.test(html)) {
      await rm(dir, { recursive: true });
      pruned += 1;
    }
  }
}

console.log(`blog: pruned ${pruned} scheduled post(s) from the export`);
