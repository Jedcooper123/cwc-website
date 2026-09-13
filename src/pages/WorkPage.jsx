// ─────────────────────────────────────────────────────────────────────────────
// WorkPage — Full portfolio at /work.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import Portfolio  from '../components/Portfolio/Portfolio'
import FinalCta   from '../components/FinalCta/FinalCta'

export default function WorkPage() {
  return (
    <>
      <PageHeader
        label="Our Work"
        title="Real sites. Real businesses."
        sub="A few of the local businesses we've built for."
      />
      <Portfolio />
      <FinalCta />
    </>
  )
}
