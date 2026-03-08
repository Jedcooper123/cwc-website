// ─────────────────────────────────────────────────────────────────────────────
// routes/admin.js — Admin-only routes for managing clients, projects, invoices.
// All routes require: authenticated + role === 'admin'
//
// POST /api/admin/clients          → create a new client account
// GET  /api/admin/clients          → list all clients
// POST /api/admin/projects         → create a project for a client
// PATCH /api/admin/projects/:id    → update project status/progress
// POST /api/admin/invoices         → create an invoice for a client
// PATCH /api/admin/invoices/:id/void → void an invoice
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import bcrypt     from 'bcryptjs'
import { getDb }  from '../database/db.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin)

// ── POST /api/admin/clients ───────────────────────────────────────────────
// Body: { email, name, company?, password }
router.post('/clients', async (req, res) => {
  const { email, name, company, password } = req.body

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'email, name, and password are required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  try {
    const hash = await bcrypt.hash(password, 12)
    const db   = getDb()
    const info = db.prepare(`
      INSERT INTO users (email, name, company, password_hash, role)
      VALUES (?, ?, ?, ?, 'client')
    `).run(email.trim(), name.trim(), company?.trim() || null, hash)

    return res.status(201).json({ clientId: info.lastInsertRowid })
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A client with that email already exists.' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
})

// ── GET /api/admin/clients ────────────────────────────────────────────────
router.get('/clients', (req, res) => {
  const db      = getDb()
  const clients = db.prepare(`
    SELECT id, email, name, company, role, created_at
    FROM users WHERE role = 'client'
    ORDER BY created_at DESC
  `).all()
  return res.json({ clients })
})

// ── POST /api/admin/projects ──────────────────────────────────────────────
// Body: { clientId, name, description?, status?, progress? }
router.post('/projects', (req, res) => {
  const { clientId, name, description, status = 'active', progress = 0 } = req.body

  if (!clientId || !name) {
    return res.status(400).json({ error: 'clientId and name are required.' })
  }

  try {
    const db   = getDb()
    const info = db.prepare(`
      INSERT INTO projects (client_id, name, description, status, progress)
      VALUES (?, ?, ?, ?, ?)
    `).run(clientId, name.trim(), description?.trim() || null, status, progress)

    return res.status(201).json({ projectId: info.lastInsertRowid })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
})

// ── PATCH /api/admin/projects/:id ─────────────────────────────────────────
// Body: { status?, progress?, description? }
router.patch('/projects/:id', (req, res) => {
  const { status, progress, description } = req.body
  const id = parseInt(req.params.id, 10)

  const db      = getDb()
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
  if (!project) return res.status(404).json({ error: 'Project not found.' })

  const updates = []
  const values  = []

  if (status      !== undefined) { updates.push('status = ?');      values.push(status) }
  if (progress    !== undefined) { updates.push('progress = ?');    values.push(progress) }
  if (description !== undefined) { updates.push('description = ?'); values.push(description) }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update.' })
  }

  updates.push("updated_at = datetime('now')")
  values.push(id)

  db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  return res.json({ ok: true })
})

// ── POST /api/admin/invoices ──────────────────────────────────────────────
// Body: { clientId, description, amountDollars, dueDate? }
router.post('/invoices', (req, res) => {
  const { clientId, description, amountDollars, dueDate } = req.body

  if (!clientId || !description || !amountDollars) {
    return res.status(400).json({ error: 'clientId, description, and amountDollars are required.' })
  }

  const amountCents = Math.round(parseFloat(amountDollars) * 100)
  if (isNaN(amountCents) || amountCents <= 0) {
    return res.status(400).json({ error: 'amountDollars must be a positive number.' })
  }

  try {
    const db   = getDb()
    const info = db.prepare(`
      INSERT INTO invoices (client_id, description, amount_cents, due_date)
      VALUES (?, ?, ?, ?)
    `).run(clientId, description.trim(), amountCents, dueDate || null)

    return res.status(201).json({ invoiceId: info.lastInsertRowid })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
})

// ── PATCH /api/admin/invoices/:id/void ───────────────────────────────────
router.patch('/invoices/:id/void', (req, res) => {
  const db      = getDb()
  const invoice = db.prepare("SELECT id FROM invoices WHERE id = ? AND status = 'pending'").get(req.params.id)
  if (!invoice) return res.status(404).json({ error: 'Pending invoice not found.' })

  db.prepare("UPDATE invoices SET status = 'void' WHERE id = ?").run(req.params.id)
  return res.json({ ok: true })
})

export default router
