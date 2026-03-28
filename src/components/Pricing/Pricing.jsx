// ─────────────────────────────────────────────────────────────────────────────
// Pricing — Three-tier pricing cards with feature lists.
// Starter $350 / Professional $500+ / Enterprise $999+
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiCheck, FiArrowRight, FiZap } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Pricing.module.css'

const PLANS = [
  {
    name: 'Essentials',
    price: '$350',
    priceNote: 'one-time',
    tagline: 'A clean, professional website — built fast, built right.',
    desc: 'Perfect for service businesses, local companies, and freelancers who need a polished, high-converting site without the enterprise price tag.',
    popular: false,
    cta: 'Get Started',
    features: [
      'Up to 5 fully custom pages',
      'Mobile-responsive & performance optimized',
      'Contact form & Google Maps integration',
      'SEO setup & Google Analytics',
      '30-day post-launch support',
    ],
  },
  {
    name: 'Professional',
    price: '$500',
    priceNote: 'starting at',
    tagline: 'A full-featured site with everything your business needs.',
    desc: 'For businesses that need more than a brochure site — backend logic, custom flows, and ongoing support to keep everything running.',
    popular: true,
    cta: 'Most Popular — Get Started',
    features: [
      'Everything in Essentials',
      'Full-stack: frontend + backend + database',
      'Custom booking, forms, or inquiry flows',
      'Advanced SEO & structured data',
      'Monthly maintenance plans available',
      '60-day post-launch support',
    ],
    maintenanceNote: 'Maintenance plans from $50/mo',
  },
  {
    name: 'Enterprise',
    price: '$999',
    priceNote: 'starting at',
    tagline: 'Custom-engineered for serious growth.',
    desc: 'For businesses with complex needs — custom integrations, multi-user systems, and a dedicated partner invested in your long-term results.',
    popular: false,
    cta: "Let's Talk",
    features: [
      'Everything in Professional',
      'Custom architecture & API integrations',
      'Multi-user roles & authentication',
      'E-commerce & payment processing',
      'Dedicated retainer & strategy reviews',
    ],
  },
]

export default function Pricing() {
  const ref = useScrollAnimation()

  return (
    <section id="pricing" className={`section ${styles.pricing}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">Pricing</p>
          <h2 className="section-title fade-up delay-1">
            Transparent pricing.<br />No hidden surprises.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            Every business is different — these are starting points. We'll scope
            your project together and make sure the price matches the work.
          </p>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {PLANS.map(({ name, price, priceNote, tagline, desc, popular, cta, features, maintenanceNote }, i) => (
            <div
              key={name}
              className={`${styles.card} ${popular ? styles.popular : ''} fade-up delay-${i + 1}`}
            >
              {popular && (
                <div className={styles.popularBadge}>
                  <FiZap size={11} /> Most Popular
                </div>
              )}

              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{name}</h3>
                <p className={styles.planTagline}>{tagline}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{price}</span>
                  <span className={styles.priceNote}>{priceNote}</span>
                </div>
                {maintenanceNote && (
                  <p className={styles.maintenanceNote}>{maintenanceNote}</p>
                )}
              </div>

              <p className={styles.planDesc}>{desc}</p>

              <a href="#contact" className={`${styles.planCta} ${popular ? 'btn-primary' : 'btn-secondary'}`}>
                {cta} <FiArrowRight size={14} />
              </a>

              <div className={styles.divider} />

              {/* Features */}
              <ul className={styles.features}>
                {features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <FiCheck className={styles.checkIcon} size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className={`${styles.note} fade-up delay-2`}>
          All prices are estimates. Final pricing is scoped per project.{' '}
          <a href="#contact" className={styles.noteLink}>Contact us</a> for a
          custom quote — no commitment required.
        </p>
      </div>
    </section>
  )
}
