import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const COLS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Our Work',     to: '/work'     },
      { label: 'Pricing',      to: '/pricing'  },
      { label: 'How It Works', to: '/#process' },
      { label: 'FAQ',          to: '/#faq'     },
    ],
  },
  {
    heading: 'Get in Touch',
    links: [
      { label: 'Book a Call',          to: '/contact' },
      { label: '(336) 707-0245',       href: 'tel:+13367070245' },
      { label: 'jedpcooper@gmail.com', href: 'mailto:jedpcooper@gmail.com' },
      { label: 'LinkedIn',             href: 'https://www.linkedin.com/in/jed-cooper-a5816a208/', external: true },
    ],
  },
  {
    heading: 'Clients',
    links: [
      { label: 'Client Portal', to: '/portal' },
    ],
  },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoMark} aria-hidden="true">L</span>
              Launchpad Web Consulting
            </Link>
            <p className={styles.tagline}>Websites for small businesses.</p>
          </div>

          {COLS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className={styles.heading}>{heading}</h4>
              <ul className={styles.list}>
                {links.map(({ label, to, href, external }) => (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className={styles.link}>{label}</Link>
                    ) : (
                      <a
                        href={href}
                        className={styles.link}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          © {YEAR} Launchpad Web Consulting. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
