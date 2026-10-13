# Mozza Italia SEO upgrade

## Initial audit — before implementation

Audit date: 13 October 2026. Repository remote matches `VLR-Technologies/mozza`.
The initial checkout was clean and on `main`, with no SEO feature branch present
locally or in the cached remote refs. Work is isolated on
`codex/technical-local-seo`; nothing is pushed or deployed.

Strengths:

- Public App Router pages already export server-side metadata; the menu renders
  its categories, dishes and prices on the server before hydration.
- Header and footer contain real Next.js links. Public pages have one primary
  H1, sections generally use H2/H3, and the shell has header, main, footer and a
  skip link. Mobile navigation has expanded/current state and Escape handling.
- Local images use `next/image`, sizes and lazy loading where appropriate.
  Informative food image alternatives generally identify illustrations;
  decorative hero images correctly use empty alternatives.
- Four city presences and four phone/WhatsApp contacts are marked verified in
  `src/config/restaurant.ts`. Existing maps and directions share one map query.
- Admin APIs authenticate requests on the server, return private/no-store
  responses, and the staff page already has noindex metadata.
- Sitemap entries have no fabricated modification dates. Robots excludes API
  and admin paths; no secrets are needed for SEO.

Defects and precise planned fixes:

| Finding | Fix |
| --- | --- |
| No public route has a canonical link; homepage relies on inherited metadata | Add explicit, unique per-page absolute canonicals, including `/`; menu/order query variants point to their own unfiltered route |
| URL is an unchecked environment string | Validate a confirmed public HTTPS origin and normalize its trailing slash; never select a hardcoded domain |
| Missing production URL silently blocks robots and empties sitemap | Fail production configuration early; require an explicit preview mode for local production-style builds; detect Vercel deployment environment |
| Configured production URL enables preview/local robots | Separate indexing policy from canonical origin; preview/development always receive noindex and blocked robots, even with production variables copied in |
| OG has no page URL or asset; no Twitter card; privacy has no description | Add complete per-page OG/Twitter metadata with the supplied brand logo and unique human-readable descriptions |
| One Restaurant schema is emitted on every page, combines Shadnagar telephone with four cities, and has no stable ID | Move brand Organization and WebSite identities to the homepage; give each outlet its own stable Restaurant entity on its outlet page |
| `/locations` is the only outlet destination; footer links only to anchors | Add four statically generated outlet pages with verified contacts, specific map-query context, directions and existing order actions; link from directory/footer/contact/reservations |
| No hierarchical breadcrumbs | Add visible and structured Home → Locations → Outlet breadcrumbs |
| Street addresses are displayed from map queries, while address fields explicitly remain unconfirmed | Preserve existing map destinations, label map-search context on new pages, and omit unconfirmed street addresses/postcodes/coordinates/maps from schema |
| Only the staff page has indexing controls | Add an admin layout policy and private-route response headers; retain actual server-side API authentication |
| Contact cards skip directly from H1 to H3 | Introduce an accessible H2 for the contact options without changing layout |
| No SEO regression coverage | Test configuration, all route metadata, canonical variants, sitemap/robots, schema safety/accuracy and actual server-rendered outlet output |

Domain verification: the web reader could not access `https://www.mozzaitalia.com`;
the sandbox curl check could not resolve it. These observations do not prove
that the domain is unowned or globally unavailable. Ownership and routing remain
unverified, and the requested domain must not be selected as a production default.
No DNS or hosting settings will be changed.

The landing animation, cart, ordering, forms, database, authentication and webhook
implementations are outside the SEO change. The upgrade adds no dependencies,
tracking, remote image fetches or extra landing-page client JavaScript.

## Confirmation and implemented behavior

During this task, the owner explicitly confirmed ownership/routing of
`https://www.mozzaitalia.com` and all four street addresses already in the map
queries. Subsequent unrestricted read-only HTTP checks independently found:

