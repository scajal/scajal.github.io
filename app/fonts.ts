import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

export const switzer = localFont({
  src: "./fonts/Switzer-Variable.woff2",
  variable: "--font-switzer",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  // Labels, not the LCP headline. Preloading it contends with Switzer
  // on Slow 4G and delays the paint PageSpeed measures.
  preload: false,
});

/** Runs before first paint so the theme never flashes. */
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var e=document.documentElement;e.dataset.theme=d?"dark":"light";e.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
