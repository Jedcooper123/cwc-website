// ─────────────────────────────────────────────────────────────────────────────
// Navbar — Sticky top nav with React Router links, logo, portal link, and
// responsive mobile drawer.
// NOTE: Drawer is rendered OUTSIDE <header> to avoid backdrop-filter creating
// a new containing block that clips fixed-positioned children on mobile.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiArrowRight, FiLock } from 'react-icons/fi'
import styles from './Navbar.module.css'

const PRIMARY_LINKS = [
  { label: 'About',    to: '/#about'   },
  { label: 'Our Work', to: '/work'     },
  { label: 'Pricing',  to: '/pricing'  },
  { label: 'Contact',  to: '/#contact' },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Smooth-scroll to section IDs when already on the home page
  const handleAnchorLink = (e, to) => {
    if (to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault()
      const id = to.slice(2)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      setMenuOpen(false)
    }
  }

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <nav className={`${styles.nav} container`}>

          {/* ── Logo ── */}
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>L</span>
            <div className={styles.logoText}>
              <span className={styles.logoPrimary}>Launchpad</span>
              <span className={styles.logoSub}>Web Consulting</span>
            </div>
          </Link>

          {/* ── Desktop Links ── */}
          <ul className={styles.links}>
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
      </header>

      {/* ── Mobile drawer ──
          Rendered OUTSIDE <header> so the header's backdrop-filter does NOT
          create a new fixed-position containing block, which would clip the
          drawer when the user has scrolled down the page. */}
      <div
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerGroup}>
          <span className={styles.drawerLabel}>Navigation</span>
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
          <Link
            to="/portal"
            className="btn-secondary"
            style={{ justifyContent: 'center', fontSize: '0.875rem' }}
          >
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
    </>
  )
}
