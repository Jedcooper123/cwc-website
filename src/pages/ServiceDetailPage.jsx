// ─────────────────────────────────────────────────────────────────────────────
// ServiceDetailPage — Dynamic page for /services/:serviceId
// Reads from services.js data and renders full details, deliverables, and CTA.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import {
  FiMonitor, FiServer, FiTool, FiZap, FiTrendingUp, FiSearch,
  FiCheck, FiArrowRight, FiArrowLeft,
} from 'react-icons/fi'
import { SERVICES, getServiceById } from '../data/services'
import styles from './ServiceDetailPage.module.css'

const ICONS = {
  'web-design':  <FiMonitor   size={28} />,
  'hosting':     <FiServer    size={28} />,
  'maintenance': <FiTool      size={28} />,
  'performance': <FiZap       size={28} />,
  'strategy':    <FiTrendingUp size={28}/>,
  'seo':         <FiSearch    size={28} />,
}

export default function ServiceDetailPage() {
  const { serviceId } = useParams()
  const service = getServiceById(serviceId)

  if (!service) return <Navigate to="/services" replace />

  const { id, title, tagline, fullDesc, whatWeDeliver, goodFor, startingAt, color } = service

  // Other services for the "explore more" row
  const others = SERVICES.filter((s) => s.id !== id).slice(0, 3)

  return (
    <div className={styles.page}>
      {/* ── Page hero ── */}
      <div className={styles.hero} style={{ '--service-color': color }}>
        <div className={`${styles.heroInner} container`}>
          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/services">Services</Link>
            <span>/</span>
            <span>{title}</span>
          </div>

          <div className={styles.heroBody}>
            <div>
              <div className={styles.iconWrap} style={{ background: color + '18', borderColor: color + '33', color }}>
                {ICONS[id]}
              </div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.tagline}>{tagline}</p>
              <div className={styles.heroCtas}>
                <Link to="/#contact" className="btn-primary">
                  Get a Quote <FiArrowRight />
                </Link>
                <Link to="/services" className={`${styles.backLink} btn-secondary`}>
                  <FiArrowLeft size={14} /> All Services
                </Link>
              </div>
            </div>

            <div className={styles.startBox}>
              <div className={styles.startLabel}>Starting at</div>
              <div className={styles.startVal} style={{ color }}>{startingAt}</div>
              <p className={styles.startNote}>
                Final pricing scoped per project.{' '}
                <Link to="/#contact" style={{ color }}>Contact us</Link> for a
                free estimate.
              </p>
              <div className={styles.goodFor}>
                <div className={styles.goodForLabel}>Great for:</div>
                {goodFor.map((g) => (
                  <span key={g} className={styles.goodForTag}>{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <section className={`section ${styles.content}`}>
        <div className={`${styles.contentGrid} container`}>
          {/* Left: description */}
          <div>
            <h2 className={styles.h2}>What this service includes</h2>
            <p className={styles.fullDesc}>{fullDesc}</p>

            <h3 className={styles.h3}>What you'll receive</h3>
            <ul className={styles.delivList}>
              {whatWeDeliver.map((d) => (
                <li key={d} className={styles.delivItem}>
                  <FiCheck className={styles.checkIcon} style={{ color }} size={15} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <Link to="/#contact" className={`btn-primary ${styles.ctaBtn}`}>
              Start This Service <FiArrowRight />
            </Link>
          </div>

          {/* Right: sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h4 className={styles.sideTitle}>Ready to get started?</h4>
              <p className={styles.sideBody}>
                Book a free 30-minute discovery call. We'll scope your project
                and give you an honest recommendation.
              </p>
              <Link to="/#contact" className={`btn-primary ${styles.sideBtn}`}>
                Schedule a Call <FiArrowRight />
              </Link>
            </div>

            <div className={styles.sideCard}>
              <h4 className={styles.sideTitle}>Also consider</h4>
              <div className={styles.alsoList}>
                {others.map(({ id: oid, title: otitle }) => (
                  <Link key={oid} to={`/services/${oid}`} className={styles.alsoItem}>
                    {otitle}
                    <FiArrowRight size={12} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
