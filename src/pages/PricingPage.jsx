import React from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import Pricing    from '../components/Pricing/Pricing'
import FAQ        from '../components/FAQ/FAQ'
import FinalCta   from '../components/FinalCta/FinalCta'

export default function PricingPage() {
  return (
    <>
      <PageHeader
        label="Pricing"
        title="One simple price."
        sub="The same plan for every business."
      />
      <Pricing showHeader={false} />
      <FAQ />
      <FinalCta />
    </>
  )
}
