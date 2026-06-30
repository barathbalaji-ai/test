# Carta — Learning Portal for Customer Support

> *Carta* — the craft of great support, written by hand.

An editorial, motion-driven learning portal for **Customer Support teams**, built
exactly to [`CARTA_BLUEPRINT.md`](./CARTA_BLUEPRINT.md): aged-paper aesthetic,
highlighter marks, hand-drawn annotations, film grain, a retro pixel cursor and a
reactive stipple-brain hero — wrapped around a genuinely functional toolset.

Built with **React 18 + Vite 5 + Tailwind CSS 3 + Framer Motion 11 + React Router 6**
(HashRouter, so it works on any static host). Shared data (forms, quiz responses,
calendar sessions, completions, the learner roster) is stored in **Vercel Postgres**
via serverless functions under `/api`; when no backend is configured the app falls
back to per-browser `localStorage`, so local dev and static-only deploys still work.

---

## Rooms

| Room | Route | What it does |
|------|-------|--------------|
| **Home** | `/` | Editorial hero (stipple brain), five-rooms map, featured courses, philosophy, poster of the week. |
| **Courses** | `/courses` | Filterable/searchable library. Click a course → opens its **Google Drive** lesson in a new tab **and** a checkpoint flow. |
| **Posters** | `/posters` | Print-ready poster wall + lightbox (generative fallback when no image). |
| **Articles** | `/articles` | Latest month's release notes; expand the archive to wind a film-reel **timeline range-scroller** (with reeling ambience) across older months. |
| **Calendar** | `/calendar` | Month grid + agenda of in-person sessions; product/type filters; tutors can add sessions. |
| **Quiz Studio** | `/studio` | *(tutor)* Build forms, graded quizzes, branching decision trees; view responses. |
| **Analytics** | `/analytics` | *(tutor/admin)* Swiss dashboard of completions, scores and survey results. |
| **Form runner** | `/form/:id` | Learner-facing runner for any built form/quiz/tree. |

## The viewing-stats mechanism (course checkpoint)

1. A course card is a **thumbnail**. Clicking it opens the Google Drive lesson in a
   **new tab** and an **acknowledgement modal** in the original page.
2. The lesson opens for anyone signed in with a `@freshworks.com` Google account.
3. Back on the page, a **“I've finished watching → checkpoint quiz”** step opens a
   short MCQ quiz.
4. **“Yes, mark complete” is disabled until the quiz is submitted.** Confirming records
   the completion (with score) per learner.
5. Those completions drive the **Analytics** learner stats.

## Roles & access (client-side sample)

Auth follows the blueprint (§5); production should move to Google Sign-In (§12).

- **Domain-restricted:** only `@freshworks.com` emails can sign up / log in.
- **Learners:** self sign-up (Name, Product, email, password), then log in by email + password.
- **Tutors / admins:** an allow-list in `src/lib/auth.jsx` (`TUTOR_IDS`). A tutor sets
  their password on first sign-in. Tutors get the Studio, Calendar “New session”, and
  the Analytics dashboard. Learners can't see tutor surfaces.

To add a tutor, append their `@freshworks.com` email to `TUTOR_IDS`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Wiring it to the real thing (placeholders to swap)

- **Course Drive links:** `src/data/courses.js` → replace each `link` with a real
  Google Drive share URL (and tune the checkpoint `quiz` questions).
- **Posters:** drop artwork into `public/posters/` and point each `img` in
  `src/data/content.js` at it (≤~250 KB web JPGs). Missing images fall back to a motif.
- **Articles:** `src/data/articles.js` is **generated from the team's Site Content
  sheet** (Feature Releases). Each row that has *both* a description and an article
  link is kept (rows missing either are skipped); columns map Product → `product`,
  Feature → `name`, Description → `excerpt`, Release month → `date`/`month`, and the
  article hyperlink → `url`. The page shows the latest month by default and exposes
  the rest through the timeline scroller. Re-run the import to refresh.
- **Calendar:** seed sessions live in `SEED_EVENTS` (`src/data/content.js`).
- **Clippings:** optional transparent torn-paper PNGs at `public/clippings/clip-1..3.png`;
  otherwise a drawn newsprint fallback renders.
- **Persistence:** shared data already goes through the `/api` functions backed by
  Vercel Postgres (see below). `src/lib/store.js` is the single sync layer.

Use **Reset demo data** in the Studio to re-pull from the backend (or restore local
seeds when running without one).

## Shared database (Vercel Postgres)

The portal syncs through serverless functions in `/api`, backed by a Postgres
database. Everything is optimistic: the UI updates instantly and writes sync in the
background; if the API is unreachable it transparently falls back to `localStorage`.

**Endpoints**

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/state` | `GET` | The whole shared store: forms, responses, events, completions, users. |
| `/api/forms` | `POST`, `DELETE?id=` | Save / delete a form, quiz or decision tree. |
| `/api/responses` | `POST` | Record a form/quiz/tree response. |
| `/api/events` | `POST`, `DELETE?id=` | Create / delete a calendar session. |
| `/api/completions` | `POST` | Record a learner's course completion + score. |
| `/api/users` | `GET`, `POST` | The learner/tutor roster for analytics (no passwords). |

The schema is created and seeded automatically on first request
(`api/_db.js` → `ensureSchema()`).

**Set it up on Vercel (one time)**

1. Import the repo into Vercel (it auto-detects Vite + the `/api` functions).
2. In the project, go to **Storage → Create Database → Postgres** (Neon) and connect
   it. Vercel injects `POSTGRES_URL` (and friends) into the project's env vars.
3. **Redeploy.** The first request to any `/api/*` route creates the tables and seeds
   the demo forms + sessions. Done — data is now shared across all users.

**Local development with the database**

```bash
npm i -g vercel
vercel link            # link to the Vercel project
vercel env pull .env.local   # fetch POSTGRES_URL locally
vercel dev             # runs the SPA + /api functions together
```

`npm run dev` (plain Vite) also works — it just runs in `localStorage` fallback mode
because the `/api` functions aren't served.

> **Identity note:** passwords are still the client-side sample auth. The roster in
> the `users` table carries no passwords. Move to Google Sign-In (verified
> server-side) for real authentication — see `CARTA_BLUEPRINT.md` §12.

## Deploy

`npm run build` → `dist/`. Deploy to **Vercel** (auto-detects Vite); `vercel.json` adds
the SPA rewrite. Hash routing means deep links work on any static host.

## Tech

React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · React Router 6.
Fonts: Playfair Display, Inter, Caveat, Space Mono.
