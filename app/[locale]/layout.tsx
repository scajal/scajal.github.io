import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { geistMono, switzer, themeScript } from "@/app/fonts";
import { SiteChrome } from "@/components/site-chrome";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { PROFILE, SITE_URL } from "@/lib/site";

export const viewport: Viewport = {
  // Matches the painted background in each scheme, so the browser chrome
  // on mobile does not sit against a different colour than the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

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
      // x-default points at the root, which is the language chooser.
      languages: { en: "/en", es: "/es", "x-default": "/" },
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
  const { nav, footer } = getContent(locale);

  return (
    <html
      lang={locale}
      className={`${switzer.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-sm"
        >
          {nav.skipToContent}
        </a>

        <SiteChrome locale={locale} themeLabel={nav.themeToggle} />

        {children}

        <footer className="section">
          <div className="shell flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="mono text-subtle-foreground">
              © {new Date().getFullYear()} {PROFILE.name}
            </p>
            <p className="mono text-subtle-foreground">{footer.built}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
