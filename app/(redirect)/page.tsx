import { BUILT_LOCALES } from "@/content";
import { DEFAULT_LOCALE } from "@/lib/site";

/**
 * Static export means no middleware, so locale detection happens here in a
 * synchronous inline script. Both real locales are still crawlable, and the
 * no-JS path is a plain list of links.
 */
const redirectScript = `(function(){try{var built=${JSON.stringify(
  BUILT_LOCALES,
)};var want=(navigator.language||"${DEFAULT_LOCALE}").slice(0,2).toLowerCase();var to=built.indexOf(want)>-1?want:"${DEFAULT_LOCALE}";location.replace("/"+to+"/");}catch(e){location.replace("/${DEFAULT_LOCALE}/");}})();`;

export default function LocaleRedirect() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <main className="shell flex flex-1 flex-col justify-center py-24">
        <h1 className="mono text-muted-foreground">Santiago Cajal</h1>
        <ul className="mt-4 flex gap-4">
          <li>
            <a className="link" href="/en/">
              English
            </a>
          </li>
          <li>
            <a className="link" href="/es/">
              Español
            </a>
          </li>
        </ul>
      </main>
    </>
  );
}
