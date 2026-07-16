import React from 'react'
import { FiCheck, FiArrowRight, FiShield } from 'react-icons/fi'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { getServiceById } from '../../data/services'
import styles from './Pricing.module.css'

const FRONT_END  = getServiceById('web-design')
const FULL_STACK = getServiceById('fullstack-db')

const PLANS = [
  {
    service: FRONT_END,
    name: 'Front-End Site',
    tagline: 'A great-looking site that tells your story.',
    desc: 'Custom design, hosting & SSL, monthly maintenance, and content updates — everything it takes to have a professional site online. Right for businesses that need to look good and be found, not run a backend.',
    features: [
      'Custom website design (not a template)',
      'Mobile-responsive — works on every device',
      'Fast, secure hosting with SSL',
      'Monthly maintenance and updates',
      'Content updates on request',
      'SEO basics so Google can find you',
    ],
  },
  {
    service: FULL_STACK,
    name: 'Full Stack Site',
    tagline: 'Everything above, plus a real backend.',
    desc: 'A custom database and backend logic on top of everything in the Front-End plan — built for sites that need to take orders, book appointments, or manage customer accounts.',
    features: [
      'Everything in the Front-End plan',
      'Custom database & backend architecture',
      'Online ordering / quote request systems',
      'Appointment & scheduling systems',
      'Customer accounts & admin dashboards',
      'Third-party integrations (payments, calendars, etc.)',
    ],
    popular: true,
  },
]

export default function Pricing() {
  const ref = useScrollAnimation()

  return (
    <section id="pricing" className={`section ${styles.pricing}`} ref={ref}>
      <div className="container">
        <div className={styles.grid}>
          {PLANS.map(({ service, name, tagline, desc, features, popular }) => (
            <div
              key={name}
              className={`${styles.card} ${popular ? styles.popular : ''} fade-up delay-1`}
            >
              {popular && <div className={styles.popularBadge}>Most Capable</div>}

              <div className={styles.cardHeader}>
                <span className={styles.planName}>{name}</span>
                <p className={styles.planTagline}>{tagline}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{service.startingAt}</span>
                  <span className={styles.priceNote}>to build</span>
                </div>
                <p className={styles.maintenanceNote}>
                  then {service.monthlySupport} — hosting, maintenance & updates included
                </p>
              </div>

              <p className={styles.planDesc}>{desc}</p>

              <a href="#contact" className={`btn-primary ${styles.planCta}`}>
                Book a Free 15-Minute Call <FiArrowRight size={14} />
              </a>

              <div className={styles.divider} />

              <ul className={styles.features}>
                {features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <FiCheck className={styles.checkIcon} size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.exampleNote}>
                <span className={styles.exampleLabel}>Real example</span>
                <a href={service.example.url} target="_blank" rel="noopener noreferrer">
                  {service.example.name}
                </a>
                <p>{service.example.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.explainer} fade-up delay-2`}>
          <h3>Which one do you need?</h3>
          <p>
            If your site just needs to look great and tell people about your
            business — hours, services, photos, a way to get in touch — the{' '}
            <strong>Front-End Site</strong> is the right call. If your site needs
            to actually <em>do</em> something — take orders, book or schedule
            appointments, store customer info, or run an admin dashboard — you
            want the <strong>Full Stack</strong> plan. Not sure which fits? Book
            a call and we'll tell you honestly, even if it means the cheaper option.
          </p>
        </div>

        <div className={`${styles.guarantee} fade-up delay-2`}>
          <FiShield className={styles.guaranteeIcon} size={22} />
          <div>
            <strong>2-Week Launch Guarantee</strong>
            <p>
              If your site isn't live within 2 weeks of our kickoff call,
              your first month of maintenance is free. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
