# Sorouh Alshami Company Ltd. — Landing Page

صفحة هبوط عربية (RTL) لشركة **صروح الشامي المحدودة** — توريد الخرسانة الجاهزة
والمقاولات العامة في الرياض.

A production-ready, dependency-free Arabic (RTL) landing page for
**Sorouh Alshami Company Ltd.** — ready-mix concrete supply and general
contracting in Riyadh.

---

## 1 · Stack

| Concern | Choice |
|---|---|
| Markup | Semantic HTML5, `lang="ar" dir="rtl"` |
| Styling | Hand-written CSS, 5 files, no framework, no build step |
| Motion | Vanilla JS, `IntersectionObserver` + `requestAnimationFrame` |
| 3D | Pure CSS `transform` / `perspective` — no WebGL, ~0 KB of library |
| Fonts | Noto Kufi Arabic, self-hosted WOFF2 subsets (arabic + latin) |
| Icons | Inline SVG — no icon font, no sprite sheet |
| Photography | The company's own project photos, converted to WebP |
| Infographics | Inline SVG (Arabic shapes correctly in the browser) |

**Total third-party runtime dependencies: none.**

---

## 2 · File map — where each section lives

```
index.html
├── assets/css/tokens.css        design system: colour, type, spacing, elevation, motion
├── assets/css/base.css           fonts, reset, RTL, typography, a11y, utilities
├── assets/css/components.css     buttons, 3D card system, header, accordion, footer, post card
├── assets/css/sections.css       per-section layout + all breakpoints
├── assets/css/blog.css           article shell, sticky TOC, prose, diagrams  (blog pages only)
├── assets/js/main.js             all interaction (15 small modules)
├── assets/img/logo.png           official logo — byte-for-byte copy
├── assets/img/about-engineers.webp   team on site (500×234)
├── assets/img/projects/*.webp    6 real Riyadh project photos, 3:4
├── assets/img/favicon-150.png    real favicon from the live site
├── assets/img/icon-192|512.png   manifest icons (quantised, 7 KB / 26 KB)
├── assets/img/apple-touch-180.png
├── assets/fonts/                 Noto Kufi Arabic WOFF2 (arabic + latin subsets)
├── robots.txt  sitemap.xml  site.webmanifest
└── blog/                         blog index + 5 SEO articles (see §5)
    ├── index.html                    listing page, 5 `.post-card`s
    ├── general-contracting-riyadh-stages/index.html
    ├── blinding-concrete/index.html
    ├── concrete-exposure-classes-r1-r2-r3/index.html
    ├── concrete-chemical-admixtures/index.html
    └── project-handover-checklist/index.html
```

31 files · 1.46 MB total · the logo alone is 290 KB of that.

The landing page loads 4 stylesheets; the 6 blog pages load
`tokens + base + components + blog` instead of `sections`. `.post-card` lives in
`components.css` precisely because the landing page's blog section and the blog
listing both need it without either page loading a stylesheet it does not use.

### Section → file mapping

Section numbers below are the same in `index.html`'s banner comments and in the
`/* N. NAME */` banners of `sections.css` / `components.css`.

| # | Section | HTML | CSS | JS |
|---|---|---|---|---|
| 1 | Hero | `index.html` `.hero` | `sections.css` §1 | `initParallax`, `initTilt`, `initLineReveal` |
| 2 | About | `.about__inner` | `sections.css` §2 | `initReveal` |
| 3 | Services (10 cards) | `.services__grid` + `.services__grid--4` | `sections.css` §3 | `initTilt` |
| 4 | Why choose us (6) | `.why__grid` | `sections.css` §4 | `initTilt` |
| 5 | Process (5 steps) | `.process__list` | `sections.css` §5 | `initTilt` |
| 6 | Projects (6 photos) | `.projects__grid` | `sections.css` §6 | `initTilt` |
| 7 | Stats / trust (4) | `.stats__grid` | `sections.css` §7 | `initCounters`, `initMeters` |
| 8 | Blog (5 posts) | `.blog__grid` | `sections.css` §8 + `components.css` §11 | `initReveal` |
| 9 | FAQ (8 items) | `[data-accordion]` | `sections.css` §9, `components.css` §7 | `initAccordion` |
| 10 | CTA | `.cta__panel` | `sections.css` §10 | `initMagnetic` |
| 11 | Contact (5) | `.contact__grid` | `sections.css` §11 | `initFloatingButtons` |
| 12 | Footer | `.site-footer` | `components.css` §9 | — |
| — | Header / nav / drawer | `.site-header`, `.drawer` | `components.css` §3 | `initHeader`, `initDrawer`, `initScrollSpy` |
| — | Shared 3D card system | `.lift` + `.card` | `components.css` §4 | `initTilt` |
| — | Every page | `.read-progress` (JS-built) | `components.css` §12 | `initReadProgress` |
| — | Every section head | `.rule` | `base.css` §10 | `initRuleDraw` |
| — | Every button | `.btn` | `components.css` §1 | `initMagnetic` |
| — | Article page | `.article-shell` | `blog.css` | `initArticleMotion` |
| — | Blog listing | `.blog-hero`, `.blog-grid` | `blog.css` | `initReveal` |

