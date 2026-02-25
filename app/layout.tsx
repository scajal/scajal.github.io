import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Santiago Cajal — Full-Stack Development Lead",
  description:
    "Full-Stack Development Lead with 8+ years building end-to-end products, payment integrations, and scalable platforms. Laravel, React, Vue, Next.js. Based in Montevideo, Uruguay.",
  openGraph: {
    title: "Santiago Cajal — Full-Stack Development Lead",
    description:
      "Full-Stack Development Lead with 8+ years building end-to-end products, payment integrations, and scalable platforms.",
    url: "https://scajal.github.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
