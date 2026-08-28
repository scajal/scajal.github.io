import type { Metadata } from "next";
import "./globals.css";
import { geistMono, switzer, themeScript } from "@/app/fonts";

export const metadata: Metadata = {
  title: "404 — Santiago Cajal",
  robots: { index: false, follow: false },
};

// A stranger landing on a broken URL has no locale context, so this page
// carries both languages rather than guessing at one.
const copy = [
  {
    lang: "en",
    heading: "This page doesn't exist",
    body: "The link is broken or the page has moved.",
    action: "Go to the homepage",
    href: "/en/",
  },
  {
    lang: "es",
    heading: "Esta página no existe",
    body: "El enlace está roto o la página se mudó.",
    action: "Ir al inicio",
    href: "/es/",
  },
];

export default function NotFound() {
  return (
    <html
      lang="en"
      className={`${switzer.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <main className="shell flex flex-1 flex-col justify-center py-24">
          <p className="eyebrow">404</p>
          <div className="mt-10 flex flex-col gap-12 sm:flex-row sm:gap-20">
            {copy.map((block) => (
              <section key={block.lang} lang={block.lang}>
                <h1 className="section-title max-w-[16ch]">{block.heading}</h1>
                <p className="prose-body mt-4 text-[1rem]">{block.body}</p>
                <a href={block.href} className="link mono mt-6 inline-block">
                  {block.action}
                </a>
              </section>
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
