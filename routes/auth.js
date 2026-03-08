// ─────────────────────────────────────────────────────────────────────────────
// routes/auth.js — Login, logout, and session check.
//
// POST /api/auth/login   { email, password } → sets httpOnly cookie, returns user
// POST /api/auth/logout  → clears cookie
// GET  /api/auth/me      → returns current user from cookie
// ─────────────────────────────────────────────────────────────────────────────
import { Router }  from 'express'
import rateLimit   from 'express-rate-limit'
import bcrypt      from 'bcryptjs'
import { getDb }   from '../database/db.js'
import { requireAuth, signToken } from '../middleware/authMiddleware.js'

const router = Router()

// Rate limit login to 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const COOKIE_OPTS = {
  httpOnly:  true,           // not accessible via JS — protects against XSS
  secure:    process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite:  'lax',
  maxAge:    7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const db   = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim())

  if (!user) {
    // Use same error as wrong password to avoid email enumeration
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = signToken(user.id)
  res.cookie('cwc_token', token, COOKIE_OPTS)

  // Return safe user object (no password_hash)
  return res.json({
    user: {
      id:      user.id,
      email:   user.email,
      name:    user.name,
      company: user.company,
      role:    user.role,
    },
  })
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('cwc_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
  return res.json({ ok: true })
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user })
})

export default router
