# WhatsApp ordering: implementation and activation

This branch implements the cart, Supabase storage, official Meta Cloud API webhook, deterministic bot and protected staff view. It does not deploy, configure Meta, migrate a remote database or send messages during local tests. No LLM, payment gateway, unofficial WhatsApp library, new package or marketing campaign is used.

## Configuration levels

| Configuration | Behaviour |
| --- | --- |
| No credentials | Website cart, serving/quantity edits, checkout, single structured click-to-chat summary, reservation/catering links and CLI bot simulator. No backend order is claimed. |
| Supabase only | Website drafts are saved and visible to staff. WhatsApp receives the full summary for manual handling. A draft is not a final order. |
| Supabase + complete Meta setup | Website sends a short draft reference. Signed webhook loads the matching phone-bound draft. Customer confirms in WhatsApp; an order and price snapshots are saved atomically. Direct ordering, reservations, catering enquiries and handoff operate through the bot. |

Contact details are centralized in `src/config/restaurant.ts`. Shadnagar (+91 99497 99488) is the only enabled ordering outlet. Other outlets remain browsable but cannot be added to an order. `restaurant.features.delivery` and `tableNumber` default to false. Enable delivery only after restaurant confirmation. The server `WHATSAPP_PHONE_NUMBER` override must match the public destination and registered Cloud API number in production.

## Website flow

Choose serving and quantity (1–20) → Add to order → add more dishes → navbar count/mobile View order → edit cart → Checkout → pickup/dine-in → name/mobile → review → prepare link → open WhatsApp and tap Send.

The explicit Open WhatsApp link avoids popup blocking after asynchronous draft creation. Nothing is auto-sent by the website. Storage key `mozza-order-cart-v1` saves only item IDs, serving indexes, quantities and branch, never customer details. Invalid/stale carts reset safely. Unknown/MRP/manual-verification prices produce a null subtotal and “Price confirmation required.” No guessed prices or fees. Limit: 20 different servings. Server calculations ignore submitted prices and use unchanged `src/data/menu-data.ts`.

`POST /api/orders` accepts same-origin JSON and an `Idempotency-Key` UUID. It saves a 24-hour draft only. With full Meta configuration, it returns a 128-bit random MI-DRAFT reference. Resolution requires the WhatsApp sender to match the mobile entered at checkout. No public endpoint reads customer orders/drafts. Repeated keys return the same unexpired draft; changed payloads return 409. Draft creation is limited to 10 per phone per hour in database mode. Add host-level IP rate limits before activation: Origin checks prevent CSRF, not scripted abuse.

Without working storage, checkout falls back honestly to click-to-chat. A timeout after a successful draft write may leave an unused draft, not a final order. Without Meta configuration, saved drafts still use a full summary for staff. Use the same WhatsApp phone as entered at checkout.

## Supabase activation steps

1. Create/select a dedicated Supabase test project, separate from production.
2. Run `supabase/migrations/202609260001_whatsapp_orders.sql` once in SQL Editor, or use your normal migration workflow. It creates customers, order_drafts, orders, order_items, conversation_sessions, reservations, staff_enquiries, processed_messages and whatsapp_outbox.
3. The migration enables RLS and revokes table/RPC access from anon/authenticated/PUBLIC. Only the server service role receives grants. Keep the Data API enabled. Do not add public customer-data policies.
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` locally and the hosting secret store later. `SUPABASE_ANON_KEY` is reserved and unused.
5. Generate a random `ADMIN_ORDER_SECRET` of at least 32 characters. Share only with authorized staff. Use `/admin/orders` over HTTPS in production. The secret lives only in React memory and the Authorization header, and is cleared on reload/sign out.
6. Run `supabase/tests/ordering.sql` in the test project after migration. It rolls back its fixtures. Verify unauthenticated Data API access to every operational table and RPC is denied.
7. Configure backups, staff access and retention/deletion procedures. Draft expiry blocks continuation but does not delete records. Review retention with the restaurant before launch.

One `apply_whatsapp_event` transaction commits inbound message deduplication, optimistic session state, order/reservation/enquiry, consumed draft and reply outbox under a per-customer advisory lock. Order-item price snapshots preserve history. Marketing consent defaults to false and is never enabled. Order IDs use `MI-YYYYMMDD-<12 random hex>` in IST; reservations use MR. Unique constraints protect against collisions.

## Meta activation steps

1. Establish the restaurant's WhatsApp Business Platform access in Meta Business. Create/select its developer business app and configure WhatsApp. Having the current number does not establish Cloud API registration.
2. Register/verify the intended business phone through supported Meta onboarding. Confirm migration or supported coexistence for its existing WhatsApp setup. Record Phone Number ID and WhatsApp Business Account ID.
3. Obtain a suitable production server access token scoped to the restaurant's assets. Sending requires `whatsapp_business_messaging`; onboarding/management may require `whatsapp_business_management`. Use a managed token lifecycle, not an expiring dashboard test token.
4. Set `WHATSAPP_PHONE_NUMBER`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` and `WHATSAPP_API_VERSION`. Select a currently supported Graph API version shown in the app, including the leading v. No version is guessed. Business Account ID is used during subscription/onboarding; sending uses Phone Number ID.
5. After deployment is separately authorized, provide `https://YOUR-DOMAIN/api/whatsapp/webhook` as the public HTTPS callback. Configure the same verify token in Meta and the server. GET validates `hub.mode=subscribe` and `hub.verify_token` and returns `hub.challenge`.
6. Subscribe the app/WABA to `messages` for the intended account/phone. POST authenticates the raw body using `X-Hub-Signature-256` and the app secret, filters Phone Number ID and ignores status receipts as customer input. Complete Meta's required app/business permission, review and production steps for this use case.
7. Start with a supported Meta test number/recipient. Complete direct order, draft continuation, reservation and handoff flows. Test wrong-phone drafts and webhook replay. Inspect the saved pending orders in staff view. Use the real number only after approved setup.
8. For status messages outside the service window, approve a utility template in Meta and set `WHATSAPP_STATUS_TEMPLATE_NAME` / `WHATSAPP_STATUS_TEMPLATE_LANGUAGE`. It must accept two body variables in order: order reference and status. Without a matching approved template, these notifications are held as `template_required`.

