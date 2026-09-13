import React from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Process.module.css'

const STEPS = [
  { title: 'Free call', desc: '15 minutes to talk through what you need.' },
  { title: 'Kickoff',   desc: 'Pay the deposit and send your logo, photos, and prices.' },
  { title: 'Review',    desc: 'See your site and tell us what to change.' },
  { title: 'Launch',    desc: 'We go live and keep it running.' },
]

export default function Process() {
  const ref = useScrollAnimation()

  return (
    <section id="process" className="section section-surface" ref={ref}>
      <div className="container">
        <div className="section-head">
          <p className="section-label fade-up">How It Works</p>
          <h2 className="section-title fade-up delay-1">Live in two weeks.</h2>
        </div>

        <ol className={styles.steps}>
          {STEPS.map(({ title, desc }, i) => (
            <li key={title} className={`${styles.step} fade-up delay-${i + 1}`}>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.desc}>{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
