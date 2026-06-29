# Carta — Build Blueprint

> **What this is.** A complete, self-contained specification for **Carta**, an
> editorial, motion-driven **learning portal for a Customer Support team**.
> Hand this `.md` to any capable coding agent (or developer) and it can rebuild
> the site from scratch. It captures the product, the design language, every
> page/feature, the data, and the integration roadmap.

> **One-line description to pair with this file:**
> *"Rebuild ‘Carta’, an Awwwards-style, aged-paper editorial learning portal for
> a Customer Support team — React + Vite + Tailwind + Framer Motion, client-side
> (localStorage) with learner/tutor roles, a course library, quiz studio,
> decision-tree builder, poster wall, articles feed, training calendar, a clip-
> to-Markdown notebook, a tutor analytics dashboard, and a reactive stipple-brain
> hero. Follow CARTA_BLUEPRINT.md exactly."*

---

## 1. Product overview

Carta is the single home where a Customer Support team learns. It opens on a
**split Learner/Tutor login**, then reveals five "rooms":

- **Courses** — a filterable library; each card opens a Google Drive lesson in a
  new tab and then asks the learner to complete a checkpoint quiz + acknowledge.
- **Posters** — a wall of print-ready posters (real artwork) with a lightbox.
- **Articles** — a launches lead story + a feed of real product-release articles.
- **Calendar** — in-person training sessions with product/type filters; tutors
  can create sessions.
- **Quiz Studio** (tutor only) — build forms, graded quizzes, and branching
  decision trees; view responses.
- **Analytics** (tutor only) — Swiss/editorial dashboard of completions, scores
  and survey results.

It must feel like a **handbook you can mark up**: aged paper, grain, highlighter
marks, hand-drawn circles/arrows, a retro pixel cursor, and gentle stop-motion
micro-animations.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | **React 18** + **Vite 5** |
| Styling | **Tailwind CSS 3** (custom theme) |
| Animation | **Framer Motion 11** |
| Routing | **react-router-dom 6**, **HashRouter** (works on any static host) |
| State / persistence | **localStorage** via a tiny pub/sub store + React hook |
| Background brain | Canvas 2D (no Three.js — it was removed for weight) |
| Deploy | **Vercel** (static); `vercel.json` with SPA rewrite |
| Node | 18+ |

Install: `react react-dom react-router-dom framer-motion`; dev:
`vite @vitejs/plugin-react tailwindcss postcss autoprefixer`.

No backend. Everything persists in the browser. (Google/Workspace integration is
a documented future phase — see §12.)

---

## 3. Design system

### 3.1 Palette (aged-paper editorial — black / red / cream / warm grey)
Tailwind theme `extend.colors`:

```
paper:        #E9E3D6   // page background (aged cream)
paper-deep:   #DED7C6
chalk:        #F5F1E8   // cards / near-white, and text on dark
ink:          #1A1712   // primary text + dark sections
ink-soft:     #524D43   // secondary text
marker:       #E0382B   // THE single accent (red) — use sparingly
oxblood:      #8E2A20   // deep red secondary
stone:        #9A948A   // muted grey
taupe:        #C7BCA6   // warm tan
```
Rule: **red is the only bright accent.** No orange (it read "too AI-default").
Hard/near-square corners (`rounded-[3px]`/`[4px]`), hard offset shadows
(`box-shadow: 7px 9px 0 …`), thin rules, generous whitespace.

### 3.2 Typography
Google Fonts:
- **Playfair Display** (Didone display) — all headers, used heavily in **italic**.
  Weights 500/700/800/900 + italics. `font-display`.
- **Inter** — body & bylines. `font-sans`. Weights 400–700.
- **Caveat** — handwritten side-notes, captions, "psst" asides. `font-hand`.
- **Space Mono** — monospace labels/eyebrows (UPPERCASE, letter-spaced). `font-mono`.

