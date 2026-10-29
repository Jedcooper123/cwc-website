// ─────────────────────────────────────────────────────────────────────────────
// portal/ClientDashboard.jsx — What a signed-in client sees.
// Tabs: Home · Requests · Billing · Account
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useState } from 'react'
import {
  FiCheck, FiCreditCard, FiEdit3, FiFileText,
  FiInbox, FiMessageSquare, FiHelpCircle,
} from 'react-icons/fi'
import { api, ago, date, firstName, money, PLAN_STATUS, REQUEST_STATUS, REQUEST_TYPES, STAGES } from './api'
import { Alert, Badge, Button, Card, cx, Empty, Field, Modal, PasswordInput, Spinner } from './ui'
import s from './Portal.module.css'

export default function ClientDashboard({ user, tab, setTab, onUserChange, toast }) {
  const [data, setData]       = useState(null)
  const [error, setError]     = useState('')
  const [composer, setComposer] = useState(null) // request type being written

  const load = useCallback(() => {
    api('/api/portal/summary').then(setData).catch(err => setError(err.message))
  }, [])
  useEffect(load, [load])

  if (error) return <Alert>{error}</Alert>
  if (!data) return <Spinner />

  const openRequest = (type) => setComposer(type)

  return (
    <>
      {tab === 'home'     && <Home user={user} data={data} openRequest={openRequest} setTab={setTab} />}
      {tab === 'requests' && <Requests requests={data.requests} openRequest={openRequest} />}
      {tab === 'billing'  && <Billing data={data} openRequest={openRequest} />}
      {tab === 'account'  && <Account user={user} onUserChange={onUserChange} toast={toast} openRequest={openRequest} />}

      {composer && (
        <RequestComposer
          type={composer}
          plan={data.plan}
          onClose={() => setComposer(null)}
          onSent={() => {
            setComposer(null)
            toast(composer === 'cancel' ? 'Cancellation request sent. Jed will be in touch.' : 'Sent. Jed usually replies within one business day.')
            load()
          }}
        />
      )}
    </>
  )
}

// ── Home ───────────────────────────────────────────────────────────────────
function Home({ user, data, openRequest, setTab }) {
  const project = data.projects.find(p => p.status === 'active') || data.projects[0]
  const plan    = data.plan?.status === 'active' ? data.plan : null
  return (
    <div className={s.stackLg}>
      <header className={s.pageHead}>
        <h1 className={s.pageTitle}>Hi, {firstName(user.name)}.</h1>
        <p className={s.pageSub}>Here’s where things stand{user.company ? ` for ${user.company}` : ''}.</p>
      </header>

      {project ? <ProjectCard project={project} /> : (
        <Card><Empty icon={FiFileText} title="Your project will show up here">Once we kick things off, you’ll see each stage as it happens.</Empty></Card>
      )}

      <div className={s.actionsGrid}>
        <ActionTile icon={FiEdit3} title="Request an edit" body="Text, photos, hours, anything on your site." onClick={() => openRequest('edit')} />
        <ActionTile icon={FiMessageSquare} title="Message Jed" body="Questions, ideas, or anything else." onClick={() => openRequest('message')} />
        <ActionTile icon={FiCreditCard} title="Billing"
          body={plan?.next_due_date ? `Next payment ${money(plan.price_cents)} on ${date(plan.next_due_date, { month: 'short', day: 'numeric' })}.` : 'Your plan and billing questions.'}
          onClick={() => setTab('billing')} />
      </div>

      <Card title="Recent requests" action={data.requests.length > 0 && <button className={s.linkBtn} onClick={() => setTab('requests')}>See all</button>}>
        {data.requests.length
          ? <RequestList requests={data.requests.slice(0, 3)} />
          : <Empty icon={FiInbox} title="No requests yet">When you send an edit or message, you can track it here.</Empty>}
      </Card>
    </div>
  )
}

function ActionTile({ icon: Icon, title, body, onClick }) {
  return (
    <button className={s.actionTile} onClick={onClick}>
      <span className={s.actionIcon}><Icon size={18} aria-hidden="true" /></span>
      <span className={s.actionTitle}>{title}</span>
      <span className={s.actionBody}>{body}</span>
    </button>
  )
}

function ProjectCard({ project }) {
  const idx = Math.max(0, STAGES.findIndex(st => st.id === project.stage))
  return (
    <Card title={project.name} action={<Badge tone={idx === STAGES.length - 1 ? 'green' : 'orange'}>{STAGES[idx].label}</Badge>}>
      <ol className={s.stages} aria-label="Project progress">
        {STAGES.map((st, i) => (
          <li key={st.id} className={cx(s.stage, i < idx && s.stageDone, i === idx && s.stageNow)}
            aria-current={i === idx ? 'step' : undefined}>
            <span className={s.stageDot}>{i < idx ? <FiCheck size={12} /> : i + 1}</span>
            <span className={s.stageLabel}>{st.label}</span>
          </li>
        ))}
      </ol>
      <p className={s.muted}>{project.description || STAGES[idx].hint}</p>
      <p className={s.fine}>Updated {ago(project.updated_at)}</p>
    </Card>
  )
}

