import React from 'react'
import {
  FiTool, FiTruck, FiCamera, FiBriefcase,
  FiHome, FiShoppingBag, FiHeart, FiGlobe,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './ForEveryone.module.css'

const TYPES = [
  {
    icon: <FiTool />,
    label: 'Contractors & Trades',
    examples: 'HVAC, roofing, plumbing, electrical',
  },
  {
    icon: <FiHome />,
    label: 'Home Services',
    examples: 'Landscaping, cleaning, pest control',
  },
  {
    icon: <FiTruck />,
    label: 'Restaurants & Food',
    examples: 'Menus, hours, location, online orders',
  },
  {
    icon: <FiHeart />,
    label: 'Salons & Spas',
    examples: 'Services, booking, gallery, hours',
  },
  {
    icon: <FiCamera />,
    label: 'Photographers',
    examples: 'Portfolio, gallery, booking, contact',
  },
  {
    icon: <FiBriefcase />,
    label: 'Healthcare & Dental',
    examples: 'About, services, patient contact',
  },
  {
    icon: <FiShoppingBag />,
    label: 'Retail & Boutiques',
    examples: 'Products, hours, location, promotions',
  },
  {
    icon: <FiGlobe />,
    label: 'Any Small Business',
    examples: 'If you need a web presence, we build it',
  },
]

export default function ForEveryone() {
  const ref = useScrollAnimation()

  return (
    <section id="who-we-build-for" className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Who We Build For</p>
          <h2 className="section-title fade-up delay-1">
            If you run a small business anywhere in the US,<br />we built this for you.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            You don't need to be tech-savvy. You don't need a big budget.
            You just need a professional website that works — and we'll take care
            of the rest.
          </p>
        </div>

        <div className={styles.grid}>
          {TYPES.map(({ icon, label, examples }, i) => (
            <div
              key={label}
              className={`${styles.card} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.iconWrap}>{icon}</div>
              <div className={styles.text}>
                <h4 className={styles.label}>{label}</h4>
                <p className={styles.examples}>{examples}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.bottomCta} fade-up delay-2`} style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href="#contact" className="btn-primary">
            Book a Free 15-Minute Call
          </a>
        </div>
      </div>
    </section>
  )
}
