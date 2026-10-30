// ─────────────────────────────────────────────────────────────────────────────
// Scheduling — Calendly inline embed for booking a free call.
// To change the calendar: replace CALENDLY_URL with your Calendly link.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react'
import styles from './Scheduling.module.css'
import { track } from '../../lib/analytics'

const CALENDLY_URL = 'https://calendly.com/jedpcooper'

export default function Scheduling() {
  // Calendly posts a message to the page when someone books: count it as a
  // Schedule conversion for the Meta Pixel.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === 'https://calendly.com' && e.data?.event === 'calendly.event_scheduled')
        track('Schedule', { content_name: 'Free 15-minute call' })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    // Load the Calendly widget script once
    if (document.querySelector('script[data-calendly]')) return

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.setAttribute('data-calendly', 'true')
    document.head.appendChild(script)

    return () => {
      // Clean up on unmount
      const s = document.querySelector('script[data-calendly]')
      if (s) s.remove()
    }
  }, [])

  return (
    <section id="schedule" className={`section ${styles.scheduling}`}>
      <div className="container">
        <h2 className={styles.title}>Pick a time.</h2>
        <div className={styles.embedWrap}>
          <div
            className="calendly-inline-widget"
            data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=f5f5f7&text_color=1d1d1f&primary_color=f97316`}
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </div>
    </section>
  )
}
