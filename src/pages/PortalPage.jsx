// ─────────────────────────────────────────────────────────────────────────────
// PortalPage — Real client portal backed by Express + SQLite + JWT + Stripe.
//
// Auth:     httpOnly cookie set by /api/auth/login (survives page refresh).
// Payments: Stripe PaymentElement — clients pay invoices directly in the portal.
// Admin:    Jed sees an extra "Manage" tab to create clients, projects, invoices.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight,
  FiGrid, FiFileText, FiTool, FiCreditCard, FiBarChart2,
  FiCheckCircle, FiClock, FiAlertCircle, FiLogOut,
  FiDollarSign, FiRefreshCw, FiUsers, FiUserPlus,
  FiPlusCircle, FiChevronDown, FiChevronUp,
} from 'react-icons/fi'
import styles from './PortalPage.module.css'

// ── Stripe setup ──────────────────────────────────────────────────────────
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

// ── API helpers ────────────────────────────────────────────────────────────
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

// ── CheckoutForm — Stripe PaymentElement ──────────────────────────────────
function CheckoutForm({ invoice, onSuccess, onCancel }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
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

// ── Invoice Card ────────────────────────────────────────────────────────────
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

  const amount = `$${(invoice.amount_cents / 100).toFixed(2)}`
  const isPaid = invoice.status === 'paid'
  const isVoid = invoice.status === 'void'
  const statusColor = isPaid ? '#4ade80' : isVoid ? '#6b7280' : '#f97316'

  if (paying && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
        <CheckoutForm invoice={invoice} onSuccess={() => { setPaying(false); onPaySuccess() }} onCancel={() => setPaying(false)} />
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

// ── Admin Panel ─────────────────────────────────────────────────────────────
function AdminPanel() {
  const [clients,      setClients]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [section,      setSection]      = useState('clients') // 'clients' | 'add-client' | 'add-project' | 'add-invoice'
  const [success,      setSuccess]      = useState('')
  const [error,        setError]        = useState('')
  const [submitting,   setSubmitting]   = useState(false)

  // Forms
  const [clientForm,  setClientForm]  = useState({ name: '', email: '', company: '', password: '' })
  const [projectForm, setProjectForm] = useState({ clientId: '', name: '', description: '', status: 'active', progress: 0 })
  const [invoiceForm, setInvoiceForm] = useState({ clientId: '', description: '', amountDollars: '', dueDate: '' })

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/clients')
      setClients(data.clients)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg)
    setTimeout(() => { setSuccess(''); setError('') }, 4000)
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    if (!clientForm.name || !clientForm.email || !clientForm.password) {
      return showMsg('Name, email, and password are required.', true)
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/clients', { method: 'POST', body: JSON.stringify(clientForm) })
      showMsg(`Client "${clientForm.name}" created! Their login: ${clientForm.email} / ${clientForm.password}`)
      setClientForm({ name: '', email: '', company: '', password: '' })
      setSection('clients')
      loadClients()
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!projectForm.clientId || !projectForm.name) {
      return showMsg('Select a client and enter a project name.', true)
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/projects', { method: 'POST', body: JSON.stringify(projectForm) })
      showMsg('Project added successfully.')
      setProjectForm({ clientId: '', name: '', description: '', status: 'active', progress: 0 })
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const handleAddInvoice = async (e) => {
    e.preventDefault()
    if (!invoiceForm.clientId || !invoiceForm.description || !invoiceForm.amountDollars) {
      return showMsg('Select a client, enter a description, and enter an amount.', true)
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/invoices', { method: 'POST', body: JSON.stringify(invoiceForm) })
      showMsg('Invoice created. The client will see it in their portal.')
      setInvoiceForm({ clientId: '', description: '', amountDollars: '', dueDate: '' })
    } catch (err) { showMsg(err.message, true) }
    finally { setSubmitting(false) }
  }

  const tabs = [
    { id: 'clients',     label: 'All Clients',    icon: <FiUsers /> },
    { id: 'add-client',  label: 'Add Client',      icon: <FiUserPlus /> },
    { id: 'add-project', label: 'Add Project',     icon: <FiFileText /> },
    { id: 'add-invoice', label: 'Create Invoice',  icon: <FiDollarSign /> },
  ]

  return (
    <div className={styles.adminPanel}>
      {/* Sub-navigation */}
      <div className={styles.adminNav}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`${styles.adminNavBtn} ${section === t.id ? styles.adminNavActive : ''}`}
            onClick={() => setSection(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Status messages */}
      {success && <div className={styles.successMsg}><FiCheckCircle size={14} /> {success}</div>}
      {error   && <div className={styles.errorMsg}><FiAlertCircle size={14} /> {error}</div>}

      {/* ── All Clients ── */}
      {section === 'clients' && (
        <div className={styles.clientList}>
          {loading ? (
            <p className={styles.loadingText}>Loading clients...</p>
          ) : clients.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUsers size={28} />
              <p>No clients yet. Use "Add Client" to create the first one.</p>
            </div>
          ) : (
            clients.map(c => (
              <div key={c.id} className={styles.clientCard}>
                <div className={styles.avatar} style={{ width: 38, height: 38, fontSize: '0.9rem' }}>
                  {c.name[0].toUpperCase()}
                </div>
                <div className={styles.clientInfo}>
                  <div className={styles.clientName}>{c.name}</div>
                  <div className={styles.clientMeta}>{c.email}{c.company ? ` · ${c.company}` : ''}</div>
                </div>
                <span className={styles.clientSince}>Since {new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Add Client ── */}
      {section === 'add-client' && (
        <form className={styles.adminForm} onSubmit={handleAddClient}>
          <p className={styles.adminFormNote}>
            Fill this out for each new client. Send them their email and password separately.
            They can log in at <strong>/portal</strong>.
          </p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client Name *</label>
              <input
                type="text" placeholder="Jane Smith"
                value={clientForm.name}
                onChange={e => setClientForm(f => ({...f, name: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
            <div className={styles.adminField}>
              <label>Email *</label>
              <input
                type="email" placeholder="jane@theirbusiness.com"
                value={clientForm.email}
                onChange={e => setClientForm(f => ({...f, email: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Company / Business</label>
              <input
                type="text" placeholder="Their Business Name (optional)"
                value={clientForm.company}
                onChange={e => setClientForm(f => ({...f, company: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
            <div className={styles.adminField}>
              <label>Temporary Password *</label>
              <input
                type="text" placeholder="e.g. Welcome2025!"
                value={clientForm.password}
                onChange={e => setClientForm(f => ({...f, password: e.target.value}))}
                className={styles.adminInput}
              />
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
          <p className={styles.adminFormNote}>Add a project to a client's dashboard so they can track progress.</p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client *</label>
              <select
                value={projectForm.clientId}
                onChange={e => setProjectForm(f => ({...f, clientId: e.target.value}))}
                className={styles.adminInput}
              >
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Project Name *</label>
              <input
                type="text" placeholder="e.g. Main Website Build"
                value={projectForm.name}
                onChange={e => setProjectForm(f => ({...f, name: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
          </div>
          <div className={styles.adminField} style={{ marginBottom: '1rem' }}>
            <label>Description (optional)</label>
            <textarea
              rows={2} placeholder="Brief description visible to the client..."
              value={projectForm.description}
              onChange={e => setProjectForm(f => ({...f, description: e.target.value}))}
              className={styles.adminInput}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Status</label>
              <select
                value={projectForm.status}
                onChange={e => setProjectForm(f => ({...f, status: e.target.value}))}
                className={styles.adminInput}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Progress: {projectForm.progress}%</label>
              <input
                type="range" min="0" max="100" step="5"
                value={projectForm.progress}
                onChange={e => setProjectForm(f => ({...f, progress: parseInt(e.target.value)}))}
                className={styles.adminRange}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Project'} <FiPlusCircle size={14} />
          </button>
        </form>
      )}

      {/* ── Add Invoice ── */}
      {section === 'add-invoice' && (
        <form className={styles.adminForm} onSubmit={handleAddInvoice}>
          <p className={styles.adminFormNote}>
            Create an invoice for a client. They can pay it directly in their portal using a card.
            You'll get paid to your Stripe account.
          </p>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Client *</label>
              <select
                value={invoiceForm.clientId}
                onChange={e => setInvoiceForm(f => ({...f, clientId: e.target.value}))}
                className={styles.adminInput}
              >
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className={styles.adminField}>
              <label>Amount (USD) *</label>
              <input
                type="number" placeholder="350.00" min="1" step="0.01"
                value={invoiceForm.amountDollars}
                onChange={e => setInvoiceForm(f => ({...f, amountDollars: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
          </div>
          <div className={styles.adminRow}>
            <div className={styles.adminField}>
              <label>Description *</label>
              <input
                type="text" placeholder="e.g. Website Design & Development — Essentials Package"
                value={invoiceForm.description}
                onChange={e => setInvoiceForm(f => ({...f, description: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
            <div className={styles.adminField}>
              <label>Due Date (optional)</label>
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={e => setInvoiceForm(f => ({...f, dueDate: e.target.value}))}
                className={styles.adminInput}
              />
            </div>
          </div>
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

// ── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [projects,  setProjects]  = useState([])
  const [invoices,  setInvoices]  = useState([])
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

  const clientTabs = [
    { id: 'overview',  label: 'Overview',  icon: <FiGrid />       },
    { id: 'projects',  label: 'Projects',  icon: <FiFileText />   },
    { id: 'billing',   label: 'Billing',   icon: <FiCreditCard /> },
    { id: 'support',   label: 'Support',   icon: <FiTool />       },
    { id: 'reports',   label: 'Reports',   icon: <FiBarChart2 />  },
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
              onClick={() => setActiveTab(id)}
            >
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
                {activeTab === 'support'  && 'Need help? Reach out directly.'}
                {activeTab === 'reports'  && 'Monthly performance and maintenance reports.'}
              </p>
            </div>
            {activeTab !== 'manage' && (
              <button className={styles.refreshBtn} onClick={fetchData} disabled={loadingData} title="Refresh">
                <FiRefreshCw size={16} className={loadingData ? styles.spinning : ''} />
              </button>
            )}
          </div>
        )}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statGrid}>
              {[
                { label: 'Active Projects',  value: activeProjects.length.toString(),       icon: <FiFileText />,  color: '#5b8df5' },
                { label: 'Open Tickets',     value: '0',                                    icon: <FiTool />,      color: '#4ade80' },
                { label: 'Pending Invoices', value: pendingInvoices.length.toString(),      icon: <FiCreditCard />, color: '#f97316' },
                { label: 'Amount Owed',      value: `$${(totalOwed / 100).toFixed(2)}`,    icon: <FiDollarSign />, color: '#facc15' },
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
                  {projects.slice(0, 3).map(({ id, name, status, progress }) => {
                    const color = status === 'completed' ? '#4ade80' : status === 'active' ? '#5b8df5' : '#facc15'
                    return (
                      <div key={id} className={styles.projectItem}>
                        <div className={styles.projectMeta}>
                          <span className={styles.projectName}>{name}</span>
                          <span className={styles.projectStatus} style={{ color, background: color+'18', borderColor: color+'33' }}>
                            {status === 'completed' && <FiCheckCircle size={11} />}
                            {status === 'active'    && <FiClock size={11} />}
                            {status === 'paused'    && <FiAlertCircle size={11} />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${progress}%`, background: color }} />
                        </div>
                        <span className={styles.progressPct}>{progress}%</span>
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
                {projects.map(({ id, name, description, status, progress }) => {
                  const color = status === 'completed' ? '#4ade80' : status === 'active' ? '#5b8df5' : '#facc15'
                  return (
                    <div key={id} className={`${styles.projectItem} ${styles.projectItemFull}`}>
                      <div className={styles.projectMeta}>
                        <span className={styles.projectName}>{name}</span>
                        <span className={styles.projectStatus} style={{ color, background: color+'18', borderColor: color+'33' }}>
                          {status === 'completed' && <FiCheckCircle size={11} />}
                          {status === 'active'    && <FiClock size={11} />}
                          {status === 'paused'    && <FiAlertCircle size={11} />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      {description && <p className={styles.projectDesc}>{description}</p>}
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%`, background: color }} />
                      </div>
                      <span className={styles.progressPct}>{progress}% complete</span>
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
          <div className={styles.placeholderTab}>
            <FiTool size={32} />
            <h2 className={styles.placeholderTitle}>Need something?</h2>
            <p className={styles.placeholderBody}>
              For support requests, bug reports, or changes, just reach out directly. I typically respond within one business day.
            </p>
            <a href="mailto:jedpcooper@gmail.com" className="btn-primary">Email Jed <FiArrowRight size={14} /></a>
          </div>
        )}

        {/* ── Reports ── */}
        {activeTab === 'reports' && (
          <div className={styles.placeholderTab}>
            <FiBarChart2 size={32} />
            <h2 className={styles.placeholderTitle}>Reports coming soon.</h2>
            <p className={styles.placeholderBody}>
              Monthly performance and maintenance reports will appear here. Contact CWC for an update in the meantime.
            </p>
            <a href="mailto:jedpcooper@gmail.com" className="btn-primary">Request a Report <FiArrowRight size={14} /></a>
          </div>
        )}

        {/* ── Admin: Manage (only shown to admin) ── */}
        {activeTab === 'manage' && isAdmin && (
          <div>
            <div className={styles.mainHeader}>
              <div>
                <h1 className={styles.mainTitle}>Manage</h1>
                <p className={styles.mainSub}>Create client accounts, add projects, and send invoices.</p>
              </div>
            </div>
            <AdminPanel />
          </div>
        )}
      </main>
    </div>
  )
}

// ── Page Entry ─────────────────────────────────────────────────────────────
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
