// ─────────────────────────────────────────────────────────────────────────────
// database/db.js — SQLite database setup using better-sqlite3.
//
// The database file is stored at DATABASE_PATH env var or ./cwc_portal.db.
//
// IMPORTANT FOR RENDER: Render's filesystem is ephemeral by default, which
// means the database will reset on each deploy. To persist data between
// deploys, add a Render Persistent Disk (Disks section in your service
// settings) and set DATABASE_PATH to a path on that disk, e.g. /data/cwc.db
// ─────────────────────────────────────────────────────────────────────────────
import Database from 'better-sqlite3'
import path     from 'path'
import { fileURLToPath } from 'url'
import bcrypt   from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const DB_PATH = process.env.DATABASE_PATH
  || path.join(__dirname, '..', 'cwc_portal.db')

let db

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL') // better concurrent read performance
    db.pragma('foreign_keys = ON')
    initSchema()
  }
  return db
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      name        TEXT    NOT NULL,
      company     TEXT,
      password_hash TEXT  NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'client'  CHECK(role IN ('admin','client')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT    NOT NULL,
      description TEXT,
      status      TEXT    NOT NULL DEFAULT 'active'
                  CHECK(status IN ('active','completed','paused','cancelled')),
      progress    INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      description           TEXT    NOT NULL,
      amount_cents          INTEGER NOT NULL,
      status                TEXT    NOT NULL DEFAULT 'pending'
                            CHECK(status IN ('pending','paid','void')),
      due_date              TEXT,
      stripe_payment_intent TEXT,
      paid_at               TEXT,
      created_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  migrateSchema()
  seedAdminIfNeeded()
}

// Add columns that don't exist yet (safe to run on every startup)
function migrateSchema() {
  const addCol = (table, column, def) => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`) } catch {}
  }
  // Projects: which service, monthly price, and stage
  addCol('projects', 'service_id',          'TEXT')
  addCol('projects', 'monthly_price_cents',  'INTEGER NOT NULL DEFAULT 0')
  addCol('projects', 'stage',               "TEXT NOT NULL DEFAULT 'discovery'")
  // Invoices: which service and whether it's a one-time or monthly charge
  addCol('invoices', 'service_id',    'TEXT')
  addCol('invoices', 'invoice_type',  "TEXT NOT NULL DEFAULT 'one-time'")
}

function seedAdminIfNeeded() {
  const adminEmail    = process.env.ADMIN_EMAIL    || 'jedpcooper@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  const hash          = bcrypt.hashSync(adminPassword, 12)

  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin')

  if (existingAdmin) {
    // Always sync email + password from env vars so changes take effect on every redeploy
    db.prepare('UPDATE users SET email = ?, password_hash = ? WHERE id = ?')
      .run(adminEmail, hash, existingAdmin.id)
    console.log(`[CWC] Admin credentials synced: ${adminEmail}`)
  } else {
    db.prepare(`
      INSERT INTO users (email, name, company, password_hash, role)
      VALUES (?, 'Jed Cooper', 'Cooper Web Consulting', ?, 'admin')
    `).run(adminEmail, hash)
    console.log(`[CWC] Admin account created: ${adminEmail}`)
  }
}
