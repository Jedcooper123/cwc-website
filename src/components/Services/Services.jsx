// ─────────────────────────────────────────────────────────────────────────────
// Services — Service cards sourced from services.js. Each card is fully
// clickable and links to the service detail page.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiMonitor, FiTool, FiLayers, FiSearch, FiArrowRight,
} from 'react-icons/fi'
import { SERVICES } from '../../data/services'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Services.module.css'

const ICON_MAP = {
  'web-design':    <FiMonitor />,
  'fullstack-db':  <FiLayers />,
  'maintenance':   <FiTool />,
  'seo':           <FiSearch />,
}

const TAG_MAP = {
  'web-design':    'Core Service',
  'fullstack-db':  'Full Stack',
  'maintenance':   'Ongoing',
  'seo':           'Add-on',
}

export default function Services() {
  const ref = useScrollAnimation()

  return (
    <section id="services" className={`section ${styles.services}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">What We Build</p>
          <h2 className="section-title fade-up delay-1">
            Tools that qualify your leads<br />
            and grow your business.
          </h2>
          <p className={`section-sub fade-up delay-2 ${styles.sub}`}>
            Every service we offer is designed with one goal: get you better customers.
            We don't just build websites — we build systems that do the filtering for you.
          </p>
        </div>

        {/* Cards grid — filter out admin-only services (e.g. friends) */}
        <div className={styles.grid}>
          {SERVICES.filter(s => !s.adminOnly).map(({ id, title, shortDesc, isAddon }, i) => (
            <Link
              key={id}
              to={`/services/${id}`}
              className={`${styles.card} ${isAddon ? styles.cardAddon : ''} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>{ICON_MAP[id]}</div>
                <span className={`${styles.tag} ${isAddon ? styles.tagAddon : ''}`}>
                  {TAG_MAP[id]}
                </span>
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
          <p>Not sure where to start? Let's figure out what will move the needle for you.</p>
          <a href="#contact" className="btn-primary">
            Get Better Leads <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  )
}
