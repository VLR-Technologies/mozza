# Mozza Italia WhatsApp implementation report

Workspace: C:\Users\Jai\mozza-whatsapp  
Branch: feature/whatsapp-automation  
Remote: https://github.com/VLR-Technologies/mozza.git

All changes are local and uncommitted. No branch switch, commit, push, merge, deployment, remote migration, package installation or real WhatsApp send occurred. Menu data, categories, prices, images, gallery and existing animation code are unchanged. The current public restaurant destination remains +91 99497 99488.

## 1–2. Files created and modified

Created (28):

- `docs/whatsapp-automation.md`
- `docs/whatsapp-implementation-report.md`
- `scripts/order-tests.mjs`
- `scripts/simulate-whatsapp.mjs`
- `scripts/ts-loader.mjs`
- `src/app/admin/orders/page.tsx`
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/orders/[id]/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/whatsapp/webhook/route.ts`
- `src/components/order/CheckoutFlow.tsx`
- `src/components/order/OrderDrawer.tsx`
- `src/components/order/OrderProvider.tsx`
- `src/components/order/QuantityControl.tsx`
- `src/components/order/StaffOrders.tsx`
- `src/lib/order-utils.ts`
- `src/lib/server/config.ts`
- `src/lib/server/db.ts`
- `src/lib/server/security.ts`
- `src/lib/whatsapp/client.ts`
- `src/lib/whatsapp/engine.ts`
- `src/lib/whatsapp/outbox.ts`
- `src/lib/whatsapp/processor.ts`
- `src/lib/whatsapp/types.ts`
- `src/types/order.ts`
- `supabase/migrations/202609260001_whatsapp_orders.sql`
- `supabase/tests/ordering.sql`

Modified (15):

- `.env.example`
- `README.md`
- `package.json`
- `src/app/globals.css`
- `src/app/privacy/page.tsx`
- `src/app/robots.ts`
- `src/components/home/CateringBanner.tsx`
- `src/components/home/LocationsSection.tsx`
- `src/components/home/ReservationSection.tsx`
- `src/components/home/ServicePlanner.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/GlassNavbar.tsx`
- `src/components/layout/SiteShell.tsx`
- `src/components/menu/MenuItemModal.tsx`
- `src/config/restaurant.ts`

## 3. Cart

React Context/reducer, shared typed models, serving and quantity selection (1–20), merge identical servings, add multiple items, change quantities/servings, remove/clear, add more, navbar count and mobile cart control. Versioned localStorage stores selections only, with safe stale/invalid recovery and current menu repricing.

## 4. Checkout

Pickup/dine-in, Shadnagar default, delivery/table controls disabled by configuration, normalized Indian mobile, name, optional note and review. No online payment. Server validates IDs, serving indexes and quantities and ignores submitted prices/totals. Unknown/MRP/manual-verification values produce a null subtotal and price-confirmation wording.

## 5. WhatsApp fallback

A single structured multi-item message includes servings, quantities, price information, outlet, fulfilment and customer. Customer explicitly opens WhatsApp and taps Send. Missing/unreachable storage falls back without claiming a saved final order. Meta-incomplete mode retains a saved draft but sends full text for manual staff handling.

## 6. Supabase schema

SQL migration creates customers, orders, order_items, order_drafts, conversation_sessions, reservations, staff_enquiries, processed_messages and whatsapp_outbox. RLS and restricted grants keep data/RPCs server-only. Transactions atomically save conversation effects, deduplicate events and enqueue replies. Order rows use immutable price snapshots; marketing_opt_in defaults false.

## 7. API routes

- POST /api/orders: validated, idempotent 24-hour draft creation or fallback.
- GET /api/admin/orders: protected latest orders, drafts, reservations, enquiries and queue.
- PATCH /api/admin/orders/[id]: protected, validated order-status transitions.
- POST /api/admin/notifications: protected retry of queued notifications.
- GET/POST /api/whatsapp/webhook: Meta verification and incoming events.

There is no unrestricted public WhatsApp-send or order-read endpoint.

## 8. Webhook

Verify-token challenge, raw-body HMAC-SHA256 verification with Meta app secret, request limits, configured Phone Number ID filtering, event parsing, database deduplication, optimistic session concurrency and persistent outbox. Website draft references are random, expire after 24 hours and require a matching sender phone. Final orders are created only after customer confirmation.

## 9. State machine

WELCOME; ORDER_CATEGORY, ORDER_ITEM, ORDER_VARIANT, ORDER_QUANTITY, ORDER_CART, ORDER_EDIT, ORDER_EDIT_QUANTITY, ORDER_FULFILMENT, ORDER_CUSTOMER, ORDER_ADDRESS, ORDER_LANDMARK, ORDER_REVIEW, ORDER_CREATED; RESERVATION_DATE, RESERVATION_TIME, RESERVATION_GUESTS, RESERVATION_NAME, RESERVATION_NOTES, RESERVATION_CONFIRM; CATERING_NAME, CATERING_DATE, CATERING_GUESTS, CATERING_TYPE, CATERING_NOTES; HUMAN_HANDOFF. Deterministic code, no LLM. STAFF pauses the bot until RESET.

## 10. Message types

Text, interactive reply buttons (up to three), paginated interactive lists (up to ten rows) and configurable approved utility templates for status notifications. Long cart text is split to fit message limits. Service-window enforcement uses persisted customer-message timestamps.

## 11. Reservations and catering

Direct WhatsApp reservations collect date/time/guests/name/optional notes, review and explicit confirmation; stored MR references remain pending staff confirmation. Direct catering collects a short enquiry and hands off. Existing website reservation/catering forms preserve full details and hand them to staff without forcing re-entry.

## 12. Admin

/admin/orders uses a server-validated random shared secret (32+ characters), kept only in UI memory. No customer data is included in the unauthenticated page. List/detail views show customer, source, items, serving, quantity, amounts, notes and status. Confirm/preparing/ready/completed/cancel actions follow allowed transitions. Unknown-price enquiries require staff handling and cannot be confirmed with a fabricated total. Staff enquiries/reservations are visible; this is not a live-chat inbox or individual staff-account system.

## 13. Environment variables

NEXT_PUBLIC_SITE_URL; WHATSAPP_PHONE_NUMBER; WHATSAPP_PHONE_NUMBER_ID; WHATSAPP_BUSINESS_ACCOUNT_ID; WHATSAPP_ACCESS_TOKEN; WHATSAPP_VERIFY_TOKEN; WHATSAPP_APP_SECRET; WHATSAPP_API_VERSION; SUPABASE_URL; SUPABASE_ANON_KEY (reserved/unused); SUPABASE_SERVICE_ROLE_KEY; ADMIN_ORDER_SECRET; optional WHATSAPP_STATUS_TEMPLATE_NAME and WHATSAPP_STATUS_TEMPLATE_LANGUAGE. Placeholders/comments are in .env.example. No real secrets were added.

## 14–16. Immediate versus configured features

Without credentials: cart, persistence, checkout, structured click-to-chat, existing form links and CLI simulator work. Supabase credentials plus migration enable persistent drafts and staff data. Supabase AND registered/configured Meta credentials enable real inbound bot flows, final orders/reservations, draft continuation and outgoing notifications. Credentials alone do not prove the phone/account is live.

## 17. Security

Server-only secret modules, trusted menu price lookup, strict quantities/variants/outlets/fulfilment, body limits, same-origin writes, constant-time checks, random phone-bound expiring references, RLS/service-role RPC grants, atomic message deduplication, no public sender, explicit order statuses and minimal structured logs. Order consent does not opt customers into marketing. Production also needs edge rate limiting, queue monitoring/retry scheduling, retention/backups and controlled staff access.

## 18–19. Tests and results

33 automated order/bot/API tests pass. Coverage includes calculations, variants/quantities, unverified pricing, phone normalization, storage recovery, IDs, messages, state transitions, pagination, cart edit/remove, checkout, order creation with simulated persistence, concurrent duplicate delivery, post-commit Meta failure, reservation, catering, handoff, expired drafts, origin checking, signature verification, draft API, database outage and admin access denial. CLI simulation smoke passed.

Existing menu tests pass: 25 categories, 118 entries, 189 variants. Existing image tests pass: complete mappings and files, unchanged source data. The supplied SQL smoke test is NOT executed here: there are no Supabase credentials or local PostgreSQL runtime configured. Meta sending is likewise NOT live-tested. Persistence/concurrency unit tests use an injected simulated EventStore, not a live database.

## 20–22. Quality gates

- Lint: PASS, zero warnings/errors.
- TypeScript: PASS.
- Production build: PASS (Next.js 16.3.6, webpack).
- Git diff whitespace check: PASS.

Browser QA passed: desktop homepage at 1440px; cart/checkout at 430px, 390px and 360px without horizontal overflow; two Margarita pizzas + one burger + two Classic Mint mojitos, pizza quantity reduction, a single ₹530 summary; burger serving change correctly updated subtotal to ₹545; cart persisted after reload; search/category/diet filters worked; reservation and catering forms generated complete intent-based links; unauthenticated staff page exposed no customer data. Dialog open/close animations remain intact. Browser console contained no errors at final inspection. No generated WhatsApp link was sent to the restaurant. QA-created cart selections were cleared.

## 23. Activation steps

Follow docs/whatsapp-automation.md for the full numbered checklist:

1. Create/select a Supabase test project; apply the supplied migration, run the SQL smoke test and verify anonymous access is denied.
2. Set server-only Supabase credentials and a random staff secret.
3. Configure the restaurant's Meta business app/WABA, register the intended number and obtain Phone Number ID and suitable production token/permissions.
4. Set all Meta placeholders, a supported API version, verify token and app secret.
5. When deployment is separately authorized, configure a public HTTPS webhook URL ending /api/whatsapp/webhook; verify it and subscribe messages for the correct account/phone.
6. Test with Meta's supported test number/recipient: direct order, draft continuation, duplicate webhook, wrong-phone draft, reservation and handoff; inspect persisted records and status notifications.
7. Approve/configure the two-variable utility status template if outside-window notifications are needed. Otherwise those messages remain held, never sent as free-form.
8. Set up operational queue retries/monitoring, edge rate limits, backups/retention and HTTPS staff access before enabling real traffic.

Outbound replies are at-least-once: a crash after Meta accepts a message but before recording progress can repeat a reply, not an order. Template-required messages remain held for staff. Unknown-price orders require human resolution. No live inventory, payment gateway, delivery promise or marketing automation was added.
