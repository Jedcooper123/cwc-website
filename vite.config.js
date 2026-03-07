import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as a full-stack / static site on Render.
// base stays '/' — Render serves index.html for all routes via public/_redirects.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
