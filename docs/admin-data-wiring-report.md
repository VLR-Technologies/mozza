# Final admin / data-wiring report

Verified 27 September 2026 in `C:\Users\Jai\mozza-whatsapp`, branch `feature/whatsapp-automation`.

This report covers the final update, including unfinished persistence/Analytics files carried forward from the preceding turn. Existing uncommitted admin work was preserved. No packages were installed. No branch switch, commit, push, merge, deployment or migration execution occurred.

## 1. Files modified

Paths below are relative to the workspace above.

| File | Change |
| --- | --- |
| `src/components/home/ReservationSection.tsx` | Save existing form before WhatsApp continuation; saving/error handling. |
| `src/components/home/ServicePlanner.tsx` | Persist compact reservation with available fields; no new identity fields. |
| `src/components/home/CateringBanner.tsx` | Persist intentional catering/bulk submission before continuation. |
| `src/app/privacy/page.tsx` | Necessary disclosure that submission now saves the request. |
| `src/components/admin/AdminDashboard.tsx` | Analytics navigation/API, default seven-day filter, loading/error/retry handling. |
| `src/components/admin/Records.tsx` | Correct source/type, missing-phone display, New enquiry filter. |
| `src/components/admin/shared.tsx` | Analytics types and enquiry reference/type helpers. |
| `src/components/admin/admin.css` | Admin-only responsive analytics styling and sidebar scrolling. |
| `src/lib/admin-ui.ts` | IST-aware Last 30 Days preset. |
| `src/lib/server/admin-data.ts` | New/legacy pending enquiry filter; omit internal request hashes from list responses. |
| `package.json` | Adds `npm run test:website`. |
| `docs/admin-dashboard.md` | Link to this report. |

Next's build also regenerated `next-env.d.ts` to reference `.next/types` instead of `.next/dev/types`. Existing unrelated dirty files, including `package-lock.json`, were not overwritten.

## 2. Files created

- `src/app/api/website-requests/route.ts`
- `src/lib/website-requests.ts`
- `src/lib/use-website-request.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/components/admin/Analytics.tsx`
- `src/types/analytics.ts`
- `scripts/website-tests.mjs`
- `scripts/verify-live-admin-data.mjs` — read-only local API/Supabase cross-check.
- `docs/admin-data-wiring-report.md`
- `docs/qa-admin-data-wiring/analytics-1440.png`
- `docs/qa-admin-data-wiring/analytics-1280.png`
- `docs/qa-admin-data-wiring/analytics-1024.png`
- `docs/qa-admin-data-wiring/analytics-768.png`
- `docs/qa-admin-data-wiring/analytics-430.png`
- `docs/qa-admin-data-wiring/analytics-390.png`
- `docs/qa-admin-data-wiring/public-home-1440.png`
- `docs/qa-admin-data-wiring/public-menu-1440.png`
- `docs/qa-admin-data-wiring/public-reservation-1440.png`
- `docs/qa-admin-data-wiring/public-catering-1440.png`
- `docs/qa-admin-data-wiring/public-mobile-navigation-390.png`

## 3–22. Implementation and QA checklist

