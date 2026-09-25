# Manual payment operations

The Vercel function at `/api/orders` uses the existing Prisma Postgres database through `DATABASE_POSTGRES_URL` (fallback `DATABASE_URL`). It creates its own `aestrela_manual_orders` and `aestrela_order_limits` tables without changing the old commerce tables. Orders persist in the database; apply the store's retention policy and backups through database administration.

`MANUAL_PAYMENT_NUMBER` is server-only. It is returned only after a durable order is created. Customers use personal bKash or Nagad Send Money, then submit the transaction ID. Submissions remain awaiting_verification until the owner checks actual receipt in the payment account. Never mark a test reference paid without receiving a transfer.

Owner page: `/owner-orders/`. Use the existing ADMIN_PASSWORD, or an access key whose SHA-256 hex is configured as ORDER_ADMIN_KEY_SHA256. Owner keys stay in page memory, not browser storage. Sign out after reviewing. Customer tokens are scoped to an order and stored in their browser. ORDER_TOKEN_SECRET overrides the existing ADMIN_COOKIE_SECRET (minimum 32 characters). Do not rotate this secret casually: idempotent retries depend on it.

Production configuration:

- MANUAL_CHECKOUT_ENABLED=true
- MANUAL_PAYMENT_NUMBER: local 11-digit receiving number
- STORE_CHECKOUT_MODE=test: only one Be Cool item for a real BDT10 payment test, explicitly no shipment. Regular bag contents are unchanged.
- For retail, set STORE_CHECKOUT_MODE=retail, STORE_SIZES to actual comma-separated sizes, STORE_SUPPORT_EMAIL to an actual customer-care address, and confirm delivery coverage, timing and returns in storefront/build-store.cjs. Product-specific catalog sizes override STORE_SIZES.

No automated email notifications are installed. Orders are reviewed on the owner page. STORE_SUPPORT_EMAIL provides a contact link; notifications require a separately configured transactional email service.

Build: node storefront/build-store.cjs. Vercel installs server dependencies with npm ci --prefix server --ignore-scripts; existing Next.js source is not deployed. Test API behavior with node --test server/manual-orders.test.cjs. These tests use an in-memory test double, so also verify a live saved order separately. No real transfer should be initiated by automated tests.
