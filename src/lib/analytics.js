// ─────────────────────────────────────────────────────────────────────────────
// lib/analytics.js — Meta (Facebook/Instagram) Pixel + ad source capture.
//
// The Pixel only loads when VITE_META_PIXEL_ID is set (Render → Environment),
// so local dev and previews send nothing. The ID isn't a secret.
//
// Events sent:
//   PageView  every public page (never inside /portal)
//   Lead      contact form sent
//   Schedule  free call booked in Calendly
//   Contact   phone or email link tapped
//
// captureSource() remembers where a visitor first came from (UTM tags / Meta
// click ID) so inquiry emails can say "Came from: facebook / paid / ...".
// ─────────────────────────────────────────────────────────────────────────────

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || ''
const SOURCE_KEY = 'lwc_source'
const SOURCE_DAYS = 30

function loadPixel() {
  if (!PIXEL_ID || typeof window === 'undefined') return false
  if (window.fbq) return true
  // Meta's standard base code, unminified.
  const fbq = function (...args) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args)
  }
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  window.fbq = window._fbq = fbq
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
  fbq('init', PIXEL_ID)
  return true
}

export function trackPageView(pathname) {
  if (pathname.startsWith('/portal')) return
  if (loadPixel()) window.fbq('track', 'PageView')
}

export function track(event, params) {
  if (loadPixel()) window.fbq('track', event, params)
}

export function captureSource() {
  try {
    const q = new URLSearchParams(window.location.search)
    const tags = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map(k => q.get(k)).filter(Boolean)
    let label = tags.join(' / ')
    if (!label && q.get('fbclid')) label = 'Meta ad or post (no UTM tags)'
    if (!label) {
      const ref = document.referrer && new URL(document.referrer).hostname
      if (ref && ref !== window.location.hostname) label = `Link from ${ref}`
    }
    if (label) localStorage.setItem(SOURCE_KEY, JSON.stringify({ label: label.slice(0, 300), at: Date.now() }))
  } catch { /* storage blocked or bad referrer: nothing to remember */ }
}

export function getSource() {
  try {
    const saved = JSON.parse(localStorage.getItem(SOURCE_KEY) || 'null')
    if (saved && Date.now() - saved.at < SOURCE_DAYS * 86400000) return saved.label
  } catch { /* ignore */ }
  return ''
}
