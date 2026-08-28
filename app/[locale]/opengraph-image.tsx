import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { PROFILE } from "@/lib/site";

// Required by `output: export`: these routes are baked at build time.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = PROFILE.name;

export function generateStaticParams() {
  return BUILT_LOCALES.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = getContent(locale as BuiltLocale);

  const [medium, regular] = await Promise.all([
    readFile(join(process.cwd(), "assets/Switzer-Medium.otf")),
    readFile(join(process.cwd(), "assets/Switzer-Regular.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          color: "#fafafa",
          padding: 72,
          fontFamily: "Switzer",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Satori lays sibling flex children in a row, so the accent is a
              mark of its own rather than a coloured span inside the text. */}
          <div style={{ display: "flex", width: 18, height: 18, borderRadius: 18, background: "#93de04" }} />
          <div style={{ display: "flex", fontSize: 24, color: "#a1a1aa" }}>
            {PROFILE.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            maxWidth: 940,
          }}
        >
          {`${content.hero.headline.join(" ")}.`}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#a1a1aa",
          }}
        >
          <span>scajal.dev</span>
          <span>{PROFILE.location}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Switzer", data: medium, weight: 500, style: "normal" },
        { name: "Switzer", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
