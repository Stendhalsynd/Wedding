# HappyLife Secure Planning Integration

## todo
- Enable billing on Firebase project `gen-lang-client-0289234038`, then rerun `npx firebase-tools deploy --only firestore:rules --project gen-lang-client-0289234038`.

## doing
- Final review and handoff.

## done
- Deep interview selected existing Wedding integration over a standalone HappyLife auth retrofit.
- Added S4-2 spec for secure HappyLife planning integration.
- Added HappyLife seed data and Firestore helpers for budget, vendor, housing, policy, timeline, and metadata collections.
- Added protected `/planning` route and bottom navigation entry.
- Added planning document migration to couple connection flow, including seed deduplication.
- Added Firestore rules for planning collections and tightened `weddingHalls` reads to couple members.
- Added Firebase blueprint documentation for planning collections.
- Added Firebase CLI project config for repeatable Firestore rules deployment.
- Deployed Wedding production build to Vercel.
- Changed HappyLife public app into a no-sensitive-data redirect page and deployed it to Vercel.

## verification
- `npm test` passed: 53 tests, 0 failures.
- `npm run lint` passed.
- `npm run build` passed with pre-existing CSS import and chunk-size warnings.
- Browser check: unauthenticated `/planning` navigation redirects to `/login`; no planning data is visible before Google auth.
- Wedding production deployment completed: `https://wedding-jwjh.vercel.app`.
- HappyLife production deployment completed: `https://jwjh.wedding` alias points to a redirect page; Vercel-authenticated HTML check found no copied budget/vendor/housing seed strings.

## risks
- Firestore batch writes are limited; v1 seed size is small enough, but future bulk imports may need chunking.
- `jwjh.wedding` is present in Vercel, but external DNS is not configured yet. Vercel recommends `A jwjh.wedding 76.76.21.21`.
- Firestore rules deployment is blocked by Firebase project billing: Firestore Admin API returned 403 billing-required.
