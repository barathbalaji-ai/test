# The Edge — an interactive playbook for Support & Excellence

An interactive, daily-use digital companion built from the **Q1 Programs Playbook
("The Edge — A Playbook for Support & Excellence")**. It preserves the guidebook's
original hand-drawn cornflower-blue illustrations, copy, and voice, and gives them a
smooth, tactile, console-style interface designed to be opened *every day*.

## What it does

- **Home hub** — an immersive, depth-lit landing with a rotating **Daily Edge** card,
  a **streak** counter, a **progress ring**, and floating chapter tiles that carry the
  original artwork.
- **Daily nudge engine** — one technique or insight surfaces each day (deterministic by
  date), with a *"I practised this today"* check-in that builds a streak and celebrates
  milestones. An optional **browser reminder** can nudge you daily.
- **Three chapters, faithfully reproduced** — Effective Prioritisation, Emotional
  Intelligence, Ownership & Accountability — plus the Outcome & Commitment close. Every
  page's copy is preserved; illustrations are the artist's originals extracted from the PDF.
- **Actionable learning modules:**
  - A working **Pomodoro** focus timer (25 / 5 / long-reset, four-round tracker).
  - A live **4·7·8 breathing** guide (the STOP technique) with an animated orb.
  - A **Pickle-Jar** tap-to-sort exercise (rocks → pebbles → sand → water).
  - **Reframe** flip-cards (auto-story → new story).
  - Expandable technique cards, interactive best-practice checklists.
- **Your private space** — "Let's Reflect" prompts and the three commitments autosave to
  your device (`localStorage`) and collect in **My Journal**. Nothing leaves the browser.

## Design

- **Aesthetic preserved:** the playbook's palette (`#4A73AA` line art, `#457ABD` display
  blue, `#5274A7` cornflower), hand-drawn illustrations, and handwritten accents (rendered
  from the artist's own art where it appears in the book, and Caveat elsewhere).
- **Feel:** spring-eased motion, glass surfaces, ambient gradient + drifting particles,
  focus-driven tiles with parallax tilt, page-transition whooshes, and optional soft UI
  cues (toggle 🔈 in the top bar). Respects `prefers-reduced-motion`.

## Running / sharing

It's a **zero-build, self-contained** web app — no framework, no install.

```bash
# from this folder
python3 -m http.server 8137
# then open http://localhost:8137/
```

Or just double-click `index.html`. Fonts are self-hosted (`fonts/`) so it works offline
and when emailed. To distribute, zip the `the-edge/` folder or host it on any static server
(the surrounding Carta project can link to it directly).

## Structure

```
the-edge/
├── index.html      # shell: ambient layers, boot splash, top bar, mount point
├── styles.css      # PS5-feel × guidebook aesthetic
├── data.js         # all playbook content, structured
├── app.js          # router, streak/nudge engine, interactive modules
├── fonts/          # self-hosted Poppins / Inter / Caveat (latin subset)
├── fonts.css
└── assets/         # hand-drawn illustrations extracted from the source PDF
```

## Credit

Content and illustrations © Freshworks — from the Q1 Programs Playbook. This is a digital
recreation of that guidebook.
