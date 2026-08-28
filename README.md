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
