// ─────────────────────────────────────────────────────────────────────────────
// Navbar — Sticky top nav with React Router links, bigger CWC logo block,
// services dropdown, portal link, and responsive mobile drawer.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiArrowRight, FiChevronDown, FiLock } from 'react-icons/fi'
import styles from './Navbar.module.css'

const PRIMARY_LINKS = [
  { label: 'About',     to: '/#about'    },
  { label: 'Process',   to: '/#process'  },
  { label: 'Portfolio', to: '/#portfolio'},
  { label: 'Pricing',   to: '/#pricing'  },
]

const SERVICE_LINKS = [
  { label: 'Design & Development', to: '/services/web-design'  },
  { label: 'Hosting Solutions',    to: '/services/hosting'     },
  { label: 'Maintenance',          to: '/services/maintenance' },
  { label: 'Performance',          to: '/services/performance' },
  { label: 'Web Strategy',         to: '/services/strategy'    },
  { label: 'SEO & Visibility',     to: '/services/seo'         },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location    = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close everything on route change
  useEffect(() => { setMenuOpen(false); setServicesOpen(false) }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setServicesOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // Lock body while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Smooth-scroll to section IDs when already on the home page
  const handleAnchorLink = (e, to) => {
    if (to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault()
      document.getElementById(to.slice(2))?.scrollIntoView({ behavior: 'smooth' })
      setMenuOpen(false)
    }
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={`${styles.nav} container`}>

        {/* ── Logo ── */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>CWC</span>
          <span className={styles.logoName}>Cooper Web Consulting</span>
        </Link>

        {/* ── Desktop Links ── */}
        <ul className={styles.links}>
          {/* Services dropdown */}
          <li className={styles.dropWrap} ref={dropdownRef}>
            <button
              className={`${styles.link} ${styles.dropTrigger}`}
              onClick={() => setServicesOpen((o) => !o)}
              aria-expanded={servicesOpen}
            >
              Services
              <FiChevronDown
                size={14}
                className={`${styles.chevron} ${servicesOpen ? styles.chevronOpen : ''}`}
              />
            </button>

            {servicesOpen && (
              <div className={styles.dropMenu}>
                <p className={styles.dropHeader}>What We Build</p>
                <div className={styles.dropGrid}>
                  {SERVICE_LINKS.map(({ label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      className={styles.dropItem}
                      onClick={() => setServicesOpen(false)}
                    >
                      {label}
                      <FiArrowRight size={11} className={styles.dropArrow} />
                    </Link>
                  ))}
                </div>
                <Link
                  to="/services"
                  className={styles.dropAll}
                  onClick={() => setServicesOpen(false)}
                >
                  Browse all services →
                </Link>
              </div>
            )}
          </li>

          {PRIMARY_LINKS.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className={styles.link}
                onClick={(e) => handleAnchorLink(e, to)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop right-side CTAs ── */}
        <div className={styles.rightActions}>
          <Link to="/portal" className={styles.portalLink}>
            <FiLock size={13} /> Client Portal
          </Link>
          <Link
            to="/#contact"
            className={`btn-primary ${styles.ctaBtn}`}
            onClick={(e) => handleAnchorLink(e, '/#contact')}
          >
            Get Started <FiArrowRight size={14} />
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className={styles.toggle}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerGroup}>
          <span className={styles.drawerLabel}>Services</span>
          {SERVICE_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className={styles.drawerLink}>{label}</Link>
          ))}
          <Link to="/services" className={`${styles.drawerLink} ${styles.drawerLinkAccent}`}>
            All services →
          </Link>
        </div>
        <div className={styles.drawerGroup}>
          <span className={styles.drawerLabel}>Company</span>
          {PRIMARY_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={styles.drawerLink}
              onClick={(e) => handleAnchorLink(e, to)}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className={styles.drawerCtas}>
          <Link to="/portal" className="btn-secondary" style={{ justifyContent: 'center', fontSize: '0.875rem' }}>
            <FiLock size={13} /> Client Portal
          </Link>
          <Link
            to="/#contact"
            className="btn-primary"
            style={{ justifyContent: 'center', fontSize: '0.875rem' }}
            onClick={(e) => handleAnchorLink(e, '/#contact')}
          >
            Get Started <FiArrowRight />
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
