// ─────────────────────────────────────────────────────────────────────────────
// WorkPage — Full portfolio at /work. Reuses the Portfolio section component.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Portfolio from '../components/Portfolio/Portfolio'
import styles from './WorkPage.module.css'

export default function WorkPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHero}>
        <div className="container">
          <p className="section-label">Our Work</p>
          <h1 className={styles.pageTitle}>Real sites. Real businesses.</h1>
          <p className={styles.pageSub}>
            Every project is built from scratch, designed to convert visitors
            into qualified leads. No templates, no shortcuts.
          </p>
        </div>
      </div>
      <Portfolio />
    </div>
  )
}
