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
              Live in 2 weeks. $0 upfront. Less than $3/day.
            </p>
          </div>
        </div>
        <a href="#contact" className={styles.cta}>
          Start Today — It's Free <FiArrowRight size={15} />
        </a>
      </div>
    </div>
  )
}