| # | Requested item | Result |
| --- | --- | --- |
| 3 | New migration | No additional migration. Uses the user-applied `202609270001_website_requests_analytics.sql`. No migrations rerun. |
| 4 | Reservation implementation | Existing forms POST to `/api/website-requests`. Server validates dates, fields, branch and normalized phone, saves through `create_website_request`, then returns the WhatsApp URL. Source website; initial status pending. |
| 5 | Reservation QA | Public form saved `MR-20260927-C7A8265D0934`, visible in admin as Website / Pending confirmation with two guests. Repeat submission retained one row. Compact planner API saved `MR-20260927-05DFBCE1D9FF` with missing identity preserved and a note explaining 13+ guests. |
| 6 | Catering/bulk implementation | Same API stores structured event details in `staff_enquiries`, source website, status new. Submitted event type determines catering vs bulk_order. Opening a navigation link/form does not write data. |
| 7 | Catering QA | Public form saved `ME-20260927-B2B1DFA9A611`, displayed as Catering / Website / New. Repeat submission retained one row. Concurrent bulk retries returned the same `ME-20260927-CBC643557EA4` reference. |
| 8 | Website draft regression | Public menu → two Chicken Zinger Burger servings (₹160 each) + one regular Margarita (₹200) → Pickup checkout → saved draft. Admin Drafts displayed two lines, three servings, ₹520, correct QA customer and normalized phone. Existing WhatsApp summary preserved; no message sent. |
| 9 | Analytics route/components | Protected `/api/admin/analytics`, `Analytics.tsx`, shared response type and sidebar entry after Enquiries. |
| 10 | Metrics | Total/confirmed/completed orders, menu subtotal, drafts, reservations, enquiries; daily orders/subtotals; statuses/sources/fulfilment; top ten item variants; reservation statuses; actual enquiry types/lifecycle; draft active/expired/consumed and reliable linked conversion. |
| 11 | Queries/functions | Existing `admin_analytics(p_from,p_to)` RPC. Four exact server count queries supplement New, Contacted, Resolved and Archived enquiry buckets, returning at most one ID per query. Browser receives aggregates, not customer records. |
| 12 | Date filters | Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Custom Range pass. All six API ranges independently cross-checked against Supabase table reads. Browser presets and custom empty period also verified. |
| 13 | Admin security | Login works; sign-out remains effective after reload. All nine dashboard sections and Analytics accept configured authorization (200) and reject anonymous requests (401). Keys remain server-side; no public admin link. |
| 14 | Public visual regression | Homepage, menu, reservation, expanded catering and mobile navigation inspected. Public CSS, menu data, cart/checkout styling and animation code unchanged. AST comparison found no class/style changes in ReservationSection/CateringBanner; ServicePlanner adds only the existing error style. Necessary saved/pending/privacy wording updated. Visual/source inspection, not historical pixel-diff testing. |
| 15 | Mobile admin | Checked 1440, 1280, 1024, 768, 430 and 390 px with no horizontal document overflow. Responsive stacking and mobile navigation verified; lower enquiry/draft panels inspected at 390 px. |
| 16 | Tests added | Twelve website/analytics tests covering normalization, validation, reservation/catering persistence, stable idempotency arguments, failure/conflict/rate-limit behavior, origin, IST dates, analytics auth/range validation, aggregate formatting and enquiry filtering. Read-only live cross-check script added. |
| 17 | Test results | 12 website + 13 admin + 33 order tests passed (58 total). Menu integrity passed: 25 categories, 118 entries, 189 variants. Image checks passed all 118 mappings. |
| 18 | Lint | Passed. |
| 19 | TypeScript | Passed. |
| 20 | Production build | Passed with the existing webpack build script. |
| 21 | Limitations | Meta remains inactive. No stored orders exist in the tested periods, so real order charts/top items render empty. Nonzero aggregate formatting is unit-tested; populated order-chart visuals were not verified against real orders. Compact planner identity is still uncollected. Labelled QA entries remain in the test database and contribute to analytics. |
| 22 | Future Meta activation | Project setup steps below; none performed in this task. |

## Data semantics and cross-check

Dates follow record creation in IST. Totals include archived records. Confirmed counts/menu subtotal include confirmed, preparing, ready and completed orders, excluding pending/cancelled orders and drafts. Missing prices are not fabricated. Top items use stored order-item quantities/price snapshots. Delivery is hidden when disabled and no stored delivery data exists. Missing enquiry types are labelled “Type not recorded.” Archived enquiry counts take precedence over underlying status. Draft conversion uses `orders.draft_token`, not inferred customer matching.

Final independent database cross-check:

| Range | Orders | Menu subtotal | Drafts | Reservations | Enquiries |
| --- | ---: | ---: | ---: | ---: | ---: |
| Today, 27 September | 0 | ₹0 | 2 | 2 | 3 |
| Yesterday, 26 September | 0 | ₹0 | 3 | 1 | 1 |
| Last 7 days | 0 | ₹0 | 5 | 3 | 4 |
| Last 30 days | 0 | ₹0 | 5 | 3 | 4 |
| This month | 0 | ₹0 | 5 | 3 | 4 |
| 1–7 January 2000 | 0 | ₹0 | 0 | 0 | 0 |

QA records came from intentional website/API submissions, never fake incoming WhatsApp events. Two separately keyed bulk QA submissions exist (`ME-20260927-C85CAC91C29E` and `ME-20260927-CBC643557EA4`); same-key retries do not create extra rows. Other existing data was retained. Screenshots capture intermediate QA totals before the additional bulk/planner checks.

On persistence failure, the existing-style error state preserves inputs, permits retry and makes no success/confirmation claim. The client locks in-flight submissions and retains a key for unchanged data; the server hashes the key/payload and the existing RPC locks/deduplicates. Sanitized log events contain operation/category codes, not credentials or customer payloads. Analytics hides old values while loading or after errors and offers Retry.

## Future Meta activation — not performed

1. Complete Meta business/WhatsApp onboarding and register the intended number.
2. Configure server-side `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, and a supported `WHATSAPP_API_VERSION`; keep `WHATSAPP_PHONE_NUMBER` aligned with the registered/public destination.
3. Provide public HTTPS `/api/whatsapp/webhook`, complete verification and subscribe the app/account to message events.
4. Test signed incoming messages, direct ordering, phone-matched draft continuation, reservations and human handoff with an explicitly authorized test recipient.
5. Configure approved status template name/language if needed outside the service window; arrange and monitor the existing outbox retry worker.

These are remaining project integration steps from the existing implementation. Meta activation, message delivery and production readiness have not been verified.
