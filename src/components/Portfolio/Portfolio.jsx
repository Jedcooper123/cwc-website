// ─────────────────────────────────────────────────────────────────────────────
// Portfolio — Live client sites shown in iframe previews.
// Real sites: Zander Keller Photography & Jed Cooper Portfolio.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Portfolio.module.css'

const PROJECTS = [
  {
    title: 'Zander Keller Photography',
    type: 'Photography & Creative',
    desc: 'A full custom website for a professional photographer built for visual impact, fast load times, and a smooth gallery experience on every device.',
    tags: ['Custom Design', 'Render', 'Performance'],
    url: 'https://zander-keller-photography.onrender.com/',
    accentColor: '#818cf8',
  },
  {
    title: 'Jed Cooper — Developer Portfolio',
    type: 'Personal / Professional',
    desc: 'A clean, modern portfolio site built to make a strong first impression. Showcases projects, skills, and professional background.',
    tags: ['Portfolio', 'GitHub Pages', 'Responsive'],
    url: 'https://jedcooper123.github.io/Professional-Portfolio/',
    accentColor: '#4d7cfe',
  },
]

function LiveCard({ project }) {
  const [loaded, setLoaded] = useState(false)
  const { title, type, desc, tags, url, accentColor } = project

  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        {!loaded && (
          <div className={styles.iframeLoader}>
            <div className={styles.loaderSpinner} />
            <span>Loading preview...</span>
          </div>
        )}
        <iframe
          src={url}
          title={title}
          className={`${styles.iframe} ${loaded ? styles.iframeLoaded : ''}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          style={{ '--accent': accentColor }}
        />
        <div className={styles.thumbOverlay}>
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.overlayBtn}>
            <FiExternalLink size={16} /> Visit Live Site
          </a>
        </div>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} /> Live
        </span>
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.type}>{type}</span>
          <div className={styles.tags}>
            {tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.siteLink}>
          <FiExternalLink size={12} /> {url.replace('https://', '').replace(/\/$/, '')}
        </a>
      </div>
    </div>
  )
}

export default function Portfolio() {
  const ref = useScrollAnimation()

  return (
    <section id="portfolio" className={`section ${styles.portfolio}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Our Work</p>
          <h2 className="section-title fade-up delay-1">Sites we have shipped.</h2>
          <p className={`section-sub fade-up delay-2`}>
            Every project is built from scratch with your goals at the center.
            No templates, no shortcuts.
          </p>
        </div>

        <div className={styles.grid}>
          {PROJECTS.map((project, i) => (
            <div key={project.title} className={`fade-up delay-${i + 1}`}>
              <LiveCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
