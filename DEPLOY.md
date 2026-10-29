# Going live: portal rebuild (Neon + Resend)

Do these in order. It takes about 20 minutes. Until step 4, the live site keeps running the old code.

## 1. Create the database (Neon)
1. Go to console.neon.tech and click **New Project**. Name it `launchpad-site` and pick region **US East**.
2. Click **Connect**, switch on **Connection pooling**, and copy the connection string. It starts with `postgresql://` and contains `-pooler`.

## 2. Check email (Resend)
1. In resend.com → **Domains**, make sure `launchpadwebconsulting.com` shows **Verified**. If it isn't listed, click **Add Domain** and add the DNS records it shows you in Cloudflare.
2. Go to **API Keys** → **Create API Key** (Sending access) and copy it.

## 3. Add settings in Render
Render → your site's service → **Environment**. Add or update these:

| Key | Value |
|---|---|
| `DATABASE_URL` | the Neon string from step 1 |
| `JWT_SECRET` | a long random string (Render's **Generate** button works) |
| `ADMIN_EMAIL` | `jedpcooper@gmail.com` |
| `ADMIN_PASSWORD` | your admin password (10+ characters) |
| `APP_URL` | `https://www.launchpadwebconsulting.com` |
| `RESEND_API_KEY` | the key from step 2 |
| `EMAIL_FROM` | `Launchpad Web Consulting <hello@launchpadwebconsulting.com>` |
| `OWNER_NOTIFY_EMAIL` | `jedpcooper@gmail.com` |
| `REDIRECT_ALL_EMAIL_TO` | `jedpcooper@gmail.com` (**temporary**, see step 5) |

You can delete these old ones: `DATABASE_PATH`, `EMAIL_PASS`, any Gmail SMTP settings, and the Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`). Stripe isn't used for now.

## 4. Deploy
Merge the `portal-neon-rebuild` branch into `main` and push. Render deploys automatically. In the Render logs, look for `[DB] Ready`.

## 5. Test it yourself (email test mode is on)
1. Sign in at `/portal` with your admin email and password.
2. Go to **Clients** → **Add client** and use a second email address of your own. The invite will arrive at jedpcooper@gmail.com because test mode is on.
3. Open the invite link, set a password, then send an edit request and a message. Check that both reach your inbox.
4. Submit the contact form on `/contact` and check that it reaches your inbox.
5. When everything works, **delete `REDIRECT_ALL_EMAIL_TO`** in Render. Real emails then go to real clients.

## 6. Add your real clients
For each one: **Clients** → **Add client** with **Email them a link** checked. They create their own password. The link works for 7 days, and **Resend invite** sends a new one.

Then open the client and fill in **Monthly plan** (price and next due date). That's what they see on their Billing tab. Update the due date each month after they pay.

## Forgot the admin password?
Change `ADMIN_PASSWORD` in Render and redeploy. It's re-applied on every boot.
