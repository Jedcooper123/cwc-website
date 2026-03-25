// ─────────────────────────────────────────────────────────────────────────────
// Hero — Bold editorial layout. No pill badge. Large typographic headline
// anchored left with a code-panel visual and metrics strip at the bottom.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiChevronDown } from 'react-icons/fi'
import styles from './Hero.module.css'

const METRICS = [
  { value: 'Qualified',  label: 'Leads only'     },
  { value: '<48h',       label: 'Response time'  },
  { value: 'Zero',       label: 'Wasted calls'   },
  { value: 'Full-Stack', label: 'Capability'     },
]

const TAGS = ['HVAC', 'Roofing', 'Plumbing', 'Landscaping', 'Contractors', 'Local Services']

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.glow}   aria-hidden="true" />

      <div className={`${styles.inner} container`}>

        {/* ── Left: Editorial copy ── */}
        <div className={styles.copy}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Launchpad Web Consulting
          </div>

          <h1 className={styles.headline}>
            Stop Wasting Time<br />
            <span className={styles.gradText}>on Bad Leads.</span>
          </h1>

          <p className={styles.sub}>
            We build websites that pre-qualify your leads — so you only talk
            to serious customers who are ready to move forward. No more chasing
            low-budget inquiries or picking up pointless calls.
          </p>

          <div className={styles.actions}>
            <a href="#contact" className="btn-primary">
              Get Better Leads <FiArrowRight size={15} />
            </a>
            <a href="#schedule" className="btn-secondary">
              <FiCalendar size={14} /> Book a Call
            </a>
          </div>
        </div>

        {/* ── Right: Code-style panel ── */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.panelFile}>leads.config.js</span>
          </div>

          <div className={styles.codeBlock}>
            <p className={styles.cl}><span className={styles.ck}>const</span> <span className={styles.cv}>leadSystem</span> <span className={styles.co}>=</span> <span className={styles.cp}>{'{'}</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>filter</span><span className={styles.co}>:</span> <span className={styles.cs}>&apos;low-budget inquiries&apos;</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>qualify</span><span className={styles.co}>:</span> <span className={styles.cs}>&apos;serious customers only&apos;</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>target</span><span className={styles.co}>:</span> <span className={styles.cs}>&apos;service businesses&apos;</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>wasted_calls</span><span className={styles.co}>:</span> <span className={styles.cb}>false</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>better_leads</span><span className={styles.co}>:</span> <span className={styles.cb}>true</span><span className={styles.cp}>,</span></p>
            <p className={styles.cl}><span className={styles.cp}>{'}'}</span></p>
            <p className={styles.clBlank}>&nbsp;</p>
            <p className={styles.cl}><span className={styles.cc}>{'// ✓ Only serious leads get through'}</span></p>
            <p className={styles.cl}><span className={styles.ck}>export default</span> <span className={styles.cv}>qualify</span><span className={styles.cp}>(</span><span className={styles.cv}>leadSystem</span><span className={styles.cp}>)</span></p>
          </div>

          <div className={styles.tagRow}>
            {TAGS.map((t) => (
              <span key={t} className={styles.techTag}>{t}</span>
            ))}
          </div>

          <div className={styles.statusBar}>
            <span className={styles.statusDot} />
            Lead qualification system active
          </div>
        </div>
      </div>

      {/* ── Metrics strip ── */}
      <div className={styles.metricsStrip}>
        <div className="container">
          <div className={styles.metrics}>
            {METRICS.map(({ value, label }, i) => (
              <React.Fragment key={label}>
                <div className={styles.metric}>
                  <span className={styles.metricVal}>{value}</span>
                  <span className={styles.metricLabel}>{label}</span>
                </div>
                {i < METRICS.length - 1 && (
                  <div className={styles.metricDivider} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <a href="#about" className={styles.scrollHint} aria-label="Scroll down">
        <FiChevronDown size={18} />
      </a>
    </section>
  )
}
