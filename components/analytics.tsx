import Script from "next/script";

export const GA_MEASUREMENT_ID = "G-H449YB52Y5";

/**
 * Google Analytics 4. `lazyOnload` rather than `afterInteractive`: Next still
 * preloads afterInteractive scripts, and that request contended with the
 * Switzer file that paints the LCP headline.
 *
 * Only mounted in the locale layout. `/` is a noindex redirect that leaves
 * before a script can load, and the locale page it lands on counts the visit.
 */
export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="gtag-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
