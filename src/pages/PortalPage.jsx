// ─────────────────────────────────────────────────────────────────────────────
// PortalPage — Real client portal backed by Express + SQLite + JWT + Stripe.
//
// Auth:     httpOnly cookie set by /api/auth/login (survives page refresh).
// Payments: Stripe PaymentElement — clients pay invoices directly in the portal.
// Admin:    Jed sees extra tabs: All Projects, All Invoices, Manage (create/edit).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js'
import {
  FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight,
  FiGrid, FiFileText, FiTool, FiCreditCard, FiBarChart2,
  FiCheckCircle, FiClock, FiAlertCircle, FiLogOut,
  FiDollarSign, FiRefreshCw, FiUsers, FiUserPlus,
  FiPlusCircle, FiEdit2, FiSend, FiMessageSquare, FiLayers,
} from 'react-icons/fi'
import { SERVICES } from '../data/services'
import styles from './PortalPage.module.css'

// ── Stripe setup ───────────────────────────────────────────────────────────
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

// All services including admin-only ones (friends), for use in admin forms
const ALL_SERVICES = SERVICES

// Project stages
const STAGES = [
  { id: 'discovery',   label: 'Discovery'   },
  { id: 'design',      label: 'Design'      },
  { id: 'development', label: 'Development' },
  { id: 'review',      label: 'Review'      },
  { id: 'launched',    label: 'Launched'    },
]

// ── API helper ─────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed.')
  return data
}

