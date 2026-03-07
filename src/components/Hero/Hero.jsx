// ─────────────────────────────────────────────────────────────────────────────
// Hero — Bold editorial layout. No pill badge. Large typographic headline
// anchored left with a code-panel visual and metrics strip at the bottom.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiChevronDown } from 'react-icons/fi'
import styles from './Hero.module.css'

const METRICS = [
  { value: 'Custom',     label: 'Every build'    },
  { value: '<48h',       label: 'Response time'  },
  { value: '99.9%',      label: 'Uptime target'  },
  { value: 'Full-Stack', label: 'Capability'     },
]

const TAGS = ['React', 'Node.js', 'Render', 'PostgreSQL', 'SEO', 'UI/UX']

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
            Cooper Web Consulting
          </div>

          <h1 className={styles.headline}>
            Your website<br />
            <span className={styles.gradText}>should work</span><br />
            as hard as you do.
          </h1>

          <p className={styles.sub}>
            We design, build, and maintain high-performance web experiences
            for businesses that take their online presence seriously.
            From first launch to long-term growth — CWC is your technical partner.
          </p>

          <div className={styles.actions}>
            <Link to="/#contact" className="btn-primary">
              <FiCalendar size={15} /> Schedule a Consultation
            </Link>
            <Link to="/services" className="btn-secondary">
              View Services <FiArrowRight size={14} />
            </Link>
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
            <span className={styles.panelFile}>cwc.config.js</span>
          </div>

          <div className={styles.codeBlock}>
            <p className={styles.cl}><span className={styles.ck}>const</span> <span className={styles.cv}>project</span> <span className={styles.co}>=</span> <span className={styles.cp}>{'{'}</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>client</span><span className={styles.co}>:</span> <span className={styles.cs}>&apos;your business&apos;</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>stack</span><span className={styles.co}>:</span> <span className={styles.cs}>&apos;React + Node + DB&apos;</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>deploy</span><span className={styles.co}>:</span> <span className={styles.cs}>&apos;Render&apos;</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>support</span><span className={styles.co}>:</span> <span className={styles.cb}>true</span><span className={styles.cp}>,</span></p>
            <p className={`${styles.cl} ${styles.ci}`}><span className={styles.ck}>uptime</span><span className={styles.co}>:</span> <span className={styles.cn}>&apos;99.9%&apos;</span><span className={styles.cp}>,</span></p>
            <p className={styles.cl}><span className={styles.cp}>{'}'}</span></p>
            <p className={styles.clBlank}>&nbsp;</p>
            <p className={styles.cl}><span className={styles.cc}>{'// ✓ Ready for launch'}</span></p>
            <p className={styles.cl}><span className={styles.ck}>export default</span> <span className={styles.cv}>build</span><span className={styles.cp}>(</span><span className={styles.cv}>project</span><span className={styles.cp}>)</span></p>
            <p className={styles.cl}><span className={styles.cursor} /></p>
          </div>

          <div className={styles.tagRow}>
            {TAGS.map((t) => (
              <span key={t} className={styles.techTag}>{t}</span>
            ))}
          </div>

          <div className={styles.statusBar}>
            <span className={styles.statusDot} />
            All systems operational
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
