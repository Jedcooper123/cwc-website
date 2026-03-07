// ─────────────────────────────────────────────────────────────────────────────
// services.js — Single source of truth for all CWC service data.
// Used by: ServicesPage overview grid, ServiceDetailPage, Services section,
//          Navbar dropdown (future), and Pricing suggestions.
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICES = [
  {
    id: 'web-design',
    title: 'Website Design & Development',
    shortTitle: 'Design & Dev',
    tagline: 'Sites that look the part and perform under pressure.',
    shortDesc:
      'Custom-designed, precision-built websites that reflect your brand and convert visitors into customers.',
    fullDesc:
      'We design and build websites from the ground up — no drag-and-drop builders, no recycled templates. Every pixel, every layout decision, and every line of code is made with your specific business in mind. The result is a site that looks like it belongs to you and works like it was built for your customers.',
    whatWeDeliver: [
      'Full custom UI/UX design tailored to your brand',
      'Responsive layouts that work on every screen size',
      'Clean, maintainable React or vanilla HTML/CSS/JS codebase',
      'Accessibility and core web vitals compliance',
      'CMS integration for easy content management',
      'Conversion-focused layout and copywriting guidance',
    ],
    goodFor: ['Small businesses', 'Service providers', 'Personal brands', 'Local companies'],
    startingAt: '$350',
    color: '#5b8df5',
  },
  {
    id: 'hosting',
    title: 'Hosting Solutions',
    shortTitle: 'Hosting',
    tagline: 'Fast, secure, and always on.',
    shortDesc:
      'Managed hosting environments built for reliability — we handle the infrastructure so you can run your business.',
    fullDesc:
      'Your website can only do its job if it\'s actually up. We configure and manage secure, performant hosting environments tailored to your traffic levels and stack. Whether it\'s a static site on a CDN or a full-stack app on Render or a VPS — you get clean infrastructure without the headaches.',
    whatWeDeliver: [
      'Domain setup and DNS management',
      'SSL/TLS certificate configuration',
      'Optimized hosting environment (CDN, VPS, or PaaS)',
      '99.9% uptime monitoring and alerting',
      'Automated backups and restore points',
      'Scalable infrastructure that grows with your traffic',
    ],
    goodFor: ['New site launches', 'Businesses migrating from bad hosts', 'High-traffic sites'],
    startingAt: 'Custom',
    color: '#4ade80',
  },
  {
    id: 'maintenance',
    title: 'Website Maintenance',
    shortTitle: 'Maintenance',
    tagline: 'Set it, don\'t forget it — we\'ve got it.',
    shortDesc:
      'Ongoing care plans that keep your site secure, updated, and running without you having to think about it.',
    fullDesc:
      'A website isn\'t a one-time project — it\'s an ongoing commitment. Plugins break, content goes stale, security vulnerabilities emerge. Our maintenance plans give you a dedicated partner who handles it all on a regular cadence, so you never wake up to a broken or hacked site.',
    whatWeDeliver: [
      'Regular CMS, plugin, and dependency updates',
      'Security monitoring and patch management',
      'Content updates and copy edits (included hours vary by plan)',
      'Monthly performance reports',
      'Uptime monitoring with rapid incident response',
      'Proactive bug identification and fixes',
    ],
    goodFor: ['Businesses without an in-house dev', 'Sites on WordPress or CMS platforms', 'E-commerce'],
    startingAt: '$99/mo',
    color: '#facc15',
  },
  {
    id: 'performance',
    title: 'Performance Optimization',
    shortTitle: 'Performance',
    tagline: 'Every second of load time costs you customers.',
    shortDesc:
      'Comprehensive audits and hands-on optimizations that make your site measurably faster and rank higher.',
    fullDesc:
      'Page speed is a business metric. A one-second delay in load time can cut conversions by 7%. We audit your site\'s performance from top to bottom — images, code, fonts, server response, render blocking — and fix everything that\'s slowing you down.',
    whatWeDeliver: [
      'Full Lighthouse and Core Web Vitals audit',
      'Image optimization and modern format conversion (WebP/AVIF)',
      'JavaScript and CSS bundling, minification, and lazy loading',
      'Server-side caching and CDN configuration',
      'Database query optimization (full-stack sites)',
      'Before/after performance report with PageSpeed scores',
    ],
    goodFor: ['Slow-loading existing sites', 'E-commerce stores', 'Content-heavy sites', 'SEO-sensitive businesses'],
    startingAt: '$200',
    color: '#f97316',
  },
  {
    id: 'strategy',
    title: 'Business Web Strategy',
    shortTitle: 'Strategy',
    tagline: 'Your website should have a job description.',
    shortDesc:
      'We work with you to define what your web presence needs to accomplish — then build a plan to get there.',
    fullDesc:
      'Most business websites exist without a clear strategy. They\'re online, but they\'re not working. We sit down with you to understand your goals, your market, your competitors, and your customers — then translate that into a concrete digital roadmap that guides everything from your content to your conversion funnel.',
    whatWeDeliver: [
      'Business goals and website alignment workshop',
      'Competitor and market landscape analysis',
      'User persona and customer journey mapping',
      'Content strategy and site architecture plan',
      'Conversion funnel review and recommendations',
      'Digital roadmap with prioritized action items',
    ],
    goodFor: ['Businesses launching their first site', 'Companies with unclear digital ROI', 'Growth-stage businesses'],
    startingAt: '$250',
    color: '#e879f9',
  },
  {
    id: 'seo',
    title: 'SEO & Online Presence',
    shortTitle: 'SEO',
    tagline: 'Be found by the people who are already looking for you.',
    shortDesc:
      'Technical SEO and on-page optimization so your site ranks for the right searches and reaches the right audience.',
    fullDesc:
      'Great design means nothing if nobody finds your site. We implement technical SEO from the ground up — structured data, sitemap setup, canonical tags, meta optimization, and page-level keyword alignment — so search engines understand and surface your content to the people who need it.',
    whatWeDeliver: [
      'Technical SEO audit and implementation',
      'Structured data (JSON-LD) markup',
      'XML sitemap and robots.txt configuration',
      'On-page meta title and description optimization',
      'Internal linking strategy',
      'Google Search Console and Analytics setup',
      'Local SEO setup for service-area businesses',
    ],
    goodFor: ['New sites that need visibility', 'Local service businesses', 'Businesses underperforming in search'],
    startingAt: '$175',
    color: '#22d3ee',
  },
]

// Helper: find service by URL slug
export function getServiceById(id) {
  return SERVICES.find((s) => s.id === id) || null
}
