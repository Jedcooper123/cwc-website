// ─────────────────────────────────────────────────────────────────────────────
// routes/payments.js — Stripe payment intents, subscriptions, billing portal,
//                      and webhook handler.
//
// POST /api/payments/create-intent          → PaymentIntent for a one-time invoice
// POST /api/payments/create-subscription    → Create Stripe customer + subscription (admin)
// POST /api/payments/billing-portal         → Stripe Customer Portal session (client)
// POST /api/payments/webhook               → Stripe webhook (raw body, signature verified)
//
// Env vars required:
//   STRIPE_SECRET_KEY      — from Stripe dashboard (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET  — from Stripe dashboard webhook settings
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import Stripe     from 'stripe'
import express    from 'express'
import { getDb }  from '../database/db.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set.')
  return new Stripe(key, { apiVersion: '2024-04-10' })
}

// ── POST /api/payments/create-intent ─────────────────────────────────────
// Authenticated: client creates intent for their own pending invoice.
// Body: { invoiceId }
router.post('/create-intent', requireAuth, async (req, res) => {
  const { invoiceId } = req.body

  if (!invoiceId) {
    return res.status(400).json({ error: 'invoiceId is required.' })
  }

  const db      = getDb()
  const invoice = db.prepare(`
    SELECT * FROM invoices
    WHERE id = ? AND client_id = ? AND status = 'pending'
  `).get(invoiceId, req.user.id)

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found or already paid.' })
  }

  try {
    const stripe = getStripe()
    const intent = await stripe.paymentIntents.create({
      amount:   invoice.amount_cents,
      currency: 'usd',
      metadata: {
        invoice_id:   String(invoice.id),
        client_id:    String(req.user.id),
        client_email: req.user.email,
      },
    })

    // Save the intent ID on the invoice so the webhook can find it
    db.prepare('UPDATE invoices SET stripe_payment_intent = ? WHERE id = ?')
      .run(intent.id, invoice.id)

    return res.json({ clientSecret: intent.client_secret })
  } catch (err) {
    console.error('[Stripe]', err.message)
    return res.status(500).json({ error: 'Could not create payment intent.' })
  }
})

