// ─────────────────────────────────────────────────────────────────────────────
// middleware/authMiddleware.js — JWT verification from httpOnly cookie.
// Usage: router.get('/protected', requireAuth, handler)
//        router.get('/admin-only', requireAuth, requireAdmin, handler)
// ─────────────────────────────────────────────────────────────────────────────
import jwt    from 'jsonwebtoken'
import { getDb } from '../database/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_ENV'

export function requireAuth(req, res, next) {
  const token = req.cookies?.cwc_token

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const db   = getDb()
    const user = db.prepare('SELECT id, email, name, company, role FROM users WHERE id = ?').get(payload.userId)

    if (!user) {
      return res.status(401).json({ error: 'User not found.' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
