# Validation record

- `npm run lint`: passed, no errors or warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed; all six public pages and the SEO endpoints prerendered successfully.
- `node scripts/verify-menu.mjs`: passed; 25 categories, 118 entries and 189 variants, unique IDs, intentional null prices and source-page checks.
- HTTP checks: homepage, menu, about, gallery, contact, privacy, robots, sitemap and original PDF all returned 200.
- Browser: search, no-results state, vegetarian filter, burger size selection, correct WhatsApp draft, modal Escape/focus restoration, gallery category filter, arrow-key lightbox navigation, reservation draft creation and invalidation on edits tested.
- No order, booking or message was sent during testing.
- Runtime browser logs: no errors in tested flows.
- Visual review performed at the available browser sizes (approximately 639 px and 1006 px), including hero, signature dishes, food story, menu controls, gallery, reservation and about page. No broken loaded images found.
- Exact requested 1920, 1440, 1280, 1024, 768, 430, 390 and 360 px viewport checks are pending: automatic approval review rejected temporary browser resizing. Approval was requested in the task. These sizes must not be described as tested until that check is completed.
- Reduced-motion CSS and pointer gating implemented; device-specific performance and reduced-motion emulation remain to be measured.
- No Git repository, commit, push, remote repository or deployment created.
