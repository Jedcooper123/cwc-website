// ─────────────────────────────────────────────────────────────────────────────
// routes/payments.js — Stripe payment intents + webhook.
//
// POST /api/payments/create-intent     → create PaymentIntent for an invoice
// POST /api/payments/webhook           → Stripe webhook to confirm payment
//
// Env vars required:
//   STRIPE_SECRET_KEY      — from Stripe dashboard (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET  — from Stripe dashboard webhook settings
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import Stripe     from 'stripe'
import express    from 'express'
import { getDb }  from '../database/db.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set.')
  return new Stripe(key, { apiVersion: '2024-04-10' })
}

// ── POST /api/payments/create-intent ─────────────────────────────────────
// Authenticated: client creates intent for their own invoice.
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
        invoice_id: String(invoice.id),
        client_id:  String(req.user.id),
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

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    const db     = getDb()

    db.prepare(`
      UPDATE invoices
      SET status = 'paid', paid_at = datetime('now')
      WHERE stripe_payment_intent = ? AND status = 'pending'
    `).run(intent.id)

    console.log(`[Stripe] Invoice paid — intent: ${intent.id}`)
  }

  return res.json({ received: true })
})

export default router
