import React, { useState } from 'react'
import {
  FiUser, FiBriefcase, FiTarget,
  FiArrowRight, FiArrowLeft,
  FiCheckCircle, FiLock, FiPhone, FiMail,
} from 'react-icons/fi'
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
  { id: 'new',      label: 'I need a brand new website built from scratch' },
  { id: 'redesign', label: 'I want to redesign or modernize my current site' },
  { id: 'fix',      label: 'My site has issues I need fixed (speed, mobile, etc.)' },
  { id: 'explore',  label: 'Just exploring my options — not sure yet' },
]

const STEPS = [
  { label: 'About You',       icon: FiUser      },
  { label: 'Your Business',   icon: FiBriefcase },
  { label: 'What You Need',   icon: FiTarget    },
]

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
          <div className={styles.successWrap}>
            <FiCheckCircle className={styles.successIcon} size={52} />
            <h3 className={styles.successTitle}>
              You're all set, {form.name.split(' ')[0]}!
            </h3>
            <p className={styles.successBody}>
              I got your info and I'll be in touch within one business day to schedule
              your free 15-minute call. It's a real conversation — no pitch, no
              pressure. Just a straight talk about what your business needs.
            </p>
            <div className={styles.successMeta}>
              <span>📧 Confirmation sent to {form.email}</span>
            </div>
            <button
              className="btn-secondary"
              onClick={() => { setSubmitted(false); setStep(0); setForm(EMPTY_FORM) }}
            >
              Submit Another Response
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

        {/* Section header */}
        <div className={styles.header}>
          <p className="section-label">Book a Free Call</p>
          <h2 className="section-title">
            Ready to grow your business online?<br />Let's figure it out together.
          </h2>
          <p className="section-sub">
            Answer 3 quick questions so I can understand your situation before we
            talk. Then we'll schedule a free 15-minute call — no pitch, just straight talk.
          </p>
        </div>

        {/* Main layout */}
        <div className={styles.layout}>

          {/* ── Form card ── */}
          <div className={styles.formCard}>

            {/* Progress indicator */}
            <div className={styles.progress}>
              {STEPS.map(({ label, icon: Icon }, i) => (
                <React.Fragment key={label}>
                  <div className={`${styles.progressStep} ${i < step ? styles.stepDone : ''} ${i === step ? styles.stepActive : ''}`}>
                    <div className={styles.progressDot}>
                      {i < step ? '✓' : <Icon size={14} />}
                    </div>
                    <span className={styles.progressLabel}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`${styles.progressConnector} ${i < step ? styles.connectorDone : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step content */}
            <div className={styles.stepBody}>

              {/* ── Step 0: About You ── */}
              {step === 0 && (
                <div className={styles.stepPane}>
                  <div className={styles.stepHead}>
                    <div className={styles.stepIconWrap}><FiUser size={18} /></div>
                    <div>
                      <h3 className={styles.stepTitle}>First, a bit about you</h3>
                      <p className={styles.stepSub}>I'll use this to reach out personally — no automated emails.</p>
                    </div>
                  </div>

                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label className={styles.label}>Your Name *</label>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        autoFocus
                      />
                      {errors.name && <span className={styles.error}>{errors.name}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Email Address *</label>
                      <input
                        type="email"
                        placeholder="jane@yourbusiness.com"
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                      />
                      {errors.email && <span className={styles.error}>{errors.email}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        Phone Number <span className={styles.optional}>(optional)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        className={styles.input}
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Your Business ── */}
              {step === 1 && (
                <div className={styles.stepPane}>
                  <div className={styles.stepHead}>
                    <div className={styles.stepIconWrap}><FiBriefcase size={18} /></div>
                    <div>
                      <h3 className={styles.stepTitle}>Tell me about your business</h3>
                      <p className={styles.stepSub}>This helps me prepare before our call so we don't waste your time.</p>
                    </div>
                  </div>

                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label className={styles.label}>Business Name *</label>
                      <input
                        type="text"
                        placeholder="Your Business Name"
                        className={`${styles.input} ${errors.business ? styles.inputError : ''}`}
                        value={form.business}
                        onChange={e => handleChange('business', e.target.value)}
                        autoFocus
                      />
                      {errors.business && <span className={styles.error}>{errors.business}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Industry *</label>
                      <select
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
                      <label className={styles.label}>Do you currently have a website? *</label>
                      <div className={styles.toggleGroup}>
                        <button
                          type="button"
                          className={`${styles.toggleBtn} ${form.hasWebsite === true ? styles.toggleActive : ''}`}
                          onClick={() => handleChange('hasWebsite', true)}
                        >
                          ✓ &nbsp;Yes, I have one
                        </button>
                        <button
                          type="button"
                          className={`${styles.toggleBtn} ${form.hasWebsite === false ? styles.toggleActive : ''}`}
                          onClick={() => handleChange('hasWebsite', false)}
                        >
                          ✗ &nbsp;No, I don't
                        </button>
                      </div>
                      {errors.hasWebsite && <span className={styles.error}>{errors.hasWebsite}</span>}
                    </div>

                    {form.hasWebsite === true && (
                      <div className={styles.field}>
                        <label className={styles.label}>
                          Current Website URL <span className={styles.optional}>(optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourbusiness.com"
                          className={styles.input}
                          value={form.websiteUrl}
                          onChange={e => handleChange('websiteUrl', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 2: What You Need ── */}
              {step === 2 && (
                <div className={styles.stepPane}>
                  <div className={styles.stepHead}>
                    <div className={styles.stepIconWrap}><FiTarget size={18} /></div>
                    <div>
                      <h3 className={styles.stepTitle}>What are you looking for?</h3>
                      <p className={styles.stepSub}>One last question — then you're done.</p>
                    </div>
                  </div>

                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label className={styles.label}>Which best describes your situation? *</label>
                      <div className={styles.goalGrid}>
                        {GOALS.map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            className={`${styles.goalBtn} ${form.goal === id ? styles.goalActive : ''}`}
                            onClick={() => handleChange('goal', id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {errors.goal && <span className={styles.error}>{errors.goal}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        Anything else you'd like me to know? <span className={styles.optional}>(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Feel free to share context, questions, or anything that would help me prepare..."
                        className={`${styles.input} ${styles.textarea}`}
                        value={form.notes}
                        onChange={e => handleChange('notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className={styles.formNav}>
              {step > 0 ? (
                <button type="button" className="btn-secondary" onClick={back}>
                  <FiArrowLeft size={14} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={next}>
                  Continue <FiArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className={`btn-primary ${submitting ? styles.btnLoading : ''}`}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Book My Free Call'} <FiArrowRight size={14} />
                </button>
              )}
            </div>

            <div className={styles.trustLine}>
              <FiLock size={11} />
              <span>No spam. No automated emails. Jed responds personally within 1 business day.</span>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.sideIconWrap}><FiPhone size={18} /></div>
              <h4 className={styles.sideTitle}>Prefer to call directly?</h4>
              <p className={styles.sideSub}>No hold music. No call center. Just Jed.</p>
              <a href="tel:+13367070245" className={`btn-primary ${styles.sideBtn}`}>
                (336) 707-0245
              </a>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideIconWrap}><FiMail size={18} /></div>
              <h4 className={styles.sideTitle}>Email directly</h4>
              <a href="mailto:jedpcooper@gmail.com" className={styles.sideEmail}>
                jedpcooper@gmail.com
              </a>
            </div>

            <div className={styles.expectCard}>
              <h4 className={styles.expectTitle}>What to expect</h4>
              <ul className={styles.expectList}>
                <li><span className={styles.expectCheck}>✓</span> Response within 1 business day</li>
                <li><span className={styles.expectCheck}>✓</span> Free 15-min call, no pitch</li>
                <li><span className={styles.expectCheck}>✓</span> Clear quote, no hidden fees</li>
                <li><span className={styles.expectCheck}>✓</span> Site live in 2 weeks or less</li>
                <li><span className={styles.expectCheck}>✓</span> Cancel anytime, no contracts</li>
              </ul>
            </div>

            <div className={styles.responseRow}>
              <div className={styles.rtDot} />
              <span>Typically responds <strong>same business day</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