Two conventions keep the motion layer safe and cheap:

- Every scroll-reveal rule is scoped to `.js`, a class set by an inline head
  script on all seven pages. If JavaScript is off, nothing is ever hidden.
- Article pages ship with no `data-reveal` attributes. `initArticleMotion`
  marks the structural beats itself and reuses the existing observer, so the
  six article files needed no markup changes — and if JS never runs, the
  attribute is never added and the text simply stays visible.

### Adding a service card

The ten services live in two grids, because ten cards do not divide into rows
of three: cards 01–06 in `.services__grid`, cards 07–10 in
`.services__grid--4`. Duplicate one `.lift` block in the matching grid and
update four things: `data-reveal` delay, the `.service__index` number, the
`<h3>`, and the `<p>`. The card picks up tilt, glow, sheen, 3D plate and border
styling automatically. Keep the counts in step — the stats band and the
services totals are read from the markup.

### Grid columns are explicit, not `auto-fit`

Every card grid declares an explicit column count (never `auto-fit`) at named
breakpoints, so a row can never come up half-empty. Where the card count does
not divide by the column count, one card spans two columns so every row still
fills. The ten services live in two grids, which is why the count column does
not reach ten:

| Grid | Cards | @0 | @560 | @640 | @900 | @1024 | @1100 | Span |
|---|---|---|---|---|---|---|---|---|
| `.services__grid` | 6 | 1 | 2 | 2 | 3 | 3 | 3 | — |
| `.services__grid--4` | 4 | 1 | 2 | 2 | 4 | 4 | 4 | — |
| `.why__grid` | 6 | 1 | 1 | 2 | 2 | 3 | 3 | — |
| `.process__list` | 5 | 1 | 1 | 1 | 5 | 5 | 5 | — |
| `.projects__grid` | 6 | 1 | 1 | 2 | 2 | 3 | 3 | — |
| `.stats__grid` | 4 | 1 | 2 | 2 | 4 | 4 | 4 | — |
| `.blog__grid` | 5 | 1 | 1 | 2 | 2 | 3 | 3 | card 1 |
| `.contact__grid` | 5 | 1 | 1 | 2 | 3 | 3 | 3 | card 5 |

`.process__list` deliberately goes straight from one column to five: any
intermediate count would leave a partly filled last row.

Verified in-browser at 320 / 360 / 390 / 480 / 560 / 640 / 768 / 900 / 1024 /
1100 / 1280 / 1440 px by clustering each grid's children into rows and
comparing the summed widths against `clientWidth` minus the gaps that sit
*between* items. Every row is exactly full at all twelve widths, and
`documentElement.scrollWidth` never exceeds the viewport.

---

## 3 · Before you go live

Search the project for `REPLACE-ME` — **111 occurrences**: 100 in
`index.html`, 8 in `sitemap.xml`, 2 in `robots.txt`, 1 in this file. Everything
else is already real.

| What | Where | Action |
|---|---|---|
| **Public URL** | `index.html` `canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD `url` / `@id` / `logo` / `image` (8 spots) | set to `https://your-domain/` |
| **Public URL** | `robots.txt`, `sitemap.xml` | set to `https://your-domain/` |
| **Social image** | `og:image` / `twitter:image` | currently a 768×1024 project photo; a 1200×630 crop is better for link previews |
| **`<lastmod>`** | `sitemap.xml` | set to the date of the next real content change |

> ⚠️ Do **not** deploy `robots.txt` / `sitemap.xml` with a wrong host — an
> incorrect `Sitemap:` directive can stop the page being indexed at all.

### Two things to review before publishing

1. **The four `data-meter` bars in §7 Stats.** The bar fills (`100 / 96 / 100 /
   92 %`) are decorative and `aria-hidden`, but nothing measures them. The four
   *numbers* next to them are all true counts (10 services, 5 process steps,
   2 sectors, 6 photographed projects). If you would rather ship no
   unmeasurable figure at all, delete the four
   `<span class="stat__meter" …>` lines — nothing else depends on them.
2. **`openingHoursSpecification` 07:00–19:00** in the JSON-LD. Confirm that
   matches reality; it is what Google shows as opening hours.

---

## 4 · Brand assets

**`assets/img/logo.png` is a byte-for-byte copy of the logo you supplied**
(`C:\Users\pc\OneDrive\Desktop\logo.png`, SHA-256
`B41053B12B89590C9E4A5C7F0E91B9C16B506D102BA14AB2F2B2AD491B011EA1`).
It is **never redrawn, recolored, cropped or filtered** — only sized with CSS.

The palette in `tokens.css` was **sampled from that file**, not invented:

| Token | Value | Sampled from |
|---|---|---|
| `--gold-500` | `#e1b832` | average of the emblem's gold pixels |
| `--gold-100` | `#ffe9a8` | brightest logo highlights |
| `--gold-700` | `#a97812` | deep gold in the emblem gradient |
| `--text-100` | `#f5f7fa` | the white wordmark |

