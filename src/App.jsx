// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root component. Assembles all sections in page order.
// To add/remove/reorder sections, simply add/remove imports and JSX here.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Navbar       from './components/Navbar/Navbar'
import Hero         from './components/Hero/Hero'
import About        from './components/About/About'
import Services     from './components/Services/Services'
import Process      from './components/Process/Process'
import WhyCWC       from './components/WhyCWC/WhyCWC'
import Portfolio    from './components/Portfolio/Portfolio'
import Pricing      from './components/Pricing/Pricing'
import ClientPortal from './components/ClientPortal/ClientPortal'
import Contact      from './components/Contact/Contact'
import Footer       from './components/Footer/Footer'

function App() {
  return (
    <>
      {/* Fixed navigation */}
      <Navbar />

      {/* Main content */}
      <main>
        <Hero />
        <About />
        <Services />
        <Process />
        <WhyCWC />
        <Portfolio />
        <Pricing />
        <ClientPortal />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default App
