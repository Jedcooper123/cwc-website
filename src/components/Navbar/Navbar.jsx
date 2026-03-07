// ─────────────────────────────────────────────────────────────────────────────
// Navbar — Sticky top navigation with scroll-aware styling, CWC logo,
// desktop nav links, and a responsive mobile menu.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'About',     href: '#about'    },
  { label: 'Services',  href: '#services' },
  { label: 'Process',   href: '#process'  },
  { label: 'Portfolio', href: '#portfolio'},
  { label: 'Pricing',   href: '#pricing'  },
  { label: 'Contact',   href: '#contact'  },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  // Add background/blur when user scrolls past 24 px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={`${styles.nav} container`}>

        {/* ── Logo ── */}
        <a href="#hero" className={styles.logo} onClick={close}>
          <span className={styles.logoMark}>CWC</span>
          <span className={styles.logoName}>Cooper Web Consulting</span>
        </a>

        {/* ── Desktop Links ── */}
        <ul className={styles.links}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={styles.link}>{label}</a>
            </li>
          ))}
        </ul>

        {/* ── Desktop CTA ── */}
        <a href="#contact" className={`${styles.cta} btn-primary`}>
          Get Started <FiArrowRight />
        </a>

        {/* ── Mobile Toggle ── */}
        <button
          className={styles.toggle}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className={styles.drawerLinks}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={styles.drawerLink} onClick={close}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#contact" className={`${styles.drawerCta} btn-primary`} onClick={close}>
          Get Started <FiArrowRight />
        </a>
      </div>

      {/* ── Mobile Backdrop ── */}
      {menuOpen && (
        <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      )}
    </header>
  )
}