// ── Requests ───────────────────────────────────────────────────────────────
function Requests({ requests, openRequest }) {
  return (
    <div className={s.stackLg}>
      <header className={s.pageHeadRow}>
        <div>
          <h1 className={s.pageTitle}>Requests</h1>
          <p className={s.pageSub}>Edits and messages you’ve sent. Every one goes straight to Jed’s inbox.</p>
        </div>
        <div className={s.row}>
          <Button variant="secondary" onClick={() => openRequest('message')}>Message</Button>
          <Button onClick={() => openRequest('edit')}>Request an edit</Button>
        </div>
      </header>
      <Card padded={false}>
        {requests.length
          ? <RequestList requests={requests} expanded />
          : <Empty icon={FiInbox} title="Nothing here yet">Need a change on your site? Request an edit and it lands with Jed right away.</Empty>}
      </Card>
    </div>
  )
}

function RequestList({ requests, expanded }) {
  return (
    <ul className={s.list}>
      {requests.map(r => {
        const st = REQUEST_STATUS[r.status]
        return (
          <li key={r.id} className={s.listItem}>
            <div className={s.listMain}>
              <div className={s.listTitle}>{r.subject}</div>
              <div className={s.listMeta}>{REQUEST_TYPES[r.type]?.label} · {ago(r.created_at)}</div>
              {expanded && <p className={s.listBody}>{r.body}</p>}
            </div>
            <Badge tone={st.tone}>{st.label}</Badge>
          </li>
        )
      })}
    </ul>
  )
}

const CANCEL_REASONS = [
  'Closing or pausing my business',
  'Too expensive right now',
  'Not getting enough value from the site',
  'Moving to another provider',
  'Something else',
]

