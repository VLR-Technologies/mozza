> Superseded by [LIVE-MENU-V2-REPORT.md](LIVE-MENU-V2-REPORT.md): all 118 menu entries now have visual mappings and automatic visible-only loops.

# Live food menu update

Implemented in the existing Mozza Italia website on 23 September 2026. No repository initialization, commit, push or deployment was performed. No unrelated project was accessed.

## Existing files modified

- `src/components/menu/MenuExplorer.tsx`: integrates category features and the five-step story while retaining search, dietary/group filters, category anchors, menu rows and original prices.
- `src/components/menu/MenuItemModal.tsx`: selects the appropriate scene, preserves selected servings and WhatsApp ordering, and opens the mobile sheet.
- `src/components/ui/Modal.tsx`: optional 220 ms closing transition, optional sheet handle/swipe dismissal, Escape/backdrop dismissal and keyboard focus wrapping. Existing navigation/order/gallery dialogs retain their default behavior.

`src/data/menu-data.ts` is byte-for-byte unchanged. SHA256: `C1DF68064CD277F5740CB40008B4C92B4BA24042CDA98DE3A8C4678F164CD0BB`. All 25 categories, 118 entries and 189 variants remain, including existing price-confirmation flags.

## New files and components

- `src/data/menu-animation-data.ts`: typed scene configuration, recipe-based pizza toppings, item assignments, featured categories and story sequence.
- `src/components/menu/ScrollRail.tsx`: horizontal scrolling, hidden native scrollbars, gradient edge cues and desktop arrow controls when needed.
- `src/components/menu/food-animation/FoodAnimationStage.tsx`: visibility/loading/replay/reduced-motion coordination.
- `PizzaAssembly.tsx`, `BurgerAssembly.tsx`, `CheesePull.tsx`, `ChickenAssembly.tsx`, `RiceReveal.tsx`, `DrinkAnimation.tsx`, `DessertAnimation.tsx` in that same directory: seven reusable systems.
- `IngredientLayer.tsx`, `types.ts`, `CategoryFoodFeature.tsx`, `MenuFoodStory.tsx`, `food-animation.css` in that directory: shared layers, scene contracts, compact features, story and scoped presentation.
- `FoodParticles` is exported from `ChickenAssembly.tsx`; `Steam` is exported from `RiceReveal.tsx`.
- `scripts/verify-live-menu.mjs`: verifies the unchanged menu hash, assignment IDs, category membership, serving indexes, vegetarian pizza toppings, seven systems and every referenced asset.
- This report, plus 42 transparent WebP assets listed below.

## Animated category features

Veg Pizza; Non-Veg Pizza; Broasted Chicken; Burger; Garlic Bread Slices; Basmathi Ghee Pulav; Chittimutyalu Ghee Pulav; Milk Shakes; Mojitos; Desserts.

Features use an available item within the active dietary filter. Searching hides the rich category features so results stay compact. Ordinary rows remain lightweight. The unfiltered menu also includes one “FROM CRAVING TO PLATE” story: Margarita, Chicken Zinger Burger, Chicken Hot Wings, Basmathi Chicken Ghee Pulav and Classic Mint.

## Exact item assignments

| System | Menu items |
| --- | --- |
| Pizza assembly | Margarita; Simple Veg; Corn Delight; American Corn Pizza; Veg Deluxe; Veg Valcano; Barbeque Delight; Veg Full House; Tandoori Paneer; Paneer Peri Peri; Veg Feast; South Chicken; Chicken Valcano; Tandoori Chicken; Peri Peri Chicken; Barbeque Chicken; Chicken Feast; Shahi Chicken; Chicken Sausage; Mozza Italia Spl |
| Burger assembly | Chicken Zinger Burger; Chicken Zinger Burger Meal. Cheese appears only for the With Cheese serving. |
| Cheese pull | Garlic Cheese Slices; Cheese Stuffed Garlic Bread |
| Chicken reveal | Chicken Pop Corn in both original categories; Boneless Tenders; Hot & Crispy Fried Chicken; Chicken Hot Wings; Hot Wings Treat; Hot Wings Bucket; Hot & Crispy Treat; Grill Chicken Drum Stick; Grill Chicken Full Joint. Grilled items use the existing grill visual with a reveal, rather than fried-piece assets. |
| Rice reveal | Basmathi Veg Ghee Pulav; Basmathi Egg Ghee Pulav; Basmathi Chicken Ghee Pulav; Chittimutyalu Veg Ghee Pulav; Chittimutyalu Egg Ghee Pulav; Chittimutyalu Chicken Ghee Pulav |
| Drink build | Classic Mint; Pudina Lemon; Fresh Lemon Soda; Fresh Lemonade; Belgium Chocolate (Milk Shakes); Cold Coffee Shake; Choco Brownie Shake |
| Dessert reveal | Chocolate Brownie; Chocolate Brownie with Vanilla Ice Cream; Sizzling Brownie with Vanilla Ice Cream |

