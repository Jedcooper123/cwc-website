// ─────────────────────────────────────────────────────────────────────────────
// utils/authLinks.js — One-time invite and password-reset links.
// The raw token only ever exists in the emailed link; the DB keeps a hash.
// ─────────────────────────────────────────────────────────────────────────────
import crypto from 'crypto'
import { query, one } from '../database/db.js'
import { APP_URL } from './email.js'

const TTL_HOURS = { invite: 24 * 7, reset: 1 }

export const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex')

// Creates a fresh link and invalidates any older unused ones of the same kind.
export async function createAuthLink(userId, purpose) {
  const raw = crypto.randomBytes(32).toString('base64url')
  await query(
    `UPDATE auth_tokens SET used_at = now()
     WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`,
    [userId, purpose],
  )
  await query(
    `INSERT INTO auth_tokens (user_id, token_hash, purpose, expires_at)
     VALUES ($1, $2, $3, now() + make_interval(hours => $4))`,
    [userId, hashToken(raw), purpose, TTL_HOURS[purpose]],
  )
  return `${APP_URL()}/portal/set-password?token=${raw}`
}

// Returns { token_id, purpose, user_id, name, email } for a valid, unused link.
export function findValidToken(raw) {
  if (!raw || typeof raw !== 'string') return null
  return one(
    `SELECT t.id AS token_id, t.purpose, u.id AS user_id, u.name, u.email
     FROM auth_tokens t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > now()`,
    [hashToken(raw)],
  )
}
