import React from 'react'
import Hero        from '../components/Hero/Hero'
import About       from '../components/About/About'
import ForEveryone from '../components/ForEveryone/ForEveryone'
import Services    from '../components/Services/Services'
import Process     from '../components/Process/Process'
import WhyCWC      from '../components/WhyCWC/WhyCWC'
import FAQ         from '../components/FAQ/FAQ'
import Contact     from '../components/Contact/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ForEveryone />
      <Services />
      <Process />
      <WhyCWC />
      <FAQ />
      <Contact />
    </>
  )
}
