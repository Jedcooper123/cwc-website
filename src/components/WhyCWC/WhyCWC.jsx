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
    icon: <FiShield />,
    title: 'Reliability You Can Count On',
    desc:
      'Every site we build is engineered for stability. From secure hosting environments to proactive monitoring and fast incident response — we treat uptime as a business requirement, not an afterthought.',
  },
  {
    icon: <FiStar />,
    title: 'Design That Builds Trust',
    desc:
      'First impressions are permanent. We craft websites with the visual sophistication that signals credibility, professionalism, and attention to detail — because your brand deserves more than average.',
  },
  {
    icon: <FiLayers />,
    title: 'Built to Scale',
    desc:
      'Your business will grow. Your website should too. Every CWC project is structured with clean, organized code and modular architecture, making it easy to add features as your needs evolve.',
  },
  {
    icon: <FiClock />,
    title: 'Ongoing Support & Partnership',
    desc:
      'We don\'t disappear after launch. Whether it\'s a content update, a new feature request, or a technical issue at 11 PM — CWC is a long-term partner, not a one-time vendor.',
  },
  {
    icon: <FiBarChart2 />,
    title: 'Growth-Oriented Thinking',
    desc:
      'We measure success the same way you do — in leads, conversions, and revenue. Every decision, from layout to page speed, is made with your business outcomes at the center.',
  },
  {
    icon: <FiUsers />,
    title: 'Real Relationships, Not Tickets',
    desc:
      'You work directly with the person building your site. No hand-offs, no account managers in the middle — just clear communication, honest timelines, and consistent quality.',
  },
]

export default function WhyCWC() {
  const ref = useScrollAnimation()

  return (
    <section id="why-cwc" className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">Why Choose CWC</p>
          <h2 className="section-title fade-up delay-1">
            The difference is in the details.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            Plenty of agencies can build a website. Fewer can build a website
            that actually moves your business forward. Here's what sets CWC apart.
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
              Ready to work with a partner who's invested in your success?
            </h3>
            <p className={styles.bannerSub}>
              Let's build something great together.
            </p>
          </div>
          <a href="#contact" className="btn-primary">
            Schedule a Free Consultation
          </a>
        </div>
      </div>
    </section>
  )
}
