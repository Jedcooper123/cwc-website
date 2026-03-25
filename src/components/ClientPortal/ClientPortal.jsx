// ─────────────────────────────────────────────────────────────────────────────
// ClientPortal — Forward-thinking teaser for the upcoming CWC client platform.
// Framed as a feature preview, not an "under construction" page.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import {
  FiLayout, FiCreditCard, FiClipboard,
  FiBarChart2, FiServer, FiLock, FiArrowRight,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './ClientPortal.module.css'

const UPCOMING = [
  { icon: <FiLayout />,    title: 'Client Dashboard',       desc: 'A centralized hub to monitor your site\'s health, usage, and project status in real time.' },
  { icon: <FiCreditCard />,title: 'Billing & Invoices',      desc: 'View, pay, and manage all your invoices and subscription plans in one place.' },
  { icon: <FiClipboard />, title: 'Service Request Portal',  desc: 'Submit change requests, content updates, and support tickets — tracked and prioritized.' },
  { icon: <FiBarChart2 />, title: 'Performance Reports',     desc: 'Monthly analytics summaries, uptime reports, and growth insights delivered automatically.' },
  { icon: <FiServer />,    title: 'Hosting Management',      desc: 'Manage domains, SSL certificates, and server configurations without opening a support ticket.' },
  { icon: <FiLock />,      title: 'Secure Access Control',   desc: 'Team-based permissions so your staff, contractors, and stakeholders access exactly what they need.' },
]

export default function ClientPortal() {
  const ref = useScrollAnimation()

  return (
    <section id="portal" className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className={styles.layout}>

          {/* ── Left: Text content ── */}
          <div className={styles.content}>
            <div className={`${styles.statusChip} fade-up`}>
              <span className={styles.statusDot} />
              In Development
            </div>
            <h2 className={`section-title fade-up delay-1`}>
              The Launchpad Client Platform is coming.
            </h2>
            <p className={`${styles.body} fade-up delay-2`}>
              We're building more than just websites. The Launchpad platform will give
              every client a dedicated workspace — a single destination to manage
              your web presence, communicate with our team, and track the health of
              your digital investment.
            </p>
            <p className={`${styles.body} fade-up delay-3`}>
              This isn't a "coming soon" placeholder. It's a preview of where Launchpad is
              heading as we grow into a full-service digital services company.
              Clients who join us now will be first in line when the platform launches.
            </p>
            <a href="#contact" className={`btn-primary fade-up delay-3 ${styles.cta}`}>
              Join the Early Access List <FiArrowRight />
            </a>
          </div>

          {/* ── Right: Feature preview grid ── */}
          <div className={styles.features}>
            {UPCOMING.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className={`${styles.featureCard} fade-up delay-${(i % 3) + 2}`}
              >
                <div className={styles.featureIcon}>{icon}</div>
                <div>
                  <h4 className={styles.featureTitle}>{title}</h4>
                  <p className={styles.featureDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
