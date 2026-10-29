// ─────────────────────────────────────────────────────────────────────────────
// PortalPage — Client portal + owner admin, backed by the Express API.
//
// /portal               → sign in, then the client or admin dashboard
// /portal/set-password  → invite / reset links land here
//
// Session is an httpOnly cookie, so a refresh keeps you signed in. The active
// tab lives in ?tab= so links open the right view.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FiCreditCard, FiGrid, FiHome, FiInbox, FiLogOut, FiUser, FiUsers,
} from 'react-icons/fi'
import { api, firstName } from '../portal/api'
import { cx, Spinner, useToast } from '../portal/ui'
import { LoginScreen, SetPasswordScreen } from '../portal/AuthScreens'
import ClientDashboard from '../portal/ClientDashboard'
import AdminDashboard  from '../portal/AdminDashboard'
import s from '../portal/Portal.module.css'

const CLIENT_TABS = [
  { id: 'home',     label: 'Home',     icon: FiHome },
  { id: 'requests', label: 'Requests', icon: FiInbox },
  { id: 'billing',  label: 'Billing',  icon: FiCreditCard },
  { id: 'account',  label: 'Account',  icon: FiUser },
]
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'clients',  label: 'Clients',  icon: FiUsers },
  { id: 'requests', label: 'Requests', icon: FiInbox },
]

export default function PortalPage() {
  const { pathname } = useLocation()
  const [user, setUser]       = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Client Portal | Launchpad Web Consulting'
    api('/api/auth/me').then(d => setUser(d.user)).catch(() => {}).finally(() => setChecking(false))
    return () => { document.title = previousTitle }
  }, [])

  let body
  if (pathname.startsWith('/portal/set-password')) body = <SetPasswordScreen onLogin={setUser} />
  else if (checking) body = <Spinner />
  else if (!user)    body = <LoginScreen onLogin={setUser} />
  else               body = <Shell user={user} setUser={setUser} />

  return <div className={s.portal}>{body}</div>
}

function Shell({ user, setUser }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [toastNode, toast]  = useToast()
  const admin = user.role === 'admin'
  const tabs  = admin ? ADMIN_TABS : CLIENT_TABS
  const tab   = tabs.some(t => t.id === params.get('tab')) ? params.get('tab') : tabs[0].id
  const setTab = (id) => { setParams(id === tabs[0].id ? {} : { tab: id }); window.scrollTo({ top: 0 }) }

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    navigate('/portal', { replace: true })
  }

  return (
    <>
      <div className={s.topbar}>
        <div className={s.topbarInner}>
          <div className={s.who}>
            <span className={s.avatar} aria-hidden="true">{(user.name || '?')[0].toUpperCase()}</span>
            <span className={s.whoText}>
              <span className={s.whoName}>{admin ? 'Admin' : firstName(user.name)}</span>
              {!admin && user.company && <span className={s.whoSub}>{user.company}</span>}
            </span>
          </div>
          <nav className={s.tabs} aria-label="Portal">
            {tabs.map(t => (
              <button key={t.id} className={cx(s.tab, tab === t.id && s.tabOn)}
                aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
                <t.icon size={16} aria-hidden="true" /><span>{t.label}</span>
              </button>
            ))}
          </nav>
          <button className={s.signOut} onClick={logout}><FiLogOut size={15} aria-hidden="true" /><span>Sign out</span></button>
        </div>
      </div>

      <main className={s.content}>
        {admin
          ? <AdminDashboard tab={tab} setTab={setTab} toast={toast} />
          : <ClientDashboard user={user} tab={tab} setTab={setTab} onUserChange={setUser} toast={toast} />}
      </main>

      {toastNode}
    </>
  )
}
