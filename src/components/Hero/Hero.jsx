import React from 'react'
import { FiArrowRight, FiCalendar, FiChevronDown, FiCheck } from 'react-icons/fi'
import styles from './Hero.module.css'

const METRICS = [
  { value: '$0',      label: 'To get started'   },
  { value: '$85/mo',  label: 'Flat monthly rate' },
  { value: '2 weeks', label: 'To go live'        },
  { value: 'Cancel',  label: 'Anytime, no fees'  },
]

const TRUST_ITEMS = [
  '$0 to start — no upfront cost',
  'Site live in 2 weeks or less',
  'We handle design, hosting, updates',
  'No contracts — cancel anytime',
  'Less than $3/day',
]

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.glow}   aria-hidden="true" />

      <div className={`${styles.inner} container`}>

        {/* ── Left: Copy ── */}
        <div className={styles.copy}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Launchpad Web Consulting
          </div>

          <h1 className={styles.headline}>
            A Website That<br />
            Actually Brings You<br />
            <span className={styles.gradText}>More Business.</span>
          </h1>

          <p className={styles.sub}>
            Whether you have no site or one that isn't working — we build
            professional websites for NC small businesses that turn visitors
            into calls, reservations, and leads.{' '}
            <strong>$0 upfront, $85/month.</strong> We handle everything.
            No contracts, no tech stress.
          </p>

          <div className={styles.actions}>
            <a href="#contact" className="btn-primary">
              Book a Free 15-Minute Call <FiArrowRight size={15} />
            </a>
            <a href="/work" className="btn-secondary">
              See Our Work
            </a>
          </div>
        </div>

        {/* ── Right: Trust card ── */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.panelFile}>What You Get</span>
          </div>

          <div className={styles.trustList}>
            {TRUST_ITEMS.map((item) => (
              <div key={item} className={styles.trustItem}>
                <FiCheck className={styles.trustCheck} size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className={styles.guarantee}>
            <span className={styles.guaranteeBadge}>2-Week Guarantee</span>
            <p>If your site isn't live in 2 weeks, your first month is free.</p>
          </div>

          <div className={styles.statusBar}>
            <span className={styles.statusDot} />
            Accepting new clients — NC small businesses
          </div>
        </div>
      </div>

      {/* ── Metrics strip ── */}
      <div className={styles.metricsStrip}>
        <div className="container">
          <div className={styles.metrics}>
            {METRICS.map(({ value, label }, i) => (
              <React.Fragment key={label}>
                <div className={styles.metric}>
                  <span className={styles.metricVal}>{value}</span>
                  <span className={styles.metricLabel}>{label}</span>
                </div>
                {i < METRICS.length - 1 && (
                  <div className={styles.metricDivider} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <a href="#about" className={styles.scrollHint} aria-label="Scroll down">
        <FiChevronDown size={18} />
      </a>
    </section>
  )
}
