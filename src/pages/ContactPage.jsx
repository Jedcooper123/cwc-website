// ─────────────────────────────────────────────────────────────────────────────
// ContactPage — Calendly booking + contact form at /contact.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Scheduling from '../components/Scheduling/Scheduling'
import Contact    from '../components/Contact/Contact'
import styles     from './ContactPage.module.css'

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHero}>
        <div className="container">
          <p className="section-label">Contact</p>
          <h1 className={styles.pageTitle}>Let's talk about your project.</h1>
          <p className={styles.pageSub}>
            Book a free 30-minute discovery call or send us a message below.
            No pressure, no commitment — just a conversation.
          </p>
        </div>
      </div>
      <Scheduling />
      <Contact />
    </div>
  )
}
