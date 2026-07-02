import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// publicDir points at the repo-root public/ so Lexica reuses the previous
// site's posters, thumbnails, book scans and guide PDFs without duplicating
// 28MB of assets inside lexica/.
export default defineConfig({
  plugins: [react()],
  publicDir: '../public',
})
