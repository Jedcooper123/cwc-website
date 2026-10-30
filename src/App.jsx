// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root with React Router. All routes defined here.
//
// Routes:
//   /           → HomePage    (hero, features, work, pricing, process, FAQ)
//   /work       → WorkPage    (full portfolio)
//   /pricing    → PricingPage (how quotes work + FAQ)
//   /contact    → ContactPage (Calendly + contact form)
//   /portal     → PortalPage  (client login + dashboard)
//   /privacy    → PrivacyPage (required for Meta ads)
//   /services/* → redirect to /pricing (old service pages were retired)
//   *           → redirect to /
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Navbar      from './components/Navbar/Navbar'
import Footer      from './components/Footer/Footer'

import HomePage    from './pages/HomePage'
import WorkPage    from './pages/WorkPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import PortalPage  from './pages/PortalPage'
import PrivacyPage from './pages/PrivacyPage'

import { captureSource, track, trackPageView } from './lib/analytics'

// Remember the ad/link a visitor arrived from before routing strips the query.
captureSource()

// Scroll to top on route change, or to the #section in the URL if there is one.
// Effects run after the new page is in the DOM, so the section already exists.
// Jumps instantly (like a normal page load) instead of using the CSS smooth scroll.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) {
      target.scrollIntoView({ behavior: 'instant' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

// Meta Pixel: a PageView per page, and a Contact event whenever a phone or
// email link is tapped anywhere on the public site.
function Analytics() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest?.('a[href^="tel:"], a[href^="mailto:"]')
      if (!link || window.location.pathname.startsWith('/portal')) return
      track('Contact', { content_name: link.href.startsWith('tel:') ? 'phone' : 'email' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}

function AppLayout() {
  const { pathname } = useLocation()
  // Portal has its own full-screen layout — hide the shared footer there
  const hideFooter = pathname.startsWith('/portal')

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Analytics />
      <main>
        <Routes>
          <Route path="/"           element={<HomePage />}    />
          <Route path="/work"       element={<WorkPage />}    />
          <Route path="/pricing"    element={<PricingPage />} />
          <Route path="/plans"      element={<Navigate to="/pricing" replace />} />
          <Route path="/contact"    element={<ContactPage />} />
          <Route path="/portal/*"   element={<PortalPage />}  />
          <Route path="/privacy"    element={<PrivacyPage />} />
          <Route path="/services/*" element={<Navigate to="/pricing" replace />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
