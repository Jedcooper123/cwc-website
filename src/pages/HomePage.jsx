import React from 'react'
import Hero      from '../components/Hero/Hero'
import About     from '../components/About/About'
import Services  from '../components/Services/Services'
import Portfolio from '../components/Portfolio/Portfolio'
import CtaBanner from '../components/CtaBanner/CtaBanner'
import Pricing   from '../components/Pricing/Pricing'
import Process   from '../components/Process/Process'
import FAQ       from '../components/FAQ/FAQ'
import Contact   from '../components/Contact/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <CtaBanner />
      <Pricing />
      <Process />
      <FAQ />
      <Contact />
    </>
  )
}
