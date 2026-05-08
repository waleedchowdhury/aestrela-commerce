# AESTRÉLA Commerce

Premium AESTRÉLA storefront and admin panel built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Prisma, and Postgres.

## What is included

- Transparent luxury header that turns deep blue on scroll or hover.
- Motion announcement bar controlled by admin content.
- Home hero, shop grid, category bar, editorial story block, and hybrid footer.
- Admin panel for products, product images, sizes, highlights, announcement, hero media, editorial content, footer copy, and social links.
- Prisma Postgres schema for products, content, customers, orders, payments, newsletter subscribers, and admin data.
- Stripe and PayPal checkout route stubs wired for live credentials.

## Setup

1. Copy `.env.example` to `.env`.
2. Put your Vercel Postgres connection string in `DATABASE_URL`.
3. Set `ADMIN_PASSWORD` before launch.
4. Install dependencies:

```bash
npm.cmd install
```

5. Create/update Postgres tables:

```bash
npm.cmd run prisma:push
npm.cmd run prisma:seed
```

6. Start the development server:

```bash
npm.cmd run dev
```

## Admin

Open `/admin` and log in with `ADMIN_PASSWORD`.

## Payments

Add Stripe and PayPal credentials in `.env`. The checkout endpoints return a clear configuration error until credentials are present, which keeps development safe.

## Vercel Deployment

This project is ready for Vercel with Prisma Postgres.

1. Import the GitHub repository into Vercel.
2. In the Vercel project, open Storage/Marketplace and connect a Postgres database. Vercel/Prisma Postgres can inject `DATABASE_URL` into the project.
3. Add the remaining environment variables from `.env.example`.
4. Deploy the project.
5. Create the tables and seed starter content:

```bash
npm run prisma:push
npm run prisma:seed
```

Required Vercel environment variables:

- `DATABASE_URL`: Vercel Prisma Postgres/Postgres connection string
- `ADMIN_PASSWORD`: admin login password
- `ADMIN_COOKIE_SECRET`: long random string
- `NEXT_PUBLIC_SITE_URL`: Vercel project URL or future domain
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENVIRONMENT`: `live` for production
- `UPLOAD_DIR`: optional. Leave unset on Vercel unless you replace local upload storage with a persistent service.

## Render Deployment

This repository includes `render.yaml` for a real Next.js web service deployment. Use Render Blueprint or create a Web Service manually from this GitHub repo.

Render build command:

```bash
npm ci && npm run build
```

Render start command:

```bash
npm run start
```

Required Render environment variables:

- `DATABASE_URL`: production Postgres connection string
- `ADMIN_PASSWORD`: admin login password
- `ADMIN_COOKIE_SECRET`: long random string
- `NEXT_PUBLIC_SITE_URL`: Render service URL or future domain
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENVIRONMENT`: `live` for production
- `UPLOAD_DIR`: optional. Leave unset on Render free plan. Use `/var/data/uploads` only after adding a paid persistent disk.

The included `render.yaml` uses Render's free web service plan so you can deploy without adding payment information. On the free plan, uploaded files are not guaranteed to persist across restarts or redeploys. Before real launch, add a paid Render disk or replace local upload storage with Azure Blob Storage/Cloudinary for CDN-backed global image delivery.
