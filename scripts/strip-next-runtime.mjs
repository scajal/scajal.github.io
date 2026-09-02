/**
 * Next still emits the App Router runtime on a fully static export — React,
 * the flight payload, and a nomodule polyfill — even when the HTML is already
 * complete and there are no client components. Parsing that JS is what
 * PageSpeed reports as desktop TBT. The site uses plain <a> tags and a tiny
 * inline enhance script, so the runtime can go.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function strip(html) {
  return html
    .replace(/<link\b[^>]*rel="preload"[^>]*as="script"[^>]*>/gi, "")
    .replace(/<script\b[^>]*src="\/_next\/static\/[^"]*"[^>]*><\/script>/gi, "")
    .replace(
      /<script>(?:\(self\.__next_f|self\.__next_f)[\s\S]*?<\/script>/g,
      "",
    );
}

const htmlFiles = (await walk(OUT)).filter((f) => f.endsWith(".html"));
let patched = 0;
let bytes = 0;
for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  const next = strip(source);
  if (next === source) continue;
  await writeFile(file, next);
  patched += 1;
  bytes += source.length - next.length;
}

console.log(
  `runtime: stripped Next client JS from ${patched} page(s) (${(bytes / 1024).toFixed(1)} KiB)`,
);
