# AESTRELA custom-domain storefront

Vercel serves this storefront using the repository-root vercel.json. Run `node storefront/build-store.cjs` from the repository root to generate storefront/out.

The original Next.js project remains in the repository for future backend work. This deployment deliberately serves the current public storefront, matching the approved design and features. It includes the original six product photos and enhanced looping banner video.

Manual bKash and Nagad checkout uses the Vercel function and private PostgreSQL order storage for all six products and the customer's actual bag. Unpublished sizes are captured as requests for phone confirmation. See ../server/PAYMENTS.md for configuration and owner review. The receiving number is not shipped in public assets; checkout returns it only after saving an order. Homepage HTML and store.css match the version before checkout; checkout styles load separately.

Edit catalog.json, build-store.cjs, public/store.css and public/store.js here to maintain the storefront. The custom domain must remain attached to the existing Vercel project connected to this repository.