Measured contrast on the `#05070c` base: **gold 10.6:1**, **secondary text 9.4:1**
— both above WCAG AAA for normal text.

### Icons — no longer the 290 KB logo

The favicon, touch icon and manifest icons are the company's **real** icon
(`favicon-1-150x150.png` / `favicon-1-300x300.png` from the live site), not the
full logo. Same artwork, downscaled, palette untouched:

| File | Size | Weight |
|---|---|---|
| `favicon-150.png` | 150×150 | 23 KB |
| `apple-touch-180.png` | 180×180 | 33 KB |
| `icon-192.png` | 192×192 | 7 KB (quantised) |
| `icon-512.png` | 512×512 | 26 KB (quantised) |

This removed ~285 KB from every icon request.

### Project photography

The six project photos and the team photo come from the company's own
`suruhconcrete.com` uploads, converted from JPEG/PNG to WebP q82. The seven
WebP files now weigh **524 KB** in total (`2641 KB` of originals as recorded at
conversion time, an 80 % reduction). `.project__art` is `aspect-ratio: 3/4`
with `object-fit: cover`, matching the portrait originals, and keeps its gold
gradient as the fallback surface if a photo ever fails to load.

Two caveats worth knowing:

- `about-engineers.webp` is only **500×234** — soft on a retina display.
- `al-mahdiyah-roof.webp` is only **362×362** — the smallest of the six.
- WebP needs Safari 14+ (Sept 2020). For older Safari, wrap the six `<img>` tags
  in `<picture>` with a JPEG fallback — say the word and I will add it.

---

## 5 · SEO

- `<title>` — `خرسانة جاهزة ومقاولات عامة بالرياض | صروح الشامي` (the wording
  already proven on the live site)
- `<meta name="description">` — 155 characters, written for click-through
- Single `<h1>`; ordered `<h2>`/`<h3>`; `aria-labelledby` on every `<section>`
- Open Graph + Twitter card (`og:locale` = `ar_SA`)
- JSON-LD `@type: GeneralContractor` with the real address, geo, opening hours,
  `sameAs` for all 7 social accounts, a `contactPoint`, and a 10-item
  `hasOfferCatalog` service list
- `robots.txt` + `sitemap.xml` + `site.webmanifest`
- Focus keywords, written naturally without stuffing:
  `خرسانة جاهزة بالرياض` · `مقاولات عامة بالرياض` · `توريد خرسانة جاهزة` ·
  `شركة خرسانة جاهزة بالرياض` · `شركة مقاولات بالرياض`

### Every claim on the page is a fact

No invented "years of experience", no unverifiable percentages. The stats
section counts things that can be counted, and the About panel shows
`10+` services, `100%` Riyadh, `5` process steps.

### Blog — 5 articles

`suruhconcrete.com` already publishes **100 articles**, so these five were
picked to fill genuine gaps rather than compete with your own pages:

| Slug | Primary keyword | Why it is not cannibalising |
|---|---|---|
| `blog/general-contracting-riyadh-stages/` | `مقاولات عامة بالرياض` | you have quotations and contracts, but no scope/stages article |
| `blog/blinding-concrete/` | `صبة نظافة` | zero coverage — and you have a photograph of it |
| `blog/concrete-exposure-classes-r1-r2-r3/` | `الفرق بين R1 R2 R3` | zero coverage; links into your 250/300/350 articles |
| `blog/concrete-chemical-admixtures/` | `مضافات الخرسانة` | zero coverage; supports your hot-weather article |
| `blog/project-handover-checklist/` | `استلام المشروع قبل التسليم` | zero coverage; inside your contracting scope |

Cross-linking runs article ↔ landing page ↔ sibling articles, and every
article carries its own canonical, Open Graph, JSON-LD `BlogPosting` and
`Article` body with an inline SVG diagram (not a bitmap — the browser shapes
Arabic correctly, Pillow does not).

---

## 6 · Accessibility

Skip link · gold focus rings on every interactive element · `aria-expanded` +
`aria-controls` on the accordion and burger · `aria-hidden` on decorative SVG ·
focus trap + `Esc` in the mobile drawer · `role="list"` on nav lists ·
measured AAA contrast · full `prefers-reduced-motion` support · semantic
`<address>`-style contact block · keyboard-operable throughout.

---

## 7 · Performance

- Self-hosted subset WOFF2 (154 KB total), `preload` + `font-display: swap`
- `width`/`height` on every image → no layout shift
- `loading="lazy"` + `decoding="async"` on all below-the-fold images
- `content-visibility: auto` on off-screen sections
- All animation on `transform`/`opacity` only (GPU), `rAF`-throttled
- Zero JS libraries; the script is `defer`red and never blocks render
- All 23 assets verified to return `200`; all 12 images decode; 0 console
  messages; JSON-LD parses

---

## 8 · Run / deploy

No build. Serve the folder with any static host:

```bash
# local preview
npx serve .
# or, with Python
python -m http.server 8000
```

Upload the **whole folder** to the web root. Works on cPanel, shared hosting,
Netlify, Vercel, Cloudflare Pages, or any Node server — no runtime needed.
