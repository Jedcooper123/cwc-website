// ─────────────────────────────────────────────────────────────────────────────
// Portfolio — Showcase of client projects with placeholder cards designed
// to be swapped for real work later. Each card uses a gradient thumbnail.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiArrowUpRight, FiExternalLink } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Portfolio.module.css'

// ── Swap these out with real project data when you're ready ──
const PROJECTS = [
  {
    title: 'Meridian Law Group',
    type: 'Professional Services',
    desc: 'Full brand redesign and custom website for a regional law firm — built for trust, lead conversion, and search visibility.',
    tags: ['React', 'SEO', 'Custom Design'],
    gradient: 'linear-gradient(135deg, #1a1f2e 0%, #2d3550 100%)',
    accentColor: '#4d7cfe',
    featured: true,
  },
  {
    title: 'Summit Roofing Co.',
    type: 'Home Services',
    desc: 'Mobile-first website with an online estimate request form and service area locator for a growing roofing contractor.',
    tags: ['Responsive', 'Lead Gen', 'Performance'],
    gradient: 'linear-gradient(135deg, #1a2218 0%, #2a3520 100%)',
    accentColor: '#4ade80',
    featured: false,
  },
  {
    title: 'Vivid Studio',
    type: 'Creative Agency',
    desc: 'Portfolio site for a photography and branding studio with a fully custom gallery system and inquiry flow.',
    tags: ['Portfolio', 'CMS', 'Animation'],
    gradient: 'linear-gradient(135deg, #1f1018 0%, #35152c 100%)',
    accentColor: '#e879f9',
    featured: false,
  },
  {
    title: 'PocketBooks CPA',
    type: 'Financial Services',
    desc: 'Clean, professional site for a boutique accounting firm — secure contact forms, service pages, and client-facing FAQs.',
    tags: ['Professional', 'Secure', 'Custom Forms'],
    gradient: 'linear-gradient(135deg, #191a12 0%, #2d2e18 100%)',
    accentColor: '#facc15',
    featured: false,
  },
  {
    title: 'CoreFit Training',
    type: 'Health & Fitness',
    desc: 'Class scheduling, trainer profiles, and membership tiers for a local fitness studio looking to expand online.',
    tags: ['Full Stack', 'Booking', 'Membership'],
    gradient: 'linear-gradient(135deg, #1a1212 0%, #2e1a1a 100%)',
    accentColor: '#f97316',
    featured: false,
  },
  {
    title: 'NorthEdge SaaS',
    type: 'Technology',
    desc: 'Marketing site and early-access landing page for a B2B SaaS product — designed for conversions and investor credibility.',
    tags: ['SaaS', 'Landing Page', 'A/B Ready'],
    gradient: 'linear-gradient(135deg, #11181a 0%, #182630 100%)',
    accentColor: '#22d3ee',
    featured: false,
  },
]

export default function Portfolio() {
  const ref = useScrollAnimation()

  return (
    <section id="portfolio" className={`section ${styles.portfolio}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">Our Work</p>
          <h2 className="section-title fade-up delay-1">
            Projects built for real results.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            A curated look at what CWC has built — and what we can build for you.
            Every project is custom-crafted with your goals in mind.
          </p>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {PROJECTS.map(({ title, type, desc, tags, gradient, accentColor, featured }, i) => (
            <div
              key={title}
              className={`${styles.card} ${featured ? styles.featured : ''} fade-up delay-${(i % 3) + 1}`}
            >
              {/* Thumbnail */}
              <div className={styles.thumb} style={{ background: gradient }}>
                <div className={styles.thumbInner}>
                  {/* Simulated site preview */}
                  <div className={styles.mockNav}>
                    <div className={styles.mockLogoBar} style={{ background: accentColor + '33' }} />
                    <div className={styles.mockNavLinks}>
                      {[1,2,3].map(n => <div key={n} className={styles.mockLine} />)}
                    </div>
                  </div>
                  <div className={styles.mockHero}>
                    <div className={styles.mockH} style={{ background: accentColor + '55' }} />
                    <div className={styles.mockH} style={{ width: '70%', background: accentColor + '33' }} />
                  </div>
                  <div className={styles.mockCards}>
                    {[1,2,3].map(n => (
                      <div key={n} className={styles.mockCard}>
                        <div className={styles.mockCardTop} style={{ background: accentColor + '44' }} />
                        <div className={styles.mockCardLine} />
                      </div>
                    ))}
                  </div>
                </div>
                {featured && <div className={styles.featuredBadge}>Featured</div>}
                <div className={styles.thumbOverlay}>
                  <FiExternalLink size={20} />
                  <span>View Project</span>
                </div>
              </div>

              {/* Info */}
              <div className={styles.info}>
                <div className={styles.meta}>
                  <span className={styles.type}>{type}</span>
                  <div className={styles.tags}>
                    {tags.map((t) => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.desc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className={`${styles.note} fade-up delay-2`}>
          Portfolio entries are representative placeholders — real client work
          will be showcased here as engagements are completed and published.
        </p>
      </div>
    </section>
  )
}
