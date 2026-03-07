// ─────────────────────────────────────────────────────────────────────────────
// Process — Step-by-step engagement model showing the 5-phase CWC workflow.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import {
  FiSearch, FiPenTool, FiCode, FiSend, FiHeadphones,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './Process.module.css'

const STEPS = [
  {
    step: '01',
    icon: <FiSearch />,
    title: 'Discovery',
    headline: 'We start by listening.',
    desc:
      'Every successful project begins with understanding your business — your goals, your audience, your competition, and your current pain points. We ask the right questions so nothing important gets missed.',
    deliverables: ['Goals & objectives brief', 'Competitor analysis', 'Technical requirements'],
  },
  {
    step: '02',
    icon: <FiPenTool />,
    title: 'Design',
    headline: 'Form follows function.',
    desc:
      'We translate your brand and business requirements into a clean, purposeful design. Every layout decision is made with your users in mind — intuitive navigation, clear messaging, and a visual identity that builds trust.',
    deliverables: ['Wireframes & mockups', 'Brand alignment review', 'Mobile-first responsive layouts'],
  },
  {
    step: '03',
    icon: <FiCode />,
    title: 'Development',
    headline: 'Precision-built, not pieced together.',
    desc:
      'Your site is engineered from the ground up using modern, maintainable code. No bloated page builders or outdated frameworks — just clean, performant, scalable web technology.',
    deliverables: ['Clean, documented codebase', 'Performance & accessibility standards', 'Cross-browser testing'],
  },
  {
    step: '04',
    icon: <FiSend />,
    title: 'Launch',
    headline: 'Go live with confidence.',
    desc:
      'We handle the final checks, domain setup, SSL configuration, and deployment. When we flip the switch, everything is production-ready — fast, secure, and indexed properly from day one.',
    deliverables: ['Full pre-launch QA', 'SEO & analytics setup', 'Domain & hosting configuration'],
  },
  {
    step: '05',
    icon: <FiHeadphones />,
    title: 'Ongoing Support',
    headline: 'We stay in your corner.',
    desc:
      'Your relationship with CWC doesn\'t end at launch. We provide ongoing maintenance, performance monitoring, content updates, and strategic guidance as your business evolves.',
    deliverables: ['Monthly maintenance plans', 'Priority bug fixes & updates', 'Growth & optimization consulting'],
  },
]

export default function Process() {
  const ref = useScrollAnimation()
  const [active, setActive] = useState(0)

  return (
    <section id="process" className={`section ${styles.process}`} ref={ref}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className="section-label fade-up">How We Work</p>
          <h2 className="section-title fade-up delay-1">
            A clear process. Zero guesswork.
          </h2>
          <p className={`section-sub fade-up delay-2 ${styles.sub}`}>
            From first conversation to long-term support, you'll always know
            exactly where your project stands and what comes next.
          </p>
        </div>

        <div className={`${styles.layout} fade-up delay-2`}>
          {/* Step list */}
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

          {/* Detail panel */}
          <div className={styles.detail}>
            {STEPS.map(({ step, icon, title, headline, desc, deliverables }, i) => (
              <div
                key={step}
                className={`${styles.panel} ${active === i ? styles.panelActive : ''}`}
                aria-hidden={active !== i}
              >
                <div className={styles.panelIcon}>{icon}</div>
                <div className={styles.panelStep}>Phase {step}</div>
                <h3 className={styles.panelTitle}>{title}</h3>
                <p className={styles.panelHeadline}>{headline}</p>
                <p className={styles.panelDesc}>{desc}</p>
                <div className={styles.deliverables}>
                  <p className={styles.delivLabel}>What you'll receive:</p>
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
      </div>
    </section>
  )
}
