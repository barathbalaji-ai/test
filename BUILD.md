# Carta — Build Rundown & Fresh-Build Guide

> Carta is an editorial, motion-driven learning portal for a Customer Support team.
> It is a **pure static frontend**: no backend, no database, no login. Content is
> read from published Google Sheets (with bundled seed fallbacks) and from images
> in `public/`. This document is the map for rebuilding or extending it.

---

## 1. What it is (broad)

An aged-paper "handbook" with five rooms behind a soft company-domain gate:

- **Home** — editorial hero (transparent stipple-brain artwork), a rooms map, featured courses, a philosophy block, poster of the week.
- **Courses** — a filterable library of course-video cards; each opens the lesson externally (Mindtickle / Drive) in a new tab. No in-site tracking.
- **Posters** — a shelf of three books that open into a page-turning reader.
- **Articles** — the latest month's release notes, plus a film-reel timeline to wind back through an archive.
- **Calendar** — a month grid + agenda of live training sessions.
- **Completion** — product-wise course-completion cards that link out to the source sheet.

The whole thing is atmosphere-first: paper texture, tape, a pixel cursor, hand-drawn marks, and restrained motion.

---

## 2. Stack & architecture (broad)

- **React 18 + Vite 5**, **React Router 6** using **HashRouter** (deep links work on any static host, no server rewrites needed).
- **Tailwind CSS 3** for styling (design tokens in `tailwind.config.js`, component classes in `src/index.css`).
- **Framer Motion 11** for all animation.
- **three 0.160** is installed but **currently unused** (the hero moved to a static image); safe to remove if you don't plan a 3D piece.
- Data layer: a tiny dependency-free CSV reader (`src/lib/sheets.js`) fetches published Google-Sheet CSVs at load; every section falls back to bundled seed data so the site always renders.
- No env vars, no server code, no auth backend.

Exact dependency set (`package.json`):

```
dependencies:  framer-motion ^11.3.0 · react ^18.3.1 · react-dom ^18.3.1 · react-router-dom ^6.26.0 · three ^0.160.1
devDeps:       @vitejs/plugin-react ^4.3.1 · autoprefixer ^10.4.19 · postcss ^8.4.39 · tailwindcss ^3.4.7 · vite ^5.3.5
engines:       node >=18
```

---

## 3. Fresh build (utility — exact)

```bash
npm install
npm run dev       # dev server → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the built dist/ locally
```

No environment variables are required. Fonts load from Google Fonts in `index.html`
(Playfair Display, Inter, Caveat, Space Mono). Entry is `src/main.jsx` → `src/App.jsx`.

Deploy: build and serve `dist/` on any static host. `vercel.json` sets the SPA
rewrite (`/(.*) → /index.html`); hash routing means it also works without it.

---

## 4. Project structure (utility — exact)

```
index.html                     Font links, #root, entry script
vercel.json                    framework: vite; SPA rewrite
tailwind.config.js             design tokens (colours, fonts, shadows)
postcss.config.js
src/
  main.jsx                     React root
  App.jsx                      GateProvider → HashRouter → Launch | Site (nav/routes/footer/notemaker)
  index.css                    Tailwind layers + component classes (.btn-ink, .tag, .paper-card, .field, .eyebrow …)
  config/
    sources.js                 Google-Sheet CSV URLs + COMPLETION_SHEET_URL + ALLOWED_DOMAIN
  lib/
    gate.jsx                   Client-side @domain launch gate (localStorage 'carta.session')
    sheets.js                  CSV parse + useSheet(url, mapRow, fallback) + pick(row, ...names)
    winding.js                 useWinding() — synthesized "focus" blip for the Articles timeline
  data/
    taxonomy.js                PRODUCTS[] (id/name/colour), productById, matchProducts(text)
    videos.js                  VIDEOS seed (15) + THUMBS map (course id → thumbnail path)
    content.js                 POSTERS[] (7), POSTER_CATEGORIES, SESSION_TYPES, sessionTypeColor, SEED_EVENTS
    books.js                   BOOKS[] (3) + docPage(book, i)
    articles.js                ARTICLES seed (release-notes fallback)
  pages/
    Launch.jsx                 Domain gate screen
    Home.jsx                   Hero + rooms + featured + philosophy + poster-of-week
    Videos.jsx                 Course-video grid (external links)
    Posters.jsx                Bookshelf + Book reader + image lightbox
    Calendar.jsx               Month grid + agenda
    Articles.jsx               Latest month + timeline archive
    Completion.jsx             Completion-rate cards
  components/
    StippleBrain.jsx           Hero image (transparent webp) + parallax + rotate/float + ink particles
    Book.jsx                   Shared page-turn reader (poster mode + doc mode)
    Timeline.jsx               Single-month film-reel scroller (Articles)
    Nav.jsx  Footer.jsx  Logo.jsx  PageHeader.jsx  Reveal.jsx  Highlight.jsx  HandDrawn.jsx
    Cursor.jsx                 Pixel cursor (data-cursor="link" enlarges it)
    PaperTexture.jsx           Fixed grain/wrinkle/tape/clippings/vignette layer
    PosterCard.jsx             PosterMotif fallback (generative poster when no image)
    ArticleCard.jsx            Manila string-tie folder card
    NoteMaker.jsx              Floating ✎ notebook (localStorage 'carta.notes')
public/
  stipple_brain.webp           Hero art (transparent, cropped)
  support_codex_mandala.png    Support Codex book cover
  favicon.svg
  posters/                     check-calendar, punctuality, missing-agent, on-time-is-late, make-notes,
                               chat-etiquette, ai-guidelines (+ i-belong.jpg, q1-playbook.jpg book covers)
  thumbnails/                  5 course thumbnails (intro-to-mcp, ai-recommendations-app, guidelines-for-ai,
                               meeting-etiquettes, time-management)
  books/i-belong/01..28.jpg    I Belong document pages
  books/q1/01..34.jpg          Q1 Programs document pages
  guides/                      i-belong.pdf, q1-programs-playbook.pdf (download targets)
  clippings/                   optional clip-1..3.png (decorative; drawn fallback if absent)
```

