// ─────────────────────────────────────────────────────────────────────────
//  Live content sources — published Google Sheet CSV URLs.
//
//  The site reads these at load. Paste a "Publish to web → CSV" link for each
//  section (File → Share → Publish to web → pick the tab → CSV). Leaving a URL
//  empty makes that section fall back to the bundled seed data, so the site
//  always renders — locally, in previews, and before the sheets are wired.
//
//  Updating a sheet updates the site automatically on next load. Adding a new
//  month of articles auto-extends the timeline; no code change or redeploy.
//
//  Column schemas for each sheet (and the matching Google Form fields) are in
//  CONTENT_GUIDE.md.
// ─────────────────────────────────────────────────────────────────────────

export const SOURCES = {
  // Live training calendar. Columns: Date, Time, Trainer, Products, Room,
  // Session, Description  (optional: EndDate, Type, Location, Seats)
  calendar: '',

  // Course videos. Columns: Title, Description, Products, Link, Thumbnail
  videos: '',

  // Posters. Columns: Title, Description, Category, Image
  posters: '',

  // Articles / release notes. Columns: Product, Feature, Description, Month, Link
  articles: '',

  // Completion rates. Columns: Course, Product, Rate  (Rate = 0–100)
  completion: '',
}

// The full completion-rates spreadsheet, opened when a manager clicks a card.
// Use the normal shareable link (not the CSV one). Access is managed in Sheets.
export const COMPLETION_SHEET_URL = ''

// Company domain allowed through the launch gate.
export const ALLOWED_DOMAIN = 'freshworks.com'
