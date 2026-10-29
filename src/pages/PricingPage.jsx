import React from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import Pricing    from '../components/Pricing/Pricing'
import FAQ        from '../components/FAQ/FAQ'
import FinalCta   from '../components/FinalCta/FinalCta'

export default function PricingPage() {
  return (
    <>
      <PageHeader
        label="Plans"
        title="Priced for your business."
        sub="Every site is personalized, so every quote is too. Here’s how it works."
      />
      <Pricing showHeader={false} />
      <FAQ />
      <FinalCta />
    </>
  )
}
