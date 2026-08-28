/**
 * Next's sitemap generator gives no hook for an xml-stylesheet processing
 * instruction, so it gets stitched on after the export. Purely cosmetic: it
 * turns out/sitemap.xml into a readable table for anyone who opens it in a
 * browser, and is ignored by every crawler.
 */
import { readFile, writeFile } from "node:fs/promises";

const SITEMAP = "out/sitemap.xml";
const PI = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

const source = await readFile(SITEMAP, "utf8");

if (source.includes("xml-stylesheet")) {
  console.log("sitemap: stylesheet already attached");
} else if (!source.startsWith("<?xml")) {
  // Without a declaration to anchor to, guessing where the PI belongs risks
  // emitting invalid XML — better to leave the sitemap correct but unstyled.
  throw new Error(`${SITEMAP}: no XML declaration to insert the stylesheet after`);
} else {
  const end = source.indexOf("?>") + 2;
  const next = `${source.slice(0, end)}\n${PI}${source.slice(end)}`;
  await writeFile(SITEMAP, next);
  console.log("sitemap: attached /sitemap.xsl");
}
