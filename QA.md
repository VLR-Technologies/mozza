# Validation record

Validated locally on 25 September 2026.

## Automated checks

- `npm run lint`: passed with no errors or warnings.
- `npm run typecheck`: passed.
- `npm run test:menu`: passed; 25 categories, 118 entries and 189 variants, including the four intentional manual-verification flags.
- `npm run test:images`: passed; all 25 category mappings and all 118 item mappings resolve to existing, diet-safe imagery.
- `npm run build`: passed with Next.js 16.3.6 using the documented `--webpack` build fallback. All public pages and SEO endpoints compiled successfully; `/menu` is request-rendered because it consumes search parameters.
- `git diff --check`: passed.

## Route checks

The homepage, menu, about, gallery, contact, privacy, robots, sitemap and original menu PDF all returned HTTP 200 from the local development server.

## Browser checks

- Homepage service selector: Pickup, Reserve and Catering states render correctly.
- Pickup: branch and query are carried to the menu route.
- Menu: initial query, food-type filters, diet filters, category navigation, no-results reset, selected branch, item details and serving selection remain connected.
- WhatsApp order URL includes the dish, serving and selected outlet. No message was sent.
- Reservation and catering interfaces clearly prepare requests rather than claiming live availability or confirmed bookings.
- Mobile navigation opens and closes correctly.
- Mobile item detail opens as a bottom sheet with selected-outlet context.
- Runtime review after the final image-loading update introduced no new browser warnings or errors.

## Responsive checks

Browser viewport validation completed at 375, 390, 430, 768, 1024, 1280 and 1440 px widths. The homepage and menu were visually reviewed across phone, tablet and desktop layouts. Automated document-width checks reported no horizontal page overflow at any requested width.

The category and food-card rails intentionally scroll horizontally on small screens with their native scrollbar hidden.
