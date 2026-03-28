// ─────────────────────────────────────────────────────────────────────────────
// HomePage — Assembles all homepage sections in order.
// Portfolio, Pricing, Scheduling, and ClientPortal have moved to their own pages.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Hero       from '../components/Hero/Hero'
import About      from '../components/About/About'
import ForEveryone from '../components/ForEveryone/ForEveryone'
import Services   from '../components/Services/Services'
import Process    from '../components/Process/Process'
import WhyCWC     from '../components/WhyCWC/WhyCWC'
import Contact    from '../components/Contact/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ForEveryone />
      <Services />
      <Process />
      <WhyCWC />
      <Contact />
    </>
  )
}
