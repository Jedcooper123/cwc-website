// ─────────────────────────────────────────────────────────────────────────────
// Hero — Full-viewport landing section with animated headline, CTA buttons,
// and a floating browser-window mockup showing a stylized site preview.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiArrowRight, FiCalendar, FiChevronDown } from 'react-icons/fi'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>

      {/* Background decorations */}
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.glow1} aria-hidden="true" />
      <div className={styles.glow2} aria-hidden="true" />

      <div className={`${styles.inner} container`}>

        {/* ── Left: Copy ── */}
        <div className={styles.copy}>
          {/* Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Modern Web Solutions
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            Build Your Digital Presence.{' '}
            <span className={styles.gradText}>Grow Your Business.</span>
          </h1>

          {/* Sub-headline */}
          <p className={styles.sub}>
            Cooper Web Consulting helps businesses launch high-performance websites,
            scale their online presence, and turn web traffic into real growth—from
            design to deployment and beyond.
          </p>

          {/* CTAs */}
          <div className={styles.actions}>
            <a href="#contact" className="btn-primary">
              <FiCalendar /> Schedule a Consultation
            </a>
            <a href="#services" className="btn-secondary">
              View Services <FiArrowRight />
            </a>
          </div>

          {/* Trust signals */}
          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>100%</span>
              <span className={styles.trustLabel}>Custom-Built</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>Fast</span>
              <span className={styles.trustLabel}>Delivery</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>Ongoing</span>
              <span className={styles.trustLabel}>Support</span>
            </div>
          </div>
        </div>

        {/* ── Right: Browser Mockup ── */}
        <div className={styles.mockupWrap}>
          <div className={styles.mockup}>
            {/* Browser chrome */}
            <div className={styles.browserBar}>
              <div className={styles.browserDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <div className={styles.browserUrl}>cooperwebconsulting.com</div>
              <div className={styles.browserRefresh} />
            </div>

            {/* Simulated page content */}
            <div className={styles.pageContent}>
              {/* Simulated nav */}
              <div className={styles.simNav}>
                <div className={`${styles.shimmer} ${styles.simLogo}`} />
                <div className={styles.simNavLinks}>
                  <div className={`${styles.shimmer} ${styles.simLink}`} />
                  <div className={`${styles.shimmer} ${styles.simLink}`} />
                  <div className={`${styles.shimmer} ${styles.simLink}`} />
                </div>
              </div>

              {/* Simulated hero */}
              <div className={styles.simHero}>
                <div className={`${styles.shimmer} ${styles.simH1}`} />
                <div className={`${styles.shimmer} ${styles.simH1} ${styles.simH1Short}`} />
                <div className={`${styles.shimmer} ${styles.simP}`} />
                <div className={`${styles.shimmer} ${styles.simP} ${styles.simPShort}`} />
                <div className={styles.simBtns}>
                  <div className={`${styles.simBtn} ${styles.simBtnPrimary}`} />
                  <div className={`${styles.shimmer} ${styles.simBtn}`} />
                </div>
              </div>

              {/* Simulated cards */}
              <div className={styles.simCards}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.simCard}>
                    <div className={`${styles.shimmer} ${styles.simIcon}`} />
                    <div className={`${styles.shimmer} ${styles.simCardTitle}`} />
                    <div className={`${styles.shimmer} ${styles.simCardBody}`} />
                    <div className={`${styles.shimmer} ${styles.simCardBody} ${styles.simCardBodyShort}`} />
                  </div>
                ))}
              </div>

              {/* Simulated metrics bar */}
              <div className={styles.simMetrics}>
                {['Uptime', 'Speed', 'Growth'].map((label) => (
                  <div key={label} className={styles.simMetric}>
                    <span className={styles.simMetricVal}>✓</span>
                    <span className={styles.simMetricLabel}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className={`${styles.floatBadge} ${styles.floatBadge1}`}>
            <span className={styles.floatIcon}>⚡</span>
            <div>
              <div className={styles.floatTitle}>Performance</div>
              <div className={styles.floatSub}>99 PageSpeed score</div>
            </div>
          </div>
          <div className={`${styles.floatBadge} ${styles.floatBadge2}`}>
            <span className={styles.floatIcon}>🛡</span>
            <div>
              <div className={styles.floatTitle}>Secure & Reliable</div>
              <div className={styles.floatSub}>99.9% uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#about" className={styles.scrollHint} aria-label="Scroll to about">
        <FiChevronDown size={20} />
      </a>
    </section>
  )
}
