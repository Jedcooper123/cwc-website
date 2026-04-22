import React from 'react'
import { FiCheck, FiArrowRight, FiShield } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Pricing.module.css'

const FEATURES = [
  'Custom website design (not a template)',
  'Mobile-responsive — works on every device',
  'Fast, secure hosting with SSL',
  'Monthly maintenance and updates',
  'Content updates on request',
  'SEO basics so Google can find you',
  'Goes live in 2 weeks or less',
  'Cancel anytime — no contracts',
]

export default function Pricing() {
  const ref = useScrollAnimation()

  return (
    <section id="pricing" className={`section ${styles.pricing}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Simple Pricing</p>
          <h2 className="section-title fade-up delay-1">
            One plan. No surprises.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            We don't do tiers, upsells, or complicated packages.
            One flat rate covers everything your business needs online.
          </p>
        </div>

        <div className={styles.singleCardWrap}>
          <div className={`${styles.card} ${styles.popular} fade-up delay-1`}>
            <div className={styles.popularBadge}>Everything Included</div>

            <div className={styles.cardHeader}>
              <div className={styles.priceRow}>
                <span className={styles.priceNote}>$0 to start, then</span>
              </div>
              <div className={styles.priceMain}>
                <span className={styles.price}>$85</span>
                <span className={styles.pricePer}>/month</span>
              </div>
              <p className={styles.priceAnchor}>Less than $3/day. Less than one hour of your labor.</p>
            </div>

            <a href="#contact" className={`btn-primary ${styles.planCta}`}>
              Book a Free 15-Minute Call <FiArrowRight size={14} />
            </a>

            <div className={styles.divider} />

            <ul className={styles.features}>
              {FEATURES.map((f) => (
                <li key={f} className={styles.feature}>
                  <FiCheck className={styles.checkIcon} size={14} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.guarantee} fade-up delay-2`}>
            <FiShield className={styles.guaranteeIcon} size={22} />
            <div>
              <strong>2-Week Launch Guarantee</strong>
              <p>
                If your site isn't live within 2 weeks of our kickoff call,
                your first month is free. No questions asked.
              </p>
            </div>
          </div>

          <div className={`${styles.compare} fade-up delay-3`}>
            <p>
              <strong>Compare:</strong> Hiring a designer costs $2,000–$8,000 upfront.
              Squarespace is $16/month — but you build it, maintain it, and it looks like a template.
              With Launchpad, we do everything for $85/month.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
