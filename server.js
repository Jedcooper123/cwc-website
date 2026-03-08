// ─────────────────────────────────────────────────────────────────────────────
// server.js — Express server for CWC full-stack deployment on Render.
//
// Handles:
//   - Serving the Vite-built React frontend
//   - REST API routes (auth, portal, admin, payments)
//   - React Router fallback (catch-all → index.html)
//
// Required environment variables (set in Render dashboard → Environment):
//   JWT_SECRET             — long random string, e.g. `openssl rand -hex 32`
//   STRIPE_SECRET_KEY      — from Stripe dashboard
//   STRIPE_WEBHOOK_SECRET  — from Stripe webhook settings
//   ADMIN_EMAIL            — your admin login email (default: jedpcooper@gmail.com)
//   ADMIN_PASSWORD         — your admin login password (CHANGE THIS)
//   DATABASE_PATH          — path on Render Persistent Disk, e.g. /data/cwc.db
// ─────────────────────────────────────────────────────────────────────────────
import express      from 'express'
import path         from 'path'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'

import { getDb }      from './database/db.js'
import authRoutes     from './routes/auth.js'
import portalRoutes   from './routes/portal.js'
import adminRoutes    from './routes/admin.js'
import paymentsRoutes from './routes/payments.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app  = express()
const PORT = process.env.PORT || 3000

// ── Stripe webhook MUST come before json() middleware ─────────────────────
// (needs raw body for signature verification)
app.use('/api/payments/webhook', paymentsRoutes)

// ── Standard middleware ───────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Trust proxy (needed behind Render's load balancer) ───────────────────
app.set('trust proxy', 1)

// ── Initialize database on startup ───────────────────────────────────────
getDb() // ensures tables + admin seed exist before requests come in

// ── API routes ────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/portal',   portalRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/payments', paymentsRoutes)

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Cooper Web Consulting', timestamp: new Date().toISOString() })
})

// ── Serve React build ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')))

// Catch-all: send index.html for any unmatched route so React Router works
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CWC server running on port ${PORT}`)
  if (!process.env.JWT_SECRET)           console.warn('[CWC] WARNING: JWT_SECRET not set — using insecure default!')
  if (!process.env.STRIPE_SECRET_KEY)    console.warn('[CWC] WARNING: STRIPE_SECRET_KEY not set — payments disabled.')
  if (!process.env.ADMIN_PASSWORD)       console.warn('[CWC] WARNING: ADMIN_PASSWORD not set — using default "ChangeMe123!"')
})
