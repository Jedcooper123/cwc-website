// ─────────────────────────────────────────────────────────────────────────────
// server.js — Express server for CWC full-stack deployment on Render.
//
// Current role: serves the built React app + handles React Router fallback.
// Future role:  add API routes below the "API routes" comment block —
//               auth, database queries, contact form emails, portal backend, etc.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express'
import path    from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── API routes ───────────────────────────────────────────────────────────────
// Add your backend routes here as you build them out, for example:
//
// import contactRouter from './routes/contact.js'
// import authRouter    from './routes/auth.js'
// import portalRouter  from './routes/portal.js'
//
// app.use('/api/contact', contactRouter)
// app.use('/api/auth',    authRouter)
// app.use('/api/portal',  portalRouter)

// Temporary: simple health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Cooper Web Consulting', timestamp: new Date().toISOString() })
})

// ── Serve React build ────────────────────────────────────────────────────────
// Serve static files from the Vite build output folder
app.use(express.static(path.join(__dirname, 'dist')))

// Catch-all: send index.html for any unmatched route so React Router works
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CWC server running on port ${PORT}`)
})
