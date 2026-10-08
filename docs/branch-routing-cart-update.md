# Branch routing and cart update — verification report

Verified locally on 5 October 2026. Workspace: C:\Users\Jai\mozza-whatsapp.

1. **Branch:** feature/whatsapp-automation-update. No branch switch, commit, push, merge or deployment.
2. **Files modified:** exact source/test file list below. The initial next-env.d.ts development-path difference was preserved after Next's build regenerated it. No .env.local edit or package installation.
3. **Canonical branch configuration:** [restaurant.ts](C:/Users/Jai/mozza-whatsapp/src/config/restaurant.ts). resolveBranch rejects unknown outlets; whatsappUrl requires an explicit outlet. Shadnagar remains the deliberate initial selection for a new session, not a fallback for invalid input.
4. **Business numbers:**

| Outlet | Display | WhatsApp digits |
|---|---|---|
| Hyderabad | +91 87123 57688 | 918712357688 |
| Shadnagar | +91 99497 99488 | 919949799488 |
| Jadcherla | +91 99510 47424 | 919951047424 |
| Guntur | +91 92467 69769 | 919246769769 |

5. **Flows made branch-aware:** homepage pickup planner, popular-item links, menu outlet selector and item modal, cart, Add more items, checkout/review, API draft and full-summary fallback, client network fallback, quick reservations, detailed homepage/contact reservations, catering/bulk enquiries, location WhatsApp links, footer WhatsApp/support/call links, and the existing itemOrderUrl utility. LocationsSection already supplies its tile's outlet and now benefits from the corrected helper; its layout/maps were not edited. There is no separate active Order This button; items use Add to order.
6. **Order routing:** all four branches passed API and automated checks for recipient, Outlet label and trusted totals. Both pickup and dine-in remain supported; delivery remains disabled. Hyderabad's browser checkout generated the full message to 918712357688. No external WhatsApp link was opened.
7. **Reservations:** all four branches passed routing and persisted-branch checks. Detailed Jadcherla and quick Shadnagar browser submissions also passed. Messages remain pending staff confirmation. The same ReservationSection is used on Contact; its selected outlet was verified.
8. **Catering:** all four branches passed routing and persisted details.branch checks. Guntur browser submission generated the Guntur recipient and label. A branch change hid the previous continuation link.
9. **Branch persistence:** one cart/provider branch in existing mozza-order-cart-v1 local storage. Verified homepage to menu, filtering, modal, multi-item additions, cart, Add more, checkout, refresh, homepage/contact/back navigation. Explicit menu query conflicts trigger the same guard. A missing query preserves the current outlet; an invalid query displays an error and disables adding until a valid outlet is selected.
10. **Cart safety:** a populated Hyderabad cart prompts before switching to Guntur, including changes requested by URL navigation. Cancel preserved all six units and ₹905; confirmation cleared items and selected Guntur. Cart replacement cannot silently change its branch, and adding checks the displayed outlet against the cart outlet. Clear order preserves the selected outlet.
11. **Cart images:** 96px desktop / 72px mobile thumbnails, rounded corners, object-fit cover. Only cart-row image/layout spacing was changed. Existing serving controls, quantity, remove, subtotal, checkout and modal architecture remain.
12. **Resolver reuse:** getMenuItemPhoto from unchanged menu-images.ts and unchanged StaticMenuImage/Next Image. No new photo assets or second mapping. Actual browser cart/menu asset paths matched for Margarita, Chicken Zinger Burger, Veg Fingers, Chicken Hot Wings, Salted French Fries, Classic Mint and Chocolate Brownie; every image loaded. Existing category fallback is inherited.
13. **Desktop:** cart and checkout checked at 1440, 1280, 1024 and 768px. Correct outlet, images/controls and no horizontal overflow.
14. **Mobile:** cart and checkout checked at 430 and 390px. Images remain visible, controls remain accessible, no horizontal overflow. Long carts scroll vertically using the existing modal.
15. **Totals:** Margarita regular ×2 = ₹400; Chicken Zinger Burger normal ×1 = ₹160; Veg Fingers small ×3 = ₹345; subtotal = **₹905**. Verified in utility tests, browser cart/review/message and saved Supabase draft.
16. **Supabase:** all 12 matrix requests returned HTTP 200; four draft checkout.branch values, four reservations.branch values and four staff_enquiries.details.branch values verified directly. Four additional browser records also verified (Hyderabad draft, Jadcherla reservation, Shadnagar quick reservation, Guntur enquiry). These 16 test records remain in the test project; none is a real order/booking. Matrix batch: 94c25bc5. Browser references: MR-20261005-9497042A2CD8, MR-20261005-2F7278A983E9, ME-20261005-633D03E89E30. No schema/migration changes or reruns. Admin orders, overview, drafts, reservations, enquiries and analytics GET APIs returned HTTP 200 using configured authorization; credentials were not printed.
17. **State machine:** all 33 existing order tests pass. New all-branch simulations cover order review/confirmation, ₹905 totals, reset retaining outlet, reservation branch and catering handoff branch. Wrong-outlet draft references are rejected by the processor. Existing CLI simulator completed pizza ×2 + burger ×1, pickup, review and confirmation with a simulated ₹560 storage effect and no network calls. Processor tests retain order-ID generation and idempotency coverage. The CLI itself only prints a storage effect; it does not create a real order ID/database row.
18. **Tests:** 82/82 pass: 33 order + 13 admin + 12 website + 24 new branch tests. Menu integrity: 25 categories, 118 entries, 189 variants. Image verification: all 25 category and 118 item mappings valid; all assets present. Existing manual-price verification flags remain unchanged.
19. **Lint:** npm run lint passes without warnings/errors.
20. **TypeScript:** npm run typecheck passes.
21. **Build:** npm run build passes (Next 16.3.6, webpack). No deployment performed.
22. **Public UI scope:** existing layouts, typography, colors, menu animations, category UI, maps, food assets/names/prices remain unchanged. Functional outlet bindings/contact values, the requested outlet confirmation and cart-row thumbnail styling are the intentional changes. Diff review verified frozen data/map paths unchanged.
23. **Admin:** no admin UI, admin route or analytics implementation files modified. Existing automated regression tests and read-only live API checks pass.
24. **Meta limitation and future configuration:** website wa.me handoffs work for all four numbers, but this does not activate four bots. Current sender remains explicitly Shadnagar and uses existing legacy credentials or its branch-prefixed equivalents. metaConfig(branch) can resolve WHATSAPP_<BRANCH>_PHONE_NUMBER_ID, _ACCESS_TOKEN, _API_VERSION, _APP_SECRET and _VERIFY_TOKEN, with no other branch inheriting Shadnagar credentials. Each actual number must be registered/verified with Meta and mapped to its real phone-number ID and permitted token; the appropriate WABA/webhook subscription, app signature secret, verification token and supported API version are required. Approved status templates/language and permissions are needed for messages outside the customer service window. **Credentials alone are not sufficient to enable the remaining senders:** before activation, namespace conversation sessions/outbox/idempotency by receiving branch/phone-number ID, persist that sender for replies/status notifications, dispatch inbound messages by trusted metadata and app signature, and update the reservation RPC (its current WhatsApp insert defaults to Shadnagar). These require a separately reviewed additive backend migration/integration; existing migrations must not be rerun. Non-live branches deliberately receive full summaries rather than unusable short draft tokens. No Meta calls, credentials, IDs or tokens were invented or sent during QA.

