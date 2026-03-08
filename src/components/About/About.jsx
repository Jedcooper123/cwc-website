// ─────────────────────────────────────────────────────────────────────────────
// About — Overview of Cooper Web Consulting's mission, approach, and stats.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './About.module.css'

const PILLARS = [
  'Built around your business goals, not generic templates',
  'Clean, maintainable code that scales with you',
  'Dedicated support from initial concept to long-term growth',
  'Modern stack — fast, secure, and future-ready',
]

const STATS = [
  { value: '100%', label: 'Custom Solutions',   desc: 'No cookie-cutter templates'  },
  { value: '<48h', label: 'Response Time',       desc: 'On every support request'    },
  { value: '99.9%',label: 'Uptime Standard',    desc: 'For all hosted projects'      },
  { value: '5★',   label: 'Client Satisfaction',desc: 'Consistent across every build'},
]

export default function About() {
  const ref = useScrollAnimation()

  return (
    <section id="about" className={`section ${styles.about}`} ref={ref}>
      <div className="container">
        <div className={styles.grid}>

          {/* ── Left: Text content ── */}
          <div className={styles.content}>
            <p className="section-label fade-up">About CWC</p>
            <h2 className="section-title fade-up delay-1">
              Your web presence is your first impression.{' '}
              <span className={styles.accent}>Make it count.</span>
            </h2>
            <p className={`section-sub fade-up delay-2 ${styles.intro}`}>
              Cooper Web Consulting is a one-person shop built on a simple idea:
              your website should actually work for your business. Everything we design,
              build, and maintain is fast, polished, and built around how you operate,
              not around a template someone else already used.
            </p>
            <p className={`${styles.body} fade-up delay-3`}>
              Whether you're launching something new, modernizing an old site,
              or just looking for someone to keep things running without the stress,
              CWC brings the technical depth and clear communication to get you there.
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

            <a href="#services" className={`btn-primary fade-up delay-4 ${styles.cta}`}>
              Explore Our Services <FiArrowRight />
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