Routes (`src/App.jsx`): `/` `/videos` `/posters` `/articles` `/calendar` `/completion`; unknown → `/`.

---

## 5. Aesthetic system (specific)

**Palette** (`tailwind.config.js` → `theme.extend.colors`):

| Token | Hex | Use |
|-------|-----|-----|
| `paper` | `#E9E3D6` | page background |
| `paper-deep` | `#DED7C6` | bars/tracks |
| `chalk` | `#F5F1E8` | cards, light text on dark |
| `ink` | `#1A1712` | primary text / dark sections |
| `ink-soft` | `#524D43` | body text |
| `marker` | `#E0382B` | highlighter red / primary accent |
| `oxblood` | `#8E2A20` | deep red accent |
| `stone` | `#9A948A` | muted mono labels |
| `taupe` | `#C7BCA6` | tape / shelf |

**Product colours** (`src/data/taxonomy.js`) — the single source that drives tags, dots, thumbnail gradients and filters. Currently: Freshservice `#1F6FEB` (blue), Freshdesk `#0E8F6E` (green), Freshchat `#7A3FF2`, Freshcaller `#C2410C`, Freshsales `#B91C5C`, Freshbots `#0E7490`, Freddy `#B45309`, Enablement `#8E2A20`, All `#1A1712`. Change a hex here and it propagates everywhere.

**Type** (loaded in `index.html`; families in `tailwind.config.js`):
- `font-display` → **Playfair Display** (italic + black for headings; `tracking-tightest` = `-0.045em`).
- `font-sans` → **Inter** (body).
- `font-hand` → **Caveat** (marginalia / asides).
- `font-mono` → **Space Mono** (eyebrows, labels, tags — usually uppercase, wide tracking).

**Signature classes** (`src/index.css`): `.btn-ink` / `.btn-ghost` (hard red offset shadow on hover), `.tag` (mono uppercase pill), `.paper-card` (cream card, hard shadow lift on hover), `.field` / `.label` (forms), `.eyebrow` (marker mono kicker), `.section-dark` (ink block). Shadows: `shadow-hard` = `7px 9px 0 rgba(26,23,18,.9)`, `shadow-hard-sm` = `4px 5px 0`. Border radius default `3px`.

**Motion vocabulary** (specific values you can tune):
- Page transitions: fade + 8px slide, ease `[0.22,1,0.36,1]`, 0.35s (`App.jsx`).
- Book page-turn: duration `DUR = 0.58s`, ease `[0.76,0,0.24,1]`, `GHOSTS = 5` flutter pages, hardcover open `0.95s` to `-168°` (`Book.jsx`).
- Hero brain: parallax translate ±18px / rotateX ±2.5° / rotateY ±3.5°; idle rotate `±2.2° over 18s`, float `y 0→-12 over 10s`; particle field `N = 72` ink motes drifting outward with slight lift (`StippleBrain.jsx`).
- Articles timeline: synthesized "focus" blip on each month step (`lib/winding.js`); one poster book / archive UI in `Timeline.jsx`.
- Cursor: retro pixel cursor; add `data-cursor="link"` to any element to grow the hover state.
- Everything is gated by `prefers-reduced-motion` where it matters.

