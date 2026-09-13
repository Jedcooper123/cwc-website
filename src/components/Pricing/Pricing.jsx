import React from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Pricing.module.css'

// One plan for every client (set Sept 2026)
const DEPOSIT = 750
const MONTHLY = 55

const INCLUDED = [
  'Custom design for your brand',
  'Looks great on every phone',
  'Hosting, SSL, and security',
  'Online booking, if you need it',
  'Updates whenever you ask',
  'Local SEO setup',
]

export default function Pricing({ showHeader = true }) {
  const ref = useScrollAnimation()

  return (
    <section id="pricing" className="section" ref={ref}>
      <div className="container">
        {showHeader && (
          <div className="section-head">
            <p className="section-label fade-up">Pricing</p>
            <h2 className="section-title fade-up delay-1">One simple price.</h2>
            <p className="section-sub fade-up delay-2">The same plan for every business.</p>
          </div>
        )}

        <div className={`${styles.card} fade-up delay-2`}>
          <div className={styles.prices}>
            <div className={styles.price}>
              <span className={styles.amount}>${DEPOSIT}</span>
              <span className={styles.unit}>one-time deposit</span>
            </div>
            <span className={styles.plus} aria-hidden="true">+</span>
            <div className={styles.price}>
              <span className={styles.amount}>${MONTHLY}</span>
              <span className={styles.unit}>per month</span>
            </div>
          </div>

          <ul className={styles.list}>
            {INCLUDED.map((item) => (
              <li key={item}>
                <FiCheck className={styles.check} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.footer}>
            <Link to="/contact" className="btn-primary btn-lg">
              Book a Free 15-Minute Call
            </Link>
            <p className={styles.note}>Live in two weeks, or your first month is free.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
