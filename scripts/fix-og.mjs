/**
 * Next emits generated images as extensionless files (out/en/opengraph-image,
 * out/apple-icon). GitHub Pages serves those as application/octet-stream, which
 * link unfurlers reject and iOS will not accept as a home-screen icon. This
 * copies each to a .png sibling and repoints the tags that reference them.
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

const GENERATED = ["opengraph-image", "apple-icon"];

const images = files.filter((f) =>
  GENERATED.some((name) => f.endsWith(`/${name}`)),
);
for (const image of images) {
  await copyFile(image, `${image}.png`);
}

const html = files.filter((f) => f.endsWith(".html"));
let patched = 0;
for (const file of html) {
  const source = await readFile(file, "utf8");
  // /en/opengraph-image?abc123  ->  /en/opengraph-image.png
  let next = source;
  for (const name of GENERATED) {
    next = next.replace(
      new RegExp(`/${name}(\\?[a-z0-9]+)?`, "gi"),
      `/${name}.png`,
    );
  }
  if (next !== source) {
    await writeFile(file, next);
    patched += 1;
  }
}

console.log(`images: copied ${images.length}, patched ${patched} page(s)`);
