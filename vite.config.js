import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HashRouter is used, so no special history fallback is required, but we keep
// the base relative so the build works on any static host.
export default defineConfig({
  plugins: [react()],
  base: './',
})
