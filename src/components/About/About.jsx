import React from 'react'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './About.module.css'

const PILLARS = [
  'Professional design built around your business and brand',
  'Mobile-friendly and fast — looks great on every phone and screen',
  'We write the copy, build the pages, and handle all the tech',
  'One flat monthly rate — no surprises, no hidden fees',
  'Site goes live in 2 weeks or less',
]

const STATS = [
  { value: '$0',    label: 'Upfront Cost',   desc: 'No payment until your site is ready' },
  { value: '2 wks', label: 'To Launch',      desc: 'From first call to live website'      },
  { value: '$85',   label: 'Per Month',      desc: 'Everything included, no surprises'    },
  { value: '5★',    label: 'Client Results', desc: 'Consistent across every build'        },
]

export default function About() {
  const ref = useScrollAnimation()

  return (
    <section id="about" className={`section ${styles.about}`} ref={ref}>
      <div className="container">
        <div className={styles.grid}>

          {/* ── Left: Text content ── */}
          <div className={styles.content}>
            <p className="section-label fade-up">Built for NC Small Businesses</p>
            <h2 className="section-title fade-up delay-1">
              You don't need to know anything<br />
              <span className={styles.accent}>about websites. That's our job.</span>
            </h2>
            <p className={`section-sub fade-up delay-2 ${styles.intro}`}>
              Most small business owners don't have time to learn web design,
              deal with hosting companies, or figure out why their site broke.
              That's exactly why Launchpad exists.
            </p>
            <p className={`${styles.body} fade-up delay-3`}>
              We build your site, put it online, and keep it running — all for
              $85 a month. We work with restaurants, contractors, salons, healthcare
              providers, photographers, and small businesses of all kinds across
              North Carolina. You focus on your business. We handle the website.
            </p>

            <ul className={`${styles.pillars} fade-up delay-3`}>
              {PILLARS.map((p) => (
                <li key={p} className={styles.pillar}>
                  <FiCheckCircle className={styles.checkIcon} size={16} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <a href="#contact" className={`btn-primary fade-up delay-4 ${styles.cta}`}>
              Book a Free 15-Minute Call <FiArrowRight />
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
