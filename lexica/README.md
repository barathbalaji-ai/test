# Lexica

A living knowledge universe for organizational learning. Knowledge is a
network, not a hierarchy: every course, article, poster, product, trainer and
concept is a node in one continuously explorable graph.

Built per `Learning_Site_Build_Instructions` (the build rundown). The previous
site, **Carta**, remains at the repo root; Lexica lives here as a sibling app
and reuses Carta's `public/` assets directly (`publicDir: '../public'` in
`vite.config.js`) — posters, thumbnails, book covers and guide PDFs are shared,
not duplicated.

## Run

```
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
npm run preview
```

No environment variables. Deployable on any static host — for Vercel, create a
project with **Root Directory = `lexica`** (the included `vercel.json` handles
SPA rewrites for `/node/:id` deep links).

## How it works

- **Stack**: React 19 + Vite + `react-force-graph-2d` (canvas) + Framer Motion
  (UI only). Graph physics never touch React renders.
- **Knowledge engine**: every object is one normalized node shape
  (`src/lib/loader.js`). Content lives in `src/data/nodes.json` (269 nodes) and
  `src/data/relationships.json` (761 typed, weighted edges) — regenerate or
  hand-edit; no component defines a relationship.
- **Navigation**: the camera is the navigation. Search (⌘K) flies you to a
  node; `/node/:id` routes are shareable camera destinations, not pages.
- **Progressive reveal**: ~16 nodes at first light; selecting a node unfolds
  its neighbourhood from its parent's position. Camera, expanded nodes, pins
  and filters persist in localStorage.
- **Categories & colours**: configured in `src/config/theme.js`; physics and
  reveal tuning in `src/config/graph.js`. New categories need config only.
- **Access**: client-side `@freshworks.com` launch gate (carried over from
  Carta — a filter, not a security boundary).
- **Accessibility**: reduced-motion disables drift/particles/breathing; the
  Index button provides a plain, screen-reader-friendly list of the entire
  universe as a fallback to the canvas.

## Content inventory (seeded from Carta)

| Source | Nodes |
|---|---|
| Products + Freddy AI | 7 |
| Courses (Mindtickle/Drive links) | 15 |
| Release notes (Oct 2025–May 2026, 84 with article links) | 202 + 8 month clusters |
| Posters (artwork in `/posters`) | 7 |
| Programs (Support Codex, I Belong, Q1 Playbook + PDFs) | 3 |
| Trainers & workshop events | 3 + 3 |
| Authored concepts (AI, Ticketing, Etiquette, MCP…) | 15 |
| Core hubs (LEXICA, Products, Learning, AI, Library, People) | 6 |

Known gaps to fill via data edits: linkless release notes (118, rendered at
low importance), trainer bios/photos, and any hand-curated
prerequisite/depends-on edges beyond the seeded ones.
