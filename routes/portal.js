// ─────────────────────────────────────────────────────────────────────────────
// routes/portal.js — Client portal data: projects and invoices.
//
// GET /api/portal/projects  → list of client's projects
// GET /api/portal/invoices  → list of client's invoices
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { getDb }  from '../database/db.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

// All portal routes require authentication
router.use(requireAuth)

// ── GET /api/portal/projects ──────────────────────────────────────────────
router.get('/projects', (req, res) => {
  const db       = getDb()
  const projects = db.prepare(`
    SELECT id, name, description, status, progress, created_at, updated_at
    FROM projects
    WHERE client_id = ?
    ORDER BY updated_at DESC
  `).all(req.user.id)

  return res.json({ projects })
})

// ── GET /api/portal/invoices ──────────────────────────────────────────────
router.get('/invoices', (req, res) => {
  const db       = getDb()
  const invoices = db.prepare(`
    SELECT id, description, amount_cents, status, due_date, paid_at, created_at
    FROM invoices
    WHERE client_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id)

  return res.json({ invoices })
})

export default router
