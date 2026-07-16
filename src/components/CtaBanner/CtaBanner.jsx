import React from 'react'
import { FiArrowRight, FiZap } from 'react-icons/fi'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  return (
    <div className={styles.banner}>
      <div className={`${styles.inner} container`}>
        <div className={styles.left}>
          <FiZap className={styles.zapIcon} size={20} />
          <div>
            <p className={styles.headline}>
              Every day without a great website is a day customers choose your competitor.
            </p>
            <p className={styles.sub}>
              Live in 2 weeks. Sites start at $350. Plans from $35/month.
            </p>
          </div>
        </div>
        <a href="#contact" className={styles.cta}>
          Book Your Free Call <FiArrowRight size={15} />
        </a>
      </div>
    </div>
  )
}
