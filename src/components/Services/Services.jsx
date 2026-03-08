// ─────────────────────────────────────────────────────────────────────────────
// Services — Service cards sourced from services.js. Each card is fully
// clickable and links to the service detail page.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiMonitor, FiServer, FiTool, FiLayers, FiSearch, FiArrowRight,
} from 'react-icons/fi'
import { SERVICES } from '../../data/services'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Services.module.css'

const ICON_MAP = {
  'web-design':    <FiMonitor />,
  'hosting':       <FiServer />,
  'maintenance':   <FiTool />,
  'fullstack-db':  <FiLayers />,
  'seo':           <FiSearch />,
}

const TAG_MAP = {
  'web-design':    'Core Service',
  'hosting':       'Infrastructure',
  'maintenance':   'Ongoing',
  'fullstack-db':  'Full Stack',
  'seo':           'Visibility',
}

export default function Services() {
  const ref = useScrollAnimation()

  return (
    <section id="services" className={`section ${styles.services}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">What We Do</p>
          <h2 className="section-title fade-up delay-1">
            Everything your business needs<br />
            to thrive online.
          </h2>
          <p className={`section-sub fade-up delay-2 ${styles.sub}`}>
            From your first launch to long-term growth, CWC covers the full
            range of web services, tailored to your business and built to last.
          </p>
        </div>

        {/* Cards grid */}
        <div className={styles.grid}>
          {SERVICES.map(({ id, title, shortDesc }, i) => (
            <Link
              key={id}
              to={`/services/${id}`}
              className={`${styles.card} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>{ICON_MAP[id]}</div>
                <span className={styles.tag}>{TAG_MAP[id]}</span>
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{shortDesc}</p>
              <div className={styles.cardFooter}>
                <span className={styles.learnMore}>
                  Learn more <FiArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`${styles.bottomCta} fade-up delay-2`}>
          <p>Not sure which services fit your situation?</p>
          <a href="#schedule" className="btn-primary">
            Book a Free Call <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  )
}
