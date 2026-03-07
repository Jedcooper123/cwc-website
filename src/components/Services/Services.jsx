// ─────────────────────────────────────────────────────────────────────────────
// Services — Six service cards with icons, descriptions, and hover effects.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import {
  FiMonitor, FiServer, FiTool, FiZap,
  FiTrendingUp, FiSearch, FiArrowRight,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Services.module.css'

const SERVICES = [
  {
    icon: <FiMonitor />,
    title: 'Website Design & Development',
    desc:
      'From concept to launch, we build pixel-perfect websites that reflect your brand and convert visitors into customers. Fully responsive, fast, and built for real-world performance.',
    tag: 'Core Service',
  },
  {
    icon: <FiServer />,
    title: 'Hosting Solutions',
    desc:
      'Reliable, secure hosting tailored to your traffic and business needs. We handle the infrastructure so you can focus on what you do best.',
    tag: 'Infrastructure',
  },
  {
    icon: <FiTool />,
    title: 'Website Maintenance',
    desc:
      'Keep your site secure, up-to-date, and running flawlessly. Regular updates, bug fixes, content changes, and proactive monitoring—handled for you.',
    tag: 'Ongoing',
  },
  {
    icon: <FiZap />,
    title: 'Performance Optimization',
    desc:
      'Slow websites cost you customers. We audit, optimize, and fine-tune your site for maximum speed, core web vitals, and search engine performance.',
    tag: 'Optimization',
  },
  {
    icon: <FiTrendingUp />,
    title: 'Business-Focused Web Strategy',
    desc:
      'Not just design—strategy. We work with you to understand your goals, your customers, and your market, then build a digital presence that actually drives growth.',
    tag: 'Strategy',
  },
  {
    icon: <FiSearch />,
    title: 'SEO & Online Presence',
    desc:
      'Help your customers find you. We implement technical SEO, structured data, and on-page best practices so your site ranks higher and reaches the right audience.',
    tag: 'Visibility',
  },
]

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
            From your first launch to long-term growth, CWC delivers the full
            spectrum of modern web services—tailored to your business, not
            copy-pasted from a template.
          </p>
        </div>

        {/* Cards grid */}
        <div className={styles.grid}>
          {SERVICES.map(({ icon, title, desc, tag }, i) => (
            <div
              key={title}
              className={`${styles.card} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>{icon}</div>
                <span className={styles.tag}>{tag}</span>
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
              <div className={styles.cardFooter}>
                <a href="#contact" className={styles.learnMore}>
                  Get started <FiArrowRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`${styles.bottomCta} fade-up delay-2`}>
          <p>Not sure which services you need?</p>
          <a href="#contact" className="btn-primary">
            Let's Talk <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  )
}
