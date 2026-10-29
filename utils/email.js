// ─────────────────────────────────────────────────────────────────────────────
// utils/email.js — Transactional email through Resend (https://resend.com).
//
// Env vars (Render → Environment):
//   RESEND_API_KEY        — Resend API key. Without it, emails print to the
//                           server log instead of sending (safe for local dev).
//   EMAIL_FROM            — verified sender, e.g.
//                           "Launchpad Web Consulting <hello@launchpadwebconsulting.com>"
//   OWNER_NOTIFY_EMAIL    — where client requests + contact forms go
//                           (default: jedpcooper@gmail.com)
//   APP_URL               — site URL used in links (default: https://www.launchpadwebconsulting.com)
//   REDIRECT_ALL_EMAIL_TO — test mode: every email goes to this address instead
//
// Every send returns { ok, id?, reason? } and never throws, so a mail outage
// can't break a request that already saved to the database.
// ─────────────────────────────────────────────────────────────────────────────

export const APP_URL     = () => (process.env.APP_URL || 'https://www.launchpadwebconsulting.com').replace(/\/$/, '')
export const PORTAL_URL  = () => `${APP_URL()}/portal`
export const OWNER_EMAIL = () => process.env.OWNER_NOTIFY_EMAIL || 'jedpcooper@gmail.com'
const FROM = () => process.env.EMAIL_FROM || 'Launchpad Web Consulting <onboarding@resend.dev>'

// Escape anything a user typed before it goes into an HTML email.
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const nl2br = (s) => esc(s).replace(/\n/g, '<br>')

async function send({ to, subject, html, text, replyTo }) {
  const redirect = process.env.REDIRECT_ALL_EMAIL_TO
  const finalTo  = redirect || to
  const finalSubject = redirect ? `[TEST → ${to}] ${subject}` : subject

  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email:not-sent] to=${finalTo} subject="${finalSubject}"\n${text}`)
    return { ok: false, reason: 'Email is not configured (RESEND_API_KEY missing).' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM(), to: [finalTo], subject: finalSubject, html, text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[Email] Resend error:', res.status, data?.message)
      return { ok: false, reason: data?.message || `Resend returned ${res.status}` }
    }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('[Email] Send failed:', err.message)
    return { ok: false, reason: err.message }
  }
}

// ── Layout ─────────────────────────────────────────────────────────────────
// Table layout + inline styles: the only thing every mail client agrees on.
const button = (href, label) => `
  <a href="${href}" style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;
     font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px;">${label}</a>`

const layout = (body) => `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:Helvetica,Arial,sans-serif;color:#1d1d1f;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px;">
  <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;">
    <tr><td style="padding:28px 32px 0;">
      <span style="display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;background:#FF6B00;color:#fff;font-weight:700;border-radius:8px;">L</span>
      <span style="font-weight:700;font-size:15px;vertical-align:middle;margin-left:8px;">Launchpad Web Consulting</span>
    </td></tr>
    <tr><td style="padding:24px 32px 32px;font-size:15px;line-height:1.6;">${body}</td></tr>
    <tr><td style="padding:18px 32px;border-top:1px solid #ececf0;font-size:12px;color:#86868b;">
      Questions? Just reply to this email, or sign in at
      <a href="${PORTAL_URL()}" style="color:#FF6B00;text-decoration:none;">${PORTAL_URL().replace(/^https?:\/\//, '')}</a>.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`

const firstName = (name = '') => esc(name.trim().split(/\s+/)[0] || 'there')

// ── Client-facing emails ──────────────────────────────────────────────────
export function sendInviteEmail({ name, email, link }) {
  return send({
    to: email,
    subject: 'Your Launchpad client portal is ready',
    text: `Hi ${name},\n\nYour Launchpad client portal is set up. Create your password here (link works for 7 days):\n${link}\n\nIn the portal you can track your project, request website edits, message Jed, and manage billing.\n\n— Jed, Launchpad Web Consulting`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;">Welcome aboard, ${firstName(name)}.</h1>
      <p style="margin:0 0 20px;">Your client portal is set up. Create a password to sign in. From there you can follow your project, request website edits, message me directly, and manage billing.</p>
      <p style="margin:0 0 24px;">${button(link, 'Create my password')}</p>
      <p style="margin:0;color:#86868b;font-size:13px;">This link works for 7 days. If it expires, reply here and I'll send a new one.<br>— Jed</p>`),
  })
}

