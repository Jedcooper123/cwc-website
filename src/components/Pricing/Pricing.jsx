import React from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Pricing.module.css'

// No public prices (Oct 2026): every client gets a personalized quote on the
// free call. This section sells how pricing works, not a number.
const STEPS = [
  { n: '1', title: 'Free 15-minute call',   body: 'Tell us about your business and what you need the site to do.' },
  { n: '2', title: 'A personalized quote',  body: 'A clear price built around your goals. No surprises, no pressure.' },
  { n: '3', title: 'One simple monthly plan', body: 'Hosting, security, and updates handled for you after launch.' },
]

const INCLUDED = [
  'Custom design for your brand',
  'Looks great on every phone',
  'Hosting, SSL, and security',
  'Online booking, if you need it',
  'Updates whenever you ask',
  'Local SEO setup',
]

export default function Pricing({ showHeader = true }) {
  const ref = useScrollAnimation()

  return (
    <section id="pricing" className="section" ref={ref}>
      <div className="container">
        {showHeader && (
          <div className="section-head">
            <p className="section-label fade-up">Plans</p>
            <h2 className="section-title fade-up delay-1">Priced for your business.</h2>
            <p className="section-sub fade-up delay-2">Not a template, and not a one-size-fits-all package.</p>
          </div>
        )}

        <div className={`${styles.card} fade-up delay-2`}>
          <ol className={styles.steps}>
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">{n}</span>
                <span className={styles.stepTitle}>{title}</span>
                <span className={styles.stepBody}>{body}</span>
              </li>
            ))}
          </ol>

          <p className={styles.includedLabel}>Every plan includes</p>
          <ul className={styles.list}>
            {INCLUDED.map((item) => (
              <li key={item}>
                <FiCheck className={styles.check} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.footer}>
            <Link to="/contact" className="btn-primary btn-lg">
              Get My Free Quote
            </Link>
            <p className={styles.note}>Live in two weeks, or your first month is free.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
