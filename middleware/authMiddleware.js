// ─────────────────────────────────────────────────────────────────────────────
// middleware/authMiddleware.js — JWT session in an httpOnly cookie.
// Usage: router.get('/protected', requireAuth, handler)
//        router.get('/admin-only', requireAuth, requireAdmin, handler)
//
// Tokens carry the user's token_version. Changing a password bumps it, which
// signs the user out everywhere else.
// ─────────────────────────────────────────────────────────────────────────────
import jwt     from 'jsonwebtoken'
import { one } from '../database/db.js'

export const SESSION_COOKIE = 'lwc_session'
const SESSION_DAYS = 14

function secret() {
  const s = process.env.JWT_SECRET
  if (s) return s
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is not set.')
  return 'dev-only-secret'
}

export const cookieOptions = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path:     '/',
})

export function setSession(res, user) {
  const token = jwt.sign({ userId: user.id, v: user.token_version }, secret(), { expiresIn: `${SESSION_DAYS}d` })
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 })
}

export function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions())
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return res.status(401).json({ error: 'Not signed in.' })

  let payload
  try {
    payload = jwt.verify(token, secret())
  } catch {
    clearSession(res)
    return res.status(401).json({ error: 'Your session expired. Please sign in again.' })
  }

  try {
    const user = await one(
      `SELECT id, email, name, company, phone, website_url, role, token_version
       FROM users WHERE id = $1`,
      [payload.userId],
    )
    if (!user || user.token_version !== payload.v) {
      clearSession(res)
      return res.status(401).json({ error: 'Your session expired. Please sign in again.' })
    }
    delete user.token_version
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' })
  next()
}
