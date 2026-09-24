# Mozza Italia — Shadnagar

Local-only client demonstration. Next.js App Router, React, TypeScript, Tailwind CSS, Motion and Lucide. No Git repository, remote, payment flow, backend or deployment was created.

## Run

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:3000 (localhost:3000 also works on this machine).

```powershell
npm run lint
npm run typecheck
node scripts/verify-menu.mjs
npm run test:images
npm run build
npm start
```

Node.js 20.9 or newer is required. Stop the development server before `npm start` if using the same port.

## Routes

- `/`: hero, marquee, signature dishes, four-chapter food story, category menu preview, drinks/dessert scenes, brand story, review summary, reservation request, visit and footer.
- `/menu`: complete searchable menu with static food photography, food/diet filters, sticky categories, size selection and WhatsApp draft links.
- `/about`: brand-focused story without invented business history.
- `/gallery`: food gallery, category filtering, keyboard/touch lightbox.
- `/contact`: visit details, call/WhatsApp and reservation request.
- `/privacy`: describes the actual local form and external WhatsApp behavior.
- `/robots.txt`, `/sitemap.xml`: domain-aware SEO endpoints.

## Edit content

- `src/config/restaurant.ts`: confirmed Shadnagar number, optional address, hours, external URLs, rating and production origin.
- `src/data/menu-data.ts`: 25 category groups, 118 entries, 189 variants, source pages and verification notes. Duplicate Chicken Pop Corn listings and topping rows retain the PDF's category context.
- `src/data/food-visuals.ts`: central image paths.
- `src/data/menu-images.ts`: category and item photography mappings plus featured menu selections.
- `src/data/gallery-data.ts`: gallery captions and groupings; add real outlet imagery under the existing `Restaurant` category type.
- `src/app/globals.css`: palette, typography, layouts, media queries and reduced-motion rules.
- `src/components/ui`: shared motion, diet markers and native accessible dialog.

## Menu verification required

1. Boneless Tenders: 170 is visible in source but its size mapping is incomplete. Both 6- and 10-piece prices are intentionally null.
2. Chicken Pop Corn, 12 pieces: page 2 lists 170 and page 3 lists 175. Both source listings keep this price null; 20 pieces remains 250.
3. Mayonnaise / Southwest Sauce: 10 and 20 are printed without sufficiently clear mapping; price stays null.

These records carry `manualVerification` TODOs. The UI says “Please confirm.” Soft Drinks & Water Bottles use MRP rather than an invented numeric price. Preserve client spellings including Valcano, Avacado, Alphanso and Basmathi. Dietary markers are omitted where ingredients/classification need confirmation. Restaurant confirmation is needed for allergens and egg-free desserts/drinks.

## Business information pending

Exact street address, hours, verified Maps link, Instagram link, ordering-platform URLs, review/read/write links, review count, tax treatment and production domain. Rating 4.4 was supplied in the brief, not independently verified. Null links are not invented. Directions use a WhatsApp request for location; review controls remain disabled until URLs are configured.

Set `NEXT_PUBLIC_SITE_URL` to a confirmed absolute production URL when deployment is separately authorized. Without a domain, robots disallows indexing and the sitemap is empty. JSON-LD omits unverified hours, coordinates, price range and ratings.

## Visual assets

18 original generated food images are illustrative demo assets. They do not claim to depict the actual restaurant or its food. The gallery and footer disclose this. No fabricated interior images are used.

- `public/food/hero/hero-pizza.webp`
- `public/food/pizza/chicken-pizza.webp`
- `public/food/chicken/broasted-chicken.webp`
- `public/food/chicken/grilled-chicken.webp`
- `public/food/burger/zinger-burger.webp`
- `public/food/burger/burger-layers.webp`
- `public/food/rice/chicken-ghee-pulav.webp`
- `public/food/rice/veg-ghee-pulav.webp`
- `public/food/rice/chittimutyalu-chicken.webp`
- `public/food/snacks/loaded-fries.webp`
- `public/food/snacks/garlic-bread.webp`
- `public/food/drinks/mojito-milkshake.webp`
- `public/food/desserts/brownie.webp`
- `public/food/desserts/ice-cream.webp`
- `public/food/menu/veg-snacks.jpg`
- `public/food/menu/veg-burger.jpg`
- `public/food/menu/mediterranean-salad.jpg`
- `public/food/menu/dips.jpg`

Replace these with approved real food photography. Keep approximately square crops and centrally composed subjects. Menu imagery is resolved in one place, so approved replacements can be swapped without layout changes. The homepage burger story still uses six CSS masks matched to its separate layered asset; set `visualSettings.burgerLayered` to `false` when replacing that homepage asset with an ordinary client burger photograph.

Official supplied logo: `public/brand/mozza-italia.png`. Unmodified supplied PDF: `public/menu/mozza-italia-menu.pdf`. Barlow Condensed and Manrope fonts are local, with OFL licenses under `public/fonts`.

## Ordering and privacy

The app only prepares external WhatsApp messages and telephone links. It never submits an order, processes payment or confirms a reservation. Reservation data is not sent to a server or stored in browser storage. No analytics were installed. Native dialogs provide focus containment, Escape close and focus restoration. Motion is reduced for `prefers-reduced-motion` and mouse depth is limited to mouse pointers.
