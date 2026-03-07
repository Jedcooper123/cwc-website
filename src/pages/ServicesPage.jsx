// ─────────────────────────────────────────────────────────────────────────────
// ServicesPage — Full services overview with a card for each service.
// Clicking a card navigates to /services/:id for full details.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiMonitor, FiServer, FiTool, FiZap, FiTrendingUp, FiSearch, FiArrowRight,
} from 'react-icons/fi'
import { SERVICES } from '../data/services'
import styles from './ServicesPage.module.css'

const ICONS = {
  'web-design':  <FiMonitor   />,
  'hosting':     <FiServer    />,
  'maintenance': <FiTool      />,
  'performance': <FiZap       />,
  'strategy':    <FiTrendingUp/>,
  'seo':         <FiSearch    />,
}

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      {/* ── Page hero ── */}
      <div className={styles.pageHero}>
        <div className={`${styles.pageHeroInner} container`}>
          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Services</span>
          </div>
          <h1 className={styles.pageTitle}>
            What we build,<br />
            <span className={styles.gradText}>and why it matters.</span>
          </h1>
          <p className={styles.pageSub}>
            From a first website to a full-stack platform — CWC delivers every
            layer of modern web development. Choose what fits, or let us scope
            the right combination for your goals.
          </p>
        </div>
      </div>

      {/* ── Services grid ── */}
      <section className={`section ${styles.serviceSection}`}>
        <div className="container">
          <div className={styles.grid}>
            {SERVICES.map(({ id, title, tagline, shortDesc, whatWeDeliver, goodFor, startingAt, color }) => (
              <div key={id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div
                    className={styles.iconWrap}
                    style={{ background: color + '18', borderColor: color + '33', color }}
                  >
                    {ICONS[id]}
                  </div>
                  <div className={styles.startingAt}>
                    <span className={styles.startingAtLabel}>Starting at</span>
                    <span className={styles.startingAtVal}>{startingAt}</span>
                  </div>
                </div>

                <h2 className={styles.cardTitle}>{title}</h2>
                <p className={styles.cardTagline}>{tagline}</p>
                <p className={styles.cardDesc}>{shortDesc}</p>

                {/* Deliverables preview */}
                <ul className={styles.delivList}>
                  {whatWeDeliver.slice(0, 3).map((d) => (
                    <li key={d} className={styles.delivItem}>
                      <span className={styles.delivDot} style={{ background: color }} />
                      {d}
                    </li>
                  ))}
                  {whatWeDeliver.length > 3 && (
                    <li className={styles.delivMore}>+{whatWeDeliver.length - 3} more…</li>
                  )}
                </ul>

                {/* Good for */}
                <div className={styles.goodFor}>
                  {goodFor.map((g) => (
                    <span key={g} className={styles.goodForTag}>{g}</span>
                  ))}
                </div>

                <Link to={`/services/${id}`} className={styles.cardCta}>
                  Full details <FiArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className={styles.bottomCta}>
            <div>
              <h3 className={styles.ctaTitle}>Not sure where to start?</h3>
              <p className={styles.ctaSub}>We'll help you figure it out in a free 30-minute discovery call.</p>
            </div>
            <Link to="/#contact" className="btn-primary">
              Schedule a Consultation <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
