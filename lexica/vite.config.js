import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// publicDir points at the repo-root public/ so Lexica reuses the previous
// site's posters, thumbnails, book scans and guide PDFs without duplicating
// 28MB of assets inside lexica/.
//
// `base` defaults to '/' for standalone use (its own dev server or its own
// Vercel deployment). When Carta's root build embeds Lexica as the
// "Supportverse" popup, it builds this with LEXICA_BASE=/universe/ so the
// emitted asset URLs resolve correctly at that nested path.
export default defineConfig({
  plugins: [react()],
  publicDir: '../public',
  base: process.env.LEXICA_BASE || '/',
})
