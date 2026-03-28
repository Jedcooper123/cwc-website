// ─────────────────────────────────────────────────────────────────────────────
// PortalPage — Real client portal backed by Express + SQLite + JWT + Stripe.
//
// Auth:     httpOnly cookie set by /api/auth/login (survives page refresh).
// Payments: Stripe PaymentElement for one-time invoices.
//           Stripe Customer Portal for subscription management.
// Admin:    Jed sees a "Manage" tab: clients, projects, invoices, subscriptions.
// Mobile:   Collapsible drawer sidebar + bottom tab bar on small screens.
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
  FiExternalLink, FiCalendar, FiMenu, FiX, FiShield,
} from 'react-icons/fi'
import { SERVICES } from '../data/services'
import styles from './PortalPage.module.css'

// ── Stripe setup ───────────────────────────────────────────────────────────
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

const ALL_SERVICES = SERVICES

// Project stages
const STAGES = [
  { id: 'discovery',   label: 'Discovery'   },
  { id: 'design',      label: 'Design'      },
  { id: 'development', label: 'Development' },
  { id: 'review',      label: 'Review'      },
  { id: 'launched',    label: 'Launched'    },
]

// Progress percentage per stage (for the visual bar)
const STAGE_PROGRESS = {
  discovery:   10,
  design:      30,
  development: 60,
  review:      85,
  launched:    100,
}

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

// ── Support Form ───────────────────────────────────────────────────────────
function SupportForm({ defaultMessage = '', user }) {
  const [form,    setForm]    = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    message: defaultMessage,
  })
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

// ── Checkout Form (Stripe PaymentElement) ──────────────────────────────────
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

// ── Invoice Card ───────────────────────────────────────────────────────────
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
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#f97316', borderRadius: '10px', fontFamily: 'Helvetica Neue, Arial, sans-serif' } } }}>
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
        <span className={styles.invoiceStatus}
          style={{ color: statusColor, background: statusColor+'18', borderColor: statusColor+'33' }}>
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

// ── Subscription Plan Card (client billing tab) ────────────────────────────
function SubscriptionCard({ subscription, hasStripeCustomer }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const openBillingPortal = async () => {
    setLoading(true); setError('')
    try {
      const data = await apiFetch('/api/payments/billing-portal', { method: 'POST' })
      window.location.href = data.url
    } catch (err) { setError(err.message); setLoading(false) }
  }

  if (!subscription) {
    return (
      <div className={styles.subCard}>
        <div className={styles.subCardNoplan}>
          <FiCreditCard size={28} className={styles.subNoplanIcon} />
          <div>
            <div className={styles.subNoplanTitle}>No active subscription</div>
            <div className={styles.subNoplanBody}>
              Contact Jed to set up automatic monthly billing for your plan.
            </div>
          </div>
        </div>
        {error && <div className={styles.errorMsg} style={{marginTop:'1rem'}}><FiAlertCircle size={14}/> {error}</div>}
      </div>
    )
  }

  const statusColors = {
    active:     { color: '#4ade80', label: 'Active' },
    past_due:   { color: '#f97316', label: 'Past Due' },
    cancelled:  { color: '#6b7280', label: 'Cancelled' },
    trialing:   { color: '#a78bfa', label: 'Trial' },
    incomplete: { color: '#facc15', label: 'Incomplete' },
    unpaid:     { color: '#ef4444', label: 'Unpaid' },
  }
  const { color, label } = statusColors[subscription.status] || { color: '#5b8df5', label: subscription.status }

  const nextBilling = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const monthly = subscription.plan_price_cents > 0
    ? `$${(subscription.plan_price_cents / 100).toFixed(2)}/mo`
    : null

  return (
    <div className={styles.subCard}>
      <div className={styles.subCardHeader}>
        <div className={styles.subCardLeft}>
          <div className={styles.subCardIcon}><FiShield size={20} /></div>
          <div>
            <div className={styles.subCardPlan}>{subscription.plan_name}</div>
            <div className={styles.subCardMeta}>
              {monthly && <span>{monthly}</span>}
              <span
                className={styles.subStatusBadge}
                style={{ color, background: color+'18', borderColor: color+'33' }}
              >
                <span className={styles.subStatusDot} style={{ background: color }} />
                {label}
              </span>
            </div>
          </div>
        </div>
        {hasStripeCustomer && (
          <button
            className={`btn-secondary ${styles.manageBillingBtn}`}
            onClick={openBillingPortal}
            disabled={loading}
          >
            {loading ? 'Opening...' : 'Manage Billing'} {!loading && <FiExternalLink size={13} />}
          </button>
        )}
      </div>

      {nextBilling && subscription.status !== 'cancelled' && (
        <div className={styles.subCardNext}>
          <FiCalendar size={13} />
          <span>Next billing date: <strong>{nextBilling}</strong></span>
        </div>
      )}

      {subscription.status === 'past_due' && (
        <div className={styles.subAlert}>
          <FiAlertCircle size={14} />
          <span>Your payment is past due. Click <strong>Manage Billing</strong> to update your payment method.</span>
        </div>
      )}

      {error && <div className={styles.errorMsg} style={{marginTop:'1rem'}}><FiAlertCircle size={14}/> {error}</div>}
    </div>
  )
}

