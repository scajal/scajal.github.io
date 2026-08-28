/**
 * GitHub Pages serves static files and no headers, so the policy has to ride
 * in a meta tag. `'unsafe-inline'` for scripts is unavoidable: Next inlines a
 * different hydration payload on every page, so there is no stable hash set
 * and no server to mint a nonce. The rest is still worth having — `base-uri`
 * and `object-src` close the two injection vectors that do not need a script
 * of their own.
 *
 * The Google hosts are the only third party the site talks to, and they are
 * listed per directive rather than globally: gtag.js is fetched from
 * googletagmanager, beacons go to google-analytics, and neither needs to be
 * a frame, a font or a form target.
 */
const GTM = "https://www.googletagmanager.com";
const GA = "https://*.google-analytics.com https://*.analytics.google.com";

export const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${GTM}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${GTM} ${GA}`,
  "font-src 'self'",
  `connect-src 'self' ${GTM} ${GA}`,
  "form-action 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");
