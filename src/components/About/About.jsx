// ─────────────────────────────────────────────────────────────────────────────
// About — Overview of Cooper Web Consulting's mission, approach, and stats.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './About.module.css'

const PILLARS = [
  'Websites designed to filter out low-budget inquiries',
  'Only serious, ready-to-buy customers reach you',
  'Stop chasing the wrong jobs — close more of the right ones',
  'Systems built for service businesses, not generic templates',
]

const STATS = [
  { value: '100%', label: 'Custom Built',        desc: 'No templates, no shortcuts'  },
  { value: 'Less',  label: 'Wasted Calls',       desc: 'Fewer low-budget inquiries'  },
  { value: 'More',  label: 'Qualified Leads',    desc: 'Customers ready to move'     },
  { value: '5★',   label: 'Client Results',      desc: 'Consistent across every build'},
]

export default function About() {
  const ref = useScrollAnimation()

  return (
    <section id="about" className={`section ${styles.about}`} ref={ref}>
      <div className="container">
        <div className={styles.grid}>

          {/* ── Left: Text content ── */}
          <div className={styles.content}>
            <p className="section-label fade-up">Our Mission</p>
            <h2 className="section-title fade-up delay-1">
              We build websites that don't just look good —{' '}
              <span className={styles.accent}>they work.</span>
            </h2>
            <p className={`section-sub fade-up delay-2 ${styles.intro}`}>
              We help service-based businesses grow by building websites that eliminate
              wasted time, reduce bad leads, and create systems that bring in real
              customers who are ready to move forward.
            </p>
            <p className={`${styles.body} fade-up delay-3`}>
              Whether you run HVAC, roofing, plumbing, landscaping, or any other
              service business — your website should be working as hard as you do.
              That means filtering out tire-kickers and putting serious customers
              in front of you.
            </p>

            {/* Pillar list */}
            <ul className={`${styles.pillars} fade-up delay-3`}>
              {PILLARS.map((p) => (
                <li key={p} className={styles.pillar}>
                  <FiCheckCircle className={styles.checkIcon} size={16} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <a href="#contact" className={`btn-primary fade-up delay-4 ${styles.cta}`}>
              Get Better Leads <FiArrowRight />
            </a>
          </div>

          {/* ── Right: Stats grid ── */}
          <div className={styles.statsGrid}>
            {STATS.map(({ value, label, desc }, i) => (
              <div
                key={label}
                className={`${styles.statCard} fade-up delay-${i + 2}`}
              >
                <div className={styles.statVal}>{value}</div>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.statDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
