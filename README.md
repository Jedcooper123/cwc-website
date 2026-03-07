# Cooper Web Consulting — Website

Modern, conversion-focused frontend website for **Cooper Web Consulting (CWC)**.
Built with React + Vite. Deployable to GitHub Pages today; architected to grow
into a full-stack client platform later.

---

## Quick Start

### 1. Install dependencies

```bash
cd cwc-website
npm install
```

### 2. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. Build for production

```bash
npm run build
```

Output lands in `dist/`.

---

## Deploying to GitHub Pages

### Option A — Subdirectory deploy (e.g. `username.github.io/cwc-website`)

1. Open `vite.config.js` and set:
   ```js
   base: '/cwc-website/', // match your GitHub repo name exactly
   ```

2. Install the deploy helper (already in `devDependencies`):
   ```bash
   npm install
   ```

3. Add a `homepage` field to `package.json`:
   ```json
   "homepage": "https://<username>.github.io/cwc-website"
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```
   This runs `vite build && gh-pages -d dist` — it publishes the `dist/`
   folder to a `gh-pages` branch automatically.

5. In your GitHub repo: **Settings → Pages → Source → gh-pages branch**

### Option B — Custom domain (e.g. `cooperwebconsulting.com`)

1. Keep `base: '/'` in `vite.config.js`
2. Add a `CNAME` file inside `public/` containing your domain:
   ```
   cooperwebconsulting.com
   ```
3. Point your DNS A/CNAME records to GitHub Pages IPs (see GitHub docs)
4. Run `npm run deploy`

---

## Project Structure

```
cwc-website/
├── public/              # Static assets (favicon, CNAME, etc.)
├── src/
│   ├── components/
│   │   ├── Navbar/      # Sticky responsive navigation
│   │   ├── Hero/        # Full-viewport hero with browser mockup
│   │   ├── About/       # Company overview + stats
│   │   ├── Services/    # 6 service cards
│   │   ├── Process/     # Interactive 5-phase workflow
│   │   ├── WhyCWC/      # Differentiators + CTA banner
│   │   ├── Portfolio/   # Project showcase (swap in real work)
│   │   ├── Pricing/     # 3-tier pricing cards
│   │   ├── ClientPortal/# Upcoming platform teaser
│   │   ├── Contact/     # Contact form + sidebar
│   │   └── Footer/      # Brand, links, copyright
│   ├── hooks/
│   │   └── useScrollAnimation.js  # IntersectionObserver scroll reveals
│   ├── App.jsx          # Root — assembles all sections
│   ├── main.jsx         # React entry point
│   └── index.css        # CSS variables, reset, global utilities
├── index.html           # HTML shell (Google Fonts loaded here)
├── vite.config.js       # Vite config (set base for GH Pages)
└── package.json
```

---

## Customization Checklist

Before going live, update these placeholders:

- [ ] **Email**: Replace `hello@cooperwebconsulting.com` in `Contact.jsx` and `Footer.jsx`
- [ ] **Phone**: Replace `(555) 000-0000` in `Contact.jsx` and `Footer.jsx`
- [ ] **LinkedIn**: Replace `linkedin.com/in/yourprofile` in `Contact.jsx` and `Footer.jsx`
- [ ] **Calendly/booking link**: Replace `#contact` in the "Schedule a Call" button in `Contact.jsx`
- [ ] **Portfolio projects**: Update the `PROJECTS` array in `Portfolio.jsx` with real client work
- [ ] **Contact form backend**: Hook up the `handleSubmit` function in `Contact.jsx` to a form service:
  - [Formspree](https://formspree.io) (easy, free tier available)
  - [EmailJS](https://emailjs.com) (sends directly from frontend)
  - Custom backend API (for the full-stack version)

---

## Design Tokens

All colors and design values live in `src/index.css` as CSS custom properties.
To change the accent color, update these 4 variables:

```css
--accent:      #5b8df5;   /* primary accent */
--accent-lt:   #7ea8ff;   /* lighter variant for hover */
--accent-bg:   rgba(91, 141, 245, 0.09);  /* subtle bg tint */
--accent-glow: rgba(91, 141, 245, 0.20);  /* glow/shadow */
```

---

## Expanding to Full-Stack

When ready to add backend features:

1. **Contact form** → Connect to a Node/Express or Next.js API route
2. **Client Portal** → Build out the dashboard using the `ClientPortal` component as the entry point
3. **Auth** → Add login/JWT with a library like `@auth0/auth0-react` or `clerk`
4. **Payments** → Drop in Stripe.js for subscription billing
5. **Database** → Connect to PostgreSQL/MongoDB via a backend API
6. **Hosting** → Migrate from GitHub Pages to Vercel, Netlify, or a VPS

The component structure is already modular and ready for this expansion.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI library |
| Vite 5 | Build tool & dev server |
| CSS Modules | Scoped component styles |
| react-icons | Icon library (Feather icons) |
| gh-pages | GitHub Pages deployment |
| Google Fonts: Geist | Typography |

---

Built by Cooper Web Consulting.
