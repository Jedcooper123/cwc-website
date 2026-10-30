// ─────────────────────────────────────────────────────────────────────────────
// PrivacyPage — /privacy. Plain-English policy. Meta requires a privacy policy
// URL for lead ads and the Pixel, so keep this page live while ads run.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import styles from './PrivacyPage.module.css'

const UPDATED = 'October 29, 2026'

export default function PrivacyPage() {
  return (
    <>
      <PageHeader label="Privacy" title="Privacy policy." sub={`Short and plain. Last updated ${UPDATED}.`} />
      <section className="section">
        <div className={`container ${styles.body}`}>
          <h2>Who we are</h2>
          <p>
            Launchpad Web Consulting (“we”) builds websites for small businesses. Questions about this
            policy go to Jed Cooper at <a href="mailto:jedpcooper@gmail.com">jedpcooper@gmail.com</a> or{' '}
            <a href="tel:+13367070245">(336) 707-0245</a>.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>What you send us.</strong> Your name, email, phone, business details and message when you fill out our contact form, a Facebook or Instagram lead form, or book a call.</li>
            <li><strong>Client portal accounts.</strong> Your login email, a securely hashed password, and the requests you send through the portal.</li>
            <li><strong>Basic site activity.</strong> Pages visited and the link or ad that brought you here.</li>
          </ul>

          <h2>How we use it</h2>
          <p>
            Only to reply to you, prepare your quote, build and support your website, and see which of our
            ads are working. We never sell your information.
          </p>

          <h2>Advertising and cookies</h2>
          <p>
            We use the Meta Pixel (Facebook and Instagram) to measure our ads and show them to people likely
            to be interested. It uses cookies to record visits and actions such as sending our contact form.
            The client portal is never tracked. You can control ad tracking in your{' '}
            <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer">Facebook ad preferences</a>{' '}
            or by blocking cookies in your browser.
          </p>

          <h2>Who else handles it</h2>
          <p>
            Trusted services that help us run the business: Render (hosting), Neon (database), Resend (email),
            Calendly (call booking) and Meta (advertising). Each one only gets what it needs to do its job.
          </p>

          <h2>Your choices</h2>
          <p>
            Email us any time to see, correct or delete the information we have about you, or to stop hearing
            from us. We keep inquiry details only as long as they’re useful for working with you.
          </p>
        </div>
      </section>
    </>
  )
}
