// ─────────────────────────────────────────────────────────────────────────────
// utils/email.js — Nodemailer-based email utility for CWC portal.
//
// Required env vars (set in Render):
//   EMAIL_FROM   — Gmail address to send from  (e.g. jedpcooper@gmail.com)
//   EMAIL_PASS   — Gmail App Password          (not your regular password)
//                  Generate at: https://myaccount.google.com/apppasswords
//   APP_URL      — Your deployed URL            (e.g. https://cwcwebconsulting.com)
//
// If EMAIL_FROM / EMAIL_PASS are not set, email functions return { ok: false }
// without crashing — invoices still get created, emails just won't send.
// ─────────────────────────────────────────────────────────────────────────────
import nodemailer from 'nodemailer'

function getTransporter() {
  const user = process.env.EMAIL_FROM
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

const PORTAL_URL = () =>
  `${process.env.APP_URL || 'https://cwcwebconsulting.com'}/portal`

// ── Shared HTML header / footer ────────────────────────────────────────────
const emailWrap = (body) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0b0d14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="540" cellpadding="0" cellspacing="0" style="background:#111420;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#5b8df5 0%,#7c3aed 100%);padding:28px 32px;text-align:center;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:10px;font-size:0.78rem;font-weight:900;color:#fff;letter-spacing:0.08em;margin-bottom:10px;">CWC</div>
          <div style="color:rgba(255,255,255,0.8);font-size:0.8rem;margin-top:4px;">Cooper Web Consulting</div>
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:32px;">${body}</td></tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:#475569;font-size:0.72rem;margin:0;">
            Questions? Reply to this email or visit your portal at
            <a href="${PORTAL_URL()}" style="color:#5b8df5;text-decoration:none;">${PORTAL_URL()}</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

// ── Send new-invoice notification ──────────────────────────────────────────
export async function sendInvoiceEmail({
  clientName, clientEmail, description, amountDollars, dueDate, invoiceType,
}) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[CWC Email] EMAIL_FROM/EMAIL_PASS not set — invoice email skipped.')
    return { ok: false, reason: 'Email not configured. Add EMAIL_FROM and EMAIL_PASS in Render env vars.' }
  }

  const amount    = `$${parseFloat(amountDollars).toFixed(2)}`
  const typeLabel = invoiceType === 'monthly' ? 'Monthly' : 'One-time'
  const portalUrl = PORTAL_URL()

  const body = `
    <p style="color:#e2e8f0;font-size:1rem;margin:0 0 8px;">Hi ${clientName},</p>
    <p style="color:#94a3b8;font-size:0.875rem;margin:0 0 24px;line-height:1.6;">
      You have a new invoice from Cooper Web Consulting ready for payment.
    </p>
    <!-- Invoice block -->
    <div style="background:#1a1f2e;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin-bottom:24px;">
      <div style="color:#94a3b8;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${typeLabel} Invoice</div>
      <div style="color:#e2e8f0;font-weight:600;font-size:0.95rem;margin-bottom:12px;">${description}</div>
      <div style="color:#5b8df5;font-size:2rem;font-weight:800;line-height:1;">${amount}</div>
      ${dueDate ? `<div style="color:#64748b;font-size:0.78rem;margin-top:8px;">Due: ${new Date(dueDate).toLocaleDateString()}</div>` : ''}
    </div>
    <!-- CTA -->
    <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#5b8df5,#7c3aed);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:0.875rem;">
      Pay Invoice →
    </a>
    <p style="color:#64748b;font-size:0.78rem;margin-top:20px;line-height:1.6;">
      Log in with your email at <a href="${portalUrl}" style="color:#5b8df5;">${portalUrl}</a> to pay securely by card.
    </p>`

  await transporter.sendMail({
    from:    `"Cooper Web Consulting" <${process.env.EMAIL_FROM}>`,
    to:      clientEmail,
    subject: `New Invoice from Cooper Web Consulting — ${amount}`,
    html:    emailWrap(body),
  })

  console.log(`[CWC Email] Invoice email sent to ${clientEmail}`)
  return { ok: true }
}

