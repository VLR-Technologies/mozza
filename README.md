# Mozza Italia

Modern multi-location restaurant website built with Next.js App Router, React, TypeScript, Tailwind CSS and Lucide icons. The interface is organized around three immediate customer actions: pickup, reservations and catering.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

Validation commands:

```bash
npm run lint
npm run typecheck
npm run test:menu
npm run test:images
npm run test:orders
npm run test:website
npm run test:admin
npm run test:seo
SEO_ENV=preview npm run build
```

Node.js 20.9 or newer is required.

## Routes

- `/`: service-first hero, branch/menu search, real menu-derived food categories, popular dishes, promotion, locations, catering, brand story and reservation request.
- `/menu`: complete searchable menu with food/diet filters, category navigation, location selection, serving selection and WhatsApp order drafts.
- `/about`: Mozza Italia brand story without invented company history.
- `/gallery`: illustrative food gallery with filters and an accessible lightbox.
- `/contact`: branch discovery and table-request form.
- `/privacy`: describes the actual local form and external WhatsApp behavior.
- `/locations`: outlet directory linking to `/locations/hyderabad`,
  `/locations/shadnagar`, `/locations/jadcherla` and `/locations/guntur`.
- `/order`, `/reservation`, `/catering`: dedicated customer action pages.
- `/robots.txt`, `/sitemap.xml`: domain-aware SEO endpoints.

## Business data

- `src/config/restaurant.ts`: four verified outlet contacts and street addresses,
  optional hours/Maps listing URLs and existing WhatsApp URL builders.
- Confirmed city presence: Hyderabad, Shadnagar, Jadcherla and Guntur.
- The owner confirmed all four map-query street addresses and ownership/routing
  of `https://www.mozzaitalia.com` on 13 October 2026. Opening hours, coordinates,
  exact Maps listing URLs and official social profiles remain unconfirmed.
- Each outlet has its own verified phone/WhatsApp number. Existing branch
  selection, cart confirmation and order handoff behavior is preserved.
- Production requires `NEXT_PUBLIC_SITE_URL=https://www.mozzaitalia.com` at build
  and runtime. Non-Vercel deployments also require `SEO_ENV=production`; Vercel
  production is detected from `VERCEL_ENV`. Missing production configuration
  fails early. Local/private builds explicitly use `SEO_ENV=preview`; local and
  preview responses stay noindex even when the production URL is configured.
- See [SEO audit, implementation and activation guide](docs/seo-upgrade.md) for
  the route metadata table, tests, business confirmations and Search Console steps.

## Menu data

- `src/data/menu-data.ts`: 25 categories, 118 entries and 189 serving variants transcribed from the supplied menu PDF.
- `src/data/menu-images.ts`: category-aware image mapping.
- `public/menu/mozza-italia-menu.pdf`: unmodified source menu.

Four ambiguous source prices remain intentionally unset and display “Please confirm” rather than an inferred price. Their `manualVerification` notes must be preserved until the restaurant confirms the source data.

## Visual assets

The local food images are illustrative demo assets, not claims about the exact appearance of restaurant dishes. They are centralized in `src/data/food-visuals.ts` so approved real Mozza Italia photography can replace them without changing layouts. The official supplied logo is `public/brand/mozza-italia.png`.

## Ordering and privacy

The site supports a persistent multi-item cart and checkout, with a structured WhatsApp fallback when credentials are absent. Supabase stores website drafts and operational orders; official Meta Cloud API enables a deterministic ordering/reservation bot once configured. No online payments or marketing campaigns are implemented.

See [WhatsApp automation setup](docs/whatsapp-automation.md) for environment variables, Supabase migration, Meta onboarding and webhook verification, staff access, CLI simulation, security, limitations and production activation steps. The staff interface is `/admin/orders`.

Run `npm run simulate:whatsapp` for a local bot session without sending messages. Cloud API is not live merely because the restaurant phone number is configured.
