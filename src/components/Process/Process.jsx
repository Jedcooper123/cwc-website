import React, { useState } from 'react'
import {
  FiPhone, FiCode, FiCheckSquare, FiZap,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Process.module.css'

const STEPS = [
  {
    step: '01',
    icon: <FiPhone />,
    title: 'Free Call',
    headline: 'We listen first.',
    desc:
      'Tell us about your business — what you do, who your customers are, what you need. We\'ll ask a few quick questions and tell you exactly what we\'ll build. No pitch, no pressure, no commitment.',
    deliverables: ['Clear scope of your site', 'Timeline confirmed', 'Next steps outlined'],
  },
  {
    step: '02',
    icon: <FiCode />,
    title: 'We Build It',
    headline: 'You don\'t have to do anything.',
    desc:
      'We design and build your site from scratch — using your brand, your photos (or stock if needed), and your services. We write the copy, set up hosting, and handle all the technical work. You\'ll get a preview link when it\'s ready.',
    deliverables: ['Complete custom website', 'Mobile-optimized design', 'Preview link to review'],
  },
  {
    step: '03',
    icon: <FiCheckSquare />,
    title: 'You Approve',
    headline: 'One round of revisions, no extra charge.',
    desc:
      'Review your site and tell us what to change. We\'ll make adjustments until you\'re happy. This usually takes 2–3 days. We don\'t move to launch until you give the green light.',
    deliverables: ['Revisions completed', 'Final approval', 'Domain and hosting confirmed'],
  },
  {
    step: '04',
    icon: <FiZap />,
    title: 'Goes Live',
    headline: 'Launched in 2 weeks or less.',
    desc:
      'We point your domain, flip the switch, and your site is live. Then we handle all ongoing maintenance — updates, security, content changes — so you never have to think about it again.',
    deliverables: ['Site live and indexed', 'SSL and security active', 'Ongoing monthly support begins'],
  },
]

export default function Process() {
  const ref = useScrollAnimation()
  const [active, setActive] = useState(0)

  return (
    <section id="process" className={`section ${styles.process}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">How It Works</p>
          <h2 className="section-title fade-up delay-1">
            From "I need a website"<br />to live in 2 weeks.
          </h2>
          <p className={`section-sub fade-up delay-2 ${styles.sub}`}>
            No long discovery phases. No back-and-forth for months.
            We keep it simple, move fast, and get your site live.
          </p>
        </div>

        <div className={`${styles.layout} fade-up delay-2`}>
          <div className={styles.stepList}>
            {STEPS.map(({ step, icon, title }, i) => (
              <button
                key={step}
                className={`${styles.stepBtn} ${active === i ? styles.stepActive : ''}`}
                onClick={() => setActive(i)}
              >
                <div className={styles.stepNum}>{step}</div>
                <div className={styles.stepIcon}>{icon}</div>
                <span className={styles.stepTitle}>{title}</span>
                <div className={styles.stepArrow}>→</div>
              </button>
            ))}
          </div>

          <div className={styles.detail}>
            {STEPS.map(({ step, icon, title, headline, desc, deliverables }, i) => (
              <div
                key={step}
                className={`${styles.panel} ${active === i ? styles.panelActive : ''}`}
                aria-hidden={active !== i}
              >
                <div className={styles.panelIcon}>{icon}</div>
                <div className={styles.panelStep}>Step {step}</div>
                <h3 className={styles.panelTitle}>{title}</h3>
                <p className={styles.panelHeadline}>{headline}</p>
                <p className={styles.panelDesc}>{desc}</p>
                <div className={styles.deliverables}>
                  <p className={styles.delivLabel}>What you'll get:</p>
                  <ul className={styles.delivList}>
                    {deliverables.map((d) => (
                      <li key={d} className={styles.delivItem}>
                        <span className={styles.delivDot} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.guaranteeBanner} fade-up delay-3`}>
          <strong>⏱ 2-Week Launch Guarantee</strong>
          <p>If your site isn't live within 2 weeks of our first call, your first month is free. No exceptions.</p>
        </div>
      </div>
    </section>
  )
}
