/**
 * GitHub Pages serves static files and no headers, so the policy has to ride
 * in a meta tag. `'unsafe-inline'` for scripts is unavoidable: Next inlines a
 * different hydration payload on every page, so there is no stable hash set
 * and no server to mint a nonce. The rest is still worth having — `base-uri`
 * and `object-src` close the two injection vectors that do not need a script
 * of their own, and everything the site loads is same-origin already.
 */
export const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");
