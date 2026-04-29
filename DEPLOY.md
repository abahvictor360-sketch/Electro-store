# Electro Store — Deployment Guide

## Recommended Stack

| Service | Purpose | Free Tier |
|---|---|---|
| **Vercel** | Host the Next.js app | Yes — unlimited deployments |
| **Neon.tech** | Serverless PostgreSQL | Yes — 0.5 GB storage |
| **Stripe** | Payments | Test mode free forever |
| **Cloudinary** | Product image hosting | Yes — 25 GB |

---

## Step 1 — Set Up the Database (Neon.tech)

1. Go to [neon.tech](https://neon.tech) → **Sign up** (free)
2. Create a new project → name it `electro-store`
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/electro_store?sslmode=require
   ```
4. Paste it into your `.env` as `DATABASE_URL`

---

## Step 2 — Run Database Migrations

With your `DATABASE_URL` set, run:

```bash
cd electro-store
npx prisma migrate dev --name init
```

This creates all tables: `User`, `Product`, `Order`, `OrderItem`, `Address`, `SiteConfig`, `WishlistItem`.

**Seed your first admin user** (run once after migration):

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('YourPassword123!', 12);
  await p.user.create({ data: { name: 'Admin', email: 'abahvictor760@gmail.com', password: hash, role: 'ADMIN' }});
  console.log('Admin created');
}
main().finally(() => p.\$disconnect());
"
```

---

## Step 3 — Set Up Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers → API keys**
2. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** → `STRIPE_SECRET_KEY`
4. **Webhooks** (needed for order status updates):
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-domain.vercel.app/api/payments/webhook`
   - Event: `checkout.session.completed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

> During development, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks locally:
> ```bash
> stripe listen --forward-to localhost:3000/api/payments/webhook
> ```

---

## Step 4 — Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
cd electro-store
vercel
```

Follow the prompts. Vercel will detect Next.js automatically.

### Option B — GitHub + Vercel Dashboard

1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/electro-store.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**

---

## Step 5 — Add Environment Variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...` for testing) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `NEXT_PUBLIC_URL` | `https://your-app.vercel.app` |

Then redeploy: **Deployments → Redeploy**.

---

## Step 6 — Run Production Migration

After first deploy, run the migration against your production DB:

```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

Or connect via Neon's SQL editor and run the migration SQL directly.

---

## Step 7 — Verify Everything Works

Go through this checklist on your live URL:

- [ ] Home page loads with hero, categories, products
- [ ] Register a new customer account
- [ ] Search for a product → results appear
- [ ] Add to cart → cart badge updates → cart page shows items
- [ ] Add to wishlist → heart fills → wishlist page shows items
- [ ] Checkout → Stripe payment page → use test card `4242 4242 4242 4242`
- [ ] Order appears in `/orders` with status `PAID`
- [ ] Download invoice PDF from orders page
- [ ] Log in as admin → `/admin` dashboard shows stats
- [ ] Admin → Content Editor → change hero title → save → homepage reflects change
- [ ] Admin → Products → add a product → appears in store

---

## Local Development

```bash
cd electro-store
cp .env.example .env      # Fill in your values
npx prisma migrate dev    # Run migrations
npm run dev               # Start at http://localhost:3000
```

---

## Custom Domain (Optional)

1. Vercel Project → **Settings → Domains** → Add your domain
2. Update DNS at your registrar to point to Vercel's nameservers
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` env vars to your custom domain
4. Update Stripe webhook URL to use your custom domain

---

## Production Checklist

- [ ] Use `sk_live_` Stripe keys (not `sk_test_`)
- [ ] Set `AUTH_SECRET` to a strong random value (32+ chars)
- [ ] Enable Vercel Analytics (free) for page view tracking
- [ ] Add your domain to Vercel
- [ ] Set up Stripe webhook with your production URL
- [ ] Test a real payment end-to-end before going live