// ── POST /api/payments/create-subscription ───────────────────────────────
// Admin only: create a Stripe customer (if needed) and attach a subscription.
// Body: { clientId, priceId, planName, planPriceDollars }
//
// priceId — a Price ID from your Stripe dashboard (e.g. "price_1Abc...")
// planName — display label shown in the client portal (e.g. "Basic Maintenance")
router.post('/create-subscription', requireAuth, requireAdmin, async (req, res) => {
  const { clientId, priceId, planName, planPriceDollars } = req.body

  if (!clientId || !priceId) {
    return res.status(400).json({ error: 'clientId and priceId are required.' })
  }

  const db     = getDb()
  const client = db.prepare('SELECT id, email, name, stripe_customer_id FROM users WHERE id = ? AND role = ?')
    .get(clientId, 'client')

  if (!client) return res.status(404).json({ error: 'Client not found.' })

  try {
    const stripe = getStripe()

    // 1. Get or create Stripe customer
    let customerId = client.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name:  client.name,
        metadata: { cwc_client_id: String(client.id) },
      })
      customerId = customer.id
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?')
        .run(customerId, client.id)
    }

    // 2. Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer:          customerId,
      items:             [{ price: priceId }],
      payment_behavior:  'default_incomplete',
      expand:            ['latest_invoice.payment_intent'],
      metadata: { cwc_client_id: String(client.id) },
    })

    const planPriceCents = planPriceDollars
      ? Math.round(parseFloat(planPriceDollars) * 100)
      : 0

    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

    // 3. Save subscription to database
    const existing = db.prepare('SELECT id FROM subscriptions WHERE client_id = ?').get(client.id)
    if (existing) {
      db.prepare(`
        UPDATE subscriptions
        SET stripe_subscription_id = ?, stripe_customer_id = ?,
            plan_name = ?, plan_price_cents = ?, status = ?,
            current_period_end = ?, updated_at = datetime('now')
        WHERE client_id = ?
      `).run(
        subscription.id, customerId,
        planName || 'Monthly Maintenance', planPriceCents,
        subscription.status, periodEnd,
        client.id,
      )
    } else {
      db.prepare(`
        INSERT INTO subscriptions
          (client_id, stripe_subscription_id, stripe_customer_id, plan_name, plan_price_cents, status, current_period_end)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        client.id, subscription.id, customerId,
        planName || 'Monthly Maintenance', planPriceCents,
        subscription.status, periodEnd,
      )
    }

    // 4. Return client secret if payment is required (for incomplete subscriptions)
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret || null
    return res.status(201).json({ subscriptionId: subscription.id, clientSecret, status: subscription.status })
  } catch (err) {
    console.error('[Stripe subscription]', err.message)
    return res.status(500).json({ error: err.message || 'Could not create subscription.' })
  }
})

// ── POST /api/payments/billing-portal ────────────────────────────────────
// Authenticated client: create a Stripe Customer Portal session and return URL.
// Client redirects to this URL to manage their payment method / cancel.
router.post('/billing-portal', requireAuth, async (req, res) => {
  const db     = getDb()
  const user   = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(req.user.id)

  if (!user?.stripe_customer_id) {
    return res.status(400).json({
      error: 'No billing account found. Contact Jed to set up your subscription.',
    })
  }

  try {
    const stripe  = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer:   user.stripe_customer_id,
      return_url: `${process.env.APP_URL || req.headers.origin || 'https://cooperwebconsulting.com'}/portal`,
    })
    return res.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe billing portal]', err.message)
    return res.status(500).json({ error: 'Could not open billing portal: ' + err.message })
  }
})

// ── POST /api/payments/webhook ────────────────────────────────────────────
// Raw body required — Stripe signs every webhook. Mounted in server.js BEFORE
// the express.json() middleware so we can verify the raw body.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig    = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET not set.')
    return res.status(500).send('Webhook secret not configured.')
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(req.body, sig, secret)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const db = getDb()

  switch (event.type) {

    // ── One-time invoice paid ──────────────────────────────────────────────
    case 'payment_intent.succeeded': {
      const intent = event.data.object
      db.prepare(`
        UPDATE invoices
        SET status = 'paid', paid_at = datetime('now')
        WHERE stripe_payment_intent = ? AND status = 'pending'
      `).run(intent.id)
      console.log(`[Stripe] Invoice paid — intent: ${intent.id}`)
      break
    }

    // ── Subscription created / updated ────────────────────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub       = event.data.object
      const clientRow = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?')
        .get(sub.customer)
      if (!clientRow) break

      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null

      const existing = db.prepare('SELECT id FROM subscriptions WHERE stripe_subscription_id = ?')
        .get(sub.id)

      if (existing) {
        db.prepare(`
          UPDATE subscriptions
          SET status = ?, current_period_end = ?, updated_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `).run(sub.status, periodEnd, sub.id)
      } else {
        // New subscription discovered via webhook (edge case)
        db.prepare(`
          INSERT OR IGNORE INTO subscriptions
            (client_id, stripe_subscription_id, stripe_customer_id, status, current_period_end)
          VALUES (?, ?, ?, ?, ?)
        `).run(clientRow.id, sub.id, sub.customer, sub.status, periodEnd)
      }
      console.log(`[Stripe] Subscription ${event.type} — ${sub.id} (${sub.status})`)
      break
    }

    // ── Subscription cancelled / deleted ──────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      db.prepare(`
        UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now')
        WHERE stripe_subscription_id = ?
      `).run(sub.id)
      console.log(`[Stripe] Subscription cancelled — ${sub.id}`)
      break
    }

    // ── Recurring invoice paid (subscription renewal) ─────────────────────
    case 'invoice.payment_succeeded': {
      const inv = event.data.object
      if (inv.subscription) {
        db.prepare(`
          UPDATE subscriptions SET status = 'active', updated_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `).run(inv.subscription)
      }
      break
    }

    // ── Recurring payment failed ──────────────────────────────────────────
    case 'invoice.payment_failed': {
      const inv = event.data.object
      if (inv.subscription) {
        db.prepare(`
          UPDATE subscriptions SET status = 'past_due', updated_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `).run(inv.subscription)
        console.warn(`[Stripe] Payment failed for subscription ${inv.subscription}`)
      }
      break
    }

    default:
      // Unknown event — ignore
      break
  }

  return res.json({ received: true })
})

export default router
