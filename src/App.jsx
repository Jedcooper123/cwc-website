// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root with React Router. All routes defined here.
//
// Routes:
//   /                    → HomePage    (hero, about, services, process, …)
//   /services            → ServicesPage (full services overview)
//   /services/:serviceId → ServiceDetailPage (individual service)
//   /portal              → PortalPage  (client login + dashboard)
//   *                    → redirect to /
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Navbar            from './components/Navbar/Navbar'
import Footer            from './components/Footer/Footer'

import HomePage          from './pages/HomePage'
import ServicesPage      from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import PortalPage        from './pages/PortalPage'

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
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
      <main>
        <Routes>
          <Route path="/"                    element={<HomePage />}          />
          <Route path="/services"            element={<ServicesPage />}      />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/portal"              element={<PortalPage />}        />
          <Route path="*"                    element={<Navigate to="/" replace />} />
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
