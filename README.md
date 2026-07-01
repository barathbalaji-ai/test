# Carta — Learning Portal for Customer Support

> *Carta* — the craft of great support, written by hand.

An editorial, motion-driven learning portal for **Customer Support teams**:
aged-paper aesthetic, highlighter marks, hand-drawn annotations, film grain, a
retro pixel cursor and a stipple-brain hero — wrapped around a genuinely useful
set of rooms.

Built with **React 18 + Vite 5 + Tailwind CSS 3 + Framer Motion 11 + React
Router 6** (HashRouter, so it works on any static host). It is a **pure
frontend**: every section reads its content from **published Google Sheets**
(CSV) at load, with bundled seed data as a fallback. No backend, no database, no
login. See **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)** to wire the sheets.

---

## Rooms

| Room | Route | What it does |
|------|-------|--------------|
| **Home** | `/` | Editorial hero (stipple brain), the rooms map, featured courses, philosophy, poster of the week. |
| **Courses** | `/videos` | Filterable/searchable library of course videos. Each thumbnail opens the lesson on **Mindtickle** (or Drive) in a new tab — no in-site tracking. |
| **Posters** | `/posters` | A **lazy-susan carousel** you spin through, with a lightbox to enlarge / download / print. |
| **Articles** | `/articles` | Latest month's release notes; open the archive to wind a film-reel **timeline scroller** (with a focus-hunt blip) month-by-month. |
| **Calendar** | `/calendar` | Month grid + agenda of in-person sessions; product/type filters. |
| **Completion** | `/completion` | Product-wise course completion; click a card to open the full sheet for managers. |

## The launch gate

The site sits behind a soft gate: visitors enter a `@freshworks.com` email to
enter (kept in `localStorage`, no password). Change the domain in
`src/config/sources.js` → `ALLOWED_DOMAIN`. This is a light touch for an internal
audience, **not** a security boundary — swap in real SSO if you need one.

## Content = Google Sheets

Content is edited in Google Sheets (fed by weekly Google Forms, or by hand) and
read as **published CSV**. Paste each sheet's published-CSV URL into
[`src/config/sources.js`](./src/config/sources.js); empty entries fall back to
the bundled seed so the site always renders. Adding a new month of articles
**auto-extends** the timeline — no code change, no redeploy.

Full column schemas + matching Google Form fields: **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)**.

| Section | Source | Key columns |
|---------|--------|-------------|
| Calendar | `SOURCES.calendar` | Date, Session, Time, Trainer, Products, Room, Description |
| Courses | `SOURCES.videos` | Title, Link, Description, Products, Thumbnail |
| Posters | `SOURCES.posters` | Title, Image, Description, Category |
| Articles | `SOURCES.articles` | Feature, Description, Link, Product, Month |
| Completion | `SOURCES.completion` (+ `COMPLETION_SHEET_URL`) | Course, Product, Rate |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

No environment variables are required.

## Deploy

`npm run build` → `dist/`. Deploy to any static host (Vercel auto-detects Vite;
`vercel.json` adds the SPA rewrite). Hash routing means deep links work anywhere.

## Assets to add

- **Video thumbnails:** drop images and point each video's `Thumbnail` at them
  (sheet) — or fill `thumbnail` in `src/data/videos.js`. Blank renders a titled tile.
- **Posters:** drop artwork into `public/posters/` and reference by path in the
  posters sheet (or `src/data/content.js`).

## Tech

React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · React Router 6.
Fonts: Playfair Display, Inter, Caveat, Space Mono.
