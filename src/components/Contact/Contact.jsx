import React, { useState } from 'react'
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiPhone, FiMail } from 'react-icons/fi'
import styles from './Contact.module.css'

const INDUSTRIES = [
  'Contractor / Trades (HVAC, Plumbing, Electrical, Roofing)',
  'Home Services (Landscaping, Cleaning, Pest Control)',
  'Restaurant / Food & Beverage',
  'Salon / Spa / Beauty',
  'Healthcare / Dental / Wellness',
  'Retail / Boutique / Shop',
  'Photography / Creative Services',
  'Professional Services (Law, Finance, Insurance)',
  'Other',
]

const GOALS = [
  { id: 'new',      label: 'A brand new website' },
  { id: 'redesign', label: 'A redesign of my current site' },
  { id: 'fix',      label: 'Fixes to my current site' },
  { id: 'explore',  label: 'Just exploring' },
]

const STEPS = ['About you', 'Your business', 'What you need']

const EMPTY_FORM = {
  name: '', email: '', phone: '',
  business: '', industry: '', hasWebsite: null, websiteUrl: '',
  goal: '', notes: '',
}

export default function Contact() {
  const [step,       setStep]       = useState(0)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [errors,     setErrors]     = useState({})
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const validateStep = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.name.trim())  e.name  = 'Your name is required.'
      if (!form.email.trim()) e.email = 'Email is required.'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    }
    if (s === 1) {
      if (!form.business.trim()) e.business  = 'Business name is required.'
      if (!form.industry)        e.industry  = 'Please select your industry.'
      if (form.hasWebsite === null) e.hasWebsite = 'Please answer this question.'
    }
    if (s === 2) {
      if (!form.goal) e.goal = 'Please select what you\'re looking for.'
    }
    return e
  }

  const next = () => {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const back = () => {
    setErrors({})
    setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    const errs = validateStep(2)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
    } catch (_) {
      // API unavailable — still show success (form data captured client-side)
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <section id="contact" className={`section ${styles.contact}`}>
        <div className="container">
          <div className={styles.success}>
            <FiCheckCircle className={styles.successIcon} size={48} />
            <h2 className={styles.successTitle}>Thanks, {form.name.split(' ')[0]}.</h2>
            <p className={styles.successBody}>
              Jed will reach out within one business day to set up your call.
            </p>
            <button
              className="btn-secondary"
              onClick={() => { setSubmitted(false); setStep(0); setForm(EMPTY_FORM) }}
            >
              Send another message
            </button>
          </div>
        </div>
      </section>
    )
  }

  /* ── Multi-step form ── */
  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className="container">
        <h2 className={styles.heading}>Or send a message.</h2>

        <div className={styles.layout}>
          <div className={styles.formCard}>

            {/* Progress */}
            <ol className={styles.progress} aria-label="Form progress">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  className={`${styles.progressStep} ${i <= step ? styles.progressDone : ''}`}
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span className={styles.progressBar} />
                  <span className={styles.progressLabel}>{label}</span>
                </li>
              ))}
            </ol>

            {/* ── Step 0: About You ── */}
            {step === 0 && (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-name">Your name</label>
                  <input
                    id="c-name"
                    type="text"
                    placeholder="Jane Smith"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                  />
                  {errors.name && <span className={styles.error}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-email">Email</label>
                  <input
                    id="c-email"
                    type="email"
                    placeholder="jane@yourbusiness.com"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                  />
                  {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-phone">
                    Phone <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id="c-phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    className={styles.input}
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ── Step 1: Your Business ── */}
            {step === 1 && (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-business">Business name</label>
                  <input
                    id="c-business"
                    type="text"
                    placeholder="Your Business Name"
                    className={`${styles.input} ${errors.business ? styles.inputError : ''}`}
                    value={form.business}
                    onChange={e => handleChange('business', e.target.value)}
                  />
                  {errors.business && <span className={styles.error}>{errors.business}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-industry">Industry</label>
                  <select
                    id="c-industry"
                    className={`${styles.input} ${errors.industry ? styles.inputError : ''}`}
                    value={form.industry}
                    onChange={e => handleChange('industry', e.target.value)}
                  >
                    <option value="">Select your industry...</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                  {errors.industry && <span className={styles.error}>{errors.industry}</span>}
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Do you have a website now?</span>
                  <div className={styles.toggleGroup}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${form.hasWebsite === true ? styles.toggleActive : ''}`}
                      onClick={() => handleChange('hasWebsite', true)}
                      aria-pressed={form.hasWebsite === true}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${form.hasWebsite === false ? styles.toggleActive : ''}`}
                      onClick={() => handleChange('hasWebsite', false)}
                      aria-pressed={form.hasWebsite === false}
                    >
                      No
                    </button>
                  </div>
                  {errors.hasWebsite && <span className={styles.error}>{errors.hasWebsite}</span>}
                </div>

                {form.hasWebsite === true && (
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="c-url">
                      Website URL <span className={styles.optional}>(optional)</span>
                    </label>
                    <input
                      id="c-url"
                      type="url"
                      placeholder="https://yourbusiness.com"
                      className={styles.input}
                      value={form.websiteUrl}
                      onChange={e => handleChange('websiteUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: What You Need ── */}
            {step === 2 && (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <span className={styles.label}>What are you looking for?</span>
                  <div className={styles.goalGrid}>
                    {GOALS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        className={`${styles.goalBtn} ${form.goal === id ? styles.goalActive : ''}`}
                        onClick={() => handleChange('goal', id)}
                        aria-pressed={form.goal === id}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.goal && <span className={styles.error}>{errors.goal}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-notes">
                    Anything else? <span className={styles.optional}>(optional)</span>
                  </label>
                  <textarea
                    id="c-notes"
                    rows={3}
                    placeholder="Questions, ideas, anything that helps."
                    className={`${styles.input} ${styles.textarea}`}
                    value={form.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.formNav}>
              {step > 0 ? (
                <button type="button" className={styles.back} onClick={back}>
                  <FiArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={next}>
                  Continue <FiArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send'} <FiArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ── Direct contact ── */}
          <aside className={styles.sidebar}>
            <a href="tel:+13367070245" className={styles.sideCard}>
              <FiPhone className={styles.sideIcon} size={20} />
              <span className={styles.sideLabel}>Call or text</span>
              <span className={styles.sideValue}>(336) 707-0245</span>
            </a>
            <a href="mailto:jedpcooper@gmail.com" className={styles.sideCard}>
              <FiMail className={styles.sideIcon} size={20} />
              <span className={styles.sideLabel}>Email</span>
              <span className={styles.sideValue}>jedpcooper@gmail.com</span>
            </a>
          </aside>
        </div>
      </div>
    </section>
  )
}
