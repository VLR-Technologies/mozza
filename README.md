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
npm run build
```

Node.js 20.9 or newer is required.

## Routes

- `/`: service-first hero, branch/menu search, real menu-derived food categories, popular dishes, promotion, locations, catering, brand story and reservation request.
- `/menu`: complete searchable menu with food/diet filters, category navigation, location selection, serving selection and WhatsApp order drafts.
- `/about`: Mozza Italia brand story without invented company history.
- `/gallery`: illustrative food gallery with filters and an accessible lightbox.
- `/contact`: branch discovery and table-request form.
- `/privacy`: describes the actual local form and external WhatsApp behavior.
- `/robots.txt`, `/sitemap.xml`: domain-aware SEO endpoints.

## Business data

- `src/config/restaurant.ts`: verified Shadnagar contact, branch list, optional addresses/hours/maps, production origin and WhatsApp URL builders.
- Confirmed city presence: Hyderabad, Shadnagar, Jadcherla and Guntur.
- Exact street addresses, hours and Maps links are not currently present. The UI omits those values and offers a WhatsApp outlet-details request instead of inventing them.
- The only verified phone/WhatsApp number in the project is the Shadnagar contact. Requests for another selected outlet include that outlet name so the team can confirm the correct branch.
- Set `NEXT_PUBLIC_SITE_URL` to a confirmed production URL when deployment is authorized. Without it, robots disallows indexing and the sitemap remains empty.

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
