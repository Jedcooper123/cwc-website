import React from 'react'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './About.module.css'

const PILLARS = [
  'Professional design built around your business and brand',
  'Mobile-friendly and fast — looks great on every phone and screen',
  'We write the copy, build the pages, and handle all the tech',
  'Flat monthly rate after launch — no surprises, no hidden fees',
  'Site goes live in 2 weeks or less, guaranteed',
]

const STATS = [
  { value: '$350',  label: 'Front-End Build', desc: 'Plus $35/mo — hosting & maintenance included' },
  { value: '2 wks', label: 'To Launch',       desc: 'From first call to live website'      },
  { value: '$499',  label: 'Full Stack Build',desc: 'Plus $50/mo — for sites with a backend' },
  { value: '5★',    label: 'Client Results',  desc: 'Consistent across every build'        },
]

export default function About() {
  const ref = useScrollAnimation()

  return (
    <section id="about" className={`section ${styles.about}`} ref={ref}>
      <div className="container">
        <div className={styles.grid}>

          {/* ── Left: Text content ── */}
          <div className={styles.content}>
            <p className="section-label fade-up">Built for Small Businesses</p>
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
              We build your site, put it online, and keep it running — starting
              at $350 to build and $35/month for a Front-End site, or $499 and
              $50/month for a Full Stack site with ordering or scheduling built
              in. We work with restaurants, contractors, salons, healthcare
              providers, photographers, and small businesses of all kinds across
              the country. You focus on your business. We handle the website.
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

          {/* ── Right: Photo + Stats ── */}
          <div className={styles.visual}>
            {/* Photo card */}
            <div className={`${styles.photoCard} fade-up delay-2`}>
              <img
                src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=700&q=80"
                alt="Small business website on laptop"
                className={styles.photo}
                loading="lazy"
              />
              <div className={styles.photoBadge}>
                <span className={styles.badgeDot} />
                Your site. Live in 2 weeks.
              </div>
            </div>

            {/* Stats grid */}
            <div className={`${styles.statsGrid} fade-up delay-3`}>
              {STATS.map(({ value, label, desc }) => (
                <div key={label} className={styles.statCard}>
                  <div className={styles.statVal}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                  <div className={styles.statDesc}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
