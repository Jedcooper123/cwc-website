// ─────────────────────────────────────────────────────────────────────────────
// services.js — Single source of truth for all CWC service data.
// Used by: ServicesPage overview grid, ServiceDetailPage, Services section,
//          Navbar dropdown, and Pricing suggestions.
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICES = [
  {
    id: 'web-design',
    title: 'Website Design & Development',
    shortTitle: 'Design & Dev',
    tagline: 'Built for your brand. Designed for your customers.',
    shortDesc:
      'Custom-designed, handcoded websites that look the part and actually convert. No templates, no drag-and-drop, no corners cut.',
    fullDesc:
      'We build websites from the ground up for businesses that want to stand out. Every layout decision, color choice, and line of code is made specifically for your business. The result is a site that actually looks like it belongs to you and works like it was designed around your customers.',
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
    id: 'fullstack-db',
    title: 'Full Stack Site & Database Support',
    shortTitle: 'Full Stack + DB',
    tagline: 'Frontend to database, start to finish.',
    shortDesc:
      'Complete full-stack development with backend logic, database design, and API integration. Built to scale as your business grows.',
    fullDesc:
      'Not every business needs just a website. When you need user accounts, data storage, custom dashboards, or third-party integrations, we handle the whole stack. From React frontends to Node backends and PostgreSQL databases, we architect and build systems that are secure, fast, and built to grow with you.',
    whatWeDeliver: [
      'Full-stack architecture design (frontend + backend + database)',
      'PostgreSQL or SQLite database setup and schema design',
      'REST API development and third-party integrations',
      'User authentication and role-based access control',
      'Admin dashboards and data management interfaces',
      'Deployment and environment configuration on Render or VPS',
    ],
    goodFor: ['SaaS products', 'Client portals', 'Businesses with complex data needs', 'Apps with user accounts'],
    startingAt: '$650',
    monthlySupport: '$75/mo',
    color: '#a78bfa',
  },
  {
    id: 'maintenance',
    title: 'Website Maintenance',
    shortTitle: 'Maintenance',
    tagline: 'Set it and forget it. We keep things running.',
    shortDesc:
      'Ongoing care plans that keep your site secure, updated, and running without you having to think about it.',
    fullDesc:
      'A website is not a one-time project. Plugins break, content goes stale, and security vulnerabilities emerge. Our maintenance plans give you a dedicated partner who handles it all on a regular cadence, so you never wake up to a broken or hacked site.',
    whatWeDeliver: [
      'Regular CMS, plugin, and dependency updates',
      'Security monitoring and patch management',
      'Content updates and copy edits (included hours vary by plan)',
      'Monthly performance reports',
      'Uptime monitoring with rapid incident response',
      'Proactive bug identification and fixes',
    ],
    goodFor: ['Businesses without an in-house dev', 'Sites on WordPress or CMS platforms', 'E-commerce'],
    startingAt: '$50/mo',
    color: '#facc15',
  },
  {
    id: 'seo',
    title: 'SEO & Online Presence',
    shortTitle: 'SEO',
    tagline: 'Be found by the people already looking for you.',
    shortDesc:
      'Technical SEO and on-page optimization so your site ranks for the right searches and reaches the right people.',
    fullDesc:
      'Great design means nothing if nobody finds your site. We implement technical SEO from the ground up, including structured data, sitemap setup, canonical tags, meta optimization, and page-level keyword alignment, so search engines understand and surface your content to the people who need it.',
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
    isAddon: true,
    color: '#22d3ee',
  },
  {
    // Admin-only: never shown on public site, only in the portal admin panel
    id: 'friends',
    title: 'Friend Project',
    shortTitle: 'Friends',
    tagline: 'Personal projects for friends.',
    shortDesc: 'Custom work for people I know. Price is set per project.',
    fullDesc: 'Personal projects for friends and family. Pricing, scope, and timeline are all flexible.',
    whatWeDeliver: ['Whatever the project needs'],
    goodFor: ['Friends and family'],
    startingAt: 'Custom',
    color: '#fb7185',
    adminOnly: true,
  },
]

// Helper: find service by URL slug
export function getServiceById(id) {
  return SERVICES.find((s) => s.id === id) || null
}
