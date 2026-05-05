# AESTRÉLA Commerce

Premium AESTRÉLA storefront and admin panel built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Prisma, and SQL Server.

## What is included

- Transparent luxury header that turns deep blue on scroll or hover.
- Motion announcement bar controlled by admin content.
- Home hero, shop grid, category bar, editorial story block, and hybrid footer.
- Admin panel for products, product images, sizes, highlights, announcement, hero media, editorial content, footer copy, and social links.
- Prisma SQL Server schema for products, content, customers, orders, payments, newsletter subscribers, and admin data.
- Stripe and PayPal checkout route stubs wired for live credentials.

## Setup

1. Copy `.env.example` to `.env`.
2. Put your SQL Server connection string in `DATABASE_URL`.
3. Set `ADMIN_PASSWORD` before launch.
4. Install dependencies:

```bash
npm.cmd install
```

5. Create/update SQL Server tables:

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
