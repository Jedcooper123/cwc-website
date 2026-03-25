// ─────────────────────────────────────────────────────────────────────────────
// WhyCWC — Differentiators section highlighting reliability, modern design,
// scalability, support, and business-growth focus.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import {
  FiShield, FiLayers, FiBarChart2, FiClock,
  FiUsers, FiStar,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './WhyCWC.module.css'

const REASONS = [
  {
    icon: <FiBarChart2 />,
    title: 'We Focus on Outcomes, Not Design',
    desc:
      'Most agencies celebrate how a site looks. We measure success by how many qualified leads it brings you. Every layout decision, every form, every page is built to filter and convert — not just impress.',
  },
  {
    icon: <FiShield />,
    title: 'Built-In Lead Qualification',
    desc:
      'Our sites are designed to pre-qualify visitors before they ever contact you. That means fewer tire-kickers, fewer low-budget calls, and more time spent closing real jobs with serious customers.',
  },
  {
    icon: <FiLayers />,
    title: 'Systems, Not Just Websites',
    desc:
      'We don\'t hand you a pretty page and walk away. We build a tool — a lead system that works 24/7, filters bad-fit inquiries, and delivers better customers straight to your inbox or phone.',
  },
  {
    icon: <FiClock />,
    title: 'Respect for Your Time',
    desc:
      'You\'re a business owner — not a marketing manager. We handle everything and make it simple. No jargon, no long calls about color palettes. Just results that show up in your schedule.',
  },
  {
    icon: <FiStar />,
    title: 'Built for Blue-Collar Businesses',
    desc:
      'HVAC, roofing, plumbing, landscaping, contracting — we understand how service businesses operate. We speak your language and build around your workflow, not the other way around.',
  },
  {
    icon: <FiUsers />,
    title: 'Direct. No Hand-Offs.',
    desc:
      'You work directly with the person building your site. No account managers, no agency hand-offs. Clear communication, honest timelines, and a partner who\'s invested in your results.',
  },
]

export default function WhyCWC() {
  const ref = useScrollAnimation()

  return (
    <section id="why-cwc" className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">Why Launchpad</p>
          <h2 className="section-title fade-up delay-1">
            We don't just build websites.<br />We build lead machines.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            Most web agencies focus on design or traffic. We focus on outcomes.
            Our approach is built around filtering and qualifying leads before
            they ever reach you.
          </p>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {REASONS.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className={`${styles.card} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.iconWrap}>{icon}</div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className={`${styles.banner} fade-up delay-2`}>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>
              Ready to stop wasting time on the wrong customers?
            </h3>
            <p className={styles.bannerSub}>
              Let's build a system that only brings you serious leads.
            </p>
          </div>
          <a href="#contact" className="btn-primary">
            Get Better Leads
          </a>
        </div>
      </div>
    </section>
  )
}
