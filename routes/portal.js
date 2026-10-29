// ─────────────────────────────────────────────────────────────────────────────
// routes/portal.js — Signed-in client's own data.
//
// GET   /api/portal/summary   → projects, monthly plan, recent requests
// PATCH /api/portal/profile   { name, company, phone, website_url }
// GET   /api/portal/requests  → all of this client's requests
// POST  /api/portal/requests  { type, subject, message, pageUrl? }
//        type: message | edit | billing | cancel — saved, then emailed to the owner
// ─────────────────────────────────────────────────────────────────────────────
import rateLimit from 'express-rate-limit'
import { query, one } from '../database/db.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { sendRequestToOwner, REQUEST_LABELS } from '../utils/email.js'
import { asyncRouter } from '../utils/asyncRouter.js'

const router = asyncRouter()
router.use(requireAuth)

const clip = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const REQUEST_COLUMNS = 'id, type, subject, body, page_url, status, created_at, updated_at'

router.get('/summary', async (req, res) => {
  const id = req.user.id
  const [projects, plan, requests] = await Promise.all([
    query(`SELECT id, name, description, status, progress, stage, created_at, updated_at
           FROM projects WHERE client_id = $1 ORDER BY updated_at DESC`, [id]),
    one(`SELECT plan_name, price_cents, next_due_date, status
         FROM plans WHERE client_id = $1`, [id]),
    query(`SELECT ${REQUEST_COLUMNS} FROM client_requests WHERE client_id = $1
           ORDER BY created_at DESC LIMIT 50`, [id]),
  ])
  return res.json({ projects, plan, requests })
})

router.patch('/profile', async (req, res) => {
  const name = clip(req.body?.name, 120)
  if (!name) return res.status(400).json({ error: 'Your name is required.' })

  let website = clip(req.body?.website_url, 300)
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`

  const user = await one(
    `UPDATE users SET name = $1, company = $2, phone = $3, website_url = $4
     WHERE id = $5 RETURNING id, email, name, company, phone, website_url, role`,
    [name, clip(req.body?.company, 120) || null, clip(req.body?.phone, 40) || null, website || null, req.user.id],
  )
  return res.json({ user })
})

router.get('/requests', async (req, res) => {
  const requests = await query(
    `SELECT ${REQUEST_COLUMNS} FROM client_requests WHERE client_id = $1 ORDER BY created_at DESC`,
    [req.user.id],
  )
  return res.json({ requests })
})

const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  keyGenerator: (req) => `client-${req.user.id}`,
  message: { error: 'You’ve sent a lot of requests in the last hour. Please try again a bit later.' },
  standardHeaders: true, legacyHeaders: false,
})

router.post('/requests', requestLimiter, async (req, res) => {
  const type    = req.body?.type
  const message = clip(req.body?.message, 5000)
  if (!REQUEST_LABELS[type]) return res.status(400).json({ error: 'Unknown request type.' })
  if (!message)              return res.status(400).json({ error: 'Please add a few details.' })

  if (type === 'cancel') {
    const open = await one(
      `SELECT id FROM client_requests WHERE client_id = $1 AND type = 'cancel' AND status <> 'done'`,
      [req.user.id],
    )
    if (open) return res.status(409).json({ error: 'You already have a cancellation request open. Jed will be in touch.' })
  }

  const subject = clip(req.body?.subject, 160)
    || (type === 'cancel' ? 'Cancel my plan' : message.split('\n')[0].slice(0, 80))
  const pageUrl = clip(req.body?.pageUrl, 300) || null

  const request = await one(
    `INSERT INTO client_requests (client_id, type, subject, body, page_url)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${REQUEST_COLUMNS}`,
    [req.user.id, type, subject, message, pageUrl],
  )

  const mail = await sendRequestToOwner({ request, client: req.user })
  if (!mail.ok) console.warn(`[Portal] Request #${request.id} saved but owner email failed: ${mail.reason}`)

  return res.status(201).json({ request })
})

export default router
