import type { Metadata } from "next";
import "../globals.css";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Santiago Cajal",
  description: "Tech Lead & Full-Stack Engineer, Montevideo.",
  alternates: { languages: { en: "/en", es: "/es" } },
  robots: { index: false, follow: true },
};

export default function RedirectLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
