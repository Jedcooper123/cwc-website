// ─────────────────────────────────────────────────────────────────────────────
// Navbar — Slim frosted-glass top bar with centered links, portal link, and a
// full-screen mobile menu.
// NOTE: The mobile menu is rendered OUTSIDE <header> so the header's
// backdrop-filter doesn't create a containing block that clips it on mobile.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import styles from './Navbar.module.css'

const LINKS = [
  { label: 'Work',         to: '/work'     },
  { label: 'Pricing',      to: '/pricing'  },
  { label: 'How It Works', to: '/#process' },
  { label: 'Contact',      to: '/contact'  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on navigation
  useEffect(() => { setMenuOpen(false) }, [location.pathname, location.hash])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Section links on the home page scroll directly — the router won't
  // re-fire for a hash that's already in the URL
  const handleClick = (e, to) => {
    if (to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault()
      document.getElementById(to.slice(2))?.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  const isActive = (to) => !to.includes('#') && location.pathname.startsWith(to)

  return (
    <>
      <header className={`${styles.header} ${scrolled || menuOpen ? styles.scrolled : ''}`}>
        <nav className={`${styles.nav} container`} aria-label="Main">

          <Link to="/" className={styles.logo} aria-label="Launchpad Web Consulting home">
            <span className={styles.logoMark} aria-hidden="true">L</span>
            <span className={styles.logoText}>Launchpad</span>
          </Link>

          <ul className={styles.links}>
            {LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={`${styles.link} ${isActive(to) ? styles.active : ''}`}
                  aria-current={isActive(to) ? 'page' : undefined}
                  onClick={(e) => handleClick(e, to)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.right}>
            <Link to="/portal" className={styles.portalLink}>Client Portal</Link>
            <Link to="/contact" className={styles.cta}>Book a Call</Link>
          </div>

          <button
            className={styles.toggle}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </nav>
      </header>

      <div className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`} aria-hidden={!menuOpen}>
        <ul className={styles.menuLinks}>
          {LINKS.map(({ label, to }) => (
            <li key={label}>
              <Link to={to} className={styles.menuLink} onClick={(e) => handleClick(e, to)}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/portal" className={styles.menuLink} onClick={(e) => handleClick(e, '/portal')}>
              Client Portal
            </Link>
          </li>
        </ul>
        <Link to="/contact" className="btn-primary btn-lg" onClick={(e) => handleClick(e, '/contact')}>
          Book a Free 15-Minute Call
        </Link>
      </div>
    </>
  )
}
