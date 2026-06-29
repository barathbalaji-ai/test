# Carta — Learning Portal for Customer Support

> *Carta* — the craft of great support, written by hand.

An editorial, motion-driven learning portal for **Customer Support teams**, built
exactly to [`CARTA_BLUEPRINT.md`](./CARTA_BLUEPRINT.md): aged-paper aesthetic,
highlighter marks, hand-drawn annotations, film grain, a retro pixel cursor and a
reactive stipple-brain hero — wrapped around a genuinely functional toolset.

Built with **React 18 + Vite 5 + Tailwind CSS 3 + Framer Motion 11 + React Router 6**
(HashRouter, so it works on any static host). **No backend** — everything persists in
the browser via `localStorage`, so it deploys free and can later be wired to a real DB.

---

## Rooms

| Room | Route | What it does |
|------|-------|--------------|
| **Home** | `/` | Editorial hero (stipple brain), five-rooms map, featured courses, philosophy, poster of the week. |
| **Courses** | `/courses` | Filterable/searchable library. Click a course → opens its **Google Drive** lesson in a new tab **and** a checkpoint flow. |
| **Posters** | `/posters` | Print-ready poster wall + lightbox (generative fallback when no image). |
| **Articles** | `/articles` | This month's launches lead + a string-tie folder feed of release notes. |
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
- **Articles:** `src/data/articles.js` → replace the placeholder `url`s with real
  support-portal links.
- **Calendar:** seed sessions live in `SEED_EVENTS` (`src/data/content.js`).
- **Clippings:** optional transparent torn-paper PNGs at `public/clippings/clip-1..3.png`;
  otherwise a drawn newsprint fallback renders.
- **Persistence:** swap `src/lib/store.js` for API/DB calls to make data multi-user.

Use **Reset demo data** in the Studio to restore the seeded forms.

## Deploy

`npm run build` → `dist/`. Deploy to **Vercel** (auto-detects Vite); `vercel.json` adds
the SPA rewrite. Hash routing means deep links work on any static host.

## Tech

React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · React Router 6.
Fonts: Playfair Display, Inter, Caveat, Space Mono.
