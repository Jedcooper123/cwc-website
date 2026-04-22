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
            One plan. No surprises.
          </h1>
          <p className={styles.pageSub}>
            $0 upfront. $85/month. We build it, host it, and maintain it.
            No contracts, no hidden fees, cancel anytime.
          </p>
        </div>
      </div>
      <Pricing />
      <FAQ />
    </div>
  )
}
