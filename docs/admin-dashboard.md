# Mozza Italia staff dashboard

The final website persistence and Analytics update is documented in [admin-data-wiring-report.md](admin-data-wiring-report.md), including exact files, live QA, security checks, responsive evidence and remaining Meta setup.

Entry: /admin/orders. Public menu data, pricing, animations, and ordering flow are unchanged.

## Local login

Add ADMIN_TEST_USERNAME=test and ADMIN_TEST_PASSWORD=test to root .env.local and restart npm run dev. The existing ADMIN_ORDER_SECRET must contain at least 32 characters. This task did not modify .env.local.

Production ignores the test variables and requires ADMIN_USERNAME, ADMIN_PASSWORD (at least 16 characters; test credentials rejected), and ADMIN_ORDER_SECRET. Missing configuration fails closed. Signed HttpOnly, SameSite=Strict cookies expire after eight hours; production cookies are Secure. Credentials never enter localStorage. Changing configured credentials invalidates sessions; logout clears the browser cookie. Existing bearer API clients remain supported. The login throttle is process-local; a multi-instance production deployment should also use gateway rate limiting.

## Database

The user applied the NEW additive migration 202609260002_admin_dashboard.sql during this task. Do not rerun the original migration. New fields: archived_at on orders, drafts, reservations, enquiries and notifications; completed reservation status; an IST aggregate function and service-role-only customer history view. Existing RLS and table grants remain intact.

Tables used: orders, order_items (existing deletion cascade), order_drafts, reservations, staff_enquiries, whatsapp_outbox, customers. No marketing consent is changed.

## Sections and actions

- Overview: real aggregate counts, status bars, today's and Monday-to-date confirmed menu subtotals. Drafts, pending and cancelled orders are excluded from those subtotals. Completed-today uses updated_at. Archived orders remain in historical financial aggregates.
- Orders: active records, full details, valid next status transitions through the existing transactional API, confirmation before changes.
- Drafts: checkout, expiry, continuation reference, archive/restore, development-only confirmed deletion. Archive only hides a draft; its customer continuation link remains valid. Staff cannot accidentally complete a draft.
- Reservations: confirm/decline/cancel pending requests, complete/cancel confirmed reservations, archive/restore.
- Enquiries: new/contacted/resolved, request details/type, archive/restore, Call and WhatsApp links.
- Notifications: customer/order enrichment, type/status/attempts, queue retry, details, archive/restore. Retry queues work for the existing sender; it does not send immediately. Archived pending entries move to non-sendable template_required. Sending entries cannot be archived; restore does not automatically retry.
- Customers: name/phone search, counts, menu subtotal, recent order/reservation/enquiry history (latest 50 each), read-only marketing consent.
- History: completed/cancelled/archived orders and restore.
- Settings: restaurant, outlet, destination, database, Meta configuration and environment; no secrets.

Notification limitations: the unchanged sender does not persist last errors or scheduled retry times. These are explicitly unavailable rather than invented. Meta configuration is not a delivery health check.

All lists have server pagination (25/50/100), search, supported status/date filters and sorting. Orders/history also filter source/fulfilment and sort by subtotal. Date boundaries use Asia/Kolkata.

Normal removal is archive. Permanent order/draft deletion requires development mode, a previously archived record, and exact DELETE confirmation on the server. Foreign-key links can prevent deleting a consumed draft; archive it instead. Contact links do not automatically send messages.

## Routes and security

/api/admin/session: GET session status, POST login, DELETE logout.
/api/admin/dashboard: protected list/aggregate reads.
/api/admin/records: protected same-origin validated mutations and concurrency guards.
/api/admin/customers/[id]: protected bounded history.
Existing /api/admin/orders, /api/admin/orders/[id], /api/admin/notifications remain protected and accept either the original bearer secret or a signed staff session. The existing order-status endpoint may send notifications when Meta is active.

## QA

33 existing order tests passed. New npm run test:admin covers configured credentials, production fail-closed, session tampering/expiry, origin/auth protection, deletion guards, bounded queries, archive/date filters and sanitized errors.

Live Supabase testing verified website draft creation and subtotal 560, draft continuation through the existing processor with an order ID, all four fulfilment status changes, archive/history persistence, confirmed test-order deletion, reservation confirm/complete/archive, enquiry contacted/resolved/archive, notification read/archive, draft archive/delete, and paginated search/date queries. All nine dashboard section reads returned HTTP 200.

Live QA disabled sending and blocked Meta requests. Only newly created labelled QA records were modified. Archived reservation/enquiry/notification records and the QA customer remain with suffix 480755; the test order and unconfirmed deletion-test draft were deleted using the protected management route. Operational replies were suppressed during processor simulation.

Browser tests use isolated fixtures, never application hardcoded totals. Checked valid/invalid login, session reload, search, pagination, status confirmation, mobile navigation, and responsive cards/detail drawers at 1440, 1280, 1024, 768, 430 and 390px. No horizontal page overflow at those widths.

No original migration rerun, production changes, commit, push or deployment.

Final verification: lint PASS; TypeScript PASS; production build PASS; 13/13 admin tests and 33/33 existing order tests PASS. Mobile detail action-menu placement was fixed and rechecked. Typed DELETE remains disabled until the exact confirmation is entered. Sign-out remained effective after page reload.
