# Carta — Content Guide

Carta is a **pure frontend**. Every section reads its content from a **published
Google Sheet** (CSV) at page load. Update a sheet → the site reflects it on the
next load. No backend, no login, no deploy needed for content changes.

The weekly workflow is: fill a **Google Form** → it appends a row to its **Google
Sheet** → the site reads the **published CSV** of that sheet. (You can also edit
the sheets by hand — the Form is just a convenient input.)

---

## 1. One-time wiring

For each sheet:

1. Open the Sheet → **File → Share → Publish to web**.
2. Choose the specific **tab**, format **Comma-separated values (.csv)**, **Publish**.
3. Copy the URL and paste it into the matching field in
   [`src/config/sources.js`](./src/config/sources.js).

```js
export const SOURCES = {
  calendar:   'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
  videos:     '…',
  posters:    '…',
  articles:   '…',
  completion: '…',
}
export const COMPLETION_SHEET_URL = 'https://docs.google.com/…'  // normal share link
```

Any field left empty falls back to the bundled seed data, so the site always
renders. Column headers are matched **case-insensitively** and extra columns
(like a Google Form **Timestamp**) are ignored — so name your Form questions to
match the column names below and you're done.

> If you use one Google Form for "Courses & Posters", give it two destination
> tabs (or two Forms) and publish each tab separately as `videos` and `posters`.

---

## 2. The sheets

### A) Calendar  →  `SOURCES.calendar`
Live training sessions.

| Column | Required | Notes |
|--------|:--:|-------|
| `Date` | ✅ | `YYYY-MM-DD` (preferred) or `M/D/YYYY` |
| `Session` | ✅ | Session name / title |
| `Time` | | e.g. `10:30–18:30` |
| `Trainer` | | Free text |
| `Products` | | `Freshservice`, `Freshdesk, Freshchat`, or `All` |
| `Room` | | e.g. `Virat Kohli` |
| `Description` | | Shown in the day + agenda detail |
| `EndDate` | | For multi-day sessions |
| `Type` | | One of `New product`, `Behavioural`, `Feature Launches`, `Leadership` (drives the colour) |
| `Location` | | Defaults to `Chennai` |
| `Seats` | | Number |

### B) Courses / Videos  →  `SOURCES.videos`
Thumbnail cards that open the external course (Mindtickle / Drive) in a new tab.
**No in-site tracking.**

| Column | Required | Notes |
|--------|:--:|-------|
| `Title` | ✅ | Course name |
| `Link` | ✅ | Mindtickle deep-link or Drive URL |
| `Description` | | Shown on the card |
| `Products` | | Free text; typo-tolerant (`Fresdesk` → Freshdesk) |
| `Thumbnail` | | Image URL or `/thumbnails/x.jpg`; blank → titled fallback tile |

### C) Posters  →  `SOURCES.posters`
Feeds the lazy-susan carousel.

| Column | Required | Notes |
|--------|:--:|-------|
| `Title` | ✅ | Poster name |
| `Image` | | Image URL, or a file you drop in `public/posters/` (e.g. `/posters/punctuality.jpg`) |
| `Description` | | Shown in the lightbox |
| `Category` | | Groups the filter chips (e.g. `Craft`, `Mindset`) |

> Posters can be uploaded individually into `public/posters/` and referenced by
> path, or hosted anywhere and referenced by URL.

### D) Articles  →  `SOURCES.articles`
Release notes. Powers the "this month" lead and the windable timeline archive.
**Months are derived from the data**, so a new month's rows extend the timeline
automatically — no code change.

| Column | Required | Notes |
|--------|:--:|-------|
| `Feature` | ✅* | Article / feature title |
| `Description` | ✅* | *Keep a row if it has a **Description OR a Link**; rows with neither are skipped.* |
| `Link` | ✅* | The article URL |
| `Product` | | Shown as the card label |
| `Month` | ✅ | `YYYY-MM` (e.g. `2026-05`) or `May 2026` |

### E) Completion  →  `SOURCES.completion` (+ `COMPLETION_SHEET_URL`)
Product-wise course completion. Cards group by product; clicking a card opens
the full spreadsheet (`COMPLETION_SHEET_URL`) — access is managed in Sheets.

| Column | Required | Notes |
|--------|:--:|-------|
| `Course` | ✅ | Course name |
| `Product` | | Groups the cards |
| `Rate` | | `0`–`100` (a `%` sign is fine) |

---

## 3. The launch gate
The site is behind a soft gate: visitors enter a `@freshworks.com` email to
continue (stored locally, no password). Change the domain in
`src/config/sources.js` → `ALLOWED_DOMAIN`. This is a light touch for an internal
audience, **not** a security boundary.
