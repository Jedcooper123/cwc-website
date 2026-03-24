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
    SELECT id, name, description, status, progress,
           service_id, monthly_price_cents, stage,
           created_at, updated_at
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
    SELECT id, description, amount_cents, status,
           service_id, invoice_type,
           due_date, paid_at, created_at
    FROM invoices
    WHERE client_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id)

  return res.json({ invoices })
})

// ── GET /api/portal/billing ───────────────────────────────────────────────
// Returns the client's subscription info (plan, status, next billing date).
router.get('/billing', (req, res) => {
  const db           = getDb()
  const subscription = db.prepare(`
    SELECT id, plan_name, plan_price_cents, status,
           stripe_subscription_id, current_period_end, created_at, updated_at
    FROM subscriptions
    WHERE client_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(req.user.id)

  // Also check if user has a Stripe customer ID for the billing portal button
  const user = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(req.user.id)
  const hasStripeCustomer = !!user?.stripe_customer_id

  return res.json({ subscription: subscription || null, hasStripeCustomer })
})

export default router
