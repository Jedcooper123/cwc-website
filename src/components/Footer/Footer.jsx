import React from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiLinkedin, FiArrowRight, FiGlobe } from 'react-icons/fi'
import styles from './Footer.module.css'

const NAV_COLS = [
  {
    heading: 'Company',
    links: [
      { label: 'About',         href: '/#about'   },
      { label: 'How It Works',  href: '/#process' },
      { label: 'Why Launchpad', href: '/#why-cwc' },
    ],
  },
  {
    heading: 'Work',
    links: [
      { label: 'Our Work',   href: '/work'    },
      { label: 'Pricing',    href: '/pricing' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    heading: 'What\'s Included',
    links: [
      { label: 'Custom Design',    href: '/#services' },
      { label: 'Hosting & SSL',    href: '/#services' },
      { label: 'Maintenance',      href: '/#services' },
      { label: 'Content Updates',  href: '/#services' },
      { label: 'SEO Basics',       href: '/#services' },
    ],
  },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>

        {/* ── Top: Brand + Nav ── */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoMark}>Launchpad</span>
            </Link>
            <p className={styles.tagline}>
              Launchpad Web Consulting builds professional websites for
              small businesses nationwide. Front-End sites from $350 + $35/mo.
              Full Stack sites from $499 + $50/mo. No contracts.
            </p>
            <div className={styles.social}>
              <Link to="/contact" className={styles.socialLink} aria-label="Email">
                <FiMail />
              </Link>
              <a
                href="https://www.linkedin.com/in/jed-cooper-a5816a208/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <FiLinkedin />
              </a>
              <a href="tel:+13367070245" className={styles.socialLink} aria-label="Phone">
                <FiPhone />
              </a>
              <Link to="/" className={styles.socialLink} aria-label="Website">
                <FiGlobe />
              </Link>
            </div>
          </div>

          {NAV_COLS.map(({ heading, links }) => (
            <div key={heading} className={styles.navCol}>
              <h4 className={styles.navHeading}>{heading}</h4>
              <ul className={styles.navList}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className={styles.navLink}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={styles.ctaCol}>
            <h4 className={styles.navHeading}>Get Your Business Online</h4>
            <p className={styles.ctaBody}>
              15 minutes is all it takes to get started.
              Book a free call today.
            </p>
            <Link to="/contact" className={`btn-primary ${styles.ctaBtn}`}>
              Book a Free 15-Minute Call <FiArrowRight />
            </Link>
            <div className={styles.contact}>
              <a href="mailto:jedpcooper@gmail.com" className={styles.contactLink}>
                jedpcooper@gmail.com
              </a>
              <a href="tel:+13367070245" className={styles.contactLink}>
                (336) 707-0245
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom: Legal ── */}
        <div className={styles.bottom}>
          <span className={styles.copy}>
            © {YEAR} Launchpad Web Consulting. All rights reserved.
          </span>
          <div className={styles.legal}>
            <a href="#" className={styles.legalLink}>Privacy Policy</a>
            <span className={styles.dot}>·</span>
            <a href="#" className={styles.legalLink}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
