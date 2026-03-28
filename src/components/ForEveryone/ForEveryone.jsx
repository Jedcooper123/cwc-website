// ─────────────────────────────────────────────────────────────────────────────
// ForEveryone — Broadens the audience beyond just trades/contractors.
// Shows all types of clients we build for, from HVAC to portfolios.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import {
  FiTool, FiTruck, FiCamera, FiBriefcase,
  FiUser, FiShoppingBag, FiHome, FiGlobe,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './ForEveryone.module.css'

const TYPES = [
  {
    icon: <FiTool />,
    label: 'Trades & Contractors',
    examples: 'HVAC, roofing, plumbing, electrical',
  },
  {
    icon: <FiHome />,
    label: 'Home Services',
    examples: 'Landscaping, cleaning, pest control',
  },
  {
    icon: <FiTruck />,
    label: 'Food Trucks & Restaurants',
    examples: 'Menus, locations, order CTAs',
  },
  {
    icon: <FiCamera />,
    label: 'Photographers & Creatives',
    examples: 'Portfolios, galleries, booking',
  },
  {
    icon: <FiBriefcase />,
    label: 'Freelancers & Consultants',
    examples: 'Services, case studies, contact',
  },
  {
    icon: <FiUser />,
    label: 'Personal Portfolios',
    examples: 'Developers, designers, job seekers',
  },
  {
    icon: <FiShoppingBag />,
    label: 'Local Retail & Boutiques',
    examples: 'Products, hours, locations',
  },
  {
    icon: <FiGlobe />,
    label: 'Anyone Who Needs a Site',
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
            Contractors. Creatives.<br />Anyone in between.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            We specialize in service businesses, but we build great websites for anyone.
            If you need a professional web presence that actually brings in customers,
            we know how to make it happen.
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
      </div>
    </section>
  )
}