Follow the current Meta dashboard's version support and eligibility. Some live Meta documentation endpoints returned rate limits during implementation; verify the selected version and template before activation. References: [Meta Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/), [Meta interactive payload examples](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/interactive/), [Supabase Data API](https://supabase.com/docs/guides/api), [Supabase functions](https://supabase.com/docs/guides/database/functions), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). The archived Meta SDK is referenced for wire-format examples only; it is not installed.

## Bot states and supported messages

- WELCOME
- ORDER_CATEGORY, ORDER_ITEM, ORDER_VARIANT, ORDER_QUANTITY
- ORDER_CART, ORDER_EDIT, ORDER_EDIT_QUANTITY
- ORDER_FULFILMENT, ORDER_CUSTOMER, ORDER_ADDRESS, ORDER_LANDMARK, ORDER_REVIEW, ORDER_CREATED
- RESERVATION_DATE, RESERVATION_TIME, RESERVATION_GUESTS, RESERVATION_NAME, RESERVATION_NOTES, RESERVATION_CONFIRM
- CATERING_NAME, CATERING_DATE, CATERING_GUESTS, CATERING_TYPE, CATERING_NOTES
- HUMAN_HANDOFF

Category/item lists paginate with eight content rows plus up to two navigation rows. Buttons never exceed three. Text, reply buttons, interactive lists and configured utility templates use official Cloud API request shapes. Pickup customers type only a name; phone identity comes from the signed webhook. STAFF pauses automation; RESET explicitly resumes it. Staff must use their configured business inbox or phone for conversation; the admin page is not a live-chat inbox. Cancel/RESET clears the active request, not previously submitted orders.

Reservations collect date (YYYY-MM-DD or 26 Sep), time (IST), guests, name, notes, review and confirmation. Saved requests remain pending; the bot never promises a confirmed table. Existing website reservation/catering forms retain their UI and full details, which the bot hands to staff instead of asking for re-entry. Direct catering collects a short enquiry and hands off. Location questions also hand off. Unknown states recover to welcome.

## Staff routes and notifications

- `GET /api/admin/orders`: secret-protected latest 100 orders, latest 50 reservations/enquiries/drafts and notification entries. The page has no server-rendered customer data.
- `PATCH /api/admin/orders/[id]`: pending → confirmed → preparing → ready → completed; cancellation allowed from active states. Unknown-price requests cannot be confirmed in this initial interface; staff must resolve them with the customer. No price override is exposed.
- `POST /api/admin/notifications`: secret-protected, same-origin retry of pending notifications. There is no public arbitrary send endpoint.

Status updates and notification entries commit together. Use Retry pending notifications in staff view. For unattended operation, schedule a trusted server worker to drain the outbox using the same server utility. Monitor pending/template-required entries; enabling a template does not silently replay old bot prompts.

`last_customer_message_at` comes from the signed inbound event timestamp. Free-form/interactive sends require a window under 24 hours; this is not a pricing claim. Outside it, status sends use only the configured approved template. API failure leaves persisted replies for retry. Duplicate inbound events cannot repeat business effects. Outbound delivery is at-least-once: a crash after Meta accepts a reply but before progress is recorded may repeat that reply, not the order. A production worker should retry independently of Meta's finite webhook retries.

## Environment reference

See `.env.example` for every variable and placeholder. `NEXT_PUBLIC_SITE_URL` is the only public environment setting. Never prefix access tokens, app secrets, database service keys or the staff secret with NEXT_PUBLIC_. Cloud readiness requires the database, Phone Number ID, access token, supported-format API version, app secret and verify token. Configuration presence does not prove the remote account is registered or reachable.

## Local testing

No new dependencies are needed. The existing TypeScript package transpiles modules only in test/simulation scripts.

```bash
npm run simulate:whatsapp
npm run test:orders
npm run test:menu
npm run test:images
npm run lint
npm run typecheck
npm run build
```

The simulator is CLI-only, refuses NODE_ENV=production and makes no external calls. Type the printed reply IDs: Hi → order → category:veg-pizza → item:margarita → variant:0 → 2 → checkout → pickup → name → confirm. It prints simulated effects without claiming DB persistence. Fixtures use fictitious customer details.

Tests cover prices, uncertain values, normalization, cart persistence, input validation, message formatting, IDs, state transitions, pagination, selection, cart edits, checkout, reservations, catering, handoff, service-window limits, signatures, concurrent duplicates, delivery failure after commit, invalid drafts, API fallback and admin denial. EventStore-backed tests simulate persistence; live SQL/Meta tests require credentials. Browser QA inspects links without sending orders to the restaurant.

## Before production

Configure HTTPS, real Meta registration/permissions/subscription, the Supabase migration, edge rate limits, queue worker/monitoring, retention/backups, approved templates if needed and real integration smoke tests. Replace the shared staff secret with individual accounts/roles when expanding access. No live inventory, delivery service, tax calculation, online payment or marketing consent is invented. Logging includes event names/statuses rather than secrets or customer conversations.
