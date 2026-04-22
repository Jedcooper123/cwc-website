import React, { useState } from 'react'
import { FiChevronDown, FiArrowRight } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './FAQ.module.css'

const FAQS = [
  {
    q: 'What does $85/month include?',
    a: 'Everything. Custom website design, hosting, SSL security, monthly maintenance, content updates when you need them, and SEO basics. We handle all of it. You just run your business.',
  },
  {
    q: 'Do I own my website?',
    a: 'Yes. Everything we build is yours. If you ever cancel, we hand over all your files, code, and content. You keep your domain and all your content — always.',
  },
  {
    q: 'What if I want to cancel?',
    a: "Just tell us. There's no contract, no cancellation fee, no penalty. We'll give you a clean handoff with everything you need to keep the site running elsewhere. We hope you'll stay, but we'll never trap you.",
  },
  {
    q: 'How long does it take to get my site live?',
    a: "Two weeks from our first call to a live website — that's our standard. If something takes longer on our end, your first month is free. No exceptions.",
  },
  {
    q: 'Do I need to know anything about tech?',
    a: "Not at all. That's why we exist. You don't need to understand hosting, HTML, DNS records, or any of it. If you can send a text or email, you can work with us.",
  },
  {
    q: 'What if I already have a website?',
    a: "We can rebuild it. If your current site is slow, outdated, or you're paying too much for it, we can replace it — usually in the same 2-week window.",
  },
  {
    q: 'What cities do you serve?',
    a: 'We work with businesses all across North Carolina — Charlotte, Raleigh, Greensboro, Winston-Salem, Asheville, Boone, Hickory, and everywhere in between. Everything is handled remotely so location never matters.',
  },
]

export default function FAQ() {
  const ref = useScrollAnimation()
  const [open, setOpen] = useState(null)

  const toggle = (i) => setOpen(open === i ? null : i)

  return (
    <section id="faq" className={`section ${styles.faq}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Common Questions</p>
          <h2 className="section-title fade-up delay-1">
            Still have questions?
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            Here are the ones we hear most. If yours isn't here, just call or text.
          </p>
        </div>

        <div className={`${styles.list} fade-up delay-2`}>
          {FAQS.map(({ q, a }, i) => (
            <div key={q} className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}>
              <button
                className={styles.question}
                onClick={() => toggle(i)}
                aria-expanded={open === i}
              >
                <span>{q}</span>
                <FiChevronDown className={styles.chevron} size={18} />
              </button>
              {open === i && (
                <div className={styles.answer}>
                  <p>{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`${styles.ctas} fade-up delay-3`}>
          <a href="#contact" className="btn-primary">
            Book a Free 15-Minute Call <FiArrowRight size={14} />
          </a>
          <a href="/work" className="btn-secondary">
            See Our Work
          </a>
        </div>
      </div>
    </section>
  )
}