// ── Send welcome / login-info email ───────────────────────────────────────
export async function sendWelcomeEmail({
  clientName, clientEmail, tempPassword,
}) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[CWC Email] EMAIL_FROM/EMAIL_PASS not set — welcome email skipped.')
    return { ok: false, reason: 'Email not configured. Add EMAIL_FROM and EMAIL_PASS in Render env vars.' }
  }

  const portalUrl = PORTAL_URL()

  const body = `
    <p style="color:#e2e8f0;font-size:1rem;margin:0 0 8px;">Hi ${clientName},</p>
    <p style="color:#94a3b8;font-size:0.875rem;margin:0 0 24px;line-height:1.6;">
      Welcome to the Cooper Web Consulting client portal! Your account is ready.
      Here are your login details — keep these somewhere safe.
    </p>
    <!-- Credentials block -->
    <div style="background:#1a1f2e;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="color:#64748b;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;padding-bottom:10px;">Login Email</td>
          <td style="color:#e2e8f0;font-weight:600;font-size:0.9rem;padding-bottom:10px;text-align:right;">${clientEmail}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;">Password</td>
          <td style="color:#e2e8f0;font-weight:600;font-size:0.9rem;text-align:right;font-family:monospace;">${tempPassword}</td>
        </tr>
      </table>
    </div>
    <!-- CTA -->
    <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#5b8df5,#7c3aed);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:0.875rem;">
      Sign In to Your Portal →
    </a>
    <p style="color:#64748b;font-size:0.78rem;margin-top:20px;line-height:1.6;">
      Visit <a href="${portalUrl}" style="color:#5b8df5;">${portalUrl}</a> any time to view your projects,
      track progress, and manage billing. Reply to this email if you have any questions.
    </p>`

  await transporter.sendMail({
    from:    `"Cooper Web Consulting" <${process.env.EMAIL_FROM}>`,
    to:      clientEmail,
    subject: 'Your Cooper Web Consulting Portal Access',
    html:    emailWrap(body),
  })

  console.log(`[CWC Email] Welcome email sent to ${clientEmail}`)
  return { ok: true }
}

// ── Send payment reminder ──────────────────────────────────────────────────
export async function sendReminderEmail({
  clientName, clientEmail, pendingCount, totalOwed,
}) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[CWC Email] EMAIL_FROM/EMAIL_PASS not set — reminder email skipped.')
    return { ok: false, reason: 'Email not configured. Add EMAIL_FROM and EMAIL_PASS in Render env vars.' }
  }

  const amount    = `$${(totalOwed / 100).toFixed(2)}`
  const portalUrl = PORTAL_URL()

  const body = `
    <p style="color:#e2e8f0;font-size:1rem;margin:0 0 8px;">Hi ${clientName},</p>
    <p style="color:#94a3b8;font-size:0.875rem;margin:0 0 24px;line-height:1.6;">
      This is a friendly reminder that you have
      <strong style="color:#f97316;">${pendingCount} outstanding invoice${pendingCount > 1 ? 's' : ''}</strong>
      totalling <strong style="color:#f97316;">${amount}</strong>.
    </p>
    <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#5b8df5,#7c3aed);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:0.875rem;">
      View &amp; Pay →
    </a>
    <p style="color:#64748b;font-size:0.78rem;margin-top:20px;line-height:1.6;">
      Log in at <a href="${portalUrl}" style="color:#5b8df5;">${portalUrl}</a> to pay securely by card.
    </p>`

  await transporter.sendMail({
    from:    `"Cooper Web Consulting" <${process.env.EMAIL_FROM}>`,
    to:      clientEmail,
    subject: `Payment Reminder — ${amount} outstanding`,
    html:    emailWrap(body),
  })

  console.log(`[CWC Email] Reminder email sent to ${clientEmail}`)
  return { ok: true }
}
