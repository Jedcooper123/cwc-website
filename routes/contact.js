// ─────────────────────────────────────────────────────────────────────────────
// routes/contact.js — Simple contact form endpoint.
//
// POST /api/contact  { name?, email, message } → 200 ok
//
// Currently logs the message to the console. To send real emails, add
// nodemailer or the SendGrid SDK and configure SMTP/SENDGRID_API_KEY env var.
// ─────────────────────────────────────────────────────────────────────────────
import { Router }    from 'express'
import rateLimit     from 'express-rate-limit'

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── POST /api/contact ─────────────────────────────────────────────────────
router.post('/', contactLimiter, (req, res) => {
  const { name, email, message } = req.body

  if (!email || !message)
    return res.status(400).json({ error: 'Email and message are required.' })

  // TODO: Send email via nodemailer or SendGrid
  console.log(`[CWC CONTACT] From: ${name || '(no name)'} <${email}>`)
  console.log(`[CWC CONTACT] Message: ${message}`)

  return res.json({ ok: true })
})

export default router
