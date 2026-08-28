import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { PROFILE, SITE_URL } from "@/lib/site";

const switzer = localFont({
  src: "../fonts/Switzer-Variable.woff2",
  variable: "--font-switzer",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Runs before first paint so the theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function generateStaticParams() {
  return BUILT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isBuilt(locale)) return {};
  const content = getContent(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", es: "/es" },
    },
    openGraph: {
      type: "profile",
      locale,
      url: `${SITE_URL}/${locale}`,
      title: content.meta.title,
      description: content.meta.description,
      siteName: PROFILE.name,
    },
    twitter: { card: "summary_large_image" },
  };
}

function isBuilt(locale: string): locale is BuiltLocale {
  return (BUILT_LOCALES as string[]).includes(locale);
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isBuilt(locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${switzer.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
