import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LOCALES, type Locale } from "@/lib/site";
import { BUILT_LOCALES } from "@/content";

/**
 * No sticky navigation by design: a wordmark in one corner, controls in the
 * other, and the page scrolls as a single document.
 */
export function SiteChrome({
  locale,
  themeLabel,
}: {
  locale: string;
  themeLabel: string;
}) {
  return (
    <header className="shell flex items-center justify-between gap-4 py-6">
      <Link
        href={`/${locale}`}
        translate="no"
        className="mono tracking-tight text-foreground transition-opacity hover:opacity-70"
      >
        scajal<span className="text-muted-foreground">.dev</span>
      </Link>

      <div className="flex items-center gap-4">
        <nav aria-label="Language" className="flex items-center gap-1.5">
          {LOCALES.map((code: Locale, i) => {
            const current = code === locale;
            const built = (BUILT_LOCALES as string[]).includes(code);
            return (
              <span key={code} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span aria-hidden className="text-subtle-foreground">
                    /
                  </span>
                )}
                {built ? (
                  <Link
                    href={`/${code}`}
                    aria-current={current ? "true" : undefined}
                    className={`mono uppercase transition-colors ${
                      current
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {code}
                  </Link>
                ) : (
                  <span className="mono uppercase text-subtle-foreground">
                    {code}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
        <ThemeToggle label={themeLabel} />
      </div>
    </header>
  );
}