function RequestComposer({ type: initialType, plan, onClose, onSent }) {
  const [type, setType]       = useState(initialType)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [reason, setReason]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const cancel = type === 'cancel'

  const submit = async (e) => {
    e.preventDefault()
    if (cancel && !reason) return setError('Please pick a reason.')
    if (!cancel && !message.trim()) return setError('Please add a few details.')
    setError(''); setLoading(true)
    try {
      await api('/api/portal/requests', {
        method: 'POST',
        body: cancel
          ? { type, subject: 'Cancel my plan', message: `Reason: ${reason}${message.trim() ? `\n\n${message.trim()}` : ''}` }
          : { type, subject, message, pageUrl },
      })
      onSent()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (cancel) {
    return (
      <Modal title="Request to cancel" onClose={onClose}>
        <form onSubmit={submit} className={s.stack}>
          <p className={s.muted}>
            This sends a cancellation request to Jed. Nothing changes right away. He’ll reach out within one business day to confirm the details
            {plan?.next_due_date ? ` (your next payment is due ${date(plan.next_due_date, { month: 'long', day: 'numeric' })})` : ''}.
          </p>
          <fieldset className={s.radioGroup}>
            <legend className={s.label}>What’s the main reason?</legend>
            {CANCEL_REASONS.map(r => (
              <label key={r} className={cx(s.radio, reason === r && s.radioOn)}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                {r}
              </label>
            ))}
          </fieldset>
          <Field label="Anything else? (optional)">
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="If something could change your mind, Jed would like to hear it." />
          </Field>
          <Alert>{error}</Alert>
          <div className={s.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose}>Keep my plan</Button>
            <Button type="submit" variant="danger" loading={loading}>Send cancellation request</Button>
          </div>
        </form>
      </Modal>
    )
  }

  const t = REQUEST_TYPES[type]
  return (
    <Modal title={t.verb} onClose={onClose}>
      <form onSubmit={submit} className={s.stack}>
        <div className={s.segmented} role="tablist" aria-label="Request type">
          {['edit', 'message', 'billing'].map(k => (
            <button key={k} type="button" role="tab" aria-selected={type === k}
              className={cx(s.segment, type === k && s.segmentOn)} onClick={() => setType(k)}>
              {REQUEST_TYPES[k].label}
            </button>
          ))}
        </div>
        <Field label="Subject (optional)">
          <input value={subject} maxLength={160} onChange={e => setSubject(e.target.value)}
            placeholder={type === 'edit' ? 'e.g. Update holiday hours' : 'A few words'} />
        </Field>
        {type === 'edit' && (
          <Field label="Which page? (optional)" hint="Paste the link, or just name the page.">
            <input value={pageUrl} onChange={e => setPageUrl(e.target.value)} placeholder="e.g. Home page, or a link" />
          </Field>
        )}
        <Field label="Details">
          <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder={t.placeholder} />
        </Field>
        <p className={s.fine}>Have photos or files? Send this, then reply to Jed’s email with them attached.</p>
        <Alert>{error}</Alert>
        <div className={s.modalActions}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Send to Jed</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Billing ────────────────────────────────────────────────────────────────
function Billing({ data, openRequest }) {
  const plan = data.plan
  const st   = plan && (PLAN_STATUS[plan.status] || { label: plan.status, tone: 'gray' })
  const live = plan && plan.status !== 'cancelled'
  const cancelOpen = data.requests.some(r => r.type === 'cancel' && r.status !== 'done')

  return (
    <div className={s.stackLg}>
      <header className={s.pageHead}>
        <h1 className={s.pageTitle}>Billing</h1>
        <p className={s.pageSub}>Your monthly plan and when your next payment is due.</p>
      </header>

      <Card title={plan?.plan_name || 'Your plan'} action={st && <Badge tone={st.tone}>{st.label}</Badge>}>
        {plan ? (
          <dl className={s.kv}>
            <div><dt>Monthly price</dt><dd className={s.bigNum}>{money(plan.price_cents)}<span className={s.fine}> / month</span></dd></div>
            <div><dt>Next payment due</dt><dd className={s.bigNum}>{plan.next_due_date && live ? date(plan.next_due_date, { month: 'long', day: 'numeric' }) : '—'}</dd></div>
          </dl>
        ) : (
          <p className={s.muted}>Your monthly plan will show here once your site launches.</p>
        )}
        <div className={s.row}>
          <Button variant="secondary" onClick={() => openRequest('billing')}><FiHelpCircle size={15} /> Billing question</Button>
        </div>
      </Card>

      {live && (
        <div className={s.dangerZone}>
          <div>
            <h2 className={s.dangerTitle}>Cancel your plan</h2>
            <p className={s.muted}>{cancelOpen ? 'Your cancellation request is with Jed. He’ll be in touch shortly.' : 'Send a request and Jed will follow up to confirm.'}</p>
          </div>
          {!cancelOpen && <Button variant="dangerGhost" onClick={() => openRequest('cancel')}>Request cancellation</Button>}
        </div>
      )}
    </div>
  )
}

// ── Account ────────────────────────────────────────────────────────────────
function Account({ user, onUserChange, toast, openRequest }) {
  const [form, setForm]     = useState({ name: user.name || '', company: user.company || '', phone: user.phone || '', website_url: user.website_url || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const { user: updated } = await api('/api/portal/profile', { method: 'PATCH', body: form })
      onUserChange(updated)
      toast('Profile saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={s.stackLg}>
      <header className={s.pageHead}>
        <h1 className={s.pageTitle}>Account</h1>
        <p className={s.pageSub}>Your contact details and password.</p>
      </header>

      <Card title="Profile">
        <form onSubmit={save} className={s.stack}>
          <div className={s.grid2}>
            <Field label="Your name"><input value={form.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field label="Business name"><input value={form.company} onChange={set('company')} autoComplete="organization" /></Field>
            <Field label="Phone"><input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
            <Field label="Website"><input value={form.website_url} onChange={set('website_url')} placeholder="yourbusiness.com" /></Field>
          </div>
          <Field label="Login email" hint={<>To change it, <button type="button" className={s.inlineLink} onClick={() => openRequest('message')}>message Jed</button> so billing stays in sync.</>}>
            <input value={user.email} readOnly disabled />
          </Field>
          <Alert>{error}</Alert>
          <div><Button type="submit" loading={saving}>Save changes</Button></div>
        </form>
      </Card>

      <ChangePassword toast={toast} />
    </div>
  )
}

function ChangePassword({ toast }) {
  const empty = { currentPassword: '', newPassword: '', confirm: '' }
  const [f, setF]             = useState(empty)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setF(v => ({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (f.newPassword.length < 10)   return setError('Use at least 10 characters.')
    if (f.newPassword !== f.confirm) return setError('The new passwords don’t match.')
    setLoading(true); setError('')
    try {
      await api('/api/auth/change-password', { method: 'POST', body: { currentPassword: f.currentPassword, newPassword: f.newPassword } })
      setF(empty)
      toast('Password updated. Other devices were signed out.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Password">
      <form onSubmit={submit} className={s.stack}>
        <Field label="Current password"><PasswordInput autoComplete="current-password" value={f.currentPassword} onChange={set('currentPassword')} /></Field>
        <div className={s.grid2}>
          <Field label="New password" hint="At least 10 characters."><PasswordInput autoComplete="new-password" value={f.newPassword} onChange={set('newPassword')} /></Field>
          <Field label="Confirm new password"><PasswordInput autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></Field>
        </div>
        <Alert>{error}</Alert>
        <div><Button type="submit" variant="secondary" loading={loading}>Update password</Button></div>
      </form>
    </Card>
  )
}
