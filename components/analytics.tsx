export const GA_MEASUREMENT_ID = "G-H449YB52Y5";

/**
 * Injects gtag on idle so it never shares first paint or the TBT window
 * with the page, and never pulls `next/script` (a client component) into
 * the bundle.
 *
 * Only mounted in the locale layout. `/` is a noindex redirect that leaves
 * before a script can load, and the locale page it lands on counts the visit.
 */
export function Analytics() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(id){function load(){var s=document.createElement("script");s.src="https://www.googletagmanager.com/gtag/js?id="+id;s.async=true;s.onload=function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config",id)};document.head.appendChild(s)}if("requestIdleCallback"in window)requestIdleCallback(load,{timeout:4000});else addEventListener("load",function(){setTimeout(load,1)})})("${GA_MEASUREMENT_ID}");`,
      }}
    />
  );
}
