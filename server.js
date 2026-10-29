// ─────────────────────────────────────────────────────────────────────────────
// server.js — Express server for the Launchpad site on Render.
//
// Serves the Vite-built React app plus the API (auth, portal, admin,
// contact). See .env.example for every environment variable.
// ─────────────────────────────────────────────────────────────────────────────
import express      from 'express'
import helmet       from 'helmet'
import path         from 'path'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'

import { initDb, isDbReady } from './database/db.js'
import authRoutes      from './routes/auth.js'
import portalRoutes    from './routes/portal.js'
import adminRoutes     from './routes/admin.js'
import contactRoutes   from './routes/contact.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app  = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1) // behind Render's load balancer
app.disable('x-powered-by')

// CSP is left off because the React app loads Google Fonts;
// helmet's other headers (HSTS, nosniff, frameguard, ...) still apply.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))

app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

// Health check for Render. Deliberately does NOT touch the database, so
// Neon's free-tier compute can sleep between real visits.
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/contact', contactRoutes) // works without the DB

// Everything else needs the database.
app.use('/api', (_req, res, next) => {
  if (isDbReady()) return next()
  res.set('Retry-After', '30')
  return res.status(503).json({ error: 'The portal is starting up. Please try again in a moment.' })
})
app.use('/api/auth',     authRoutes)
app.use('/api/portal',   portalRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// ── React build ───────────────────────────────────────────────────────────
const dist = path.join(__dirname, 'dist')
app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }))
app.use(express.static(dist, { index: false, maxAge: '1h' }))
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

// ── Errors ────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (res.headersSent) return
  // Bad input from the browser (malformed JSON, unknown related record).
  if (err.status >= 400 && err.status < 500) return res.status(err.status).json({ error: 'That request wasn’t valid.' })
  if (err.code === '23503') return res.status(400).json({ error: 'That client or record no longer exists.' })
  if (err.code === '22P02') return res.status(400).json({ error: 'That request wasn’t valid.' })
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err)
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' })
})

app.listen(PORT, () => {
  console.log(`Launchpad server running on port ${PORT}`)
  if (!process.env.JWT_SECRET)        console.warn('[Config] JWT_SECRET not set.')
  if (!process.env.RESEND_API_KEY)    console.warn('[Config] RESEND_API_KEY not set — emails print to the log instead.')
  initDb()
})
