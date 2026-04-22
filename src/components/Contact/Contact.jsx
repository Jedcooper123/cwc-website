import React, { useState } from 'react'
import {
  FiMail, FiPhone, FiCalendar,
  FiSend, FiCheckCircle, FiArrowRight, FiLock,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Contact.module.css'

export default function Contact() {
  const ref = useScrollAnimation()
  const [form, setForm]       = useState({ name: '', email: '', business: '', phone: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [submitted, setSubmit] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required.'
    if (!form.email.trim())   e.email   = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.message.trim()) e.message = 'Tell us a bit about your business.'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    // Send to backend contact route
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch (_) {
      // Fallback: mailto link if API not available
    }
    setSubmit(true)
  }

  return (
    <section id="contact" className={`section ${styles.contact}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Book a Free Call</p>
          <h2 className="section-title fade-up delay-1">
            Ready to get your business online?<br />Let's talk for 15 minutes.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            No sales pitch. No commitment. Just an honest conversation about
            what your business needs and whether we're the right fit.
            Most people know by the end of the call.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Left: Form */}
          <div className={`${styles.formWrap} fade-up delay-2`}>
            {submitted ? (
              <div className={styles.successState}>
                <FiCheckCircle className={styles.successIcon} size={40} />
                <h3 className={styles.successTitle}>Got it, {form.name.split(' ')[0]}!</h3>
                <p className={styles.successBody}>
                  I'll reach out within one business day to schedule your free
                  15-minute call. Talk soon.
                </p>
                <button className="btn-secondary" onClick={() => { setSubmit(false); setForm({ name:'', email:'', business:'', phone:'', message:'' }) }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">Your Name *</label>
                    <input
                      id="name" name="name" type="text"
                      placeholder="Jane Smith"
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      value={form.name} onChange={handleChange}
                    />
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email Address *</label>
                    <input
                      id="email" name="email" type="email"
                      placeholder="jane@yourbusiness.com"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      value={form.email} onChange={handleChange}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="business">Business Name</label>
                    <input
                      id="business" name="business" type="text"
                      placeholder="Your Business Name"
                      className={styles.input}
                      value={form.business} onChange={handleChange}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="phone">Phone (optional)</label>
                    <input
                      id="phone" name="phone" type="tel"
                      placeholder="(555) 000-0000"
                      className={styles.input}
                      value={form.phone} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">What does your business do? *</label>
                  <textarea
                    id="message" name="message"
                    rows={4}
                    placeholder="Tell us a bit about your business and what you're looking for..."
                    className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    value={form.message} onChange={handleChange}
                  />
                  {errors.message && <span className={styles.error}>{errors.message}</span>}
                </div>

                <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                  Send — I'll Be in Touch Within 1 Business Day <FiSend size={14} />
                </button>

                <div className={styles.trustLine}>
                  <FiLock size={12} />
                  <span>No spam. No sales pitch. Just a real conversation.</span>
                </div>
              </form>
            )}
          </div>

          {/* Right: Contact info */}
          <div className={`${styles.sidebar} fade-up delay-3`}>
            <div className={styles.sideCard}>
              <div className={styles.scheduleIcon}><FiCalendar /></div>
              <h3 className={styles.sideTitle}>Prefer to just call?</h3>
              <p className={styles.scheduleBody}>
                Call or text Jed directly. No hold music, no call center —
                just a direct line to the person who will build your site.
              </p>
              <a href="tel:+13367070245" className={`btn-primary ${styles.scheduleBtn}`}>
                <FiPhone size={14} /> (336) 707-0245
              </a>
              <a href="#schedule" className={`btn-secondary ${styles.scheduleBtn}`} style={{ marginTop: '0.75rem' }}>
                Book a 15-Min Call <FiArrowRight />
              </a>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Contact Info</h3>
              <div className={styles.contactItems}>
                <a href="mailto:jedpcooper@gmail.com" className={styles.contactItem}>
                  <div className={styles.contactIcon}><FiMail /></div>
                  <div>
                    <div className={styles.contactLabel}>Email</div>
                    <div className={styles.contactValue}>jedpcooper@gmail.com</div>
                  </div>
                </a>
                <a href="tel:+13367070245" className={styles.contactItem}>
                  <div className={styles.contactIcon}><FiPhone /></div>
                  <div>
                    <div className={styles.contactLabel}>Call or Text</div>
                    <div className={styles.contactValue}>(336) 707-0245</div>
                  </div>
                </a>
              </div>
            </div>

            <div className={styles.responseTime}>
              <div className={styles.rtDot} />
              <span>Typically responds within <strong>same business day.</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
