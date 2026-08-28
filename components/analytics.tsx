import Script from "next/script";

export const GA_MEASUREMENT_ID = "G-H449YB52Y5";

/**
 * Google Analytics 4. `afterInteractive` rather than the raw `async` tag: the
 * page is content, not an app, so measurement should never compete with first
 * paint for bandwidth. gtag still records the pageview once it loads.
 *
 * Only mounted in the locale layout. `/` is a noindex redirect that leaves
 * before a script can load, and the locale page it lands on counts the visit.
 */
export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
