// ─────────────────────────────────────────────────────────────────────────────
// routes/admin.js — Owner-only: clients, projects, monthly plans, and the
// inbox of client requests. Every route requires role = 'admin'.
// ─────────────────────────────────────────────────────────────────────────────
import { query, one } from '../database/db.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'
import { sendInviteEmail } from '../utils/email.js'
import { createAuthLink } from '../utils/authLinks.js'
import { asyncRouter } from '../utils/asyncRouter.js'

const router = asyncRouter()
router.use(requireAuth, requireAdmin)

const clip = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const isUniqueViolation = (err) => err.code === '23505'

function clientFields(body = {}) {
  let website = clip(body.website_url, 300)
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
  return {
    name:        clip(body.name, 120),
    email:       clip(body.email, 200),
    company:     clip(body.company, 120) || null,
    phone:       clip(body.phone, 40) || null,
    website_url: website || null,
    notes:       clip(body.notes, 5000) || null,
  }
}

// ── Overview ─────────────────────────────────────────────────────────────
router.get('/overview', async (_req, res) => {
  const stats = await one(`
    SELECT
      (SELECT count(*) FROM users WHERE role = 'client')::int                            AS clients,
      (SELECT count(*) FROM users WHERE role = 'client' AND password_hash IS NULL)::int  AS invited,
      (SELECT count(*) FROM plans WHERE status = 'active')::int                          AS active_plans,
      (SELECT COALESCE(sum(price_cents),0) FROM plans WHERE status = 'active')::int      AS mrr_cents,
      (SELECT count(*) FROM plans WHERE status = 'active'
         AND next_due_date <= current_date + 7)::int                                    AS due_soon,
      (SELECT count(*) FROM client_requests WHERE status <> 'done')::int                 AS open_requests,
      (SELECT count(*) FROM projects WHERE status = 'active')::int                       AS active_projects
  `)
  return res.json({ stats })
})

// ── Clients ──────────────────────────────────────────────────────────────
router.get('/clients', async (_req, res) => {
  const clients = await query(`
    SELECT u.id, u.email, u.name, u.company, u.phone, u.website_url, u.created_at, u.last_login_at,
           (u.password_hash IS NULL) AS invite_pending,
           p.status AS plan_status, p.price_cents, p.next_due_date,
           (SELECT count(*) FROM projects pr WHERE pr.client_id = u.id AND pr.status = 'active')::int AS active_projects,
           (SELECT pr.stage FROM projects pr WHERE pr.client_id = u.id ORDER BY pr.updated_at DESC LIMIT 1) AS latest_stage,
           (SELECT count(*) FROM client_requests r WHERE r.client_id = u.id AND r.status <> 'done')::int AS open_requests
    FROM users u
    LEFT JOIN plans p ON p.client_id = u.id
    WHERE u.role = 'client'
    ORDER BY lower(COALESCE(u.company, u.name))
  `)
  return res.json({ clients })
})

