// ─────────────────────────────────────────────────────────────────────────────
// portal/AdminDashboard.jsx — Jed's view. Tabs: Overview · Clients · Requests
// Clicking a client opens everything about them in one panel.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle, FiCopy, FiExternalLink, FiInbox, FiMail, FiPhone,
  FiPlus, FiSearch, FiTrash2, FiUsers,
} from 'react-icons/fi'
import { api, ago, date, money, PLAN_STATUS, REQUEST_STATUS, REQUEST_TYPES, STAGES } from './api'
import { Alert, Badge, Button, Card, cx, Empty, Field, Modal, Spinner } from './ui'
import s from './Portal.module.css'

export default function AdminDashboard({ tab, setTab, toast }) {
  const [openClient, setOpenClient] = useState(null)
  const [version, setVersion]       = useState(0) // bump to refetch lists
  const refresh = () => setVersion(v => v + 1)

  return (
    <>
      {tab === 'overview' && <Overview key={version} setTab={setTab} openClient={setOpenClient} />}
      {tab === 'clients'  && <Clients  key={version} openClient={setOpenClient} toast={toast} refresh={refresh} />}
      {tab === 'requests' && <RequestsInbox key={version} openClient={setOpenClient} toast={toast} />}
      {openClient && (
        <ClientDetail id={openClient} toast={toast}
          onClose={() => { setOpenClient(null); refresh() }} />
      )}
    </>
  )
}

function useLoad(path) {
  const [data, setData]   = useState(null)
  const [error, setError] = useState('')
  const load = useCallback(() => { api(path).then(setData).catch(e => setError(e.message)) }, [path])
  useEffect(load, [load])
  return [data, error, load]
}

// ── Overview ───────────────────────────────────────────────────────────────
function Overview({ setTab, openClient }) {
  const [ov, err]   = useLoad('/api/admin/overview')
  const [req]       = useLoad('/api/admin/requests')
  if (err) return <Alert>{err}</Alert>
  if (!ov) return <Spinner />
  const st = ov.stats

  return (
    <div className={s.stackLg}>
      <header className={s.pageHead}>
        <h1 className={s.pageTitle}>Overview</h1>
        <p className={s.pageSub}>Your business at a glance.</p>
      </header>
      <div className={s.stats}>
        <Stat label="Clients" value={st.clients} note={st.invited ? `${st.invited} invite${st.invited > 1 ? 's' : ''} pending` : null} onClick={() => setTab('clients')} />
        <Stat label="Monthly recurring" value={money(st.mrr_cents)} note={`${st.active_plans} active plan${st.active_plans === 1 ? '' : 's'}`} />
        <Stat label="Open requests" value={st.open_requests} tone={st.open_requests ? 'orange' : null} onClick={() => setTab('requests')} />
        <Stat label="Payments due this week" value={st.due_soon} tone={st.due_soon ? 'orange' : null} onClick={() => setTab('clients')} />
      </div>

      <Card title="Needs your attention" action={<button className={s.linkBtn} onClick={() => setTab('requests')}>All requests</button>} padded={false}>
        {!req ? <Spinner /> : req.requests.length
          ? <AdminRequestList requests={req.requests.slice(0, 6)} openClient={openClient} compact />
          : <Empty icon={FiInbox} title="Inbox zero">No open client requests.</Empty>}
      </Card>
    </div>
  )
}

function Stat({ label, value, note, tone, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={cx(s.stat, onClick && s.statLink)} onClick={onClick}>
      <span className={s.statLabel}>{label}</span>
      <span className={cx(s.statValue, tone && s[`text_${tone}`])}>{value}</span>
      {note && <span className={s.fine}>{note}</span>}
    </Tag>
  )
}