Headline style: `font-display italic font-bold tracking-tightest leading-[~0.9]`.

### 3.3 Motion principle (important)
- **Stop-motion (~12 fps) ONLY for micro-animations**: highlighter sweeps,
  hand-drawn "draw-in", the blinking ink dot, the landing's hand-drawn "line
  boil", the ambient brain wiggle. Implement via CSS `steps()` keyframes or, in
  SVG, by stepping a filter `seed` at ~10fps.
- **Everything else stays smooth**: page transitions, scroll reveals, card hover,
  layout, the cursor. (Do **not** apply stepped easing globally — it made the
  whole site feel laggy.)
- Respect `prefers-reduced-motion`.

### 3.4 Atmosphere & textures (the "handbook" feel)
A fixed, non-interactive `PaperTexture` layer:
- **Paper fibres** — SVG `feTurbulence` fractal noise, `mix-blend-multiply`, ~0.10.
- **Organic wrinkles** — SVG `feTurbulence` + `feDiffuseLighting` (NOT straight
  gradient lines — those looked too exact), `mix-blend-soft-light`, ~0.55.
- **Tape strips** — small rotated translucent rectangles in the margins.
- **Newspaper clippings** — in the page margins at ~0.7–0.8 opacity. Use **real
  clipping images** if present at `public/clippings/clip-1.png … clip-3.png`
  (transparent torn-paper PNGs are ideal), else fall back to a drawn newsprint
  component (serif headline + halftone block + tiny justified body + torn edges
  via `clip-path` + sepia). Public-domain sources: Wikimedia Commons, Library of
  Congress "Chronicling America", archive.org.
- **Vignette** — `box-shadow: inset 0 0 280px rgba(26,23,18,0.32)`.

### 3.5 Retro pixel cursor
Replace the OS cursor (on fine pointers) with a **pixel-art arrow** that follows
the pointer **smoothly via rAF** (do NOT snap it at 12fps — that felt laggy).
Over interactive elements it swells / turns red (`data-cursor="link"`). Add
`html.has-pixel-cursor *{cursor:none}`; disable on touch.

### 3.6 Reactive stipple brain (hero)
A canvas behind the **right side of the hero only** (not full-screen):
- Draw a lumpy **brain outline**, clip to it, fill with **meandering gyri** folds
  + a central fissure + stem; sample drawn pixels into **stipple dots**.
- Dots **wiggle** at rest and **scatter from the cursor**, springing back.
- **Gotcha that bit us twice:** the wrapper must have exactly **one** position
  class. Tailwind's `.relative` is defined after `.absolute`, so a hardcoded
  `relative` will override an incoming `absolute` and collapse the box to 0 height
  → invisible brain. Size the wrapper with `absolute top-… bottom-… w-[46%]` and
  build the canvas via a **ResizeObserver** (so it never measures 0).
- Ship a **deterministic SVG wireframe brain** as a base layer behind the canvas
  so a brain is always visible even if the canvas fails.

### 3.7 Reusable hand-drawn SVG annotations (`HandDrawn.jsx`)
Marker-style, animate their stroke "drawing in" on scroll: `Circle`, `Underline`
(double sketchy pass), `Arrow`, `Squiggle`, `Spark`, `Bracket`, `Strike`. All
default to red `#E0382B` / ink. Used to circle/underline words throughout.

---

## 4. Layout & routing

`HashRouter`. App shell renders: `PaperTexture`, `Cursor`, then either the
**Landing** (no session) or the **Site** (nav + routes + footer + NoteMaker).

Routes (all gated behind login; tutor-only ones also role-checked):
```
/            Home (hero + section index)
/courses     Course library + checkpoint flow
/posters     Poster wall + lightbox
/articles    Launches lead + article folders
/calendar    Training calendar + filters + (tutor) create
/studio      Quiz Studio            [tutor only]
/analytics   Analytics dashboard    [tutor only]
/form/:id    Public runner for a built form/quiz/tree
*            → Home
```

