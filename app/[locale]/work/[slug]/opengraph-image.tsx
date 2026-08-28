import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { CASE_SLUGS, type CaseSlug } from "@/content/types";
import { PROFILE } from "@/lib/site";

// Required by `output: export`: these routes are baked at build time.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = PROFILE.name;

// Image routes under `output: export` need every dynamic param, not just
// the ones below the parent segment.
export function generateStaticParams() {
  return BUILT_LOCALES.flatMap((locale) =>
    CASE_SLUGS.map((slug) => ({ locale, slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const content = getContent(locale as BuiltLocale);
  const study = content.cases.studies[slug as CaseSlug];

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#a1a1aa",
          }}
        >
          <span>{PROFILE.name}</span>
          <span>{study.years}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", width: 56, height: 5, background: "#93de04" }} />
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {`${study.name}.`}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: "#a1a1aa",
              maxWidth: 900,
            }}
          >
            {study.lede}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#a1a1aa" }}>
          scajal.dev
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
