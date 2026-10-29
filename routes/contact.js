// ─────────────────────────────────────────────────────────────────────────────
// routes/contact.js — Public inquiry form → email to the owner via Resend.
//
// POST /api/contact
//   Website form: { name, email, phone?, business?, industry?, hasWebsite?,
//                   websiteUrl?, goal?, notes? }
//   Plain form:   { name?, email, message }
// ─────────────────────────────────────────────────────────────────────────────
import { Router }  from 'express'
import rateLimit   from 'express-rate-limit'
import { sendContactToOwner } from '../utils/email.js'

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const GOAL_LABELS = {
  new:      'A brand new website',
  redesign: 'A redesign of their current site',
  fix:      'Fixes to their current site',
  explore:  'Just exploring',
}

const clip = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

router.post('/', contactLimiter, async (req, res) => {
  const b     = req.body || {}
  const email = clip(b.email)
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ error: 'A valid email is required.' })

  // Hidden honeypot field: real people never fill it in.
  if (clip(b.company_website)) return res.json({ ok: true })

  const lines = [
    b.industry   && `Industry: ${clip(b.industry)}`,
    b.goal       && `Looking for: ${GOAL_LABELS[b.goal] || clip(b.goal)}`,
    b.hasWebsite === true  && `Current website: ${clip(b.websiteUrl) || 'yes (no URL given)'}`,
    b.hasWebsite === false && 'Current website: none',
    (b.notes || b.message) && `\n${clip(b.notes || b.message, 5000)}`,
  ].filter(Boolean)

  if (lines.length === 0)
    return res.status(400).json({ error: 'Please tell us a little about what you need.' })

  const result = await sendContactToOwner({
    name:     clip(b.name),
    email,
    phone:    clip(b.phone, 40),
    business: clip(b.business),
    message:  lines.join('\n'),
  })

  // Without email configured (local dev) the inquiry is printed to the log,
  // so treat that as success; a real Resend failure is surfaced to the visitor.
  if (!result.ok && process.env.RESEND_API_KEY)
    return res.status(502).json({ error: "We couldn't send your message. Please call or email Jed directly." })

  return res.json({ ok: true })
})

export default router
