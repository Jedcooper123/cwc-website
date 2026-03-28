// ─────────────────────────────────────────────────────────────────────────────
// PricingPage — Full pricing + services at /pricing.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Pricing  from '../components/Pricing/Pricing'
import Services from '../components/Services/Services'
import styles   from './PricingPage.module.css'

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHero}>
        <div className="container">
          <p className="section-label">Pricing</p>
          <h1 className={styles.pageTitle}>
            Transparent pricing.<br />No hidden surprises.
          </h1>
          <p className={styles.pageSub}>
            Every business is different — these are starting points. We'll scope
            your project together and make sure the price matches the work.
          </p>
        </div>
      </div>
      <Pricing />
      <Services />
    </div>
  )
}