// ── Admin Panel ────────────────────────────────────────────────────────────
function AdminPanel() {
  const [clients,     setClients]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [section,     setSection]     = useState('all-projects')
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [editClient,  setEditClient]  = useState(null)
  const [subForm,        setSubForm]        = useState({ clientId: '', priceId: '', planName: '', planPriceDollars: '' })
  const [subLoading,     setSubLoading]     = useState(false)
  const [welcomeModal,   setWelcomeModal]   = useState(null)  // client object
  const [welcomePw,      setWelcomePw]      = useState('')
  const [welcomeLoading, setWelcomeLoading] = useState(false)

  const [allProjects,  setAllProjects]  = useState([])
  const [allInvoices,  setAllInvoices]  = useState([])
  const [loadingAll,   setLoadingAll]   = useState(false)
  const [stageEdit,    setStageEdit]    = useState({})
  const [sendingId,    setSendingId]    = useState(null)

  const [clientForm,  setClientForm]  = useState({ name: '', email: '', company: '', password: '' })
  const [projectForm, setProjectForm] = useState({ clientId: '', name: '', description: '', serviceId: '', monthlyPriceDollars: '', stage: 'discovery', status: 'active' })
  const [invoiceForm, setInvoiceForm] = useState({ clientId: '', serviceId: '', invoiceType: 'one-time', description: '', amountDollars: '', dueDate: '', notifyClient: true })
  const [editForm,    setEditForm]    = useState({ name: '', email: '', company: '' })

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
    try { const data = await apiFetch('/api/admin/projects'); setAllProjects(data.projects) }
    catch (err) { showMsg(err.message, true) }
    finally { setLoadingAll(false) }
  }, []) // eslint-disable-line

  const loadAllInvoices = useCallback(async () => {
    setLoadingAll(true)
    try { const data = await apiFetch('/api/admin/invoices'); setAllInvoices(data.invoices) }
    catch (err) { showMsg(err.message, true) }
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

  // ── Handlers ──────────────────────────────────────────────────────────────
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
          showMsg('Invoice created & client notified by email!')
        } catch {
          showMsg('Invoice created. (Email notification failed — check EMAIL_FROM/EMAIL_PASS env vars.)')
        }
      } else {
        showMsg('Invoice created. Client will see it when they log in.')
      }
      setInvoiceForm({ clientId: '', serviceId: '', invoiceType: 'one-time', description: '', amountDollars: '', dueDate: '', notifyClient: true })
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleCreateSubscription = async (e) => {
    e.preventDefault()
    if (!subForm.clientId || !subForm.priceId) return showMsg('Client and Stripe Price ID are required.', true)
    setSubLoading(true)
    try {
      const data = await apiFetch('/api/payments/create-subscription', { method: 'POST', body: JSON.stringify(subForm) })
      showMsg(`Subscription created! Status: ${data.status}`)
      setSubForm({ clientId: '', priceId: '', planName: '', planPriceDollars: '' })
    } catch (err) { showMsg(err.message, true) }
    finally { setSubLoading(false) }
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

  const handleSendWelcome = async () => {
    if (!welcomePw.trim()) return showMsg('Enter the password you set for this client.', true)
    setWelcomeLoading(true)
    try {
      await apiFetch(`/api/admin/clients/${welcomeModal.id}/welcome`, {
        method: 'POST',
        body: JSON.stringify({ tempPassword: welcomePw.trim() }),
      })
      showMsg(`Login info sent to ${welcomeModal.email}!`)
      setWelcomeModal(null)
      setWelcomePw('')
    } catch (err) { showMsg(err.message, true) }
    finally { setWelcomeLoading(false) }
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

  const tabs = [
    { id: 'all-projects',  label: 'Projects',       icon: <FiLayers />      },
    { id: 'all-invoices',  label: 'Invoices',        icon: <FiDollarSign />  },
    { id: 'clients',       label: 'Clients',         icon: <FiUsers />       },
    { id: 'subscriptions', label: 'Subscriptions',   icon: <FiCreditCard />  },
    { id: 'add-client',    label: 'Add Client',      icon: <FiUserPlus />    },
    { id: 'add-project',   label: 'Add Project',     icon: <FiFileText />    },
    { id: 'add-invoice',   label: 'Create Invoice',  icon: <FiPlusCircle />  },
  ]

  if (editClient) return (
    <div className={styles.adminPanel}>
      <button className={styles.adminBackBtn} onClick={() => setEditClient(null)}>← Back to Clients</button>
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

      {/* ── Welcome / Send Login Info modal ── */}
      {welcomeModal && (
        <div className={styles.modalOverlay} onClick={() => { setWelcomeModal(null); setWelcomePw('') }}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Send Login Info</h3>
            <p className={styles.modalBody}>
              This will email <strong>{welcomeModal.name}</strong> their portal login URL and password.
              Enter the password you set for them below.
            </p>
            <div className={styles.adminField} style={{ marginBottom: '1rem' }}>
              <label>Their Password</label>
              <input type="text" className={styles.adminInput} placeholder="The password you set..."
                value={welcomePw} onChange={e => setWelcomePw(e.target.value)}
                autoFocus />
            </div>
            <div className={styles.adminRow}>
              <button className="btn-primary" onClick={handleSendWelcome} disabled={welcomeLoading}>
                {welcomeLoading ? 'Sending...' : 'Send Email'} <FiSend size={13} />
              </button>
              <button className="btn-secondary" onClick={() => { setWelcomeModal(null); setWelcomePw('') }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin sub-nav ── */}
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

      {/* ── All Projects ── */}
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
            <div className={styles.emptyState}><FiLayers size={28} /><p>No projects yet.</p></div>
          ) : allProjects.map(p => {
            const svc      = ALL_SERVICES.find(s => s.id === p.service_id)
            const svcName  = svc ? (svc.shortTitle || svc.title) : null
            const stageVal = stageEdit[p.id] !== undefined ? stageEdit[p.id] : p.stage
            const isDirty  = stageEdit[p.id] !== undefined && stageEdit[p.id] !== p.stage
            const statusColor = p.status === 'active' ? '#6366f1' : p.status === 'completed' ? '#10b981' : '#f59e0b'

            return (
              <div key={p.id} className={styles.adminProjectCard}>
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
                <div className={styles.adminProjectName}>{p.name}</div>
                {p.description && <p className={styles.adminProjectDesc}>{p.description}</p>}
                <StageTracker stage={p.stage || 'discovery'} />
                {p.monthly_price_cents > 0 && (
                  <div className={styles.monthlyPriceNote}>
                    <FiCreditCard size={12} /> ${(p.monthly_price_cents / 100).toFixed(2)}/mo
                  </div>
                )}
                <div className={styles.adminProjectActions}>
                  <div className={styles.stageSelectWrap}>
                    <label className={styles.stageSelectLabel}>Stage:</label>
                    <select className={styles.adminInputSm} value={stageVal}
                      onChange={e => setStageEdit(s => ({ ...s, [p.id]: e.target.value }))}>
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    {isDirty && (
                      <button className={styles.stageSaveBtn} onClick={() => handleUpdateStage(p.id, stageEdit[p.id])}>
                        Save
                      </button>
                    )}
                  </div>
                  <button className={styles.actionBtn} onClick={() => handleQuickInvoice(p.client_id)}>
                    <FiDollarSign size={13} /> Invoice
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── All Invoices ── */}
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
            <div className={styles.emptyState}><FiDollarSign size={28} /><p>No invoices yet.</p></div>
          ) : allInvoices.map(inv => {
            const isPaid = inv.status === 'paid'
            const isVoid = inv.status === 'void'
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
                        disabled={sendingId === inv.id}>
                        <FiSend size={12} /> {sendingId === inv.id ? '...' : 'Email'}
                      </button>
                      <button className={styles.actionBtnDanger} onClick={() => handleVoidInvoice(inv.id)}>
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
                  <button className={styles.actionBtn}
                    onClick={() => { setWelcomeModal(c); setWelcomePw('') }}
                    title="Email this client their login info">
                    <FiMail size={12} /> Login Info
                  </button>
                  <button className={styles.remindBtn} onClick={() => handleRemindClient(c.id)}>
                    <FiSend size={12} /> Remind
                  </button>
                  <button className={styles.actionBtn} onClick={() => handleQuickInvoice(c.id)}>
                    <FiDollarSign size={12} /> Invoice
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Subscriptions (admin) ── */}
      {section === 'subscriptions' && (
        <div className={styles.allListSection}>
          <p className={styles.adminFormNote}>
            Create a Stripe subscription for a client. You'll need a <strong>Price ID</strong> from
            your <a href="https://dashboard.stripe.com/prices" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-lt)' }}>Stripe dashboard</a>.
            This creates the Stripe customer automatically, then bills them monthly.
          </p>
          <form className={styles.adminForm} onSubmit={handleCreateSubscription}>
            <div className={styles.adminRow}>
              <div className={styles.adminField}>
                <label>Client *</label>
                <select className={styles.adminInput}
                  value={subForm.clientId}
                  onChange={e => setSubForm(f => ({...f, clientId: e.target.value}))}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className={styles.adminField}>
                <label>Stripe Price ID *</label>
                <input type="text" placeholder="price_1ABC..." className={styles.adminInput}
                  value={subForm.priceId}
                  onChange={e => setSubForm(f => ({...f, priceId: e.target.value}))} />
              </div>
            </div>
            <div className={styles.adminRow}>
              <div className={styles.adminField}>
                <label>Plan Display Name</label>
                <input type="text" placeholder="e.g. Basic Maintenance" className={styles.adminInput}
                  value={subForm.planName}
                  onChange={e => setSubForm(f => ({...f, planName: e.target.value}))} />
              </div>
              <div className={styles.adminField}>
                <label>Monthly Price (for display)</label>
                <input type="number" placeholder="50.00" min="0" step="0.01" className={styles.adminInput}
                  value={subForm.planPriceDollars}
                  onChange={e => setSubForm(f => ({...f, planPriceDollars: e.target.value}))} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={subLoading}>
              {subLoading ? 'Creating...' : 'Create Subscription'} <FiCreditCard size={14} />
            </button>
          </form>
        </div>
      )}

      {/* ── Add Client ── */}
      {section === 'add-client' && (
        <form className={styles.adminForm} onSubmit={handleAddClient}>
          <p className={styles.adminFormNote}>
            Fill this out for each new client. They log in at <strong>/portal</strong> with their email and temp password.
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
              <select className={styles.adminInput} value={projectForm.clientId}
                onChange={e => setProjectForm(f => ({...f, clientId: e.target.value}))}>
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Service</label>
              <select className={styles.adminInput} value={projectForm.serviceId}
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
                value={projectForm.name} onChange={e => setProjectForm(f => ({...f, name: e.target.value}))} />
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
              <select className={styles.adminInput} value={projectForm.stage}
                onChange={e => setProjectForm(f => ({...f, stage: e.target.value}))}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Status</label>
              <select className={styles.adminInput} value={projectForm.status}
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
            Create an invoice for a client. They pay it via card directly in the portal.
          </p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client *</label>
              <select className={styles.adminInput} value={invoiceForm.clientId}
                onChange={e => setInvoiceForm(f => ({...f, clientId: e.target.value}))}>
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Invoice Type</label>
              <select className={styles.adminInput} value={invoiceForm.invoiceType}
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
              <select className={styles.adminInput} value={invoiceForm.serviceId}
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
        <div className={styles.loginLogo}><span className={styles.logoMark}>L</span></div>
        <h1 className={styles.loginTitle}>Client Portal</h1>
        <p className={styles.loginSub}>Sign in to view your projects, invoices, and billing.</p>

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
            <label className={styles.label} htmlFor="password">Password</label>
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
          Not a Launchpad client yet?{' '}
          <Link to="/contact" className={styles.loginFooterLink}>Get in touch →</Link>
        </p>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [activeTab,    setActiveTab]    = useState('overview')
  const [projects,     setProjects]     = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [billing,      setBilling]      = useState({ subscription: null, hasStripeCustomer: false })
  const [loadingData,  setLoadingData]  = useState(false)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [pData, iData, bData] = await Promise.all([
        apiFetch('/api/portal/projects'),
        apiFetch('/api/portal/invoices'),
        apiFetch('/api/portal/billing'),
      ])
      setProjects(pData.projects)
      setInvoices(iData.invoices)
      setBilling(bData)
    } catch (err) { console.error('Failed to load portal data:', err.message) }
    finally { setLoadingData(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }) } catch {}
    onLogout()
  }

  const navigate = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
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

  // Tabs shown in mobile bottom bar (5 max)
  const mobileBottomTabs = isAdmin
    ? [clientTabs[0], clientTabs[1], clientTabs[2], clientTabs[3], adminTabs[0]]
    : clientTabs

  const tabSubtitle = {
    overview: `Welcome back, ${user.name?.split(' ')[0] || 'there'}.`,
    projects: 'Track your active and completed work.',
    billing:  'Manage your plan, invoices, and payment methods.',
    support:  "Need something? Send a message and we'll get back to you.",
    reports:  'Monthly performance and maintenance reports.',
    manage:   'View all client projects, create invoices, and manage accounts.',
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sideTop}>
          <div className={styles.sideLogoWrap}>
            <span className={styles.logoMark}>L</span>
            <div>
              <div className={styles.sideLogoTitle}>Client Portal</div>
              <div className={styles.sideLogoSub}>Launchpad Web Consulting</div>
            </div>
          </div>
          <button className={styles.sideCloseBtn} onClick={() => setSidebarOpen(false)}>
            <FiX size={18} />
          </button>
        </div>
        <nav className={styles.sideNav}>
          {tabs.map(({ id, label, icon }) => (
            <button key={id}
              className={`${styles.sideNavItem} ${activeTab === id ? styles.sideNavActive : ''} ${id === 'manage' ? styles.adminNavItem : ''}`}
              onClick={() => navigate(id)}>
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

      {/* ── Main content ── */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainHeaderLeft}>
            {/* Hamburger for mobile */}
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className={styles.mainTitle}>{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className={styles.mainSub}>{tabSubtitle[activeTab]}</p>
            </div>
          </div>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loadingData} title="Refresh">
            <FiRefreshCw size={16} className={loadingData ? styles.spinning : ''} />
          </button>
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Welcome banner */}
            <div className={styles.welcomeBanner}>
              <div>
                <p className={styles.welcomeName}>
                  Welcome back, <span className={styles.welcomeOrangeText}>{user.name?.split(' ')[0] || 'there'}</span>.
                </p>
                <p className={styles.welcomeSub}>
                  {activeProjects.length > 0
                    ? `You have ${activeProjects.length} active project${activeProjects.length > 1 ? 's' : ''} in progress.`
                    : 'Your dashboard is ready — projects will appear here when work begins.'}
                </p>
              </div>
              <span className={styles.logoMark} style={{ flexShrink: 0 }}>L</span>
            </div>

            <div className={styles.statGrid}>
              {[
                { label: 'Active Projects',  value: activeProjects.length.toString(),   icon: <FiFileText />,   color: '#6366f1' },
                { label: 'Open Tickets',     value: '0',                                 icon: <FiTool />,       color: '#10b981' },
                { label: 'Pending Invoices', value: pendingInvoices.length.toString(),   icon: <FiCreditCard />, color: '#f97316' },
                { label: 'Amount Owed',      value: `$${(totalOwed/100).toFixed(2)}`,    icon: <FiDollarSign />, color: '#f59e0b' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: color+'15', color }}>{icon}</div>
                  <div className={styles.statVal}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Subscription status chip on overview */}
            {billing.subscription && (
              <div className={styles.overviewSubChip} onClick={() => navigate('billing')} role="button">
                <FiShield size={14} />
                <span>{billing.subscription.plan_name}</span>
                <span className={styles.overviewSubStatus}
                  style={{
                    color: billing.subscription.status === 'active' ? '#4ade80' : '#f97316',
                  }}>
                  {billing.subscription.status === 'active' ? 'Active' : billing.subscription.status}
                </span>
                <FiArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </div>
            )}

            {projects.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Projects</h2>
                  <button className={styles.viewAll} onClick={() => navigate('projects')}>
                    View all <FiArrowRight size={12} />
                  </button>
                </div>
                <div className={styles.projectList}>
                  {projects.slice(0, 3).map(p => {
                    const color   = p.status === 'completed' ? '#10b981' : p.status === 'active' ? '#6366f1' : '#f59e0b'
                    const svcName = getServiceName(p.service_id)
                    const pct     = p.status === 'completed' ? 100 : (STAGE_PROGRESS[p.stage] || 10)
                    return (
                      <div key={p.id} className={styles.projectItem}>
                        <div className={styles.projectMeta}>
                          <span className={styles.projectName}>{p.name}</span>
                          <div className={styles.projectTags}>
                            {svcName && <span className={styles.svcBadge}>{svcName}</span>}
                            <span className={styles.projectStatus} style={{ color, background: color+'15', borderColor: color+'30' }}>
                              {p.status === 'completed' ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.projectProgressRow}>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={styles.progressPct}>{pct}%</span>
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
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Outstanding Invoices</h2>
                  <button className={styles.viewAll} onClick={() => navigate('billing')}>
                    View all <FiArrowRight size={12} />
                  </button>
                </div>
                <div className={styles.invoiceList}>
                  {pendingInvoices.slice(0, 2).map(inv => (
                    <InvoiceCard key={inv.id} invoice={inv} onPaySuccess={fetchData} />
                  ))}
                </div>
              </div>
            )}

            {projects.length === 0 && pendingInvoices.length === 0 && !billing.subscription && (
              <div className={styles.emptyState}>
                <FiGrid size={32} />
                <p>Your dashboard will populate once your project begins. Reach out if you have any questions.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Projects ── */}
        {activeTab === 'projects' && (
          <div className={styles.tabContent}>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <FiFileText size={32} />
                <p>No projects yet. Your project tracker will populate once your work begins.</p>
              </div>
            ) : (
              <div className={styles.projectList}>
                {projects.map(p => {
                  const color   = p.status === 'completed' ? '#10b981' : p.status === 'active' ? '#6366f1' : '#f59e0b'
                  const svcName = getServiceName(p.service_id)
                  const pct     = p.status === 'completed' ? 100 : (STAGE_PROGRESS[p.stage] || 10)
                  return (
                    <div key={p.id} className={`${styles.projectItem} ${styles.projectItemFull}`}>
                      <div className={styles.projectMeta}>
                        <span className={styles.projectName}>{p.name}</span>
                        <div className={styles.projectTags}>
                          {svcName && <span className={styles.svcBadge}>{svcName}</span>}
                          <span className={styles.projectStatus} style={{ color, background: color+'15', borderColor: color+'30' }}>
                            {p.status === 'completed' ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {p.description && <p className={styles.projectDesc}>{p.description}</p>}
                      <div className={styles.projectProgressRow}>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.progressPct}>{pct}%</span>
                      </div>
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
            {/* Subscription card at top */}
            <SubscriptionCard
              subscription={billing.subscription}
              hasStripeCustomer={billing.hasStripeCustomer}
            />

            {/* Invoice list below */}
            <div className={styles.section} style={{ marginTop: '1.5rem' }}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Invoices {invoices.length > 0 && `(${invoices.length})`}
                </h2>
                {invoices.filter(i => i.status === 'pending').length > 0 && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
                    textTransform: 'uppercase', background: 'rgba(249,115,22,0.1)',
                    color: '#f97316', border: '1px solid rgba(249,115,22,0.2)',
                    borderRadius: '100px', padding: '0.2rem 0.6rem',
                  }}>
                    {invoices.filter(i => i.status === 'pending').length} pending
                  </span>
                )}
              </div>
              {invoices.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiFileText size={28} /><p>No invoices yet. Invoices will appear here when created.</p>
                </div>
              ) : (
                <div className={styles.invoiceList}>
                  {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} onPaySuccess={fetchData} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Support ── */}
        {activeTab === 'support' && (
          <div className={styles.tabContent}>
            <div className={styles.supportCard}>
              <FiMessageSquare size={26} className={styles.supportIcon} />
              <h2 className={styles.placeholderTitle}>Send a Support Request</h2>
              <p className={styles.placeholderBody}>
                Need a content change, have a bug, or just want to check in?
                Send a message and Jed will respond within one business day.
              </p>
              <SupportForm user={user} />
            </div>
          </div>
        )}

        {/* ── Reports ── */}
        {activeTab === 'reports' && (
          <div className={styles.tabContent}>
            <div className={styles.supportCard}>
              <FiBarChart2 size={26} className={styles.supportIcon} />
              <h2 className={styles.placeholderTitle}>Request a Report</h2>
              <p className={styles.placeholderBody}>
                Monthly performance reports will appear here automatically as your project
                matures. You can also request one manually at any time.
              </p>
              <SupportForm user={user} defaultMessage="Hi Jed, could you send over my latest monthly report?" />
            </div>
          </div>
        )}

        {/* ── Manage (Admin only) ── */}
        {activeTab === 'manage' && isAdmin && <AdminPanel />}

        {/* ── Mobile bottom tab bar ── */}
        <nav className={styles.mobileBottomNav}>
          {mobileBottomTabs.map(({ id, label, icon }) => (
            <button key={id}
              className={`${styles.mobileNavItem} ${activeTab === id ? styles.mobileNavActive : ''}`}
              onClick={() => navigate(id)}>
              <span className={styles.mobileNavIcon}>{icon}</span>
              <span className={styles.mobileNavLabel}>{label}</span>
            </button>
          ))}
        </nav>
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
          <span className={styles.logoMark}>L</span>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading your portal…</p>
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
