// ─────────────────────────────────────────────────────────────────────────────
// Footer — Brand, nav links, contact info, social links, and copyright.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiMail, FiPhone, FiLinkedin, FiArrowRight, FiGlobe } from 'react-icons/fi'
import styles from './Footer.module.css'

const NAV_COLS = [
  {
    heading: 'Company',
    links: [
      { label: 'About',          href: '#about'    },
      { label: 'Services',       href: '#services' },
      { label: 'Process',        href: '#process'  },
      { label: 'Why CWC',        href: '#why-cwc'  },
    ],
  },
  {
    heading: 'Work',
    links: [
      { label: 'Portfolio',      href: '#portfolio' },
      { label: 'Pricing',        href: '#pricing'   },
      { label: 'Client Platform', href: '#portal'   },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Web Design',          href: '#services' },
      { label: 'Development',         href: '#services' },
      { label: 'Hosting',             href: '#services' },
      { label: 'Maintenance',         href: '#services' },
      { label: 'Performance & SEO',   href: '#services' },
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
            <a href="#hero" className={styles.logo}>
              <span className={styles.logoMark}>CWC</span>
            </a>
            <p className={styles.tagline}>
              Cooper Web Consulting helps businesses build, grow, and maintain
              a modern web presence — from first launch to long-term success.
            </p>
            <div className={styles.social}>
              <a
                href="mailto:jedpcooper@gmail.com"
                className={styles.socialLink}
                aria-label="Email"
              >
                <FiMail />
              </a>
              <a
                href="https://linkedin.com/in/yourprofile"
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
              <a
                href="#hero"
                className={styles.socialLink}
                aria-label="Website"
              >
                <FiGlobe />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map(({ heading, links }) => (
            <div key={heading} className={styles.navCol}>
              <h4 className={styles.navHeading}>{heading}</h4>
              <ul className={styles.navList}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className={styles.navLink}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA column */}
          <div className={styles.ctaCol}>
            <h4 className={styles.navHeading}>Start a Project</h4>
            <p className={styles.ctaBody}>
              Ready to launch, improve, or grow your web presence?
              Let's talk.
            </p>
            <a href="#contact" className={`btn-primary ${styles.ctaBtn}`}>
              Get in Touch <FiArrowRight />
            </a>
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
            © {YEAR} Cooper Web Consulting. All rights reserved.
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
