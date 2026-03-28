// ─────────────────────────────────────────────────────────────────────────────
// Footer — Brand, nav links, contact info, social links, and copyright.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiLinkedin, FiArrowRight, FiGlobe } from 'react-icons/fi'
import styles from './Footer.module.css'

const NAV_COLS = [
  {
    heading: 'Company',
    links: [
      { label: 'About',         href: '/#about'   },
      { label: 'Our Process',   href: '/#process' },
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
    heading: 'Services',
    links: [
      { label: 'Web Design',       href: '/services/web-design'  },
      { label: 'Hosting',          href: '/services/hosting'     },
      { label: 'Maintenance',      href: '/services/maintenance' },
      { label: 'Performance',      href: '/services/performance' },
      { label: 'SEO & Visibility', href: '/services/seo'         },
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
          {/* Brand column */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoMark}>Launchpad</span>
            </Link>
            <p className={styles.tagline}>
              Launchpad Web Consulting builds lead qualification systems for
              service businesses — so you spend less time on bad leads and more
              time closing the right ones.
            </p>
            <div className={styles.social}>
              <Link
                to="/contact"
                className={styles.socialLink}
                aria-label="Email"
              >
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
              <Link
                to="/"
                className={styles.socialLink}
                aria-label="Website"
              >
                <FiGlobe />
              </Link>
            </div>
          </div>

          {/* Nav columns */}
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

          {/* CTA column */}
          <div className={styles.ctaCol}>
            <h4 className={styles.navHeading}>Get Better Leads</h4>
            <p className={styles.ctaBody}>
              Ready to stop wasting time on the wrong customers?
              Let's build your lead system.
            </p>
            <Link to="/contact" className={`btn-primary ${styles.ctaBtn}`}>
              Get Better Leads <FiArrowRight />
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