**Textures**: `PaperTexture.jsx` renders fixed grain, wrinkle lighting, tape strips, newspaper clippings (`public/clippings/clip-1..3.png` or a drawn fallback), and a vignette.

---

## 6. Content & data wiring (utility — exact)

All live sources are Google-Sheet **published-CSV** URLs pasted into
`src/config/sources.js`. Empty string → that section uses its bundled seed.
See `CONTENT_GUIDE.md` for the full column reference + Google-Form field lists.

```js
// src/config/sources.js
export const SOURCES = {
  calendar:   '',  // Date, Session, Time, Trainer, Products, Room, Description [, EndDate, Type, Location, Seats]
  videos:     '',  // Title, Link, Description, Products, Thumbnail
  posters:    '',  // Title, Image, Description, Category            (Support Codex posters)
  articles:   '',  // Feature, Description, Link, Product, Month     (keep row if Description OR Link present)
  completion: '',  // Course, Product, Rate (0–100)
}
export const COMPLETION_SHEET_URL = ''   // normal share link opened from Completion cards
export const ALLOWED_DOMAIN = 'freshworks.com'
```

Column headers are matched case/space-insensitively; extra columns (e.g. a Form
`Timestamp`) are ignored. Publishing: Sheet → File → Share → **Publish to web** →
pick the tab → **CSV** → paste the URL above.

**Adding content without a sheet (edit code):**
- Course video: add to `RAW` in `src/data/videos.js`; product text is typo-tolerant (`matchProducts`).
- Course thumbnail: drop an image in `public/thumbnails/`, map it in `THUMBS` (keyed by the course's slug id) in `videos.js`. No thumbnail → titled fallback tile.
- Poster (Support Codex book): add to `POSTERS` in `src/data/content.js` and drop artwork in `public/posters/`.
- Calendar session: add to `SEED_EVENTS` in `content.js`.
- Article: append to `src/data/articles.js` (or wire the articles sheet). Months are derived from the data, so a new month auto-extends the timeline — no code change.

**The three books** (`src/data/books.js`):
- `support-codex` — `type:'poster'`, cover `public/support_codex_mandala.png`; pages are the `POSTERS` (image left / name+description right).
- `i-belong` — `type:'doc'`, cover `public/posters/i-belong.jpg`, `pages:28`, `dir:'/books/i-belong'`, `download:'/guides/i-belong.pdf'`.
- `q1-programs` — `type:'doc'`, cover `public/posters/q1-playbook.jpg`, `pages:34`, `dir:'/books/q1'`, `download:'/guides/q1-programs-playbook.pdf'`.

To add / replace a document book: render the PDF pages to `public/books/<id>/NN.jpg`
(zero-padded, 1-indexed) and add a `type:'doc'` entry. Page images load lazily —
only the current/target spreads mount.

---

## 7. Key interactions (broad + specific)

- **Launch gate** (`lib/gate.jsx`): enter an `@ALLOWED_DOMAIN` email → stored in `localStorage` as `carta.session`; "Leave" in the nav clears it. Soft gate for an internal audience — **not** a security boundary.
- **Book reader** (`Book.jsx`): closed hardcover (book cover image) swings open (auto-opens shortly after you pick it from the shelf), then a weighted 3D page-flip with fluttering pages. Poster books show image + description spreads and clicking a poster opens a lightbox; document books show two consecutive pages and expose a "PDF ↗" download. Drag / ‹ › / dots / arrow keys navigate; `Esc` returns to the shelf.
- **Articles timeline** (`Timeline.jsx` + `Articles.jsx`): shows the latest month by default; "open the archive" reveals a single-month film-reel scroller (drag / steppers / tap) with a synthesized focus blip per step.
- **Hero brain** (`StippleBrain.jsx`): transparent WebP, pointer parallax, slow rotation/float, and a canvas ink-particle field.

---

## 8. Conventions & gotchas

- Commit/push to `main`. Deep-linking relies on HashRouter — don't switch to BrowserRouter without adding host rewrites.
- Keep large source art out of `public/`: posters/thumbnails are compressed JPEGs (~130–750 KB), the hero is a transparent WebP (~660 KB), document pages are ~760px JPEGs. Re-render at higher quality only where zoom demands it.
- `three` is a dead dependency right now — remove it if you won't use it.
- Product colours, session-type colours, and the palette are each single-sourced (taxonomy.js / content.js / tailwind.config.js) — edit there, not at call sites.
- Reduced-motion: honour it in any new animation (see StippleBrain / Book for the pattern).
```
