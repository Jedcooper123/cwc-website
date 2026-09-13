import React, { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './FAQ.module.css'

const FAQS = [
  {
    q: 'What does the $750 deposit cover?',
    a: 'It gets your project started. We design and build your site from there.',
  },
  {
    q: 'What does $55/month include?',
    a: 'Hosting, security, maintenance, and changes whenever you need them.',
  },
  {
    q: 'How long does it take?',
    a: "About two weeks from our first call. If we miss that, your first month is free.",
  },
  {
    q: 'Do I own my website?',
    a: 'Yes. Your site, your content, and your domain are yours.',
  },
  {
    q: 'Do I need to be good with tech?',
    a: 'No. If you can send a text, you can work with us.',
  },
]

export default function FAQ() {
  const ref = useScrollAnimation()
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="section" ref={ref}>
      <div className={`container ${styles.inner}`}>
        <div className="section-head">
          <p className="section-label fade-up">FAQ</p>
          <h2 className="section-title fade-up delay-1">Questions? Answers.</h2>
        </div>

        <div className={`${styles.list} fade-up delay-2`}>
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i
            return (
              <div key={q} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                <button
                  className={styles.question}
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span>{q}</span>
                  <FiPlus className={styles.icon} aria-hidden="true" />
                </button>
                <div id={`faq-${i}`} className={styles.answer}>
                  <div>
                    <p>{a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
