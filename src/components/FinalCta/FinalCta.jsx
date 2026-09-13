import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './FinalCta.module.css'

export default function FinalCta() {
  const ref = useScrollAnimation()

  return (
    <section className={`section section-surface ${styles.cta}`} ref={ref}>
      <div className="container">
        <h2 className="section-title fade-up">Let's build your site.</h2>
        <p className="section-sub fade-up delay-1">Book a free 15-minute call. No pressure.</p>
        <div className={`${styles.actions} fade-up delay-2`}>
          <Link to="/contact" className="btn-primary btn-lg">
            Book a Free 15-Minute Call
          </Link>
          <a href="tel:+13367070245" className="link-arrow">
            Or call (336) 707-0245
          </a>
        </div>
      </div>
    </section>
  )
}
