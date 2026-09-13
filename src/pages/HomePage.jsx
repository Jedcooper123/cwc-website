import React from 'react'
import Hero      from '../components/Hero/Hero'
import Features  from '../components/Features/Features'
import Portfolio from '../components/Portfolio/Portfolio'
import Pricing   from '../components/Pricing/Pricing'
import Process   from '../components/Process/Process'
import FAQ       from '../components/FAQ/FAQ'
import FinalCta  from '../components/FinalCta/FinalCta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Portfolio variant="preview" />
      <Pricing />
      <Process />
      <FAQ />
      <FinalCta />
    </>
  )
}
