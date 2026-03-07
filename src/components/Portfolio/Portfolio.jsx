// ─────────────────────────────────────────────────────────────────────────────
// Portfolio — Live client sites shown in iframe previews + placeholder cards.
// Real sites: Zander Keller Photography & Jed Cooper Portfolio.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { FiExternalLink, FiGlobe } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Portfolio.module.css'

const PROJECTS = [
  {
    title: 'Zander Keller Photography',
    type: 'Photography & Creative',
    desc: 'Full custom website for a professional photographer — built for visual impact, fast load times, and a seamless gallery experience on every device.',
    tags: ['Custom Design', 'Render', 'Performance'],
    url: 'https://zander-keller-photography.onrender.com/',
    live: true,
    featured: true,
    gradient: 'linear-gradient(135deg, #0f1117 0%, #1a1a2e 100%)',
    accentColor: '#818cf8',
  },
  {
    title: 'Jed Cooper — Portfolio',
    type: 'Personal / Professional',
    desc: 'A clean, modern personal portfolio site showcasing projects, skills, and professional experience — built for first impressions and fast delivery.',
    tags: ['Portfolio', 'GitHub Pages', 'Responsive'],
    url: 'https://jedcooper123.github.io/Professional-Portfolio/',
    live: true,
    featured: true,
    gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
    accentColor: '#4d7cfe',
  },
  {
    title: 'Meridian Law Group',
    type: 'Professional Services',
    desc: 'Full brand redesign and custom website for a regional law firm — built for trust, lead conversion, and search visibility.',
    tags: ['React', 'SEO', 'Lead Gen'],
    url: '#',
    live: false,
    featured: false,
    gradient: 'linear-gradient(135deg, #1a1f2e 0%, #2d3550 100%)',
    accentColor: '#5b8df5',
  },
  {
    title: 'Summit Roofing Co.',
    type: 'Home Services',
    desc: 'Mobile-first site with an estimate request form and service area locator for a growing roofing contractor.',
    tags: ['Responsive', 'Forms', 'Local SEO'],
    url: '#',
    live: false,
    featured: false,
    gradient: 'linear-gradient(135deg, #1a2218 0%, #2a3520 100%)',
    accentColor: '#4ade80',
  },
  {
    title: 'PocketBooks CPA',
    type: 'Financial Services',
    desc: 'Professional site for a boutique accounting firm with secure contact forms, service pages, and client-facing FAQs.',
    tags: ['Professional', 'Secure', 'Custom'],
    url: '#',
    live: false,
    featured: false,
    gradient: 'linear-gradient(135deg, #191a12 0%, #2d2e18 100%)',
    accentColor: '#facc15',
  },
  {
    title: 'NorthEdge SaaS',
    type: 'Technology',
    desc: 'Marketing site and early-access landing page for a B2B SaaS product — designed for conversions and investor credibility.',
    tags: ['SaaS', 'Full-Stack', 'A/B Ready'],
    url: '#',
    live: false,
    featured: false,
    gradient: 'linear-gradient(135deg, #11181a 0%, #182630 100%)',
    accentColor: '#22d3ee',
  },
]

function LiveCard({ project }) {
  const [loaded, setLoaded] = useState(false)
  const { title, type, desc, tags, url, accentColor, featured } = project

  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <div className={styles.thumb}>
        {!loaded && (
          <div className={styles.iframeLoader}>
            <div className={styles.loaderSpinner} />
            <span>Loading preview…</span>
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
      <CardInfo type={type} tags={tags} title={title} desc={desc} url={url} live />
    </div>
  )
}

function PlaceholderCard({ project }) {
  const { title, type, desc, tags, gradient, accentColor } = project
  return (
    <div className={styles.card}>
      <div className={styles.thumb} style={{ background: gradient }}>
        <div className={styles.thumbInner}>
          <div className={styles.mockNav}>
            <div style={{ width: 50, height: 9, borderRadius: 4, background: accentColor + '44' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3].map(n => <div key={n} style={{ width: 30, height: 7, borderRadius: 3, background: 'rgba(255,255,255,0.15)' }} />)}
            </div>
          </div>
          <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: '85%', height: 11, borderRadius: 5, background: accentColor + '55' }} />
            <div style={{ width: '60%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
        <div className={styles.thumbOverlay}>
          <span className={styles.overlayComingSoon}><FiGlobe size={14} /> Coming Soon</span>
        </div>
      </div>
      <CardInfo type={type} tags={tags} title={title} desc={desc} live={false} />
    </div>
  )
}

function CardInfo({ type, tags, title, desc, url, live }) {
  return (
    <div className={styles.info}>
      <div className={styles.meta}>
        <span className={styles.type}>{type}</span>
        <div className={styles.tags}>
          {tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{desc}</p>
      {live && url && url !== '#' && (
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.siteLink}>
          <FiExternalLink size={12} /> {url.replace('https://', '').replace(/\/$/, '')}
        </a>
      )}
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
          <h2 className="section-title fade-up delay-1">Projects built for real results.</h2>
          <p className={`section-sub fade-up delay-2`}>
            A look at what CWC has shipped. Every project is custom-crafted
            with your goals at the center.
          </p>
        </div>

        <div className={styles.grid}>
          {PROJECTS.map((project, i) =>
            project.live ? (
              <div key={project.title} className={`fade-up delay-${(i % 3) + 1}`}>
                <LiveCard project={project} />
              </div>
            ) : (
              <div key={project.title} className={`fade-up delay-${(i % 3) + 1}`}>
                <PlaceholderCard project={project} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