// ── Stage Tracker ──────────────────────────────────────────────────────────
function StageTracker({ stage }) {
  const currentIdx = STAGES.findIndex(s => s.id === stage)
  return (
    <div className={styles.stageTracker}>
      {STAGES.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={[
            styles.stageStep,
            i <= currentIdx ? styles.stageActive : '',
            i === currentIdx ? styles.stageCurrent : '',
          ].filter(Boolean).join(' ')}>
            <div className={styles.stageCircle}>
              {i < currentIdx ? <FiCheckCircle size={11} /> : i + 1}
            </div>
            <span className={styles.stageLabel}>{s.label}</span>
          </div>
          {i < STAGES.length - 1 && (
            <div className={`${styles.stageLine} ${i < currentIdx ? styles.stageLineActive : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Support Form (replaces all mailto: links) ──────────────────────────────
function SupportForm({ defaultMessage = '' }) {
  const [form,    setForm]    = useState({ name: '', email: '', message: defaultMessage })
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.message) { setError('Email and message are required.'); return }
    setLoading(true); setError('')
    try {
      await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })
      setDone(true)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className={styles.supportDone}>
      <FiCheckCircle size={22} style={{ color: '#4ade80' }} />
      <p>Message sent. Jed will get back to you within one business day.</p>
    </div>
  )

  return (
    <form className={styles.supportForm} onSubmit={handleSubmit}>
      <div className={styles.adminRow}>
        <div className={styles.adminField}>
          <label>Your Name</label>
          <input type="text" className={styles.adminInput} placeholder="Jane Smith"
            value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
        </div>
        <div className={styles.adminField}>
          <label>Your Email *</label>
          <input type="email" className={styles.adminInput} placeholder="you@company.com"
            value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
        </div>
      </div>
      <div className={styles.adminField}>
        <label>Message *</label>
        <textarea rows={4} className={styles.adminInput} style={{ resize: 'vertical' }}
          placeholder="Describe what you need help with..."
          value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} />
      </div>
      {error && <div className={styles.errorMsg}><FiAlertCircle size={14} /> {error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'} <FiSend size={13} />
      </button>
    </form>
  )
}

// ── Checkout Form (Stripe) ─────────────────────────────────────────────────
function CheckoutForm({ invoice, onSuccess, onCancel }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true); setError('')
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    if (stripeError) { setError(stripeError.message); setLoading(false) }
    else onSuccess()
  }

  const amount = (invoice.amount_cents / 100).toFixed(2)
  return (
    <div className={styles.checkoutWrap}>
      <div className={styles.checkoutCard}>
        <h3 className={styles.checkoutTitle}>Pay Invoice</h3>
        <p className={styles.checkoutDesc}>{invoice.description}</p>
        <div className={styles.checkoutAmount}>${amount}</div>
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          {error && <div className={styles.errorMsg} style={{marginTop:'1rem'}}><FiAlertCircle size={14} /> {error}</div>}
          <div className={styles.checkoutActions}>
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !stripe}>
              {loading ? 'Processing...' : `Pay $${amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Invoice Card ──────────────────────────────────────────────────────────
function InvoiceCard({ invoice, onPaySuccess }) {
  const [paying,        setPaying]        = useState(false)
  const [clientSecret,  setClientSecret]  = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [error,         setError]         = useState('')

  const handlePay = async () => {
    if (!stripePromise) { setError('Stripe is not configured. Contact CWC.'); return }
    setLoadingIntent(true); setError('')
    try {
      const data = await apiFetch('/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      setClientSecret(data.clientSecret)
      setPaying(true)
    } catch (err) { setError(err.message) }
    finally { setLoadingIntent(false) }
  }

  const amount      = `$${(invoice.amount_cents / 100).toFixed(2)}`
  const isPaid      = invoice.status === 'paid'
  const isVoid      = invoice.status === 'void'
  const statusColor = isPaid ? '#4ade80' : isVoid ? '#6b7280' : '#f97316'
  const isMonthly   = invoice.invoice_type === 'monthly'

  if (paying && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
        <CheckoutForm invoice={invoice}
          onSuccess={() => { setPaying(false); onPaySuccess() }}
          onCancel={() => setPaying(false)} />
      </Elements>
    )
  }

  return (
    <div className={`${styles.invoiceCard} ${isPaid ? styles.invoicePaid : ''}`}>
      <div className={styles.invoiceLeft}>
        <div className={styles.invoiceIcon} style={{ color: statusColor, background: statusColor+'18' }}>
          <FiDollarSign size={18} />
        </div>
        <div>
          <div className={styles.invoiceDesc}>{invoice.description}</div>
          <div className={styles.invoiceMeta}>
            <span className={styles.invoiceTypeBadge}
              style={{
                background: isMonthly ? 'rgba(167,139,250,0.12)' : 'rgba(91,141,245,0.12)',
                color:      isMonthly ? '#a78bfa' : '#5b8df5',
              }}>
              {isMonthly ? 'Monthly' : 'One-time'}
            </span>
            {invoice.due_date && <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>}
            {invoice.paid_at  && <span>Paid: {new Date(invoice.paid_at).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
      <div className={styles.invoiceRight}>
        <span className={styles.invoiceAmount}>{amount}</span>
        <span className={styles.invoiceStatus} style={{ color: statusColor, background: statusColor+'18', borderColor: statusColor+'33' }}>
          {isPaid && <FiCheckCircle size={11} />}
          {!isPaid && !isVoid && <FiClock size={11} />}
          {isPaid ? 'Paid' : isVoid ? 'Void' : 'Pending'}
        </span>
        {!isPaid && !isVoid && (
          <button className={`btn-primary ${styles.payBtn}`} onClick={handlePay} disabled={loadingIntent}>
            {loadingIntent ? 'Loading...' : 'Pay Now'}
          </button>
        )}
      </div>
      {error && <div className={`${styles.errorMsg} ${styles.invoiceError}`}><FiAlertCircle size={13} /> {error}</div>}
    </div>
  )
}

// ── Admin Panel ────────────────────────────────────────────────────────────
function AdminPanel() {
  // ── Core state ──────────────────────────────────────────────────────────
  const [clients,     setClients]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [section,     setSection]     = useState('all-projects')
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [editClient,  setEditClient]  = useState(null)

  // ── All-projects / all-invoices state ───────────────────────────────────
  const [allProjects,  setAllProjects]  = useState([])
  const [allInvoices,  setAllInvoices]  = useState([])
  const [loadingAll,   setLoadingAll]   = useState(false)
  const [stageEdit,    setStageEdit]    = useState({})   // { [projectId]: 'design' }
  const [sendingId,    setSendingId]    = useState(null) // invoiceId being notified

  // ── Form state ──────────────────────────────────────────────────────────
  const [clientForm,  setClientForm]  = useState({ name: '', email: '', company: '', password: '' })
  const [projectForm, setProjectForm] = useState({ clientId: '', name: '', description: '', serviceId: '', monthlyPriceDollars: '', stage: 'discovery', status: 'active' })
  const [invoiceForm, setInvoiceForm] = useState({ clientId: '', serviceId: '', invoiceType: 'one-time', description: '', amountDollars: '', dueDate: '', notifyClient: true })
  const [editForm,    setEditForm]    = useState({ name: '', email: '', company: '' })

  // ── Loaders ─────────────────────────────────────────────────────────────
  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/clients')
      setClients(data.clients)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  const loadAllProjects = useCallback(async () => {
    setLoadingAll(true)
    try {
      const data = await apiFetch('/api/admin/projects')
      setAllProjects(data.projects)
    } catch (err) { showMsg(err.message, true) }
    finally { setLoadingAll(false) }
  }, []) // eslint-disable-line

  const loadAllInvoices = useCallback(async () => {
    setLoadingAll(true)
    try {
      const data = await apiFetch('/api/admin/invoices')
      setAllInvoices(data.invoices)
    } catch (err) { showMsg(err.message, true) }
    finally { setLoadingAll(false) }
  }, []) // eslint-disable-line

  useEffect(() => { loadClients() }, [loadClients])

  useEffect(() => {
    if (section === 'all-projects') loadAllProjects()
    if (section === 'all-invoices') loadAllInvoices()
  }, [section]) // eslint-disable-line

  const showMsg = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg)
    setTimeout(() => { setSuccess(''); setError('') }, 6000)
  }

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleAddClient = async (e) => {
    e.preventDefault()
    if (!clientForm.name || !clientForm.email || !clientForm.password)
      return showMsg('Name, email, and password are required.', true)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/clients', { method: 'POST', body: JSON.stringify(clientForm) })
      showMsg(`Client "${clientForm.name}" created! Login: ${clientForm.email} / ${clientForm.password}`)
      setClientForm({ name: '', email: '', company: '', password: '' })
      setSection('clients')
      loadClients()
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editForm.name || !editForm.email) return showMsg('Name and email are required.', true)
    setSubmitting(true)
    try {
      await apiFetch(`/api/admin/clients/${editClient.id}`, { method: 'PATCH', body: JSON.stringify(editForm) })
      showMsg('Client updated.')
      setEditClient(null)
      loadClients()
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!projectForm.clientId || !projectForm.name)
      return showMsg('Select a client and enter a project name.', true)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/projects', { method: 'POST', body: JSON.stringify(projectForm) })
      showMsg('Project added.')
      setProjectForm({ clientId: '', name: '', description: '', serviceId: '', monthlyPriceDollars: '', stage: 'discovery', status: 'active' })
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleAddInvoice = async (e) => {
    e.preventDefault()
    if (!invoiceForm.clientId || !invoiceForm.description || !invoiceForm.amountDollars)
      return showMsg('Client, description, and amount are required.', true)
    setSubmitting(true)
    try {
      const { invoiceId } = await apiFetch('/api/admin/invoices', { method: 'POST', body: JSON.stringify(invoiceForm) })
      if (invoiceForm.notifyClient) {
        try {
          await apiFetch(`/api/admin/invoices/${invoiceId}/notify`, { method: 'POST' })
          showMsg('Invoice created & client notified by email! ✓')
        } catch {
          showMsg('Invoice created. (Email notification failed — check EMAIL_FROM / EMAIL_PASS env vars.)')
        }
      } else {
        showMsg('Invoice created. The client will see it when they log in.')
      }
      setInvoiceForm({ clientId: '', serviceId: '', invoiceType: 'one-time', description: '', amountDollars: '', dueDate: '', notifyClient: true })
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleUpdateStage = async (projectId, stage) => {
    try {
      await apiFetch(`/api/admin/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify({ stage }) })
      showMsg('Stage updated.')
      setStageEdit(s => { const n = { ...s }; delete n[projectId]; return n })
      loadAllProjects()
    } catch (err) { showMsg(err.message, true) }
  }

  const handleVoidInvoice = async (invoiceId) => {
    if (!window.confirm('Void this invoice? This cannot be undone.')) return
    try {
      await apiFetch(`/api/admin/invoices/${invoiceId}/void`, { method: 'PATCH' })
      showMsg('Invoice voided.')
      loadAllInvoices()
    } catch (err) { showMsg(err.message, true) }
  }

  const handleNotifyClient = async (invoiceId) => {
    setSendingId(invoiceId)
    try {
      await apiFetch(`/api/admin/invoices/${invoiceId}/notify`, { method: 'POST' })
      showMsg('Email sent to client!')
    } catch (err) { showMsg(err.message, true) }
    finally { setSendingId(null) }
  }

  const handleRemindClient = async (clientId) => {
    try {
      await apiFetch(`/api/admin/clients/${clientId}/remind`, { method: 'POST' })
      showMsg('Reminder email sent!')
    } catch (err) { showMsg(err.message, true) }
  }

  const handleQuickInvoice = (clientId) => {
    setInvoiceForm(f => ({ ...f, clientId: String(clientId) }))
    setSection('add-invoice')
  }

  const autoFillDesc = (serviceId, invoiceType) => {
    const svc = ALL_SERVICES.find(s => s.id === serviceId)
    if (!svc) return
    const desc = invoiceType === 'monthly' ? `${svc.title} — Monthly Plan` : `${svc.title} — Project Build`
    setInvoiceForm(f => ({ ...f, description: desc }))
  }

  // ── Nav tabs ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'all-projects', label: 'All Projects',   icon: <FiLayers />     },
    { id: 'all-invoices', label: 'All Invoices',   icon: <FiDollarSign /> },
    { id: 'clients',      label: 'All Clients',    icon: <FiUsers />      },
    { id: 'add-client',   label: 'Add Client',     icon: <FiUserPlus />   },
    { id: 'add-project',  label: 'Add Project',    icon: <FiFileText />   },
    { id: 'add-invoice',  label: 'Create Invoice', icon: <FiPlusCircle /> },
  ]

  // ── Edit client overlay ──────────────────────────────────────────────────
  if (editClient) return (
    <div className={styles.adminPanel}>
      <div className={styles.adminNav}>
        <button className={styles.adminNavBtn} onClick={() => setEditClient(null)}>← Back</button>
      </div>
      {success && <div className={styles.successMsg}><FiCheckCircle size={14} /> {success}</div>}
      {error   && <div className={styles.errorMsg}><FiAlertCircle size={14} /> {error}</div>}
      <form className={styles.adminForm} onSubmit={handleSaveEdit}>
        <p className={styles.adminFormNote}>Editing <strong>{editClient.name}</strong></p>
        <div className={styles.adminRow}>
          <div className={styles.adminField}>
            <label>Full Name *</label>
            <input type="text" className={styles.adminInput}
              value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div className={styles.adminField}>
            <label>Email *</label>
            <input type="email" className={styles.adminInput}
              value={editForm.email} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} />
          </div>
        </div>
        <div className={styles.adminField}>
          <label>Company</label>
          <input type="text" className={styles.adminInput} placeholder="Optional"
            value={editForm.company} onChange={e => setEditForm(f => ({...f, company: e.target.value}))} />
        </div>
        <div className={styles.adminRow}>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditClient(null)}>Cancel</button>
        </div>
      </form>
    </div>
  )

  return (
    <div className={styles.adminPanel}>
      <div className={styles.adminNav}>
        {tabs.map(t => (
          <button key={t.id}
            className={`${styles.adminNavBtn} ${section === t.id ? styles.adminNavActive : ''}`}
            onClick={() => setSection(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {success && <div className={styles.successMsg}><FiCheckCircle size={14} /> {success}</div>}
      {error   && <div className={styles.errorMsg}><FiAlertCircle size={14} /> {error}</div>}

      {/* ── All Projects ─────────────────────────────────────────────── */}
      {section === 'all-projects' && (
        <div className={styles.allListSection}>
          <div className={styles.listHeaderRow}>
            <span className={styles.listCount}>
              {allProjects.length} project{allProjects.length !== 1 ? 's' : ''}
            </span>
            <button className={styles.refreshSmallBtn} onClick={loadAllProjects} title="Refresh">
              <FiRefreshCw size={13} className={loadingAll ? styles.spinning : ''} />
            </button>
          </div>

          {loadingAll ? (
            <p className={styles.loadingText}>Loading projects...</p>
          ) : allProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <FiLayers size={28} />
              <p>No projects yet. Create a client and add a project to get started.</p>
            </div>
          ) : allProjects.map(p => {
            const svc      = ALL_SERVICES.find(s => s.id === p.service_id)
            const svcName  = svc ? (svc.shortTitle || svc.title) : null
            const stageVal = stageEdit[p.id] !== undefined ? stageEdit[p.id] : p.stage
            const isDirty  = stageEdit[p.id] !== undefined && stageEdit[p.id] !== p.stage
            const statusColor = p.status === 'active' ? '#5b8df5' : p.status === 'completed' ? '#4ade80' : '#facc15'

            return (
              <div key={p.id} className={styles.adminProjectCard}>
                {/* Client row */}
                <div className={styles.adminProjectTop}>
                  <div className={styles.adminProjectClient}>
                    <div className={styles.avatar} style={{ width: 30, height: 30, fontSize: '0.75rem', flexShrink: 0 }}>
                      {p.client_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.adminClientName}>{p.client_name}</div>
                      <div className={styles.adminClientEmail}>{p.client_email}</div>
                    </div>
                  </div>
                  <div className={styles.adminProjectBadges}>
                    {svcName && <span className={styles.svcBadge}>{svcName}</span>}
                    <span className={styles.projectStatus}
                      style={{ color: statusColor, background: statusColor+'18', borderColor: statusColor+'33' }}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Project name */}
                <div className={styles.adminProjectName}>{p.name}</div>
                {p.description && <p className={styles.adminProjectDesc}>{p.description}</p>}

                {/* Stage tracker */}
                <StageTracker stage={p.stage || 'discovery'} />

                {/* Monthly price */}
                {p.monthly_price_cents > 0 && (
                  <div className={styles.monthlyPriceNote}>
                    <FiCreditCard size={12} /> ${(p.monthly_price_cents / 100).toFixed(2)}/mo
                  </div>
                )}

                {/* Actions row */}
                <div className={styles.adminProjectActions}>
                  <div className={styles.stageSelectWrap}>
                    <label className={styles.stageSelectLabel}>Stage:</label>
                    <select className={styles.adminInputSm}
                      value={stageVal}
                      onChange={e => setStageEdit(s => ({ ...s, [p.id]: e.target.value }))}>
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    {isDirty && (
                      <button className={styles.stageSaveBtn}
                        onClick={() => handleUpdateStage(p.id, stageEdit[p.id])}>
                        Save
                      </button>
                    )}
                  </div>
                  <button className={styles.actionBtn} onClick={() => handleQuickInvoice(p.client_id)}
                    title="Create an invoice for this client">
                    <FiDollarSign size={13} /> Invoice
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── All Invoices ──────────────────────────────────────────────── */}
      {section === 'all-invoices' && (
        <div className={styles.allListSection}>
          <div className={styles.listHeaderRow}>
            <span className={styles.listCount}>
              {allInvoices.length} invoice{allInvoices.length !== 1 ? 's' : ''}
              {allInvoices.filter(i => i.status === 'pending').length > 0 && (
                <span className={styles.pendingPill}>
                  {allInvoices.filter(i => i.status === 'pending').length} pending
                </span>
              )}
            </span>
            <button className={styles.refreshSmallBtn} onClick={loadAllInvoices} title="Refresh">
              <FiRefreshCw size={13} className={loadingAll ? styles.spinning : ''} />
            </button>
          </div>

          {loadingAll ? (
            <p className={styles.loadingText}>Loading invoices...</p>
          ) : allInvoices.length === 0 ? (
            <div className={styles.emptyState}>
              <FiDollarSign size={28} />
              <p>No invoices yet. Create one under "Create Invoice".</p>
            </div>
          ) : allInvoices.map(inv => {
            const isPaid      = inv.status === 'paid'
            const isVoid      = inv.status === 'void'
            const statusColor = isPaid ? '#4ade80' : isVoid ? '#6b7280' : '#f97316'
            const isMonthly   = inv.invoice_type === 'monthly'
            return (
              <div key={inv.id} className={`${styles.adminInvoiceRow} ${isPaid ? styles.adminInvoicePaid : ''}`}>
                <div className={styles.adminInvoiceLeft}>
                  <div className={styles.adminInvoiceClient}>
                    <div className={styles.avatar} style={{ width: 26, height: 26, fontSize: '0.68rem', flexShrink: 0 }}>
                      {inv.client_name[0].toUpperCase()}
                    </div>
                    <div>
                      <span className={styles.adminClientName}>{inv.client_name}</span>
                      <span className={styles.adminClientEmail}> · {inv.client_email}</span>
                    </div>
                  </div>
                  <div className={styles.adminInvoiceDesc}>{inv.description}</div>
                  <div className={styles.invoiceMeta}>
                    <span className={styles.invoiceTypeBadge}
                      style={{
                        background: isMonthly ? 'rgba(167,139,250,0.12)' : 'rgba(91,141,245,0.12)',
                        color:      isMonthly ? '#a78bfa' : '#5b8df5',
                      }}>
                      {isMonthly ? 'Monthly' : 'One-time'}
                    </span>
                    {inv.due_date && <span style={{ fontSize: '0.73rem', color: 'var(--text-3)' }}>Due {new Date(inv.due_date).toLocaleDateString()}</span>}
                    {inv.paid_at  && <span style={{ fontSize: '0.73rem', color: '#4ade80' }}>Paid {new Date(inv.paid_at).toLocaleDateString()}</span>}
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-3)' }}>{new Date(inv.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.adminInvoiceRight}>
                  <div className={styles.adminInvoiceAmount}>${(inv.amount_cents / 100).toFixed(2)}</div>
                  <span className={styles.invoiceStatus}
                    style={{ color: statusColor, background: statusColor+'18', borderColor: statusColor+'33' }}>
                    {isPaid ? <FiCheckCircle size={11} /> : isVoid ? <FiAlertCircle size={11} /> : <FiClock size={11} />}
                    {isPaid ? 'Paid' : isVoid ? 'Void' : 'Pending'}
                  </span>
                  {!isPaid && !isVoid && (
                    <div className={styles.adminInvoiceActions}>
                      <button className={styles.actionBtn}
                        onClick={() => handleNotifyClient(inv.id)}
                        disabled={sendingId === inv.id}
                        title="Email payment link to client">
                        <FiSend size={12} /> {sendingId === inv.id ? '...' : 'Email'}
                      </button>
                      <button className={styles.actionBtnDanger}
                        onClick={() => handleVoidInvoice(inv.id)}
                        title="Void this invoice">
                        Void
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── All Clients ── */}
      {section === 'clients' && (
        <div className={styles.clientList}>
          {loading ? <p className={styles.loadingText}>Loading...</p>
            : clients.length === 0 ? (
              <div className={styles.emptyState}><FiUsers size={28} /><p>No clients yet.</p></div>
            ) : clients.map(c => (
              <div key={c.id} className={styles.clientCard}>
                <div className={styles.avatar} style={{ width: 38, height: 38, fontSize: '0.9rem' }}>
                  {c.name[0].toUpperCase()}
                </div>
                <div className={styles.clientInfo}>
                  <div className={styles.clientName}>{c.name}</div>
                  <div className={styles.clientMeta}>{c.email}{c.company ? ` · ${c.company}` : ''}</div>
                </div>
                <span className={styles.clientSince}>Since {new Date(c.created_at).toLocaleDateString()}</span>
                <div className={styles.clientActions}>
                  <button className={styles.editBtn}
                    onClick={() => {
                      setEditClient(c)
                      setEditForm({ name: c.name, email: c.email, company: c.company || '' })
                    }}>
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button className={styles.remindBtn}
                    onClick={() => handleRemindClient(c.id)}
                    title="Send payment reminder email">
                    <FiSend size={12} /> Remind
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Add Client ── */}
      {section === 'add-client' && (
        <form className={styles.adminForm} onSubmit={handleAddClient}>
          <p className={styles.adminFormNote}>
            Fill this out for each new client. Send them their email and password separately.
            They log in at <strong>/portal</strong>.
          </p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client Name *</label>
              <input type="text" placeholder="Jane Smith" className={styles.adminInput}
                value={clientForm.name} onChange={e => setClientForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className={styles.adminField}>
              <label>Email *</label>
              <input type="email" placeholder="jane@company.com" className={styles.adminInput}
                value={clientForm.email} onChange={e => setClientForm(f => ({...f, email: e.target.value}))} />
            </div>
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Company (optional)</label>
              <input type="text" placeholder="Their Business" className={styles.adminInput}
                value={clientForm.company} onChange={e => setClientForm(f => ({...f, company: e.target.value}))} />
            </div>
            <div className={styles.adminField}>
              <label>Temp Password *</label>
              <input type="text" placeholder="e.g. Welcome2025!" className={styles.adminInput}
                value={clientForm.password} onChange={e => setClientForm(f => ({...f, password: e.target.value}))} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Client Account'} <FiUserPlus size={14} />
          </button>
        </form>
      )}

      {/* ── Add Project ── */}
      {section === 'add-project' && (
        <form className={styles.adminForm} onSubmit={handleAddProject}>
          <p className={styles.adminFormNote}>Add a project to a client's dashboard.</p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client *</label>
              <select className={styles.adminInput}
                value={projectForm.clientId}
                onChange={e => setProjectForm(f => ({...f, clientId: e.target.value}))}>
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Service</label>
              <select className={styles.adminInput}
                value={projectForm.serviceId}
                onChange={e => setProjectForm(f => ({...f, serviceId: e.target.value}))}>
                <option value="">Select a service...</option>
                {ALL_SERVICES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Project Name *</label>
              <input type="text" placeholder="e.g. Main Website Build" className={styles.adminInput}
                value={projectForm.name}
                onChange={e => setProjectForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className={styles.adminField}>
              <label>Monthly Price ($/mo)</label>
              <input type="number" placeholder="e.g. 50.00" min="0" step="0.01" className={styles.adminInput}
                value={projectForm.monthlyPriceDollars}
                onChange={e => setProjectForm(f => ({...f, monthlyPriceDollars: e.target.value}))} />
            </div>
          </div>
          <div className={styles.adminField} style={{ marginBottom: '1rem' }}>
            <label>Description (optional)</label>
            <textarea rows={2} placeholder="Brief description visible to the client..."
              className={styles.adminInput} style={{ resize: 'vertical' }}
              value={projectForm.description}
              onChange={e => setProjectForm(f => ({...f, description: e.target.value}))} />
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Stage</label>
              <select className={styles.adminInput}
                value={projectForm.stage}
                onChange={e => setProjectForm(f => ({...f, stage: e.target.value}))}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Status</label>
              <select className={styles.adminInput}
                value={projectForm.status}
                onChange={e => setProjectForm(f => ({...f, status: e.target.value}))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Project'} <FiPlusCircle size={14} />
          </button>
        </form>
      )}

      {/* ── Create Invoice ── */}
      {section === 'add-invoice' && (
        <form className={styles.adminForm} onSubmit={handleAddInvoice}>
          <p className={styles.adminFormNote}>
            Create an invoice for a client. They pay it directly in the portal via card.
          </p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client *</label>
              <select className={styles.adminInput}
                value={invoiceForm.clientId}
                onChange={e => setInvoiceForm(f => ({...f, clientId: e.target.value}))}>
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Invoice Type</label>
              <select className={styles.adminInput}
                value={invoiceForm.invoiceType}
                onChange={e => {
                  const t = e.target.value
                  setInvoiceForm(f => ({...f, invoiceType: t}))
                  if (invoiceForm.serviceId) autoFillDesc(invoiceForm.serviceId, t)
                }}>
                <option value="one-time">One-time (Web Build)</option>
                <option value="monthly">Monthly (Plan / Maintenance)</option>
              </select>
            </div>
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Service</label>
              <select className={styles.adminInput}
                value={invoiceForm.serviceId}
                onChange={e => {
                  const sid = e.target.value
                  setInvoiceForm(f => ({...f, serviceId: sid}))
                  autoFillDesc(sid, invoiceForm.invoiceType)
                }}>
                <option value="">Select a service (optional)...</option>
                {ALL_SERVICES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Amount (USD) *</label>
              <input type="number" placeholder="350.00" min="1" step="0.01" className={styles.adminInput}
                value={invoiceForm.amountDollars}
                onChange={e => setInvoiceForm(f => ({...f, amountDollars: e.target.value}))} />
            </div>
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Description *</label>
              <input type="text" placeholder="e.g. Website Design — Project Build" className={styles.adminInput}
                value={invoiceForm.description}
                onChange={e => setInvoiceForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div className={styles.adminField}>
              <label>Due Date (optional)</label>
              <input type="date" className={styles.adminInput}
                value={invoiceForm.dueDate}
                onChange={e => setInvoiceForm(f => ({...f, dueDate: e.target.value}))} />
            </div>
          </div>
          <label className={styles.checkboxLabel}>
            <input type="checkbox"
              checked={invoiceForm.notifyClient}
              onChange={e => setInvoiceForm(f => ({...f, notifyClient: e.target.checked}))} />
            <span>Email invoice to client immediately after creating</span>
          </label>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Invoice'} <FiDollarSign size={14} />
          </button>
        </form>
      )}
    </div>
  )
}

// ── Login Form ─────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      onLogin(data.user)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}><span className={styles.logoMark}>CWC</span></div>
        <h1 className={styles.loginTitle}>Client Portal</h1>
        <p className={styles.loginSub}>Sign in to view your projects and billing.</p>

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.inputIcon} size={15} />
              <input id="email" type="email" placeholder="you@company.com" className={styles.input}
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Password</label>
            </div>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} size={15} />
              <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                className={styles.input} value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" />
              <button type="button" className={styles.showPw} onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
          {error && <div className={styles.errorMsg}><FiAlertCircle size={14} /> {error}</div>}
          <button type="submit" className={`btn-primary ${styles.signInBtn}`} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}{!loading && <FiArrowRight size={14} />}
          </button>
        </form>

        <p className={styles.loginFooter}>
          Not a CWC client yet?{' '}
          <Link to="/#contact" className={styles.loginFooterLink}>Get in touch</Link>
        </p>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [activeTab,   setActiveTab]   = useState('overview')
  const [projects,    setProjects]    = useState([])
  const [invoices,    setInvoices]    = useState([])
  const [loadingData, setLoadingData] = useState(false)

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [pData, iData] = await Promise.all([
        apiFetch('/api/portal/projects'),
        apiFetch('/api/portal/invoices'),
      ])
      setProjects(pData.projects)
      setInvoices(iData.invoices)
    } catch (err) { console.error('Failed to load portal data:', err.message) }
    finally { setLoadingData(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }) } catch {}
    onLogout()
  }

  const isAdmin = user.role === 'admin'
  const activeProjects  = projects.filter(p => p.status === 'active')
  const pendingInvoices = invoices.filter(i => i.status === 'pending')
  const totalOwed       = pendingInvoices.reduce((s, i) => s + i.amount_cents, 0)

  const getServiceName = (serviceId) => {
    const svc = ALL_SERVICES.find(s => s.id === serviceId)
    return svc ? (svc.shortTitle || svc.title) : null
  }

  const clientTabs = [
    { id: 'overview', label: 'Overview',  icon: <FiGrid />       },
    { id: 'projects', label: 'Projects',  icon: <FiFileText />   },
    { id: 'billing',  label: 'Billing',   icon: <FiCreditCard /> },
    { id: 'support',  label: 'Support',   icon: <FiTool />       },
    { id: 'reports',  label: 'Reports',   icon: <FiBarChart2 />  },
  ]
  const adminTabs = isAdmin ? [{ id: 'manage', label: 'Manage', icon: <FiUsers /> }] : []
  const tabs = [...clientTabs, ...adminTabs]

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.sideLogoWrap}>
            <span className={styles.logoMark}>CWC</span>
            <div>
              <div className={styles.sideLogoTitle}>Client Portal</div>
              <div className={styles.sideLogoSub}>Cooper Web Consulting</div>
            </div>
          </div>
        </div>
        <nav className={styles.sideNav}>
          {tabs.map(({ id, label, icon }) => (
            <button key={id}
              className={`${styles.sideNavItem} ${activeTab === id ? styles.sideNavActive : ''} ${id === 'manage' ? styles.adminNavItem : ''}`}
              onClick={() => setActiveTab(id)}>
              <span className={styles.sideNavIcon}>{icon}</span>
              {label}
              {id === 'manage' && <span className={styles.adminBadge}>Admin</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <div className={styles.sideUser}>
            <div className={styles.avatar}>{(user.name || user.email)[0].toUpperCase()}</div>
            <div className={styles.sideUserInfo}>
              <div className={styles.sideUserEmail}>{user.name || user.email}</div>
              <div className={styles.sideUserRole}>{isAdmin ? 'Admin' : user.company || 'Client'}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {activeTab !== 'manage' && (
          <div className={styles.mainHeader}>
            <div>
              <h1 className={styles.mainTitle}>{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className={styles.mainSub}>
                {activeTab === 'overview' && `Welcome back, ${user.name?.split(' ')[0] || 'there'}.`}
                {activeTab === 'projects' && 'Track your active and completed work.'}
                {activeTab === 'billing'  && 'View invoices and pay outstanding balances.'}
                {activeTab === 'support'  && "Need something? Send a message and we'll get back to you."}
                {activeTab === 'reports'  && 'Monthly performance and maintenance reports.'}
              </p>
            </div>
            <button className={styles.refreshBtn} onClick={fetchData} disabled={loadingData} title="Refresh">
              <FiRefreshCw size={16} className={loadingData ? styles.spinning : ''} />
            </button>
          </div>
        )}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statGrid}>
              {[
                { label: 'Active Projects',  value: activeProjects.length.toString(),    icon: <FiFileText />,   color: '#5b8df5' },
                { label: 'Open Tickets',     value: '0',                                  icon: <FiTool />,       color: '#4ade80' },
                { label: 'Pending Invoices', value: pendingInvoices.length.toString(),    icon: <FiCreditCard />, color: '#f97316' },
                { label: 'Amount Owed',      value: `$${(totalOwed / 100).toFixed(2)}`,  icon: <FiDollarSign />, color: '#facc15' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: color+'18', color }}>{icon}</div>
                  <div className={styles.statVal}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {projects.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Projects</h2>
                <div className={styles.projectList}>
                  {projects.slice(0, 3).map(p => {
                    const color   = p.status === 'completed' ? '#4ade80' : p.status === 'active' ? '#5b8df5' : '#facc15'
                    const svcName = getServiceName(p.service_id)
                    return (
                      <div key={p.id} className={styles.projectItem}>
                        <div className={styles.projectMeta}>
                          <span className={styles.projectName}>{p.name}</span>
                          <div className={styles.projectTags}>
                            {svcName && <span className={styles.svcBadge}>{svcName}</span>}
                            <span className={styles.projectStatus} style={{ color, background: color+'18', borderColor: color+'33' }}>
                              {p.status === 'completed' ? <FiCheckCircle size={11} /> : p.status === 'active' ? <FiClock size={11} /> : <FiAlertCircle size={11} />}
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <StageTracker stage={p.stage || 'discovery'} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {pendingInvoices.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Outstanding Invoices</h2>
                <div className={styles.invoiceList}>
                  {pendingInvoices.slice(0, 2).map(inv => (
                    <InvoiceCard key={inv.id} invoice={inv} onPaySuccess={fetchData} />
                  ))}
                </div>
                {pendingInvoices.length > 2 && (
                  <button className={styles.viewAll} onClick={() => setActiveTab('billing')}>
                    View all <FiArrowRight size={13} />
                  </button>
                )}
              </div>
            )}

            {projects.length === 0 && pendingInvoices.length === 0 && (
              <div className={styles.emptyState}>
                <FiGrid size={32} />
                <p>No active projects yet. Your dashboard will update as your project gets underway.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Projects ── */}
        {activeTab === 'projects' && (
          <div className={styles.tabContent}>
            {projects.length === 0 ? (
              <div className={styles.emptyState}><FiFileText size={32} /><p>No projects yet. Check back after your kickoff call.</p></div>
            ) : (
              <div className={styles.projectList}>
                {projects.map(p => {
                  const color   = p.status === 'completed' ? '#4ade80' : p.status === 'active' ? '#5b8df5' : '#facc15'
                  const svcName = getServiceName(p.service_id)
                  return (
                    <div key={p.id} className={`${styles.projectItem} ${styles.projectItemFull}`}>
                      <div className={styles.projectMeta}>
                        <span className={styles.projectName}>{p.name}</span>
                        <div className={styles.projectTags}>
                          {svcName && <span className={styles.svcBadge}>{svcName}</span>}
                          <span className={styles.projectStatus} style={{ color, background: color+'18', borderColor: color+'33' }}>
                            {p.status === 'completed' ? <FiCheckCircle size={11} /> : p.status === 'active' ? <FiClock size={11} /> : <FiAlertCircle size={11} />}
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {p.description && <p className={styles.projectDesc}>{p.description}</p>}
                      <StageTracker stage={p.stage || 'discovery'} />
                      {p.monthly_price_cents > 0 && (
                        <div className={styles.monthlyPriceNote}>
                          <FiCreditCard size={12} /> Monthly plan: ${(p.monthly_price_cents / 100).toFixed(2)}/mo
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Billing ── */}
        {activeTab === 'billing' && (
          <div className={styles.tabContent}>
            {invoices.length === 0 ? (
              <div className={styles.emptyState}><FiCreditCard size={32} /><p>No invoices yet.</p></div>
            ) : (
              <div className={styles.invoiceList}>
                {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} onPaySuccess={fetchData} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Support ── */}
        {activeTab === 'support' && (
          <div className={styles.tabContent}>
            <div className={styles.supportCard}>
              <FiMessageSquare size={28} className={styles.supportIcon} />
              <h2 className={styles.placeholderTitle}>Send a Message</h2>
              <p className={styles.placeholderBody}>
                For support requests, bug fixes, or content changes — fill this out
                and Jed will get back to you within one business day.
              </p>
              <SupportForm />
            </div>
          </div>
        )}

        {/* ── Reports ── */}
        {activeTab === 'reports' && (
          <div className={styles.tabContent}>
            <div className={styles.supportCard}>
              <FiBarChart2 size={28} className={styles.supportIcon} />
              <h2 className={styles.placeholderTitle}>Request a Report</h2>
              <p className={styles.placeholderBody}>
                Monthly performance and maintenance reports will appear here automatically.
                Until then, send a message to request one.
              </p>
              <SupportForm defaultMessage="Hi Jed, could you send over my latest monthly report?" />
            </div>
          </div>
        )}

        {/* ── Manage (Admin only) ── */}
        {activeTab === 'manage' && isAdmin && (
          <div>
            <div className={styles.mainHeader}>
              <div>
                <h1 className={styles.mainTitle}>Manage</h1>
                <p className={styles.mainSub}>View all client projects, create invoices, and manage accounts.</p>
              </div>
            </div>
            <AdminPanel />
          </div>
        )}
      </main>
    </div>
  )
}

// ── Page Entry ────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(data => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.portalRoot}>
        <div className={styles.loadingScreen}>
          <span className={styles.logoMark}>CWC</span>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.portalRoot}>
      {user
        ? <Dashboard user={user} onLogout={() => setUser(null)} />
        : <LoginForm onLogin={u => setUser(u)} />
      }
    </div>
  )
}
