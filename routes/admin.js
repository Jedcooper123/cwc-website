// ─────────────────────────────────────────────────────────────────────────────
// routes/admin.js — Admin-only routes for managing clients, projects, invoices.
// All routes require: authenticated + role === 'admin'
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import bcrypt     from 'bcryptjs'
import { getDb }  from '../database/db.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()
router.use(requireAuth, requireAdmin)

// ── POST /api/admin/clients ───────────────────────────────────────────────
router.post('/clients', async (req, res) => {
  const { email, name, company, password } = req.body
  if (!email || !name || !password)
    return res.status(400).json({ error: 'email, name, and password are required.' })
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  try {
    const hash = await bcrypt.hash(password, 12)
    const db   = getDb()
    const info = db.prepare(`
      INSERT INTO users (email, name, company, password_hash, role)
      VALUES (?, ?, ?, ?, 'client')
    `).run(email.trim(), name.trim(), company?.trim() || null, hash)
    return res.status(201).json({ clientId: info.lastInsertRowid })
  } catch (err) {
    if (err.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'A client with that email already exists.' })
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
})

// ── PATCH /api/admin/clients/:id ─────────────────────────────────────────
router.patch('/clients/:id', (req, res) => {
  const { name, email, company } = req.body
  const id = parseInt(req.params.id, 10)
  if (!name || !email)
    return res.status(400).json({ error: 'name and email are required.' })
  const db     = getDb()
  const client = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(id, 'client')
  if (!client) return res.status(404).json({ error: 'Client not found.' })
  try {
    db.prepare('UPDATE users SET name = ?, email = ?, company = ? WHERE id = ?')
      .run(name.trim(), email.trim(), company?.trim() || null, id)
    return res.json({ ok: true })
  } catch (err) {
    if (err.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'That email is already in use.' })
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
// Body: { clientId, name, description?, serviceId?, monthlyPriceDollars?, stage?, status? }
router.post('/projects', (req, res) => {
  const {
    clientId, name, description,
    serviceId, monthlyPriceDollars,
    stage   = 'discovery',
    status  = 'active',
  } = req.body

  if (!clientId || !name)
    return res.status(400).json({ error: 'clientId and name are required.' })

  const monthlyPriceCents = monthlyPriceDollars
    ? Math.round(parseFloat(monthlyPriceDollars) * 100)
    : 0

  try {
    const db   = getDb()
    const info = db.prepare(`
      INSERT INTO projects
        (client_id, name, description, service_id, monthly_price_cents, stage, status, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      clientId,
      name.trim(),
      description?.trim() || null,
      serviceId || null,
      monthlyPriceCents,
      stage,
      status,
    )
    return res.status(201).json({ projectId: info.lastInsertRowid })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
})

// ── PATCH /api/admin/projects/:id ─────────────────────────────────────────
// Body: { status?, stage?, description?, monthlyPriceDollars? }
router.patch('/projects/:id', (req, res) => {
  const { status, stage, description, monthlyPriceDollars } = req.body
  const id = parseInt(req.params.id, 10)

  const db      = getDb()
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
  if (!project) return res.status(404).json({ error: 'Project not found.' })

  const updates = []
  const values  = []

  if (status              !== undefined) { updates.push('status = ?');              values.push(status) }
  if (stage               !== undefined) { updates.push('stage = ?');               values.push(stage) }
  if (description         !== undefined) { updates.push('description = ?');         values.push(description) }
  if (monthlyPriceDollars !== undefined) {
    updates.push('monthly_price_cents = ?')
    values.push(Math.round(parseFloat(monthlyPriceDollars) * 100))
  }

  if (updates.length === 0)
    return res.status(400).json({ error: 'No fields to update.' })

  updates.push("updated_at = datetime('now')")
  values.push(id)
  db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  return res.json({ ok: true })
})

// ── POST /api/admin/invoices ──────────────────────────────────────────────
// Body: { clientId, description, amountDollars, serviceId?, invoiceType?, dueDate? }
router.post('/invoices', (req, res) => {
  const {
    clientId, description, amountDollars,
    serviceId, invoiceType = 'one-time', dueDate,
  } = req.body

  if (!clientId || !description || !amountDollars)
    return res.status(400).json({ error: 'clientId, description, and amountDollars are required.' })

  const amountCents = Math.round(parseFloat(amountDollars) * 100)
  if (isNaN(amountCents) || amountCents <= 0)
    return res.status(400).json({ error: 'amountDollars must be a positive number.' })

  try {
    const db   = getDb()
    const info = db.prepare(`
      INSERT INTO invoices (client_id, description, amount_cents, service_id, invoice_type, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(clientId, description.trim(), amountCents, serviceId || null, invoiceType, dueDate || null)
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
