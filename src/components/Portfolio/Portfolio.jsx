// ─────────────────────────────────────────────────────────────────────────────
// Portfolio — Client sites shown as screenshots in a browser frame.
// Screenshots live in public/work/ (1440×900 captures of each live site).
//
// variant="full"    → featured project + grid of the rest (Work page)
// variant="preview" → featured project + link to /work (home page)
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Portfolio.module.css'

const PROJECTS = [
  {
    id: 'classic-cleanz',
    title: 'Classic Cleanz Detailing',
    type: 'Mobile Auto Detailing · Boone, NC',
    desc: 'Online booking, an owner dashboard, and instant email confirmations.',
    tags: ['Online booking', 'Owner dashboard', 'Email alerts'],
    url: 'https://www.classiccleanzdetailing.com/',
    image: '/work/classic-cleanz.jpg',
    featured: true,
  },
  {
    id: 'qm-lawncare',
    title: 'Q & M Lawncare',
    type: 'Lawn & Landscaping',
    url: 'https://qmlawncare.com/',
    image: '/work/qm-lawncare.jpg',
  },
  {
    id: 'willy-b',
    title: "Willy B's Grill",
    type: 'Food Truck',
    url: 'https://willy-b-grill-website-1.onrender.com/',
    image: '/work/willy-b.jpg',
  },
  {
    id: 'zander-keller',
    title: 'Zander Keller Photography',
    type: 'Photography',
    url: 'https://www.zanderkellerphotography.com/',
    image: '/work/zander-keller.jpg',
  },
]

function Browser({ src, alt }) {
  return (
    <div className={styles.browser}>
      <div className={styles.chrome} aria-hidden="true">
        <span /><span /><span />
      </div>
      <img src={src} alt={alt} width="1440" height="900" loading="lazy" className={styles.shot} />
    </div>
  )
}

export default function Portfolio({ variant = 'full' }) {
  const ref = useScrollAnimation()
  const isPreview = variant === 'preview'
  const featured  = PROJECTS.find((p) => p.featured)
  const rest      = PROJECTS.filter((p) => !p.featured)

  return (
    <section id="work" className={`section ${isPreview ? 'section-surface' : ''}`} ref={ref}>
      <div className="container">
        {isPreview && (
          <div className="section-head">
            <p className="section-label fade-up">Our Work</p>
            <h2 className="section-title fade-up delay-1">Built for real businesses.</h2>
          </div>
        )}

        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.featured} ${isPreview ? styles.onSurface : ''} fade-up delay-1`}
        >
          <div className={styles.featuredCopy}>
            <span className={styles.badge}>New</span>
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
            <p className={styles.type}>{featured.type}</p>
            <p className={styles.desc}>{featured.desc}</p>
            <ul className={styles.tags}>
              {featured.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <span className="link-arrow">Visit site <FiArrowUpRight /></span>
          </div>
          <Browser src={featured.image} alt={`${featured.title} website`} />
        </a>

        {isPreview ? (
          <div className={`${styles.more} fade-up delay-2`}>
            <Link to="/work" className="link-arrow">See all our work <FiChevronRight /></Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {rest.map((p, i) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.card} fade-up delay-${i + 1}`}
              >
                <Browser src={p.image} alt={`${p.title} website`} />
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <p className={styles.type}>{p.type}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