export function sendPasswordResetEmail({ name, email, link }) {
  return send({
    to: email,
    subject: 'Reset your Launchpad portal password',
    text: `Hi ${name},\n\nReset your password here (link works for 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;">Reset your password</h1>
      <p style="margin:0 0 20px;">Hi ${firstName(name)}, use the button below to choose a new password.</p>
      <p style="margin:0 0 24px;">${button(link, 'Choose a new password')}</p>
      <p style="margin:0;color:#86868b;font-size:13px;">This link works for 1 hour. If you didn't ask for a reset, you can ignore this email. Your password won't change.</p>`),
  })
}

export function sendPasswordChangedEmail({ name, email }) {
  return send({
    to: email,
    subject: 'Your Launchpad portal password was changed',
    text: `Hi ${name},\n\nYour portal password was just changed. If this wasn't you, reply to this email right away.`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;">Password changed</h1>
      <p style="margin:0;">Hi ${firstName(name)}, your portal password was just changed and other devices were signed out. If this wasn't you, reply to this email right away.</p>`),
  })
}

// ── Owner notifications ───────────────────────────────────────────────────
export const REQUEST_LABELS = {
  message: 'Message',
  edit:    'Website edit request',
  billing: 'Billing question',
  cancel:  'Cancellation request',
}

export function sendRequestToOwner({ request, client }) {
  const label   = REQUEST_LABELS[request.type] || 'Request'
  const urgent  = request.type === 'cancel'
  const details = [
    ['Client',  `${client.name}${client.company ? ` (${client.company})` : ''}`],
    ['Email',   client.email],
    client.phone       && ['Phone',   client.phone],
    client.website_url && ['Website', client.website_url],
    request.page_url   && ['Page',    request.page_url],
  ].filter(Boolean)

  return send({
    to: OWNER_EMAIL(),
    replyTo: client.email,
    subject: `${urgent ? '⚠️ ' : ''}${label} from ${client.company || client.name}: ${request.subject}`,
    text: `${label} from ${client.name} <${client.email}>\n\n${request.subject}\n\n${request.body}\n\nReply to this email to answer them directly.\nAdmin: ${APP_URL()}/portal`,
    html: layout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${urgent ? '#d70015' : '#FF6B00'};">${label}</p>
      <h1 style="font-size:20px;margin:0 0 16px;">${esc(request.subject)}</h1>
      <div style="background:#f5f5f7;border-radius:12px;padding:16px 20px;margin:0 0 20px;">${nl2br(request.body)}</div>
      <table cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px;margin:0 0 20px;">
        ${details.map(([k, v]) => `<tr><td style="color:#86868b;padding:2px 16px 2px 0;">${k}</td><td>${esc(v)}</td></tr>`).join('')}
      </table>
      <p style="margin:0;color:#86868b;font-size:13px;">Reply to this email to answer ${firstName(client.name)} directly. Mark it done in the <a href="${APP_URL()}/portal" style="color:#FF6B00;">admin portal</a>.</p>`),
  })
}

export function sendContactToOwner({ name, email, phone, business, message }) {
  const rows = [['Name', name], ['Email', email], phone && ['Phone', phone], business && ['Business', business]].filter(Boolean)
  return send({
    to: OWNER_EMAIL(),
    replyTo: email,
    subject: `New website inquiry from ${name || email}`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${message}`,
    html: layout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#FF6B00;">New inquiry</p>
      <h1 style="font-size:20px;margin:0 0 16px;">${esc(name || email)}</h1>
      <table cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px;margin:0 0 16px;">
        ${rows.map(([k, v]) => `<tr><td style="color:#86868b;padding:2px 16px 2px 0;">${k}</td><td>${esc(v)}</td></tr>`).join('')}
      </table>
      <div style="background:#f5f5f7;border-radius:12px;padding:16px 20px;">${nl2br(message)}</div>`),
  })
}