- `https://www.mozzaitalia.com` returns HTTP 200 from Vercel, with the Mozza Italia
  title, brand assets and location content.
- `http://mozzaitalia.com` returns 308 to `https://mozzaitalia.com/`, then 308 to
  `https://www.mozzaitalia.com/`, then HTTP 200.

The initial verification limitation was sandbox networking. The deployment origin
is now confirmed; there is still no hardcoded fallback overriding
`NEXT_PUBLIC_SITE_URL`. No DNS, hosting or external application settings changed.

Every public page has a unique absolute canonical, description, Open Graph URL,
title and Twitter summary card. The existing supplied 1600 × 649 brand logo is
used for social metadata with `Mozza Italia logo` alternative text. Root metadata
sets metadataBase, brand naming, icons and an environment-based robots policy,
without a canonical that children could accidentally inherit. The homepage
canonical is `https://www.mozzaitalia.com`, matching Next.js serialization.

Homepage schema contains one Organization (`/#organization`) and one WebSite
(`/#website`), linked by publisher. Each outlet page defines exactly one Restaurant
with an ID ending `/locations/<slug>#restaurant`, parent organization reference,
verified telephone, PostalAddress and menu URL. The Hyderabad outlet is displayed
under its existing Hyderabad name, with the confirmed physical locality
Shamshabad and street/locality description Thukkuguda. No ratings, reviews,
coordinates, hours, social profiles, invented company history or dish photographs
are asserted. The new pages visibly display Home → Locations → Outlet breadcrumbs
and emit matching BreadcrumbList data. JSON-LD escapes script delimiters and line
separator characters and safely round-trips through JSON.parse.

All four outlet pages are statically generated and return useful initial HTML:
distinct locality/landmark guidance, full street address, direct outlet telephone
and WhatsApp links, existing directions/map, branch-qualified menu/order actions,
table/catering enquiry links, and links to other outlets. Unknown slugs return 404.
Existing `/locations#location-...` anchors still work; the footer and directory now
also link directly to outlet pages. Contact/reservation cross-links are updated.

The 14-entry production sitemap contains canonical public pages only, with no
made-up lastmod/changefreq/priority values, query variants, APIs or staff pages.
Production robots advertises the production sitemap and excludes admin/API
crawling. Admin layout metadata and response headers apply noindex/nofollow;
existing session checks continue to protect sensitive data on every admin API.
The unauthenticated staff login shell is intentionally accessible. Robots is
never a security boundary.

No customer flow implementation changed. The only existing on-page hierarchy
repair adds a visually hidden H2 over the contact action cards. Existing
decorative image alternatives, informative illustrative food alternatives,
responsive classes, image optimization and landing animation remain intact.

## Production environment requirements

Set these values at **build time and runtime**, and rebuild after changing them:

```dotenv
NEXT_PUBLIC_SITE_URL=https://www.mozzaitalia.com
SEO_ENV=production
# Optional: the content value from Search Console's HTML verification tag.
GOOGLE_SITE_VERIFICATION=
```

- The URL must be an HTTPS origin with no path, query, fragment, credentials or
  nondefault port. Its trailing slash is normalized. Local/IP addresses and known
  hosting preview origins are rejected. A deliberately changed, owner-confirmed
  public origin is respected; this code does not silently force www or modify DNS.
- Vercel production selects production mode automatically. A conflicting
  `SEO_ENV=preview`/`development` stops the build. Remove the sample preview setting
  or explicitly set production in the production environment.
- Vercel preview/development always stays private, even if production SEO_ENV and
  URL variables are inherited. Non-Vercel production must explicitly declare
  production; non-Vercel previews must explicitly declare preview.
- With NODE_ENV=production and no deployment mode, the build fails with instructions
  to choose production or preview. With production mode and no URL, it fails before
  compilation. Private/local production-style builds use `SEO_ENV=preview npm run
  build`, with the URL optional. `npm run dev` is private by default.
