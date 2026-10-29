// ─────────────────────────────────────────────────────────────────────────────
// portal/AuthScreens.jsx — Sign in, forgot password, and set password
// (used by both invite links and reset links).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiMail } from 'react-icons/fi'
import { api, firstName } from './api'
import { Alert, Button, Field, PasswordInput, Spinner } from './ui'
import s from './Portal.module.css'

const MIN_PASSWORD = 10

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className={s.authPage}>
      <div className={s.authCard}>
        <div className={s.authMark} aria-hidden="true">L</div>
        <h1 className={s.authTitle}>{title}</h1>
        {subtitle && <p className={s.authSub}>{subtitle}</p>}
        {children}
      </div>
      {footer && <p className={s.authFooter}>{footer}</p>}
    </div>
  )
}

export function LoginScreen({ onLogin }) {
  const [mode, setMode]       = useState('login') // login | forgot | sent
  const [email, setEmail]     = useState('')
  const [password, setPw]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { user } = await api('/api/auth/login', { method: 'POST', body: { email, password } })
        onLogin(user)
      } else {
        await api('/api/auth/forgot-password', { method: 'POST', body: { email } })
        setMode('sent')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'sent') {
    return (
      <AuthShell title="Check your email" subtitle={`If ${email} has a portal account, a reset link is on its way. It works for 1 hour.`}>
        <div className={s.authIcon}><FiMail size={22} /></div>
        <Button variant="secondary" className={s.full} onClick={() => { setMode('login'); setPw('') }}>
          <FiArrowLeft size={15} /> Back to sign in
        </Button>
      </AuthShell>
    )
  }

  const forgot = mode === 'forgot'
  return (
    <AuthShell
      title={forgot ? 'Reset your password' : 'Client portal'}
      subtitle={forgot ? 'Enter your email and we’ll send you a reset link.' : 'Sign in to see your project, request edits, and manage billing.'}
      footer={<>Not a client yet? <Link to="/contact">Book a free call</Link></>}
    >
      <form onSubmit={submit} className={s.stack} noValidate>
        <Field label="Email">
          <input type="email" autoComplete="email" required value={email}
            onChange={e => setEmail(e.target.value)} />
        </Field>
        {!forgot && (
          <Field label="Password">
            <PasswordInput autoComplete="current-password" required value={password}
              onChange={e => setPw(e.target.value)} />
          </Field>
        )}
        <Alert>{error}</Alert>
        <Button type="submit" loading={loading} className={s.full}>
          {forgot ? 'Send reset link' : 'Sign in'}
        </Button>
        <button type="button" className={s.linkBtn} onClick={() => { setMode(forgot ? 'login' : 'forgot'); setError('') }}>
          {forgot ? 'Back to sign in' : 'Forgot password?'}
        </button>
      </form>
    </AuthShell>
  )
}

export function SetPasswordScreen({ onLogin }) {
  const navigate = useNavigate()
  const token    = new URLSearchParams(window.location.search).get('token') || ''
  const [link, setLink]       = useState(null)   // { purpose, name, email }
  const [bad, setBad]         = useState('')
  const [pw, setPw]           = useState('')
  const [pw2, setPw2]         = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api(`/api/auth/link?token=${encodeURIComponent(token)}`)
      .then(setLink)
      .catch(err => setBad(err.message))
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`)
    if (pw !== pw2)               return setError('Those passwords don’t match.')
    setError(''); setLoading(true)
    try {
      const { user } = await api('/api/auth/set-password', { method: 'POST', body: { token, password: pw } })
      onLogin(user)
      navigate('/portal', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (bad) {
    return (
      <AuthShell title="This link has expired" subtitle="Invite and reset links only work once and expire for security. Request a new one below, or reply to your email and Jed will send a fresh link.">
        <Button className={s.full} onClick={() => navigate('/portal', { replace: true })}>Go to sign in</Button>
      </AuthShell>
    )
  }
  if (!link) return <Spinner />

  const invite = link.purpose === 'invite'
  return (
    <AuthShell
      title={invite ? `Welcome, ${firstName(link.name)}` : 'Choose a new password'}
      subtitle={invite ? `Create a password for ${link.email} to open your client portal.` : `For ${link.email}.`}
    >
      <form onSubmit={submit} className={s.stack} noValidate>
        {/* Lets password managers save the right username. */}
        <input type="email" autoComplete="username" value={link.email} readOnly hidden />
        <Field label="New password" hint={`At least ${MIN_PASSWORD} characters. A short phrase works well.`}>
          <PasswordInput autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} />
        </Field>
        <Field label="Confirm password">
          <PasswordInput autoComplete="new-password" value={pw2} onChange={e => setPw2(e.target.value)} />
        </Field>
        <Alert>{error}</Alert>
        <Button type="submit" loading={loading} className={s.full}>
          {invite ? 'Create password & sign in' : 'Save password & sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}
