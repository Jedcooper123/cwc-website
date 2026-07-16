import React from 'react'
import Pricing from '../components/Pricing/Pricing'
import FAQ     from '../components/FAQ/FAQ'
import styles  from './PricingPage.module.css'

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHero}>
        <div className="container">
          <p className="section-label">Simple Pricing</p>
          <h1 className={styles.pageTitle}>
            Two plans. No surprises.
          </h1>
          <p className={styles.pageSub}>
            Front-End sites start at $350 to build, then $35/month. Full
            Stack sites — with ordering, scheduling, and custom backends —
            start at $499 to build, then $50/month. No contracts, no hidden
            fees, cancel anytime.
          </p>
        </div>
      </div>
      <Pricing />
      <FAQ />
    </div>
  )
}
