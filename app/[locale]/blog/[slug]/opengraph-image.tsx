import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { getAllPosts, getPost, formatDay } from "@/lib/blog";
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
    getAllPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { blog } = getContent(locale as BuiltLocale);
  const post = getPost(locale as BuiltLocale, slug)!;

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
          <span>{formatDay(post.published, locale)}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", width: 18, height: 18, borderRadius: 18, background: "#93de04" }} />
          <div
            style={{
              display: "flex",
              fontSize: post.title.length > 48 ? 64 : 76,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              maxWidth: 1000,
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.35,
              color: "#a1a1aa",
              maxWidth: 940,
            }}
          >
            {post.description}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#a1a1aa" }}>
          {`scajal.dev/${locale}/${blog.title.toLowerCase()}`}
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
