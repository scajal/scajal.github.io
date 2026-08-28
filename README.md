# scajal.dev

Personal site of Santiago Cajal — Tech Lead and full-stack engineer in Montevideo.
Static Next.js, bilingual, deployed to GitHub Pages.

**Live:** [scajal.dev](https://scajal.dev)

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
npm run lint
```

## How it is put together

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, `output: "export"` |
| Styling | Tailwind CSS v4, shadcn `base-vega` tokens |
| Type | [Switzer](https://www.fontshare.com/fonts/switzer) (self-hosted variable) + Geist Mono |
| Hosting | GitHub Pages, deployed by `.github/workflows/deploy.yml` on push to `main` |

### Content

Every string lives in `content/en.ts` and `content/es.ts`, typed against
`content/types.ts`. Adding a field to one locale without the other is a
compile error, which is the point — copy cannot drift between languages.

### Routing

`app/[locale]/` is the root layout, so `<html lang>` follows the URL. The
locale list is `BUILT_LOCALES` in `content/index.ts`; adding a locale there
adds its routes, its `hreflang` pair, its sitemap entries and its OG image.

`/` is a separate root layout that detects `navigator.language` and redirects.
A static export has no middleware, so detection has to happen in the browser —
both locales are independently crawlable regardless.

### Theming

The theme is stored on `data-theme` on `<html>`, not a class. React renders
`className` on that element, so a client-side navigation would wipe a class
set by the pre-paint script. An inline script in the layout applies the theme
before first paint to avoid a flash.

### Colour and contrast

`--ink-accent` and `--ink-accent-text` are two stops of the same hue: no single
green is both legible on white and distinct from near-black text. Graphics and
large type use the first, small text the second. `--subtle-foreground` is a
third text tier for dates and metadata — an opacity modifier on the muted
colour fell below 4.5:1.

### Agent-readable output

The site is meant to be read by agents as well as people, so nothing important
is locked behind rendering the DOM.

| Route | What it is |
|---|---|
| `/llms.txt` | Discovery index: every page in both locales, one line each |
| `/[locale]/index.md` | The home page as Markdown |
| `/[locale]/work/[slug]/index.md` | A case study as Markdown |
| `/[locale]/llms-full.txt` | The whole locale — page and all case studies — in one fetch |

All four are static route handlers (`export const dynamic = "force-static"`)
rendering the same `content/` dictionaries as the pages, via `lib/agent-text.ts`.
There is no second copy of the copy; a change to `content/en.ts` changes both
the HTML and the Markdown. Each HTML page advertises its mirror with
`<link rel="alternate" type="text/markdown">`, and `robots.ts` names the AI
crawlers explicitly, because several of them (`Google-Extended`,
`Applebot-Extended`) are opt-out by convention and read silence as a refusal.

Pages also carry a schema.org `@graph` rather than a flat node: `ProfilePage`
→ `Person` → `ItemList` on the home page, `Article` + `BreadcrumbList` on a
case study, joined by `@id` so a parser can walk between them.

### Analytics

Google Analytics 4 (`components/analytics.tsx`), loaded through `next/script`
with `afterInteractive` so measurement never competes with first paint. It
mounts in the locale layout only — `/` is a noindex redirect that leaves before
a script can load, and the locale page it lands on counts the visit.

Adding a third party means the CSP has to allow it. If the tag ever stops
reporting, check `lib/csp.ts` first: a blocked beacon fails silently.

### Content security policy

GitHub Pages serves no headers, so the policy rides in a `<meta>` tag from
`lib/csp.ts`. `script-src` has to keep `'unsafe-inline'` — Next inlines a
different hydration payload on every page, so there is no stable hash set and
no server to mint a nonce. `base-uri`, `object-src` and `form-action` are still
locked down. The Google Analytics hosts are listed per directive rather than
globally: `googletagmanager` serves the script, `google-analytics` receives the
beacons, and neither needs to be a frame, a font or a form target.

### OG images

Generated at build time by `next/og` (`opengraph-image.tsx`), one per page per
locale. Next emits them without a file extension, which GitHub Pages serves as
`application/octet-stream`; `scripts/fix-og.mjs` copies each to a `.png`
sibling after the build and repoints the meta tags.

## Deploying

Push to `main`. The workflow lints, typechecks, builds and publishes `./out`.
`public/CNAME` carries the custom domain.

## Licence

Code is free to learn from. The content and the Switzer font files are not
mine to relicense — Switzer is © Indian Type Foundry, used under the
[Fontshare licence](https://www.fontshare.com/licence).
