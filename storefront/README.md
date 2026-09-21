# AESTRELA custom-domain storefront

Vercel serves this storefront using the repository-root vercel.json. Run `node storefront/build-store.cjs` from the repository root to generate storefront/out.

The original Next.js project remains in the repository for future backend work. This deployment deliberately serves the current public storefront, matching the approved design and features. It includes the original six product photos and enhanced looping banner video.

Checkout remains unavailable pending actual prices, sizes, delivery terms and order/payment integration. No customer orders are submitted or payments verified by this static storefront. The payment number is not shipped in its public assets.

Edit catalog.json, build-store.cjs, public/store.css and public/store.js here to maintain the storefront. The custom domain must remain attached to the existing Vercel project connected to this repository.
