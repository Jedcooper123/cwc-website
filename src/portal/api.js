// ─────────────────────────────────────────────────────────────────────────────
// portal/api.js — fetch wrapper + formatting helpers shared by the portal.
// ─────────────────────────────────────────────────────────────────────────────

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = {}
  try { data = await res.json() } catch { /* empty or non-JSON body */ }
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.')
    err.status = res.status
    throw err
  }
  return data
}

export const money = (cents = 0) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`

// Calendar dates ('2026-11-01') are read as local noon so they never shift a day.
export const date = (v, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  v ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00` : v).toLocaleDateString('en-US', opts) : '—'

export function ago(v) {
  if (!v) return 'never'
  const s = (Date.now() - new Date(v).getTime()) / 1000
  if (s < 60)     return 'just now'
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return date(v)
}

export const firstName = (name = '') => name.trim().split(/\s+/)[0] || ''

export const STAGES = [
  { id: 'discovery',   label: 'Discovery',   hint: 'Learning about your business and goals.' },
  { id: 'design',      label: 'Design',      hint: 'Shaping the look and layout of your site.' },
  { id: 'development', label: 'Build',       hint: 'Building pages and features.' },
  { id: 'review',      label: 'Review',      hint: 'Your turn: look it over and send edits.' },
  { id: 'launched',    label: 'Live',        hint: 'Your site is live. We keep it running.' },
]

export const REQUEST_TYPES = {
  edit:    { label: 'Website edit',      verb: 'Request an edit',       placeholder: 'What should change? e.g. “Update our Saturday hours to 9–2 on the Contact page.”' },
  message: { label: 'Message',           verb: 'Send a message',        placeholder: 'What’s on your mind?' },
  billing: { label: 'Billing question',  verb: 'Ask about billing',     placeholder: 'What do you need help with?' },
  cancel:  { label: 'Cancellation',      verb: 'Request cancellation',  placeholder: '' },
}

export const REQUEST_STATUS = {
  open:        { label: 'Sent',        tone: 'orange' },
  in_progress: { label: 'In progress', tone: 'blue'   },
  done:        { label: 'Done',        tone: 'green'  },
}

export const PLAN_STATUS = {
  active:    { label: 'Active',    tone: 'green' },
  paused:    { label: 'Paused',    tone: 'gray'  },
  cancelled: { label: 'Cancelled', tone: 'gray'  },
}
