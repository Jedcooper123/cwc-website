import React from 'react'
import {
  FiDollarSign, FiZap, FiXCircle, FiTool,
  FiStar, FiUser,
} from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import styles from './WhyCWC.module.css'

const REASONS = [
  {
    icon: <FiDollarSign />,
    title: 'Straightforward Pricing',
    desc:
      'Most web agencies want $1,000–$5,000 upfront. We don\'t. A Front-End site is $350 to build + $35/month. A Full Stack site with ordering or scheduling built in is $499 + $50/month. That\'s it.',
  },
  {
    icon: <FiZap />,
    title: 'Site Live in 2 Weeks',
    desc:
      'We don\'t drag projects out for months. From first call to live website is two weeks or less. We\'ve done it dozens of times and we stand behind it with a guarantee.',
  },
  {
    icon: <FiXCircle />,
    title: 'Cancel Anytime',
    desc:
      'No long-term contracts. No cancellation fees. If you ever want to stop, just say so. We hand over everything — your files, your domain, all of it. No strings attached.',
  },
  {
    icon: <FiTool />,
    title: 'We Handle Everything',
    desc:
      'Design, hosting, security updates, content changes — you don\'t have to touch any of it. If something breaks at 2am, that\'s our problem, not yours.',
  },
  {
    icon: <FiStar />,
    title: 'Built for Your Business',
    desc:
      'This isn\'t a template with your name swapped in. We build around your brand, your services, and your customers. It looks like it belongs to you because it does.',
  },
  {
    icon: <FiUser />,
    title: 'Real Person, Direct Contact',
    desc:
      'You work directly with Jed — not an account manager, not a ticket system. One person who knows your site, answers your messages, and is invested in your results.',
  },
]

export default function WhyCWC() {
  const ref = useScrollAnimation()

  return (
    <section id="why-cwc" className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label fade-up">Why Launchpad</p>
          <h2 className="section-title fade-up delay-1">
            Flat pricing. No contracts.<br />No tech headaches.
          </h2>
          <p className={`section-sub fade-up delay-2`}>
            We built Launchpad for small business owners who know they need
            a website but don't want to deal with the hassle — or pay
            thousands of dollars to get one.
          </p>
        </div>

        <div className={styles.grid}>
          {REASONS.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className={`${styles.card} fade-up delay-${(i % 3) + 1}`}
            >
              <div className={styles.iconWrap}>{icon}</div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.banner} fade-up delay-2`}>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>
              Every day without a website is a day customers choose your competitor.
            </h3>
            <p className={styles.bannerSub}>
              Let's fix that in 2 weeks — for less than $3/day.
            </p>
          </div>
          <a href="#contact" className="btn-primary">
            Book a Free 15-Minute Call
          </a>
        </div>
      </div>
    </section>
  )
}
