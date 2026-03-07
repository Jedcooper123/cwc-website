// ─────────────────────────────────────────────────────────────────────────────
// PortalPage — Client portal with a login screen and a mock dashboard.
// Uses React state for auth. Replace with real auth (JWT/session) on backend.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight,
  FiGrid, FiFileText, FiTool, FiCreditCard, FiBarChart2,
  FiCheckCircle, FiClock, FiAlertCircle, FiLogOut, FiPlus,
} from 'react-icons/fi'
import styles from './PortalPage.module.css'

// ── Mock dashboard data (replace with API calls) ──────────────────────────
const MOCK_PROJECTS = [
  { name: 'Main Website Redesign', status: 'In Progress',  pct: 65, color: '#5b8df5' },
  { name: 'Performance Audit',     status: 'Completed',    pct: 100, color: '#4ade80' },
  { name: 'Monthly Maintenance',   status: 'Scheduled',    pct: 0,   color: '#facc15' },
]

const MOCK_ACTIVITY = [
  { icon: <FiCheckCircle />, color: '#4ade80', text: 'Performance audit report delivered',        time: '2 days ago'  },
  { icon: <FiTool />,        color: '#5b8df5', text: 'SSL certificate renewed automatically',     time: '5 days ago'  },
  { icon: <FiFileText />,    color: '#facc15', text: 'Monthly maintenance report ready',          time: '1 week ago'  },
  { icon: <FiCheckCircle />, color: '#4ade80', text: 'Uptime: 99.97% — no incidents this month', time: '2 weeks ago' },
]

// ── Login Form Component ───────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }

    setLoading(true)
    // Simulate API call — replace with real auth endpoint
    setTimeout(() => {
      // Demo credentials: any email + password "cwc2025"
      if (password === 'cwc2025') {
        onLogin(email)
      } else {
        setError('Incorrect email or password. (Demo: use password "cwc2025")')
      }
      setLoading(false)
    }, 900)
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        {/* Logo */}
        <div className={styles.loginLogo}>
          <span className={styles.logoMark}>CWC</span>
        </div>

        <h1 className={styles.loginTitle}>Client Portal</h1>
        <p className={styles.loginSub}>Sign in to view your projects, reports, and billing.</p>

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.inputIcon} size={15} />
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Password</label>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
            </div>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} size={15} />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.showPw}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMsg}>
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary ${styles.signInBtn}`}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
            {!loading && <FiArrowRight size={14} />}
          </button>
        </form>

        <p className={styles.loginFooter}>
          Not a CWC client yet?{' '}
          <Link to="/#contact" className={styles.loginFooterLink}>Get in touch →</Link>
        </p>
      </div>

      <p className={styles.demoNote}>
        Demo mode · use any email and password <strong>cwc2025</strong>
      </p>
    </div>
  )
}

// ── Dashboard Component ───────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview',        icon: <FiGrid />      },
    { id: 'projects', label: 'Projects',         icon: <FiFileText />  },
    { id: 'support',  label: 'Support',           icon: <FiTool />      },
    { id: 'billing',  label: 'Billing',           icon: <FiCreditCard />},
    { id: 'reports',  label: 'Reports',           icon: <FiBarChart2 />},
  ]

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
            <button
              key={id}
              className={`${styles.sideNavItem} ${activeTab === id ? styles.sideNavActive : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <span className={styles.sideNavIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.sideBottom}>
          <div className={styles.sideUser}>
            <div className={styles.avatar}>{user[0].toUpperCase()}</div>
            <div className={styles.sideUserInfo}>
              <div className={styles.sideUserEmail}>{user}</div>
              <div className={styles.sideUserRole}>Client</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.mainHeader}>
          <div>
            <h1 className={styles.mainTitle}>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'projects' && 'Projects'}
              {activeTab === 'support'  && 'Support'}
              {activeTab === 'billing'  && 'Billing'}
              {activeTab === 'reports'  && 'Reports'}
            </h1>
            <p className={styles.mainSub}>
              {activeTab === 'overview' && "Here's a snapshot of your account."}
              {activeTab === 'projects' && 'Track your active and completed work.'}
              {activeTab === 'support'  && 'Submit and track support requests.'}
              {activeTab === 'billing'  && 'View invoices and payment history.'}
              {activeTab === 'reports'  && 'Monthly performance and maintenance reports.'}
            </p>
          </div>
          {activeTab === 'support' && (
            <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <FiPlus size={14} /> New Request
            </button>
          )}
        </div>

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Stat cards */}
            <div className={styles.statGrid}>
              {[
                { label: 'Active Projects', value: '1', icon: <FiFileText />, color: '#5b8df5' },
                { label: 'Open Tickets',    value: '0', icon: <FiTool />,     color: '#4ade80' },
                { label: 'Uptime (30d)',    value: '99.97%', icon: <FiBarChart2 />, color: '#facc15' },
                { label: 'Next Invoice',    value: 'Mar 28', icon: <FiCreditCard />, color: '#f97316' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: color + '18', color }}>{icon}</div>
                  <div className={styles.statVal}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Current Projects</h2>
              <div className={styles.projectList}>
                {MOCK_PROJECTS.map(({ name, status, pct, color }) => (
                  <div key={name} className={styles.projectItem}>
                    <div className={styles.projectMeta}>
                      <span className={styles.projectName}>{name}</span>
                      <span
                        className={styles.projectStatus}
                        style={{
                          color,
                          background: color + '18',
                          borderColor: color + '33',
                        }}
                      >
                        {status === 'Completed' && <FiCheckCircle size={11} />}
                        {status === 'In Progress' && <FiClock size={11} />}
                        {status === 'Scheduled' && <FiAlertCircle size={11} />}
                        {status}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className={styles.progressPct}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              <div className={styles.activityList}>
                {MOCK_ACTIVITY.map(({ icon, color, text, time }, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityIcon} style={{ background: color + '18', color }}>
                      {icon}
                    </div>
                    <div className={styles.activityBody}>
                      <span className={styles.activityText}>{text}</span>
                      <span className={styles.activityTime}>{time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Placeholder tabs ── */}
        {activeTab !== 'overview' && (
          <div className={styles.placeholderTab}>
            <div className={styles.placeholderIcon}>🚧</div>
            <h2 className={styles.placeholderTitle}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} — Coming Soon
            </h2>
            <p className={styles.placeholderBody}>
              This section of the client portal is under development. Contact CWC
              directly for project updates, billing, or support requests in the
              meantime.
            </p>
            <Link to="/#contact" className="btn-primary">
              Contact CWC <FiArrowRight />
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Page Entry ────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [user, setUser] = useState(null)

  return (
    <div className={styles.portalRoot}>
      {user
        ? <Dashboard user={user} onLogout={() => setUser(null)} />
        : <LoginForm onLogin={(email) => setUser(email)} />
      }
    </div>
  )
}