**Nav**: sticky, scroll-progress bar, role-aware links (learners don't see
Studio/Analytics), a user chip (`Learner/Tutor · FirstName`) + Log out, animated
active "pill", small object glyphs per item (Zelda-ish), mobile drawer.
Each interior page uses a shared `PageHeader` (mono kicker + big italic title +
intro, word-by-word reveal).

---

## 5. Auth & roles (client-side sample)

Two roles: **learner** and **tutor**. State in `localStorage`.
- `carta.session` = `{ role, email, name, product? }`
- `carta.users` = `{ [email]: { name, product, email, password, role, createdAt } }`
- Allowed email domain: **`@freshworks.com`** (signup/login reject others).
- **Tutor allow-list**: `TUTOR_IDS = ['barath.balaji@freshworks.com']`. Tutors set
  their password on first login; only allow-listed emails may be tutors.
- **Learner**: sign-up form (Name, Product dropdown, email, password) → login by
  email+password. Activity tracked per email.

`AuthProvider` exposes `session, isTutor, isLearner, signupLearner, loginLearner,
loginTutor, logout`. `listUsers()` for analytics. `RequireTutor` wrapper blocks
learners from tutor surfaces.

> This is a **sample workflow**; production should use Google Sign-In (§12).

---

## 6. The Landing (split login)

Full-screen, two halves:
- **Left — Learner**: white (`chalk`), hand-drawn **bulb + notes** hero icons,
  tagline "Relearn. Repeat. Resolve."
- **Right — Tutor**: black (`ink`), hand-drawn **blackboard + clipboard** icons,
  tagline "Teach. Track. Tune."
- Hand-drawn icons have a **mild "line boil"** (SVG `feTurbulence`+
  `feDisplacementMap` whose `seed` steps at ~10fps).
- **Hover one half → it spotlights; the other dims** (`brightness(0.55)`).
- Click a half → themed **login modal** for that role. Password fields have a
  **Show/Hide** toggle. Learner modal toggles Sign-up/Login; tutor modal notes
  the approved id.
- Centre seam shows the **Carta** wordmark + quill mark.

---

## 7. Brand / logo

**Carta** wordmark in **italic Playfair**, followed by a small **red blinking ink
dot** (do NOT colour a single letter — that was fragile). A hand-drawn **quill +
ink-drop** mark (`QuillMark`) appears in the nav badge, footer, favicon, and
landing seam. Quill drop = red `#E0382B`. Favicon = ink rounded square + chalk
quill + red drop.

---

## 8. Pages & features in detail

