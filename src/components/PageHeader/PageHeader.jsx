// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — Big centered title at the top of inner pages (Work, Pricing,
// Contact). Tightens the top padding of the section that follows it.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import styles from './PageHeader.module.css'

export default function PageHeader({ label, title, sub }) {
  return (
    <header className={styles.header}>
      <div className="container">
        {label && <p className={`section-label ${styles.label}`}>{label}</p>}
        <h1 className={styles.title}>{title}</h1>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </header>
  )
}
