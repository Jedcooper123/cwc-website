import React from 'react'
import { FiMonitor, FiServer, FiTool, FiSearch, FiEdit, FiArrowRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Services.module.css'

const INCLUDED = [
  {
    icon: <FiMonitor />,
    title: 'Custom Website Design',
    desc: 'Built for your business. Not a template. Not a drag-and-drop builder. Your brand, your services, your look.',
  },
  {
    icon: <FiServer />,
    title: 'Hosting & Security',
    desc: 'Your site lives on a fast, secure server. SSL certificate included. No extra hosting bills.',
  },
  {
    icon: <FiMonitor size={16} style={{ transform: 'rotate(90deg)' }} />,
    title: 'Mobile Optimization',
    desc: 'Looks great on every phone, tablet, and desktop. Over 60% of your customers will visit from a phone.',
  },
  {
    icon: <FiTool />,
    title: 'Monthly Maintenance',
    desc: 'We keep your site updated, fast, and working. If something breaks, we fix it — no extra charge.',
  },
  {
    icon: <FiEdit />,
    title: 'Content Updates',
    desc: 'Need to change your hours, add a photo, update a price? Just send us a message. We handle it.',
  },
  {
    icon: <FiSearch />,
    title: 'SEO Basics',
    desc: "We set up the fundamentals so Google can find you — title tags, meta descriptions, local SEO, sitemap.",
  },
]

export default function Services() {
  const ref = useScrollAnimation()

  return (
    <section id="services" className={`section ${styles.services}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">What's Included</p>
          <h2 className="section-title fade-up delay-1">
            Two plans. Everything included.<br />
            <span style={{ color: 'var(--accent)' }}>From $350 + $35/mo.</span>
          </h2>
          <p className={`section-sub fade-up delay-2 ${styles.sub}`}>
            No à la carte. No surprise bills. Front-End sites start at $350
            + $35/month; Full Stack sites with ordering or scheduling start
            at $499 + $50/month. Every plan covers everything below.
          </p>
        </div>

        <div className={styles.grid}>
          {INCLUDED.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className={`${styles.card} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>{icon}</div>
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.bottomCta} fade-up delay-2`}>
          <p>From $350 + $35/mo. Everything above included. Cancel anytime.</p>
          <a href="#contact" className="btn-primary">
            Book a Free 15-Minute Call <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  )
}