50 menu entries have an assigned scene. Unassigned entries preserve their normal detail experience. Pizza toppings are inferred only from the existing item descriptions; Margarita has no added vegetable/chicken toppings. Names and recipes in the menu were not rewritten.

## Temporary assets and later replacements

All new raster layers were generated for this prototype, mechanically separated from transparent atlases, and compressed. Every delivered WebP has actual alpha transparency; no rectangular ingredient backgrounds are used.

- `public/food/animations/pizza/`: base, sauce, cheese, finished.
- `public/food/animations/burger/`: top, bottom, lettuce, patty, cheese, sauce.
- `public/food/animations/cheese/`: group, piece, strands, finished.
- `public/food/animations/chicken/`: drumstick, wing, tender, popcorn.
- `public/food/animations/rice/`: bowl, mound, garnish, chicken.
- `public/food/animations/drinks/`: glass, lime, mint, ice.
- `public/food/animations/desserts/`: brownie, scoop, chocolate, cream.
- `public/food/ingredients/`: mushroom, onion, capsicum, tomato, corn, paneer, chicken, olive, jalapeno, baby-corn, paprika, chilli.

All names above have `.webp` extensions. Total: 42 files, 2,437,766 bytes (2.44 MB decimal). Main layers are at most 560 px, toppings at most 180 px. Some atlas outputs are retained as optional replacement layers and are not requested by the scenes.

Replace these generated layers and the pre-existing illustrative food photos with actual Mozza Italia photography when available. For assembly scenes, commission separately isolated ingredients with consistent camera angle and lighting; preserve alpha and the current framing. The SVG cheese strands, egg, chocolate line, steam and particles are lightweight graphic elements. On-page labels and the existing footer make the illustrative status explicit.

## Desktop, mobile and accessibility

Desktop uses paired copy/visual category features, subtle hover movement, scroll-driven burger assembly and a sticky story heading. The burger keeps layers apart in the first quarter of its progress, assembles through the middle half, and settles in the final quarter.

Mobile stacks compact feature copy and visuals, uses automatic assembly instead of scroll-dependent burger layers, removes sticky story behavior, and opens item details as a bottom sheet. The sheet supports a downward drag on its handle as well as tapping the handle/close button. Details, servings and ordering are rendered immediately; food playback begins approximately 150 ms after the detail scene is visible and its assets are ready.

Native modal dialogs make the background inert, with explicit forward/reverse Tab wrapping, Escape and backdrop dismissal. Decorative layers have empty alt text inside a labelled food illustration. Replay buttons are labelled. Reduced-motion CSS and Motion hooks show the final assembled state and disable loops/replay; serving selection and ordering remain available.

## Performance behavior

- Existing Motion/CSS/SVG stack; no new packages, GSAP, WebGL or particle engine.
- Scenes mount their ingredient layers within 180 px of the viewport and start once at approximately 45% visibility after image readiness.
- Category playback is remembered while switching filters; small scroll movements do not restart it. Explicit Replay remains available.
- Animations pause when the scene leaves view. Idle effects are limited to three steam wisps or seven drink bubbles.
- Pizza has 12 cheese shreds and at most 20 topping nodes; chicken has seven brief crumbs.
- Compressed local WebP layers are served directly, retaining alpha and avoiding oversized image-optimizer requests for tiny ingredients.
- No entire-menu preload; the existing static food visual serves as a lazy fallback if a layer fails.
- Normal menu rows remain server-rendered; all 118 rows were confirmed in the generated HTML without animation JavaScript.

## Validation

- `npm run lint`: passed with no errors or warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed; existing routes prerender successfully.
- `npm run test:menu`: passed (25 categories / 118 entries / 189 variants).
- `node scripts/verify-live-menu.mjs`: passed.
- Asset audit: all 42 files have transparent and opaque alpha pixels; all references resolve.
- Browser review at 1440, 1280, 1024, 430, 390 and 360 px: no horizontal document overflow in the tested layouts. Reviewed all seven systems across desktop and mobile, final assembled states, category features, readable prices, detail scrolling, hidden horizontal scrollbars and the story layout.
- Search for zinger, vegetarian empty results, non-veg results, reset/clear search, food-type filters, detailed hash navigation and mobile navigation verified.
- WhatsApp URL retains the chosen dish/serving, including the story burger's With Cheese selection. Order Now still opens the existing contact-choice dialog. No messages were sent.
- Close button, Escape, backdrop dismissal and forward/reverse focus wrap verified. Native top-layer dialogs keep the floating WhatsApp control behind the sheet.

Limits: viewport testing is browser-based, not a physical Android performance benchmark. Reduced-motion behavior was checked in implementation; OS-level reduced-motion preference was not changed. The handle swipe is implemented but was not separately touch-device tested. Existing unknown prices remain subject to restaurant confirmation.

