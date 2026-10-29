// ─────────────────────────────────────────────────────────────────────────────
// portal/ui.jsx — Small building blocks shared by the client and admin views.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useId, useRef, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiX } from 'react-icons/fi'
import s from './Portal.module.css'

export const cx = (...c) => c.filter(Boolean).join(' ')

export function Badge({ tone = 'gray', children }) {
  return <span className={cx(s.badge, s[`tone_${tone}`])}>{children}</span>
}

export function Card({ title, action, children, className, padded = true }) {
  return (
    <section className={cx(s.card, padded && s.cardPadded, className)}>
      {(title || action) && (
        <header className={s.cardHead}>
          {title && <h2 className={s.cardTitle}>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, error, children }) {
  const id = useId()
  const child = React.cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': hint || error ? `${id}-help` : undefined,
    className: cx(s.input, children.props.className),
  })
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}</label>
      {child}
      {(error || hint) && (
        <p id={`${id}-help`} className={error ? s.fieldError : s.hint}>{error || hint}</p>
      )}
    </div>
  )
}

export function PasswordInput(props) {
  const [show, setShow] = useState(false)
  return (
    <div className={s.pwWrap}>
      <input {...props} type={show ? 'text' : 'password'} className={cx(s.input, props.className)} />
      <button type="button" className={s.pwToggle} onClick={() => setShow(v => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  )
}

export function Button({ variant = 'primary', loading, children, className, ...rest }) {
  return (
    <button {...rest} disabled={loading || rest.disabled}
      className={cx(s.btn, s[`btn_${variant}`], className)}>
      {loading ? <span className={s.btnSpinner} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export function Alert({ tone = 'error', children }) {
  if (!children) return null
  const Icon = tone === 'success' ? FiCheckCircle : FiAlertCircle
  return (
    <div className={cx(s.alert, s[`alert_${tone}`])} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={16} aria-hidden="true" /> <span>{children}</span>
    </div>
  )
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className={s.empty}>
      {Icon && <Icon size={22} aria-hidden="true" />}
      <p className={s.emptyTitle}>{title}</p>
      {children && <p className={s.emptyBody}>{children}</p>}
    </div>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className={s.spinnerWrap} role="status">
      <span className={s.spinner} aria-hidden="true" />
      <span className={s.srOnly}>{label}</span>
    </div>
  )
}

// Accessible dialog: focus moves in, Esc closes, background is inert.
export function Modal({ title, onClose, children, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    ref.current?.querySelector('input, textarea, select, button')?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <div className={s.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={cx(s.modal, wide && s.modalWide)} role="dialog" aria-modal="true" aria-label={title}>
        <header className={s.modalHead}>
          <h2 className={s.modalTitle}>{title}</h2>
          <button className={s.iconBtn} onClick={onClose} aria-label="Close"><FiX size={18} /></button>
        </header>
        <div className={s.modalBody}>{children}</div>
      </div>
    </div>
  )
}

// One-line toast at the bottom of the screen.
export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 3500)
    return () => clearTimeout(t)
  }, [msg])
  const node = msg ? <div className={s.toast} role="status">{msg}</div> : null
  return [node, setMsg]
}
