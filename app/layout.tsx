import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Santiago Cajal — Software Development Lead & Full-Stack Engineer",
  description:
    "Portfolio of Santiago Cajal, Software Development Lead and Full-Stack Engineer focused on secure, scalable fintech and IoT platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-[100dvh] bg-[color:var(--background)] text-[color:var(--text-primary)]">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12)_0,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9)_0,_rgba(15,23,42,1)_60%)]" />
          <Navbar />
          <main className="pt-4 md:pt-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

