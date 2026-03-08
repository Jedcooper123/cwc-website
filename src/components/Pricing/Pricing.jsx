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
    tagline: 'A clean, professional online presence — built fast, built right.',
    desc: 'Perfect for service-based businesses, local companies, and freelancers who need a polished, high-converting website without the enterprise price tag.',
    popular: false,
    cta: 'Get Started',
    features: [
      'Up to 5 fully custom pages',
      'Mobile-responsive design',
      'Contact form & Google Maps integration',
      'Basic SEO setup & meta configuration',
      'Google Analytics integration',
      'Fast load times (performance optimized)',
      '2 rounds of design revisions',
      '30-day post-launch support',
    ],
    notIncluded: [
      'Backend / database functionality',
      'Client portal or login system',
    ],
  },
  {
    name: 'Professional',
    price: '$500',
    priceNote: 'starting at + maintenance',
    tagline: 'A full-featured web solution with the foundation to grow.',
    desc: 'For growing businesses that need more than a brochure site — dynamic features, backend integrations, and a monthly care plan that keeps everything running smoothly.',
    popular: true,
    cta: 'Most Popular — Get Started',
    features: [
      'Everything in Essentials',
      'Full-stack development (frontend + backend)',
      'CMS integration for easy content management',
      'Custom forms, booking, or inquiry flows',
      'Database-backed dynamic content',
      'Advanced SEO & structured data',
      'Performance & security hardening',
      'Monthly maintenance plans available',
      'Priority email & chat support',
      '60-day post-launch support window',
    ],
    notIncluded: [],
    maintenanceNote: 'Monthly maintenance plans starting at $50/mo',
  },
  {
    name: 'Enterprise',
    price: '$999',
    priceNote: 'starting at',
    tagline: 'Custom-engineered digital infrastructure for serious growth.',
    desc: 'For companies with complex requirements — custom integrations, multi-role user systems, advanced data workflows, and a dedicated web presence built to match your ambitions.',
    popular: false,
    cta: 'Let\'s Talk',
    features: [
      'Everything in Professional',
      'Custom architecture & database design',
      'Multi-user roles & authentication system',
      'Third-party API & software integrations',
      'E-commerce or payment processing',
      'Advanced analytics & reporting dashboards',
      'Scalable cloud deployment',
      'Dedicated project management',
      'Quarterly strategy & growth reviews',
      'Ongoing retainer & support available',
    ],
    notIncluded: [],
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
            Every business is different — these plans are starting points.
            We'll scope your project together and make sure you're getting
            exactly what you need at a price that makes sense.
          </p>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {PLANS.map(({ name, price, priceNote, tagline, desc, popular, cta, features, notIncluded, maintenanceNote }, i) => (
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

              {/* Not included */}
              {notIncluded.length > 0 && (
                <ul className={styles.notIncluded}>
                  {notIncluded.map((f) => (
                    <li key={f} className={styles.notFeature}>
                      <span className={styles.dashIcon}>—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
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
