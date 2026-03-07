// ─────────────────────────────────────────────────────────────────────────────
// Contact — Frontend-only contact form with validation state + contact sidebar.
// Hook up to a backend (e.g. Formspree, EmailJS, or custom API) later.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import {
  FiMail, FiPhone, FiLinkedin, FiCalendar,
  FiSend, FiCheckCircle, FiArrowRight,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Contact.module.css'

const SERVICES = [
  'Website Design & Development',
  'Hosting Solutions',
  'Website Maintenance',
  'Performance Optimization',
  'Full-Stack Web Application',
  'Business Web Strategy',
  'Other / Not Sure Yet',
]

export default function Contact() {
  const ref = useScrollAnimation()
  const [form, setForm]       = useState({ name: '', email: '', company: '', service: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [submitted, setSubmit] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required.'
    if (!form.email.trim())   e.email   = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.message.trim()) e.message = 'Please include a message.'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    // TODO: wire up to backend / form service (Formspree, EmailJS, etc.)
    console.log('Form submitted:', form)
    setSubmit(true)
  }

  return (
    <section id="contact" className={`section ${styles.contact}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">Get In Touch</p>
          <h2 className="section-title fade-up delay-1">
            Let's build something together.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            Whether you have a clear vision or just know you need help — reach out.
            We'll respond within one business day.
          </p>
        </div>

        <div className={styles.layout}>
          {/* ── Left: Form ── */}
          <div className={`${styles.formWrap} fade-up delay-2`}>
            {submitted ? (
              <div className={styles.successState}>
                <FiCheckCircle className={styles.successIcon} size={40} />
                <h3 className={styles.successTitle}>Message received!</h3>
                <p className={styles.successBody}>
                  Thanks for reaching out, {form.name.split(' ')[0]}. We'll review your
                  request and follow up within one business day.
                </p>
                <button className="btn-secondary" onClick={() => { setSubmit(false); setForm({ name:'', email:'', company:'', service:'', message:'' }) }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* Row 1: Name + Email */}
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">Full Name *</label>
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
                      placeholder="jane@company.com"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      value={form.email} onChange={handleChange}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                </div>

                {/* Row 2: Company + Service */}
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="company">Company / Business</label>
                    <input
                      id="company" name="company" type="text"
                      placeholder="Your Business Name (optional)"
                      className={styles.input}
                      value={form.company} onChange={handleChange}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="service">Service You're Interested In</label>
                    <select
                      id="service" name="service"
                      className={styles.input}
                      value={form.service} onChange={handleChange}
                    >
                      <option value="">Select a service…</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">Tell Us About Your Project *</label>
                  <textarea
                    id="message" name="message"
                    rows={5}
                    placeholder="Describe your project, goals, timeline, or anything else we should know..."
                    className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    value={form.message} onChange={handleChange}
                  />
                  {errors.message && <span className={styles.error}>{errors.message}</span>}
                </div>

                <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                  Send Message <FiSend size={14} />
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Contact info ── */}
          <div className={`${styles.sidebar} fade-up delay-3`}>
            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Contact Information</h3>
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
                    <div className={styles.contactLabel}>Phone</div>
                    <div className={styles.contactValue}>(336) 707-0245</div>
                  </div>
                </a>
                <a
                  href="https://linkedin.com/in/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactItem}
                >
                  <div className={styles.contactIcon}><FiLinkedin /></div>
                  <div>
                    <div className={styles.contactLabel}>LinkedIn</div>
                    <div className={styles.contactValue}>linkedin.com/in/yourprofile</div>
                  </div>
                </a>
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.scheduleIcon}><FiCalendar /></div>
              <h3 className={styles.sideTitle}>Prefer to talk first?</h3>
              <p className={styles.scheduleBody}>
                Book a free 30-minute discovery call. No sales pitch — just an
                honest conversation about what you're building.
              </p>
              {/* Replace href with your Calendly / Cal.com link */}
              <a href="#contact" className={`btn-secondary ${styles.scheduleBtn}`}>
                Schedule a Call <FiArrowRight />
              </a>
            </div>

            <div className={styles.responseTime}>
              <div className={styles.rtDot} />
              <span>We typically respond within <strong>1 business day.</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
