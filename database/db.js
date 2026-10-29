// ─────────────────────────────────────────────────────────────────────────────
// database/db.js — Neon Postgres connection, schema, and owner seed.
//
// Env vars:
//   DATABASE_URL    — Neon connection string (Neon dashboard → Connect).
//                     Use the *pooled* string; it already has sslmode=require.
//   ADMIN_EMAIL     — owner login email (default: jedpcooper@gmail.com)
//   ADMIN_PASSWORD  — owner login password. Re-applied on every boot, so this
//                     is also the password-recovery path for the admin login.
//
// Neon free tier: the pool closes idle connections after 30s so the compute
// can go to sleep. Nothing here polls the DB (the health check doesn't either).
// ─────────────────────────────────────────────────────────────────────────────
import pg     from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg

// Return DATE columns (e.g. a plan's due date) as plain 'YYYY-MM-DD' strings.
// Turning them into JS Dates at midnight UTC shows the day before in NC.
pg.types.setTypeParser(1082, (v) => v)

let pool  = null
let ready = false

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
    pool = new Pool({
      connectionString:        process.env.DATABASE_URL,
      max:                     5,
      idleTimeoutMillis:       30_000,
      connectionTimeoutMillis: 10_000,
    })
    pool.on('error', (err) => console.error('[DB] Idle client error:', err.message))
  }
  return pool
}

export const isDbReady = () => ready

// query('SELECT ... WHERE id = $1', [id]) → rows[]
export async function query(text, params = []) {
  const { rows } = await getPool().query(text, params)
  return rows
}

// one('SELECT ...', [..]) → first row or null
export async function one(text, params = []) {
  const rows = await query(text, params)
  return rows[0] || null
}

// Run several statements atomically.
export async function transaction(fn) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn((text, params = []) => client.query(text, params).then(r => r.rows))
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    client.release()
  }
}

// ── Schema ─────────────────────────────────────────────────────────────────
// Every statement is idempotent, so this is safe to run on every boot.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id                 SERIAL PRIMARY KEY,
    email              TEXT NOT NULL,
    name               TEXT NOT NULL,
    company            TEXT,
    phone              TEXT,
    website_url        TEXT,
    notes              TEXT,
    password_hash      TEXT,
    role               TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin','client')),
    token_version      INTEGER NOT NULL DEFAULT 0,
    last_login_at      TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

  CREATE TABLE IF NOT EXISTS projects (
    id                  SERIAL PRIMARY KEY,
    client_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','completed','paused','cancelled')),
    progress            INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    stage               TEXT NOT NULL DEFAULT 'discovery',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Each client's monthly plan. Entered by hand in the admin panel for now;
  -- Stripe can fill these in automatically later.
  CREATE TABLE IF NOT EXISTS plans (
    id            SERIAL PRIMARY KEY,
    client_id     INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    plan_name     TEXT NOT NULL DEFAULT 'Monthly Care Plan',
    price_cents   INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
    next_due_date DATE,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Messages, edit requests, billing questions and cancellation requests
  -- that clients send from the portal. Each one is also emailed to the owner.
  CREATE TABLE IF NOT EXISTS client_requests (
    id          SERIAL PRIMARY KEY,
    client_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('message','edit','billing','cancel')),
    subject     TEXT NOT NULL,
    body        TEXT NOT NULL,
    page_url    TEXT,
    status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS client_requests_client_idx ON client_requests (client_id, created_at DESC);

  -- One-time links for invites and password resets. Only a SHA-256 hash of
  -- the token is stored, so a DB leak can't be used to take over accounts.
  CREATE TABLE IF NOT EXISTS auth_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    purpose     TEXT NOT NULL CHECK (purpose IN ('invite','reset')),
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`

async function seedOwner() {
  const email    = (process.env.ADMIN_EMAIL || 'jedpcooper@gmail.com').trim()
  const password = process.env.ADMIN_PASSWORD

  const admin = await one(`SELECT id, email, password_hash FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`)

  if (!password) {
    if (!admin) console.warn('[DB] ADMIN_PASSWORD not set — no admin login exists yet.')
    return
  }

  if (!admin) {
    const hash = await bcrypt.hash(password, 12)
    await query(
      `INSERT INTO users (email, name, company, password_hash, role)
       VALUES ($1, 'Jed Cooper', 'Launchpad Web Consulting', $2, 'admin')`,
      [email, hash],
    )
    console.log(`[DB] Admin account created: ${email}`)
    return
  }

  // Keep the admin login in sync with Render's env vars. Only rewrite (and
  // sign out other sessions) when something actually changed.
  const samePassword = admin.password_hash && await bcrypt.compare(password, admin.password_hash)
  if (admin.email !== email || !samePassword) {
    const hash = samePassword ? admin.password_hash : await bcrypt.hash(password, 12)
    await query(
      `UPDATE users SET email = $1, password_hash = $2,
              token_version = token_version + $3
       WHERE id = $4`,
      [email, hash, samePassword ? 0 : 1, admin.id],
    )
    console.log(`[DB] Admin credentials synced from env: ${email}`)
  }
}

// Boot-time setup. Retries in the background so the web server can start
// (and serve the marketing site) even if Neon is briefly unavailable.
export async function initDb({ retryMs = 30_000 } = {}) {
  try {
    await query(SCHEMA)
    await seedOwner()
    ready = true
    console.log('[DB] Ready')
  } catch (err) {
    console.error(`[DB] Init failed (${err.message}); retrying in ${retryMs / 1000}s`)
    setTimeout(() => initDb({ retryMs }), retryMs).unref()
  }
}