// Everything about one client, for the detail view.
router.get('/clients/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const client = await one(`
    SELECT id, email, name, company, phone, website_url, notes,
           created_at, last_login_at, (password_hash IS NULL) AS invite_pending
    FROM users WHERE id = $1 AND role = 'client'`, [id])
  if (!client) return res.status(404).json({ error: 'Client not found.' })

  const [projects, plan, requests] = await Promise.all([
    query('SELECT * FROM projects WHERE client_id = $1 ORDER BY updated_at DESC', [id]),
    one('SELECT * FROM plans WHERE client_id = $1', [id]),
    query('SELECT * FROM client_requests WHERE client_id = $1 ORDER BY created_at DESC', [id]),
  ])
  return res.json({ client, projects, plan, requests })
})

// Create a client. No password: they get an invite link to set their own.
// Body: { name, email, company?, phone?, website_url?, notes?, sendInvite? }
router.post('/clients', async (req, res) => {
  const f = clientFields(req.body)
  if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email))
    return res.status(400).json({ error: 'A name and a valid email are required.' })

  let client
  try {
    client = await one(
      `INSERT INTO users (email, name, company, phone, website_url, notes, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'client') RETURNING id, name, email`,
      [f.email, f.name, f.company, f.phone, f.website_url, f.notes],
    )
  } catch (err) {
    if (isUniqueViolation(err)) return res.status(409).json({ error: 'A client with that email already exists.' })
    throw err
  }

  const link = await createAuthLink(client.id, 'invite')
  const mail = req.body?.sendInvite === false ? null : await sendInviteEmail({ ...client, link })
  return res.status(201).json({ clientId: client.id, inviteLink: link, emailed: !!mail?.ok, emailError: mail && !mail.ok ? mail.reason : null })
})

router.patch('/clients/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const f  = clientFields(req.body)
  if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email))
    return res.status(400).json({ error: 'A name and a valid email are required.' })
  try {
    const updated = await one(
      `UPDATE users SET name = $1, email = $2, company = $3, phone = $4, website_url = $5, notes = $6
       WHERE id = $7 AND role = 'client' RETURNING id`,
      [f.name, f.email, f.company, f.phone, f.website_url, f.notes, id],
    )
    if (!updated) return res.status(404).json({ error: 'Client not found.' })
    return res.json({ ok: true })
  } catch (err) {
    if (isUniqueViolation(err)) return res.status(409).json({ error: 'That email is already in use.' })
    throw err
  }
})

// Set the client's monthly plan by hand: what they see on their Billing tab.
// Body: { planName?, priceDollars, nextDueDate?, status? }
router.put('/clients/:id/plan', async (req, res) => {
  const id     = parseInt(req.params.id, 10)
  const cents  = Math.round(parseFloat(req.body?.priceDollars) * 100)
  const status = req.body?.status || 'active'
  const due    = req.body?.nextDueDate || null
  if (!Number.isFinite(cents) || cents < 0) return res.status(400).json({ error: 'Enter a monthly price (0 or more).' })
  if (!['active', 'paused', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid plan status.' })
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return res.status(400).json({ error: 'Invalid due date.' })

  const client = await one(`SELECT id FROM users WHERE id = $1 AND role = 'client'`, [id])
  if (!client) return res.status(404).json({ error: 'Client not found.' })

  const plan = await one(
    `INSERT INTO plans (client_id, plan_name, price_cents, next_due_date, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (client_id) DO UPDATE SET
       plan_name = EXCLUDED.plan_name, price_cents = EXCLUDED.price_cents,
       next_due_date = EXCLUDED.next_due_date, status = EXCLUDED.status, updated_at = now()
     RETURNING *`,
    [id, clip(req.body?.planName, 80) || 'Monthly Care Plan', cents, due, status],
  )
  return res.json({ plan })
})

// Send (or re-send) a portal link: an invite if they never set a password,
// otherwise a password reset. Returns the link so it can be copied manually.
router.post('/clients/:id/invite', async (req, res) => {
  const client = await one(
    `SELECT id, name, email, (password_hash IS NULL) AS invite_pending
     FROM users WHERE id = $1 AND role = 'client'`, [req.params.id])
  if (!client) return res.status(404).json({ error: 'Client not found.' })

  const link = await createAuthLink(client.id, client.invite_pending ? 'invite' : 'reset')
  const mail = await sendInviteEmail({ ...client, link })
  return res.json({ inviteLink: link, emailed: mail.ok, emailError: mail.ok ? null : mail.reason })
})

// Deletes the client and everything attached (ON DELETE CASCADE).
router.delete('/clients/:id', async (req, res) => {
  const deleted = await one(`DELETE FROM users WHERE id = $1 AND role = 'client' RETURNING id`, [req.params.id])
  if (!deleted) return res.status(404).json({ error: 'Client not found.' })
  return res.json({ ok: true })
})

// ── Requests inbox ───────────────────────────────────────────────────────
router.get('/requests', async (req, res) => {
  const status = ['open', 'in_progress', 'done'].includes(req.query.status) ? req.query.status : null
  const requests = await query(`
    SELECT r.*, u.name AS client_name, u.company AS client_company, u.email AS client_email
    FROM client_requests r JOIN users u ON u.id = r.client_id
    WHERE ($1::text IS NULL AND r.status <> 'done') OR r.status = $1
    ORDER BY (r.type = 'cancel') DESC, r.created_at DESC
    LIMIT 200`, [status])
  return res.json({ requests })
})

router.patch('/requests/:id', async (req, res) => {
  const status = req.body?.status
  if (!['open', 'in_progress', 'done'].includes(status)) return res.status(400).json({ error: 'Invalid status.' })
  const updated = await one(
    'UPDATE client_requests SET status = $1, updated_at = now() WHERE id = $2 RETURNING id',
    [status, req.params.id],
  )
  if (!updated) return res.status(404).json({ error: 'Request not found.' })
  return res.json({ ok: true })
})

// ── Projects ─────────────────────────────────────────────────────────────
// Body: { clientId, name, description?, stage?, status? }
router.post('/projects', async (req, res) => {
  const { clientId, name, description, stage = 'discovery', status = 'active' } = req.body || {}
  if (!clientId || !clip(name)) return res.status(400).json({ error: 'clientId and name are required.' })
  const project = await one(
    `INSERT INTO projects (client_id, name, description, stage, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [clientId, clip(name), clip(description, 2000) || null, stage, status],
  )
  return res.status(201).json({ projectId: project.id })
})

// Body: { status?, stage?, description? }
router.patch('/projects/:id', async (req, res) => {
  const { status, stage, description } = req.body || {}
  const sets = []
  const vals = []
  const add  = (col, val) => { vals.push(val); sets.push(`${col} = $${vals.length}`) }

  if (status      !== undefined) add('status', status)
  if (stage       !== undefined) add('stage', stage)
  if (description !== undefined) add('description', description)
  if (!sets.length) return res.status(400).json({ error: 'No fields to update.' })

  vals.push(parseInt(req.params.id, 10))
  const updated = await one(
    `UPDATE projects SET ${sets.join(', ')}, updated_at = now() WHERE id = $${vals.length} RETURNING id`,
    vals,
  )
  if (!updated) return res.status(404).json({ error: 'Project not found.' })
  return res.json({ ok: true })
})

router.delete('/projects/:id', async (req, res) => {
  const deleted = await one('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id])
  if (!deleted) return res.status(404).json({ error: 'Project not found.' })
  return res.json({ ok: true })
})

export default router
