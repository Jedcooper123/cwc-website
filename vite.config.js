import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Pages deployment config:
//   • If deploying to https://<username>.github.io/<repo-name>/
//     → set base to '/<repo-name>/'  (e.g. '/cwc-website/')
//   • If deploying to a custom domain (e.g. cooperwebconsulting.com)
//     → set base to '/'
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [react()],
  base: '/cwc-website/', // Change to '/cwc-website/' if deploying to a GitHub Pages subdirectory
})
