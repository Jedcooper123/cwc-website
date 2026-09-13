import React from 'react'
import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import styles from './Hero.module.css'

// Fanned screenshots of real client sites (files in public/portfolio/)
const SHOTS = [
  { src: '/portfolio/qm-lawncare.jpg',    alt: 'Q & M Lawncare website',           pos: 'left'   },
  { src: '/portfolio/willy-b.jpg',        alt: "Willy B's Grill website",          pos: 'right'  },
  { src: '/portfolio/classic-cleanz.jpg', alt: 'Classic Cleanz Detailing website', pos: 'center' },
]

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={`${styles.copy} container`}>
        <p className={styles.eyebrow}>Launchpad Web Consulting</p>

        <h1 className={styles.headline}>
          Websites that<br />
          bring in <span className={styles.grad}>business.</span>
        </h1>

        <p className={styles.sub}>
          Designed, built, and hosted for you. Live in two weeks.
        </p>

        <div className={styles.actions}>
          <Link to="/contact" className="btn-primary btn-lg">
            Book a Free 15-Minute Call
          </Link>
          <Link to="/work" className="link-arrow">
            See our work <FiChevronRight />
          </Link>
        </div>

        <p className={styles.price}>
          <strong>$750</strong> deposit <span aria-hidden="true">·</span> <strong>$55</strong>/month
        </p>
      </div>

      <div className={styles.stage}>
        {SHOTS.map(({ src, alt, pos }) => (
          <figure key={src} className={`${styles.shot} ${styles[pos]}`}>
            <div className={styles.chrome} aria-hidden="true">
              <span /><span /><span />
            </div>
            <img src={src} alt={alt} width="1440" height="900" />
          </figure>
        ))}
      </div>
    </section>
  )
}
