// ─────────────────────────────────────────────────────────────────────────────
// routes/auth.js — Sign in/out, session check, and password management.
//
// POST /api/auth/login            { email, password }
// POST /api/auth/logout
// GET  /api/auth/me
// POST /api/auth/change-password  { currentPassword, newPassword }   (signed in)
// POST /api/auth/forgot-password  { email }  → always 200 (no account probing)
// GET  /api/auth/link?token=      → { purpose, name, email } if the link is valid
// POST /api/auth/set-password     { token, password }  (invite or reset link)
// ─────────────────────────────────────────────────────────────────────────────
import rateLimit from 'express-rate-limit'
import bcrypt    from 'bcryptjs'
import { query, one, transaction } from '../database/db.js'
import { requireAuth, setSession, clearSession } from '../middleware/authMiddleware.js'
import { createAuthLink, findValidToken } from '../utils/authLinks.js'
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../utils/email.js'
import { asyncRouter } from '../utils/asyncRouter.js'

const router = asyncRouter()

const limiter = (max, minutes, message) => rateLimit({
  windowMs: minutes * 60 * 1000, max, message: { error: message },
  standardHeaders: true, legacyHeaders: false,
})
const loginLimiter = limiter(10, 15, 'Too many sign-in attempts. Please try again in 15 minutes.')
const emailLimiter = limiter(5, 60, 'Too many requests. Please try again later.')

export const MIN_PASSWORD = 10
export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (pw.length > 200) return 'That password is too long.'
  return null
}

const publicUser = (u) => ({
  id: u.id, email: u.email, name: u.name, company: u.company,
  phone: u.phone, website_url: u.website_url, role: u.role,
})

// Compared against when the email doesn't exist, so response time doesn't
// reveal which emails have accounts.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

router.post('/login', loginLimiter, async (req, res) => {
  const email    = String(req.body?.email || '').trim()
  const password = String(req.body?.password || '')
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const user  = await one('SELECT * FROM users WHERE lower(email) = lower($1)', [email])
  const match = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH)
  if (!user || !user.password_hash || !match)
    return res.status(401).json({ error: 'That email and password don’t match.' })

  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id])
  setSession(res, user)
  return res.json({ user: publicUser(user) })
})

router.post('/logout', (_req, res) => {
  clearSession(res)
  return res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }))

router.post('/change-password', requireAuth, loginLimiter, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  const problem = passwordProblem(newPassword)
  if (problem) return res.status(400).json({ error: problem })

  const user = await one('SELECT * FROM users WHERE id = $1', [req.user.id])
  if (!user.password_hash || !(await bcrypt.compare(String(currentPassword || ''), user.password_hash)))
    return res.status(400).json({ error: 'Your current password isn’t right.' })
  if (await bcrypt.compare(newPassword, user.password_hash))
    return res.status(400).json({ error: 'Pick a password you haven’t used here before.' })

  const hash    = await bcrypt.hash(newPassword, 12)
  const updated = await one(
    `UPDATE users SET password_hash = $1, token_version = token_version + 1
     WHERE id = $2 RETURNING id, token_version`,
    [hash, user.id],
  )
  setSession(res, updated) // keep this device signed in; others are signed out
  sendPasswordChangedEmail({ name: user.name, email: user.email })
  return res.json({ ok: true })
})

router.post('/forgot-password', emailLimiter, async (req, res) => {
  const email = String(req.body?.email || '').trim()
  const user  = email && await one('SELECT id, name, email FROM users WHERE lower(email) = lower($1)', [email])
  if (user) {
    const link = await createAuthLink(user.id, 'reset')
    await sendPasswordResetEmail({ name: user.name, email: user.email, link })
  }
  return res.json({ ok: true })
})

router.get('/link', async (req, res) => {
  const t = await findValidToken(req.query.token)
  if (!t) return res.status(404).json({ error: 'This link has expired or was already used.' })
  return res.json({ purpose: t.purpose, name: t.name, email: t.email })
})

router.post('/set-password', loginLimiter, async (req, res) => {
  const { token, password } = req.body || {}
  const problem = passwordProblem(password)
  if (problem) return res.status(400).json({ error: problem })

  const t = await findValidToken(token)
  if (!t) return res.status(400).json({ error: 'This link has expired or was already used. Ask for a new one.' })

  const hash = await bcrypt.hash(password, 12)
  const user = await transaction(async (q) => {
    await q('UPDATE auth_tokens SET used_at = now() WHERE id = $1', [t.token_id])
    const [u] = await q(
      `UPDATE users SET password_hash = $1, token_version = token_version + 1, last_login_at = now()
       WHERE id = $2 RETURNING *`,
      [hash, t.user_id],
    )
    return u
  })

  setSession(res, user)
  return res.json({ user: publicUser(user) })
})

export default router