### 8.1 Home
- **Hero**: eyebrow tags ("Customer Support · Learning Portal", "June launches are
  live"); giant stacked headline **"Relearn." / "Repeat." (italic) / "Resolve."**
  with marks that wrap the actual words — red **underline** on Relearn, red
  **circle** on Repeat, messy red **underline** on Resolve. Beware the reveal mask
  clipping italic descenders: add bottom padding inside the per-word `overflow-
  hidden` mask. Byline: *"The learning home for Customer Support. Master the craft
  through a library of courses, build-it-yourself quizzes, a wall of posters, in-
  person training and this month's product launches — all in one atmospheric
  studio."* CTAs: Browse the library / Open the Quiz Studio. **Stipple brain** on
  the right.
- **"Five rooms" feature grid** linking to each section (object glyph, accent,
  hover sway).
- **Featured courses** (first 3), **philosophy** block, **poster of the week**.
- No marquees/tickers (explicitly removed as "too default").

### 8.2 Courses (`/courses`)
- Filters: **Track** chips + **Product** chips + search.
- Cards show track, level, title, blurb, **product tags**, duration, lessons,
  and a ✓ Done badge when completed by the current learner.
- **Click flow**: open the course's Drive link in a **new tab** AND open an
  **acknowledgement modal** on the page:
  1. "Finish the checkpoint quiz" → opens a short MCQ quiz (3 questions).
  2. "Yes, mark complete" is **greyed/disabled until the quiz is submitted**.
  3. On confirm → `store.markComplete(email, courseId, score)`.

### 8.3 Posters (`/posters`)
- Grid of `PosterCard`s (real images, full-bleed, caption overlay, inner
  vignette, slight tilt, hover lift). Lightbox shows the full uncropped image +
  details + Download/Print.
- Cards without an image render a **generative motif** fallback.

### 8.4 Articles (`/articles`)
- **Lead story** = the month's **product launches** (a "what shipped" list).
- The rest are **string-tie folder cards** (`ArticleCard`): manila folder with a
  thread that **wraps around** it and a bow; on hover the bow unties, the strap
  slips off, and a loose thread dangles. Real release articles link out (new tab).
- Category filter chips.

### 8.5 Calendar (`/calendar`)
- Month grid (June 2026 default). Event days show a **short handwritten session
  title** (Caveat), a red tint, type-coloured dots, and a `+N` overflow count.
- Day detail panel + an "upcoming" agenda list with full fields.
- **Filters**: Product and Session Type.
- **Tutors** see a "**New session**" button → modal form. Events persist in store.

### 8.6 Quiz Studio (`/studio`, tutor only)
- Create **Form**, graded **Quiz**, or branching **Decision tree**.
- Field types: short, paragraph, multiple-choice, checkboxes, rating; required
  toggles; reorder; accent colour; (quiz) per-option **correct** + pass %.
- **Decision tree**: question nodes whose each option routes to another node or an
  **outcome** node; a configurable start node.
- Library list with Edit / Open / Responses / Delete; "Reset demo data".
- **Responses** slide-over: counts, average score, pass rate, per-response answers.

### 8.7 FormRunner (`/form/:id`)
- Renders any built form/quiz/tree for taking. Quizzes auto-grade + show a result
  screen; trees walk node-to-node to an outcome; responses saved with the taker's
  email (`by`) for analytics.

### 8.8 Analytics (`/analytics`, tutor only) — Swiss/editorial
- KPI row (learners, completions, avg checkpoint score, total responses).
- **Completions by course** (horizontal bars), **score distribution** (histogram),
  **surveys & quizzes** table (responses / avg / pass), **most-active learners**.
- Visual language: thin top rules, mono labels, huge italic numerals, red bars,
  lots of whitespace, `Fig. 0X` captions.

### 8.9 Note Maker (global, after login)
A floating **✎ notebook** (bottom-right):
- **＋ Selection** captures highlighted page text.
- **＋ Clip image** toggles clip-mode (images get a dashed outline); click one to
  capture it.
- Quick-note input; list with delete; count badge.
- **↓ Download .md** exports everything as Markdown (text as paragraphs/quotes,
  images as `![]()`). Persists in `carta.notes`.
- (Future: "Save to Google Docs" — §12.)

---

## 9. Data model & seed content

### 9.1 Store (`localStorage` key `carta.v1`)
```
{
  forms:     [ Form ],          // see Studio
  responses: { [formId]: [ {id, at, by, answers, score?} ] },
  events:    [ Session ],
  completions:{ [email]: { [courseId]: { at, score } } }
}
```
Pub/sub `store` + `useStore(selector)` hook. Methods: saveForm, deleteForm,
addResponse, addEvent, deleteEvent, markComplete, completionsFor, reset. Seed 3
example forms (a quiz "Tone & Empathy Checkpoint", a tree "Escalation Decision
Tree", a form "Post-Training Reflection") on first run.

### 9.2 Taxonomy (`src/data/courses.js`)
- **Tracks**: Foundations, Product Mastery, Communication, Tools & Systems,
  Leadership.
- **Products**: All products, Freshdesk, Freshservice, Freshchat, Freshcaller,
  Freshsales, Freshbots, Enablement (each with a palette colour).

### 9.3 Courses (from the team's doc — swap `link` for real Drive URLs)
1. **AI Recommendations** — Tools & Systems — All products — "Delivering delight
   became a whole lot easier with the new AI Recommendations App…"
2. **Freshdesk Omni — Intro** — Product Mastery — Freshdesk/Freshchat/Freshbots/
   Freshcaller — "Dive into the world of Freshdesk Omni, our latest CX offering…"
3. **Freshdesk Omni — Walkthrough** — Product Mastery — (same products) —
   "differences between the standalone Freshdesk and the new Omni experience."
4. **Cultural Awareness** — Foundations — All products — "Embrace the diverse world
   of customers… empathy and acceptance."
5. **ITAM Readiness** — Product Mastery — Freshservice — "Get ready for IT Asset
   Management in Freshservice."

### 9.4 Sessions (calendar seed — real)
- **Stakeholder Engagement** — 15 Jun 2026, 10:30–18:30, Chennai, Room *Virat
  Kohli*, Behavioural, All products, trainers Varsha Balakrishnan / Sreejith
  Murali / Anushree Francisca.
- **Data Infused Storytelling** — 16–17 Jun 2026, 14:30–20:30, Chennai, Room
  *Sachin Tendulkar*, Leadership, All products, trainer External.
- **Stakeholder Engagement** (repeat) — 19 Jun 2026, same details as the 15th.
- (Do not invent extra sessions.)
Session fields: `name, date, endDate?, time, duration, location, room,
productIds[], type (New product|Behavioural|Feature Launches|Leadership),
trainer, seats`.

### 9.5 Posters (`public/posters/…`, legend)
- **Chat Etiquette** — Craft (bookmark).
- **I Belong** — Mindset (guidebook: "A Personal Playbook for Influence & Impact").
- **Check Your Calendar** — Mindset (meeting etiquette, black poster).
- **Punctuality** ("is the first deliverable", chicken illustration) — Mindset.
- **The Missing Agent** — Mindset (detective-board illustration).
- **AI Guidelines** — Communication (green/gold, 5 numbered rules).
Source art from the team; downscale large files to ≤~250KB web JPGs.

### 9.6 Articles (`src/data/articles.js`)
- Lead = **June launches** (Freshdesk Omni, ITAM, AI Recommendations App).
- Feed = ~24 real Freshworks **release-note** articles (title=module,
  excerpt=description, category=product, real support-portal URL). Source: the
  team's "Support Learning Repository" spreadsheet → *Feature Releases* sheet
  → rows whose *Articles* column holds a real `https://…` link.

---

## 10. Component inventory
```
App.jsx                 shell + gate + routes
pages/   Landing, Home, Courses, Posters, Articles, Calendar,
         Studio, Analytics, FormRunner
components/
  Nav, Footer, PageHeader, Logo (+ QuillMark)
  Cursor (pixel), PaperTexture, StippleBrain
  HandDrawn (Circle/Underline/Arrow/Squiggle/Spark/Bracket/Strike)
  Highlight (marker sweep), Reveal (+ RevealWords)
  PosterCard, ArticleCard, FormBuilder, ResponsesPanel
  RequireTutor, NoteMaker
lib/  auth.jsx, store.js
data/ courses.js, content.js (posters, sessions types, articles helpers), articles.js
```

---

## 11. Reusable CSS utilities (Tailwind `@layer components`)
- `.hl` highlighter sweep (translucent red, animates `background-size` with
  `steps()`; add `.is-on` when scrolled into view).
- `.btn-ink` / `.btn-ghost` (hard red offset shadow on hover).
- `.tag` (mono uppercase pill, hairline border).
- `.paper-card` (cream card, hard offset shadow on hover).
- `.field` / `.label` (form inputs), `.section-dark`, `.paper-grain`, `.pixelated`,
  `html.clip-mode img { outline: dashed red }`, `.text-stroke`, `.no-scrollbar`.

---

## 12. Future: Google Workspace integration (roadmap)

Goal: Google sign-in, Drive link sharing, add-to-Calendar, save-notes-to-Docs,
export-Analytics-to-Sheets — **restricted to one company domain**.

**Recommended start: client-only** using **Google Identity Services (GIS)** +
in-browser OAuth token client calling Google REST APIs (fits the static deploy).
Move to a small **Vercel serverless backend** (OAuth code+PKCE, server-side
ID-token verification, refresh tokens, optional service account) when you need
shared team resources, scheduled exports, or hardened security.

**Domain restriction (use all three):** (1) OAuth consent screen = **Internal**
user type — the real lock; (2) pass `hd` hint and verify the ID token's `hd`
claim == your domain; (3) server-side token verification for tamper-proof actions.

| Feature | API | Min scope |
|---|---|---|
| Login | GIS | `openid email profile` |
| Drive links | **Picker** + Drive | `drive.file` |
| Add to Calendar | Calendar `events.insert` | `calendar.events` |
| Save notes to Docs | Docs `documents.create`+batchUpdate | `documents`, `drive.file` |
| Export to Sheets | Sheets `spreadsheets.create`+values | `spreadsheets` |

Request scopes **incrementally** (only at the moment a feature is used). Public
client ID + API key go in `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_API_KEY` (no
client secret in an SPA). Build order: Sign-in (replace §5, keep tutor allow-list)
→ Sheets export → Docs save → Calendar + Drive picker.

Setup (Workspace/Cloud admin): enable Drive/Picker/Calendar/Docs/Sheets APIs;
consent screen Internal; create Web OAuth Client (origins = prod + localhost) and
an API key.

---

## 13. Deployment
- `npm run build` → `dist/`. Deploy to **Vercel** (auto-detects Vite).
- `vercel.json`: framework `vite`, output `dist`, SPA rewrite `/(.*) → /index.html`.
- Production branch = `main`. Hash routing means deep links work even without the
  rewrite.

---

## 14. Reference links
- React https://react.dev · Vite https://vite.dev · Tailwind https://tailwindcss.com
- Framer Motion https://www.framer.com/motion/ · React Router https://reactrouter.com
- Google Fonts: Playfair Display, Inter, Caveat, Space Mono (fonts.google.com)
- Google Identity Services https://developers.google.com/identity/gsi/web
- Drive Picker https://developers.google.com/drive/picker · Calendar
  https://developers.google.com/calendar · Docs
  https://developers.google.com/docs · Sheets https://developers.google.com/sheets
- Public-domain newspaper textures: Wikimedia Commons, LoC Chronicling America,
  archive.org.

---

## 15. Acceptance checklist
- [ ] Opens on the split Learner/Tutor landing; spotlight hover; line-boil icons.
- [ ] Domain-restricted login; tutor allow-list; show/hide password; logout.
- [ ] Aged-paper palette (red-only accent), Playfair italic headers, grain +
      wrinkles + tape + clippings, retro pixel cursor.
- [ ] **Visible** reactive stipple brain on the right of the hero (wiggle + cursor
      scatter; SVG fallback present).
- [ ] Hero reads "Relearn. / Repeat. / Resolve." with word-wrapping marks, no
      clipping.
- [ ] Courses: filters + product tags; click opens Drive + acknowledgement; Yes
      locked until checkpoint quiz done; completion tracked.
- [ ] Posters: real images, lightbox. Articles: launches lead + thread-tie folders.
- [ ] Calendar: real sessions only, handwritten day titles, product/type filters,
      tutor create.
- [ ] Studio (tutor): forms/quizzes/decision-trees + responses. Analytics (tutor):
      Swiss charts.
- [ ] Note Maker: clip text/images → download `.md`.
- [ ] Micro-animations are stop-motion; scrolling/cursor are smooth.
- [ ] Builds clean; deploys to Vercel on `main`.
