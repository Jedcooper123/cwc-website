// ─────────────────────────────────────────────────────────────────────────────
// Features — "What's included" bento grid. Layout: one wide tile + one tile,
// three tiles, then a full-width dark tile (fills evenly at 3, 2, and 1 cols).
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { FiPenTool, FiCalendar, FiShield, FiMessageSquare, FiSearch, FiClock } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Features.module.css'

const TILES = [
  { icon: <FiPenTool />,       title: 'Designed around your brand.', desc: 'Your colors, your photos. Looks great on every phone.', variant: 'wide' },
  { icon: <FiCalendar />,      title: 'Online booking.',             desc: 'Customers book on their own.' },
  { icon: <FiShield />,        title: 'Hosting & security.',         desc: 'Fast, secure, always online.' },
  { icon: <FiMessageSquare />, title: 'Updates on request.',         desc: 'Text us a change. Done.' },
  { icon: <FiSearch />,        title: 'Found on Google.',            desc: 'Local SEO from day one.' },
  { icon: <FiClock />,         title: 'Live in two weeks.',          desc: 'Or your first month is free.', variant: 'dark' },
]

export default function Features() {
  const ref = useScrollAnimation()

  return (
    <section id="features" className="section" ref={ref}>
      <div className="container">
        <div className="section-head">
          <p className="section-label fade-up">What's Included</p>
          <h2 className="section-title fade-up delay-1">Everything handled.</h2>
          <p className="section-sub fade-up delay-2">You run the business. We run the website.</p>
        </div>

        <div className={styles.grid}>
          {TILES.map(({ icon, title, desc, variant }, i) => (
            <div
              key={title}
              className={`${styles.tile} ${variant ? styles[variant] : ''} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.icon} aria-hidden="true">{icon}</div>
              <div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.desc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