- Private mode returns a blocked robots.txt, empty sitemap, noindex/nofollow HTML
  metadata and an X-Robots-Tag response header. When no canonical origin is
  configured, canonical/social URL and schema fields are omitted, avoiding
  localhost URLs. A configured production origin can be used by private previews
  for canonical metadata without enabling their indexing.
- SEO variables do not replace existing database, staff authentication, WhatsApp
  or webhook environment requirements. No credentials were read or changed.
- An explicit private mode is a declaration by the deployment operator. Outside
  Vercel, the app cannot infer that an incorrectly labelled preview is really a
  production deployment. Set production mode in the release pipeline.

## Search Console and structured-data checks after an authorized deployment

1. In [Google Search Console](https://search.google.com/search-console), add the
   `mozzaitalia.com` Domain property and follow Google's DNS verification
   instructions through the owner, or create the URL-prefix property
   `https://www.mozzaitalia.com/`. For HTML-tag verification, place only the tag's
   content value in `GOOGLE_SITE_VERIFICATION`, rebuild/deploy, then verify. Keep
   the verification token in place. See [Google's ownership verification guide](https://support.google.com/webmasters/answer/9008080).
2. Open the deployed robots.txt and sitemap.xml. Confirm robots allows public
   crawling, advertises `https://www.mozzaitalia.com/sitemap.xml`, and the sitemap
   contains the 14 canonical entries below. Submit `sitemap.xml` in the Sitemaps
   report and monitor processing/indexing. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
3. In [URL Inspection](https://support.google.com/webmasters/answer/9012289), inspect
   the homepage, menu, locations directory and all four outlet URLs. Run Test Live
   URL, inspect returned HTML and confirm crawling/indexing is allowed. After Google
   processes the pages, compare the user-declared and Google-selected canonicals.
   Request indexing for the homepage and new outlet pages if appropriate. Google
   ultimately selects canonicals and whether to index a page.
4. Use the [Rich Results Test](https://search.google.com/test/rich-results) on all
   four outlet pages. Review Restaurant and Breadcrumb data against the visible
   name/address/phone and fix any required-property errors. Optional-property
   warnings are not permission to invent ratings, images or hours. Use
   [Schema.org Validator](https://validator.schema.org/) for the homepage WebSite
   and Organization graph too. WebSite site-name data is not fully represented by
   the Rich Results Test; see [Google's site-name guide](https://developers.google.com/search/docs/appearance/site-names).
5. Monitor Search Console indexing/enhancement reports and Google Business
   Profiles. Once owner-managed profiles are verified, set each outlet's website
   URL to its own canonical outlet page and keep name/address/phone consistent.
   Have the owner supply accurate hours and exact profile/Maps URLs first.

[Organic sitelinks are selected automatically by Google](https://developers.google.com/search/docs/appearance/sitelinks).
Unique titles, accessible navigation and relevant internal links improve the
site structure Google uses; they do not guarantee sitelinks or rankings. The
[sitelinks search box was retired](https://developers.google.com/search/blog/2024/10/sitelinks-search-box);
no obsolete SearchAction claim was added.

## Remaining business details and operational limits

- Confirm per-outlet regular/special opening hours, holidays and time zone for any
  future openingHoursSpecification.
- Supply exact owner-managed Google Maps/Business Profile listing URLs and any
  verified coordinates. Current directions are existing address-based Maps
  searches, not an assertion of a particular listing ID.
- Confirm official social accounts before adding sameAs, and supply real outlet
  photography with usage approval if desired. Current food assets remain
  illustrations, including gallery imagery.
- Four menu price verification flags remain unchanged. Current availability,
  fulfilment options and booking acceptance are confirmed by restaurant staff.
- Live Search Console verification/submission, Rich Results Test, URL Inspection,
  field Core Web Vitals and Google indexing/sitelinks have **not** been performed
  for this un-deployed change. Deployment is a separate owner-authorized action.
- Existing first-visit landing animation may affect mobile performance. No new
  client-side landing work or animation change was introduced. Browser checks are
  layout/accessibility checks, not a Lighthouse or field performance benchmark.
- Existing Next.js warning about an ignored package-lock.json outside the Git
  repository is nonfatal and unrelated to this change; tracing root is unchanged.

## Implemented route and metadata table

Every path below is indexable and included in the production sitemap. Its canonical is the confirmed origin plus the path (the homepage uses the origin alone). Menu/order query variants canonicalize to `/menu`/`/order`, respectively. The existing `/admin/orders` route remains noindex and is excluded from the sitemap.

| Path | Full title | Description | Schema |
| --- | --- | --- | --- |
| `/` | Mozza Italia \| Pizza, Chicken, Burgers & Ghee Pulav | Explore Mozza Italia in Hyderabad, Shadnagar, Jadcherla and Guntur. Browse pizza, crispy chicken, burgers, ghee pulav, drinks and desserts. | Organization + WebSite |
| `/menu` | Menu \| Mozza Italia | Browse the Mozza Italia menu with serving sizes and prices in rupees. Explore pizza, chicken, burgers, ghee pulav, snacks, drinks and desserts. | — |
| `/order` | Order Online \| Mozza Italia | Build your Mozza Italia order for pickup, dine-in or delivery. Choose dishes and an outlet, then let the restaurant confirm availability on WhatsApp. | — |
| `/locations` | Locations \| Mozza Italia | Find Mozza Italia outlets in Hyderabad, Shadnagar, Jadcherla and Guntur. View street addresses, phone numbers, directions and ways to order. | — |
| `/catering` | Catering & Events \| Mozza Italia | Plan food for birthdays, weddings, office events and bulk orders with Mozza Italia. Send a catering enquiry to your preferred outlet for availability. | — |
| `/reservation` | Reserve a Table \| Mozza Italia | Request a table at Mozza Italia in Hyderabad, Shadnagar, Jadcherla or Guntur. Share your date, time and guest count; staff confirm availability. | — |
| `/about` | Our Story \| Mozza Italia | Get to know Mozza Italia and its menu of pizza, crispy chicken, burgers and ghee pulav, with familiar favourites made for sharing. | — |
| `/gallery` | Food Gallery \| Mozza Italia | Explore illustrative pizza, chicken, burgers, ghee pulav, drinks and desserts in the Mozza Italia food gallery, then find your favourites on the menu. | — |
| `/contact` | Contact \| Mozza Italia | Call or WhatsApp Mozza Italia, find the right outlet, or ask about an order, table reservation, catering event or franchise enquiry. | — |
| `/privacy` | Privacy \| Mozza Italia | Read how Mozza Italia handles cart storage, order details, table requests and catering enquiries, including WhatsApp and restaurant service providers. | — |
| `/locations/hyderabad` | Hyderabad Outlet \| Mozza Italia | Visit Mozza Italia in Thukkuguda, Shamshabad, Hyderabad. Get directions, call +91 87123 57688, or start an order with the Hyderabad team. | Restaurant + BreadcrumbList |
| `/locations/shadnagar` | Shadnagar Outlet \| Mozza Italia | Visit Mozza Italia in Padmavati Colony, Shadnagar. Get directions, call +91 99497 99488, or start an order with the Shadnagar team. | Restaurant + BreadcrumbList |
| `/locations/jadcherla` | Jadcherla Outlet \| Mozza Italia | Visit Mozza Italia in Vijayanagar Colony, Jadcherla. Get directions, call +91 99510 47424, or start an order with the Jadcherla team. | Restaurant + BreadcrumbList |
| `/locations/guntur` | Guntur Outlet \| Mozza Italia | Visit Mozza Italia in Brodipet, Guntur. Get directions, call +91 92467 69769, or start an order with the Guntur team. | Restaurant + BreadcrumbList |

## Exact changed-file inventory

31 files. The build-generated next-env.d.ts change was restored; no dependency/lockfile, API handler, authentication implementation, database migration, webhook, cart or animation source changed.

- `.env.example`
- `README.md`
- `docs/seo-upgrade.md`
- `next.config.ts`
- `package.json`
- `scripts/seo-live-tests.mjs`
- `scripts/seo-tests.mjs`
- `src/app/about/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/catering/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/gallery/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/locations/[slug]/page.tsx`
- `src/app/locations/page.tsx`
- `src/app/menu/page.tsx`
- `src/app/order/page.tsx`
- `src/app/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/reservation/page.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/layout/Footer.tsx`
- `src/components/locations/LocationsDirectory.tsx`
- `src/components/seo/Breadcrumbs.tsx`
- `src/components/seo/JsonLd.tsx`
- `src/config/restaurant.ts`
- `src/config/seo.ts`
- `src/lib/seo.ts`
- `src/lib/structured-data.ts`

## Final validation results

| Command/check | Result |
| --- | --- |
| npm run typecheck | PASS, exit 0 |
| npm run lint | PASS, exit 0 |
| npm run test:orders | PASS, 33 tests |
| npm run test:website | PASS, 12 tests |
| npm run test:admin | PASS, 13 tests |
| npm run test:menu | PASS, 25 categories / 118 entries / 189 variants; four existing price flags retained |
| npm run test:images | PASS, all 25 category and 118 item mappings and image assets |
| npm run test:seo | PASS, 10 tests |
| node --test scripts/branch-tests.mjs | PASS, 24 tests; outlet/cart/WhatsApp/form routing |
| SEO_ENV=production NEXT_PUBLIC_SITE_URL=https://www.mozzaitalia.com npm run build | PASS, all four outlet pages statically generated |
| SEO_ENV=production NEXT_PUBLIC_SITE_URL= npm run build | Expected fail-fast PASS: exit 1 with explicit missing production URL error |
| SEO_ENV=preview NEXT_PUBLIC_SITE_URL= npm run build | PASS, private local build without a URL |
| npm run test:seo:live against final production build | PASS, 5 integration tests; all 14 public routes, menu/order variants, outlet content/schema, private API authentication, sitemap/robots |
| npm run test:seo:live against preview build without URL | PASS, 5 integration tests; private metadata/headers, blocked robots, empty sitemap, no invented canonical/schema origin |
| Browser layout check | PASS, Jadcherla outlet at 1440 × 1000 and 390 × 844; no horizontal overflow; mobile navigation opens and reaches Locations |
| git diff --check | PASS |

The first sandbox server/test attempts were blocked by local networking permissions;
reruns with authorized local network access succeeded. The first production HTML
assertion exposed Next.js root trailing-slash normalization, which was corrected
and revalidated. No failing application assertion remains. The external Rich
Results Test and Search Console actions are instructions for after deployment,
not claimed validation results.

To reproduce the HTTP integration checks, build and start in matching modes, then
run in a second terminal (the test harness only accepts localhost):

```bash
SEO_ENV=production NEXT_PUBLIC_SITE_URL=https://www.mozzaitalia.com npm run build
SEO_ENV=production NEXT_PUBLIC_SITE_URL=https://www.mozzaitalia.com npm run start -- --port 3099
# In a second terminal:
SEO_TEST_URL=http://127.0.0.1:3099 SEO_EXPECT_INDEXABLE=true NEXT_PUBLIC_SITE_URL=https://www.mozzaitalia.com npm run test:seo:live
```

For a private build, use SEO_ENV=preview and an empty NEXT_PUBLIC_SITE_URL for build
and start, then set SEO_EXPECT_INDEXABLE=false and an empty NEXT_PUBLIC_SITE_URL
for test:seo:live. The automated suite also checks a configured production origin
in inherited preview/development environments.
