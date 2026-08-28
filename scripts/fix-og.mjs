/**
 * Next emits generated OG images as extensionless files (out/en/opengraph-image).
 * GitHub Pages serves those as application/octet-stream, which most link
 * unfurlers reject. This copies each one to a .png sibling and repoints the
 * meta tags at it.
 */
import { readdir, readFile, writeFile, copyFile } from "node:fs/promises";
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

const files = await walk(OUT);

const images = files.filter((f) => f.endsWith("/opengraph-image"));
for (const image of images) {
  await copyFile(image, `${image}.png`);
}

const html = files.filter((f) => f.endsWith(".html"));
let patched = 0;
for (const file of html) {
  const source = await readFile(file, "utf8");
  // /en/opengraph-image?abc123  ->  /en/opengraph-image.png
  const next = source.replace(/\/opengraph-image(\?[a-z0-9]+)?/gi, "/opengraph-image.png");
  if (next !== source) {
    await writeFile(file, next);
    patched += 1;
  }
}

console.log(`og: copied ${images.length} image(s), patched ${patched} page(s)`);
