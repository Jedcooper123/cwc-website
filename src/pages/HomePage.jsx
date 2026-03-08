// ─────────────────────────────────────────────────────────────────────────────
// HomePage — Assembles all homepage sections in order.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Hero         from '../components/Hero/Hero'
import About        from '../components/About/About'
import Services     from '../components/Services/Services'
import Process      from '../components/Process/Process'
import WhyCWC       from '../components/WhyCWC/WhyCWC'
import Portfolio    from '../components/Portfolio/Portfolio'
import Pricing      from '../components/Pricing/Pricing'
import Scheduling   from '../components/Scheduling/Scheduling'
import ClientPortal from '../components/ClientPortal/ClientPortal'
import Contact      from '../components/Contact/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Process />
      <WhyCWC />
      <Portfolio />
      <Pricing />
      <Scheduling />
      <ClientPortal />
      <Contact />
    </>
  )
}
