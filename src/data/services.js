// ─────────────────────────────────────────────────────────────────────────────
// services.js — Single source of truth for all CWC service data.
// Used by: ServicesPage overview grid, ServiceDetailPage, Services section,
//          Navbar dropdown, and Pricing suggestions.
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICES = [
  {
    id: 'web-design',
    title: 'Front-End Website',
    shortTitle: 'Front-End Site',
    tagline: 'Built for your brand. Designed for your customers.',
    shortDesc:
      'A custom-designed, handcoded website that looks the part and actually converts. No templates, no drag-and-drop, no corners cut.',
    fullDesc:
      'A front-end site is the right fit for most small businesses — it tells your story, shows off your work, and makes it easy for customers to reach you. Every layout decision, color choice, and line of code is made specifically for your business. Think a photographer\'s portfolio, a restaurant\'s menu and hours, or a contractor\'s service pages — professional, fast, and built around your brand, without the overhead of a backend you don\'t need.',
    whatWeDeliver: [
      'Full custom UI/UX design tailored to your brand',
      'Responsive layouts that work on every screen size',
      'Clean, maintainable React or vanilla HTML/CSS/JS codebase',
      'Contact forms, photo galleries, and service/menu pages',
      'Accessibility and core web vitals compliance',
      'Conversion-focused layout and copywriting guidance',
    ],
    goodFor: ['Small businesses', 'Photographers & creatives', 'Personal brands', 'Local companies'],
    example: {
      name: 'Zander Keller Photography',
      url: 'https://www.zanderkellerphotography.com/',
      note: 'A portfolio site built for visual impact and fast load times — no backend needed, just a great-looking showcase and a way for clients to get in touch.',
    },
    startingAt: '$350',
    monthlySupport: '$35/mo',
    color: '#f97316',
  },
  {
    id: 'fullstack-db',
    title: 'Full Stack Site & Database Support',
    shortTitle: 'Full Stack + DB',
    tagline: 'Frontend to database, start to finish.',
    shortDesc:
      'Everything in the Front-End plan, plus a real backend — custom database, accounts, and automation. Built for sites that need to actually do something, not just look good.',
    fullDesc:
      'Not every business needs just a website. When your site needs to handle order processing, appointment or quote scheduling, customer accounts, or an admin dashboard to manage it all, we build the whole stack. From React frontends to Node backends and SQL databases, we architect and build systems that are secure, fast, and built to grow with you.',
    whatWeDeliver: [
      'Full-stack architecture design (frontend + backend + database)',
      'PostgreSQL or SQLite database setup and schema design',
      'Online ordering, quote requests, and appointment/scheduling systems',
      'User authentication and role-based access control',
      'Admin dashboards and data management interfaces',
      'Deployment and environment configuration on Render or VPS',
    ],
    goodFor: ['Service businesses that book or quote online', 'Client portals', 'Businesses with complex data needs', 'Apps with user accounts'],
    example: {
      name: 'QM Lawncare',
      url: 'https://qmlawncare.com/',
      note: 'A great example of what a Full Stack upgrade unlocks: instead of just listing a phone number, customers could request quotes and get scheduled for service automatically, right from the site.',
    },
    startingAt: '$499',
    monthlySupport: '$50/mo',
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
