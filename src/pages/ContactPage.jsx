// ─────────────────────────────────────────────────────────────────────────────
// ContactPage — Calendly booking + contact form at /contact.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import Scheduling from '../components/Scheduling/Scheduling'
import Contact    from '../components/Contact/Contact'

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Contact"
        title="Let's talk."
        sub="Book a time or send a message. Jed replies within one business day."
      />
      <Scheduling />
      <Contact />
    </>
  )
}