## Exact files changed

All paths are under C:\Users\Jai\mozza-whatsapp:

- C:\Users\Jai\mozza-whatsapp\src\config\restaurant.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\order-utils.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\website-requests.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\server\config.ts
- C:\Users\Jai\mozza-whatsapp\src\app\api\orders\route.ts
- C:\Users\Jai\mozza-whatsapp\src\app\api\website-requests\route.ts
- C:\Users\Jai\mozza-whatsapp\src\app\api\whatsapp\webhook\route.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\whatsapp\client.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\whatsapp\engine.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\whatsapp\processor.ts
- C:\Users\Jai\mozza-whatsapp\src\lib\whatsapp\types.ts
- C:\Users\Jai\mozza-whatsapp\src\components\home\ServicePlanner.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\home\ReservationSection.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\home\CateringBanner.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\layout\Footer.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\menu\MenuExplorer.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\menu\MenuItemCard.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\menu\MenuItemModal.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\order\OrderProvider.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\order\OrderDrawer.tsx
- C:\Users\Jai\mozza-whatsapp\src\components\order\CheckoutFlow.tsx
- C:\Users\Jai\mozza-whatsapp\src\app\globals.css
- C:\Users\Jai\mozza-whatsapp\scripts\order-tests.mjs
- C:\Users\Jai\mozza-whatsapp\scripts\branch-tests.mjs (new)
- C:\Users\Jai\mozza-whatsapp\scripts\branch-live-qa.mjs (new; requires explicit --test-project; creates test records)
- C:\Users\Jai\mozza-whatsapp\docs\branch-routing-cart-update.md (this report)

QA screenshots, responsive measurements, seven-category image parity and simulator transcript are local ignored artifacts in C:\Users\Jai\mozza-whatsapp\qa\branch-routing. Existing .env.local, database migrations, package.json and lockfile were not edited.

## Commands

- node --test scripts/order-tests.mjs scripts/website-tests.mjs scripts/admin-tests.mjs scripts/branch-tests.mjs
- npm run lint
- npm run typecheck
- npm run test:images
- npm run test:menu
- npm run build
- npm run simulate:whatsapp (scripted local inputs; no backend/Meta)
- node --env-file=.env.local scripts/branch-live-qa.mjs --test-project (already run once; rerunning intentionally creates another set of test records)