// ── Clients ────────────────────────────────────────────────────────────────
function Clients({ openClient, toast, refresh }) {
  const [data, err] = useLoad('/api/admin/clients')
  const [q, setQ]   = useState('')
  const [adding, setAdding] = useState(false)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = data?.clients || []
    return needle ? list.filter(c => [c.name, c.company, c.email, c.phone].some(v => v?.toLowerCase().includes(needle))) : list
  }, [data, q])

  if (err) return <Alert>{err}</Alert>
  return (
    <div className={s.stackLg}>
      <header className={s.pageHeadRow}>
        <div>
          <h1 className={s.pageTitle}>Clients</h1>
          <p className={s.pageSub}>{data ? `${data.clients.length} total` : ' '}</p>
        </div>
        <Button onClick={() => setAdding(true)}><FiPlus size={15} /> Add client</Button>
      </header>

      <div className={s.searchWrap}>
        <FiSearch size={16} aria-hidden="true" />
        <input className={s.search} placeholder="Search name, business, email, phone" value={q}
          onChange={e => setQ(e.target.value)} aria-label="Search clients" />
      </div>

      <Card padded={false}>
        {!data ? <Spinner /> : rows.length === 0 ? (
          <Empty icon={FiUsers} title={q ? 'No matches' : 'No clients yet'}>
            {!q && 'Add your first client and they’ll get an email to set up their login.'}
          </Empty>
        ) : (
          <ul className={s.list}>
            {rows.map(c => {
              const plan = c.plan_status && PLAN_STATUS[c.plan_status]
              const stage = STAGES.find(x => x.id === c.latest_stage)
              return (
                <li key={c.id}>
                  <button className={cx(s.listItem, s.listButton)} onClick={() => openClient(c.id)}>
                    <span className={s.avatar} aria-hidden="true">{(c.company || c.name)[0]?.toUpperCase()}</span>
                    <span className={s.listMain}>
                      <span className={s.listTitle}>{c.company || c.name}</span>
                      <span className={s.listMeta}>{c.company ? `${c.name} · ` : ''}{c.email}</span>
                    </span>
                    <span className={s.chips}>
                      {c.invite_pending && <Badge tone="gray">Invite pending</Badge>}
                      {stage && <Badge tone={stage.id === 'launched' ? 'green' : 'blue'}>{stage.label}</Badge>}
                      {plan && c.plan_status === 'active'
                        ? <Badge tone="green">{money(c.price_cents)}/mo{c.next_due_date ? ` · due ${date(c.next_due_date, { month: 'short', day: 'numeric' })}` : ''}</Badge>
                        : plan && <Badge tone={plan.tone}>{plan.label}</Badge>}
                      {c.open_requests > 0 && <Badge tone="orange">{c.open_requests} request{c.open_requests > 1 ? 's' : ''}</Badge>}
                    </span>
                    <span className={cx(s.fine, s.hideSm)}>Seen {ago(c.last_login_at)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {adding && <AddClient onClose={() => setAdding(false)} onCreated={(id) => { setAdding(false); toast('Client added.'); refresh(); openClient(id) }} />}
    </div>
  )
}

const EMPTY_CLIENT = { name: '', email: '', company: '', phone: '', website_url: '', notes: '' }

function ClientForm({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })
  return (
    <>
      <div className={s.grid2}>
        <Field label="Contact name"><input value={value.name} onChange={set('name')} required /></Field>
        <Field label="Email (their login)"><input type="email" value={value.email} onChange={set('email')} required /></Field>
        <Field label="Business"><input value={value.company || ''} onChange={set('company')} /></Field>
        <Field label="Phone"><input type="tel" value={value.phone || ''} onChange={set('phone')} /></Field>
      </div>
      <Field label="Website"><input value={value.website_url || ''} onChange={set('website_url')} placeholder="theirbusiness.com" /></Field>
      <Field label="Private notes" hint="Only you can see these.">
        <textarea rows={3} value={value.notes || ''} onChange={set('notes')} placeholder="Plan details, logins they use, preferences…" />
      </Field>
    </>
  )
}

function AddClient({ onClose, onCreated }) {
  const [form, setForm]       = useState(EMPTY_CLIENT)
  const [invite, setInvite]   = useState(true)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api('/api/admin/clients', { method: 'POST', body: { ...form, sendInvite: invite } })
      onCreated(res.clientId)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Modal title="Add client" onClose={onClose}>
      <form onSubmit={submit} className={s.stack}>
        <ClientForm value={form} onChange={setForm} />
        <label className={s.check}>
          <input type="checkbox" checked={invite} onChange={e => setInvite(e.target.checked)} />
          Email them a link to create their password
        </label>
        <Alert>{error}</Alert>
        <div className={s.modalActions}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add client</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Client detail ──────────────────────────────────────────────────────────
function ClientDetail({ id, onClose, toast }) {
  const [d, err, load] = useLoad(`/api/admin/clients/${id}`)
  const [editing, setEditing] = useState(false)
  const [link, setLink]       = useState(null)
  const [busy, setBusy]       = useState('')
  const [error, setError]     = useState('')

  const act = async (key, fn, okMsg) => {
    setBusy(key); setError('')
    try { const r = await fn(); if (okMsg) toast(okMsg); load(); return r }
    catch (e) { setError(e.message) }
    finally { setBusy('') }
  }

  const title = d ? (d.client.company || d.client.name) : 'Client'
  return (
    <Modal title={title} onClose={onClose} wide>
      {err ? <Alert>{err}</Alert> : !d ? <Spinner /> : editing ? (
        <EditClient client={d.client} onCancel={() => setEditing(false)}
          onSaved={() => { setEditing(false); toast('Saved.'); load() }} />
      ) : (
        <div className={s.stackLg}>
          <div className={s.detailHead}>
            <div className={s.stackSm}>
              <div className={s.listTitle}>{d.client.name}</div>
              <div className={s.contactRow}>
                <a href={`mailto:${d.client.email}`}><FiMail size={14} /> {d.client.email}</a>
                {d.client.phone && <a href={`tel:${d.client.phone}`}><FiPhone size={14} /> {d.client.phone}</a>}
                {d.client.website_url && <a href={d.client.website_url} target="_blank" rel="noreferrer"><FiExternalLink size={14} /> {d.client.website_url.replace(/^https?:\/\//, '')}</a>}
              </div>
              <div className={s.fine}>
                Client since {date(d.client.created_at)} · {d.client.invite_pending ? 'Hasn’t set a password yet' : `Last sign-in ${ago(d.client.last_login_at)}`}
              </div>
            </div>
            <div className={s.row}>
              <Button variant="secondary" className={s.btnSm} onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="secondary" className={s.btnSm} loading={busy === 'invite'}
                onClick={() => act('invite', async () => {
                  const r = await api(`/api/admin/clients/${id}/invite`, { method: 'POST' })
                  setLink(r)
                }, null)}>
                {d.client.invite_pending ? 'Resend invite' : 'Send reset link'}
              </Button>
            </div>
          </div>

          {link && (
            <div className={s.callout}>
              <p>{link.emailed ? 'Emailed. You can also copy the link:' : `Email didn’t send (${link.emailError}). Copy the link and text it to them:`}</p>
              <div className={s.copyRow}>
                <input className={s.input} readOnly value={link.inviteLink} onFocus={e => e.target.select()} />
                <Button variant="secondary" className={s.btnSm} onClick={() => { navigator.clipboard?.writeText(link.inviteLink); toast('Link copied.') }}><FiCopy size={14} /> Copy</Button>
              </div>
            </div>
          )}
          <Alert>{error}</Alert>

          {d.client.notes && <div className={s.notes}><span className={s.label}>Private notes</span><p>{d.client.notes}</p></div>}

          <section className={s.stack}>
            <h3 className={s.sectionTitle}>Requests</h3>
            {d.requests.length
              ? <AdminRequestList requests={d.requests} onChange={load} toast={toast} />
              : <p className={s.muted}>No requests yet.</p>}
          </section>

          <ProjectsSection clientId={id} projects={d.projects} reload={load} toast={toast} />
          <PlanSection clientId={id} plan={d.plan} reload={load} toast={toast} />

          <div className={s.dangerZone}>
            <div>
              <h3 className={s.dangerTitle}>Delete client</h3>
              <p className={s.muted}>Removes their login, projects, plan and requests.</p>
            </div>
            <Button variant="dangerGhost" loading={busy === 'delete'} onClick={() => {
              if (!window.confirm(`Delete ${title} and all of their data? This can’t be undone.`)) return
              act('delete', () => api(`/api/admin/clients/${id}`, { method: 'DELETE' }), 'Client deleted.').then(() => onClose())
            }}><FiTrash2 size={14} /> Delete</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function EditClient({ client, onCancel, onSaved }) {
  const [form, setForm]       = useState({ ...client })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try { await api(`/api/admin/clients/${client.id}`, { method: 'PATCH', body: form }); onSaved() }
    catch (err) { setError(err.message); setLoading(false) }
  }
  return (
    <form onSubmit={submit} className={s.stack}>
      <ClientForm value={form} onChange={setForm} />
      <Alert>{error}</Alert>
      <div className={s.modalActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Save</Button>
      </div>
    </form>
  )
}

function ProjectsSection({ clientId, projects, reload, toast }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm]     = useState({ name: '', description: '', stage: 'discovery' })
  const [error, setError]   = useState('')

  const update = async (pid, body) => {
    try { await api(`/api/admin/projects/${pid}`, { method: 'PATCH', body }); toast('Project updated.'); reload() }
    catch (e) { setError(e.message) }
  }
  const remove = async (p) => {
    if (!window.confirm(`Delete project “${p.name}”?`)) return
    try { await api(`/api/admin/projects/${p.id}`, { method: 'DELETE' }); toast('Project deleted.'); reload() }
    catch (e) { setError(e.message) }
  }
  const create = async (e) => {
    e.preventDefault()
    try {
      await api('/api/admin/projects', { method: 'POST', body: { ...form, clientId } })
      setAdding(false); setForm({ name: '', description: '', stage: 'discovery' }); toast('Project added.'); reload()
    } catch (err) { setError(err.message) }
  }

  return (
    <section className={s.stack}>
      <div className={s.sectionHead}>
        <h3 className={s.sectionTitle}>Projects</h3>
        {!adding && <button className={s.linkBtn} onClick={() => setAdding(true)}><FiPlus size={13} /> Add project</button>}
      </div>
      {projects.map(p => (
        <div key={p.id} className={s.subCard}>
          <div className={s.sectionHead}>
            <div className={s.listTitle}>{p.name}</div>
            <button className={s.iconBtn} aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>
              <FiTrash2 size={15} />
            </button>
          </div>
          <div className={s.grid2}>
            <Field label="Stage (client sees this)">
              <select value={p.stage} onChange={e => update(p.id, { stage: e.target.value })}>
                {STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={p.status} onChange={e => update(p.id, { status: e.target.value })}>
                {['active', 'paused', 'completed', 'cancelled'].map(v => <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Note to client" hint="Shown under the progress bar. Saves when you click away.">
            <textarea rows={2} defaultValue={p.description || ''}
              onBlur={e => e.target.value !== (p.description || '') && update(p.id, { description: e.target.value })} />
          </Field>
        </div>
      ))}
      {!projects.length && !adding && <p className={s.muted}>No projects yet.</p>}
      {adding && (
        <form onSubmit={create} className={cx(s.subCard, s.stack)}>
          <div className={s.grid2}>
            <Field label="Project name"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Website build" required /></Field>
            <Field label="Stage">
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                {STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Note to client (optional)"><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <div className={s.row}>
            <Button type="button" variant="secondary" className={s.btnSm} onClick={() => setAdding(false)}>Cancel</Button>
            <Button type="submit" className={s.btnSm}>Add project</Button>
          </div>
        </form>
      )}
      <Alert>{error}</Alert>
    </section>
  )
}

// What the client sees on their Billing tab. Entered by hand for now.
function PlanSection({ clientId, plan, reload, toast }) {
  const initial = () => ({
    planName:     plan?.plan_name || 'Monthly Care Plan',
    priceDollars: plan ? String(plan.price_cents / 100) : '',
    nextDueDate:  plan?.next_due_date ? String(plan.next_due_date).slice(0, 10) : '',
    status:       plan?.status || 'active',
  })
  const [form, setForm]     = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  useEffect(() => setForm(initial()), [plan]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await api(`/api/admin/clients/${clientId}/plan`, { method: 'PUT', body: form })
      toast('Plan saved.'); reload()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <section className={s.stack}>
      <div className={s.sectionHead}>
        <h3 className={s.sectionTitle}>Monthly plan</h3>
        {plan && <span className={s.fine}>Updated {ago(plan.updated_at)}</span>}
      </div>
      <form onSubmit={save} className={cx(s.subCard, s.stack)}>
        <div className={s.grid2}>
          <Field label="Monthly price ($)"><input inputMode="decimal" value={form.priceDollars} onChange={set('priceDollars')} placeholder="55" required /></Field>
          <Field label="Next payment due"><input type="date" value={form.nextDueDate} onChange={set('nextDueDate')} /></Field>
          <Field label="Plan name"><input value={form.planName} onChange={set('planName')} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')}>
              {Object.entries(PLAN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>
        <p className={s.fine}>The client sees the price and due date on their Billing tab.</p>
        <Alert>{error}</Alert>
        <div><Button type="submit" className={s.btnSm} loading={saving}>{plan ? 'Save plan' : 'Set plan'}</Button></div>
      </form>
    </section>
  )
}

// ── Requests inbox ─────────────────────────────────────────────────────────
function RequestsInbox({ openClient, toast }) {
  const [filter, setFilter] = useState('')
  const [data, err, load]   = useLoad(`/api/admin/requests${filter ? `?status=${filter}` : ''}`)
  return (
    <div className={s.stackLg}>
      <header className={s.pageHeadRow}>
        <div>
          <h1 className={s.pageTitle}>Requests</h1>
          <p className={s.pageSub}>Everything clients send from the portal. Each one also lands in your email.</p>
        </div>
        <div className={s.segmented} role="tablist" aria-label="Filter requests">
          {[['', 'Open'], ['done', 'Done']].map(([v, l]) => (
            <button key={l} role="tab" aria-selected={filter === v} className={cx(s.segment, filter === v && s.segmentOn)} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </header>
      {err && <Alert>{err}</Alert>}
      <Card padded={false}>
        {!data ? <Spinner /> : data.requests.length
          ? <AdminRequestList requests={data.requests} openClient={openClient} onChange={load} toast={toast} />
          : <Empty icon={FiInbox} title={filter ? 'Nothing marked done yet' : 'Inbox zero'}>{!filter && 'New client requests show up here.'}</Empty>}
      </Card>
    </div>
  )
}

function AdminRequestList({ requests, openClient, onChange, toast, compact }) {
  const setStatus = async (r, status) => {
    await api(`/api/admin/requests/${r.id}`, { method: 'PATCH', body: { status } })
    toast?.(status === 'done' ? 'Marked done.' : 'Updated.')
    onChange?.()
  }
  return (
    <ul className={s.list}>
      {requests.map(r => {
        const st = r.status === 'open' ? { label: 'New', tone: 'orange' } : REQUEST_STATUS[r.status]
        const cancel = r.type === 'cancel'
        return (
          <li key={r.id} className={cx(s.listItem, s.requestItem, cancel && r.status !== 'done' && s.requestUrgent)}>
            <div className={s.listMain}>
              <div className={s.listTitle}>
                {cancel && <FiAlertTriangle size={14} className={s.text_red} aria-hidden="true" />} {r.subject}
              </div>
              <div className={s.listMeta}>
                {r.client_name && (openClient
                  ? <button className={s.inlineLink} onClick={() => openClient(r.client_id)}>{r.client_company || r.client_name}</button>
                  : (r.client_company || r.client_name))}
                {r.client_name && ' · '}{REQUEST_TYPES[r.type]?.label} · {ago(r.created_at)}
              </div>
              {!compact && <p className={s.listBody}>{r.body}</p>}
              {!compact && r.page_url && <p className={s.fine}>Page: {r.page_url}</p>}
            </div>
            <div className={s.requestActions}>
              <Badge tone={st.tone}>{st.label}</Badge>
              {!compact && onChange && (
                <div className={s.row}>
                  {r.client_email && <a className={s.linkBtn} href={`mailto:${r.client_email}?subject=${encodeURIComponent(`Re: ${r.subject}`)}`}>Reply</a>}
                  {r.status === 'open' && <button className={s.linkBtn} onClick={() => setStatus(r, 'in_progress')}>Start</button>}
                  {r.status !== 'done'
                    ? <button className={s.linkBtn} onClick={() => setStatus(r, 'done')}>Mark done</button>
                    : <button className={s.linkBtn} onClick={() => setStatus(r, 'open')}>Reopen</button>}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
