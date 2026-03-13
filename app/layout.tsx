import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppLoadGate } from "@/components/layout/app-load-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://santiagocajal.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Santiago Cajal — Software Development Lead & Full-Stack Engineer",
    template: "%s | Santiago Cajal",
  },
  description:
    "Software development lead & full‑stack engineer building secure, scalable platforms across fintech, crypto, and IoT.",
  applicationName: "Santiago Cajal — Software Development Lead",
  keywords: [
    "software engineer",
    "software development lead",
    "full-stack engineer",
    "tech lead",
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "fintech",
    "crypto",
    "IoT",
  ],
  authors: [{ name: "Santiago Cajal", url: siteUrl }],
  creator: "Santiago Cajal",
  publisher: "Santiago Cajal",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Santiago Cajal — Software Development Lead & Full-Stack Engineer",
    description:
      "Software development lead & full‑stack engineer focused on secure, scalable systems across fintech, crypto, and IoT.",
    siteName: "Santiago Cajal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Santiago Cajal — Software Development Lead & Full-Stack Engineer",
    description:
      "Full‑stack engineer and tech lead building secure, scalable products in fintech, crypto, and IoT.",
    creator: "@santiagocajal",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AppLoadGate>{children}</AppLoadGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
