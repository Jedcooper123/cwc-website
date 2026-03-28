// ─────────────────────────────────────────────────────────────────────────────
// Scheduling — Calendly inline embed for booking a free discovery call.
// To activate: replace CALENDLY_URL below with your actual Calendly link.
// Get yours at https://calendly.com → share your scheduling link.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Scheduling.module.css'

// !! IMPORTANT: Replace this with your real Calendly link !!
const CALENDLY_URL = 'https://calendly.com/jedpcooper'

export default function Scheduling() {
  const ref = useScrollAnimation()

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
    <section id="schedule" className={`section ${styles.scheduling}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Book a Call</p>
          <h2 className="section-title fade-up delay-1">
            Free 30-minute discovery call.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            Pick a time that works for you. We'll talk through your project,
            answer questions, and figure out the best path forward. No pressure.
          </p>
        </div>

        <div className={`${styles.embedWrap} fade-up delay-2`}>
          <div
            className="calendly-inline-widget"
            data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=ffffff&text_color=0a0a0a&primary_color=f97316`}
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </div>
    </section>
  )
}
