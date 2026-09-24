# Complete animated menu — second upgrade

Implemented in the existing Mozza Italia website on 23 September 2026. This supersedes the first upgrade's 50-item animation coverage and play-once behavior.

## Coverage and variants

1. **Menu total:** 118 entries across 25 categories, with 189 existing serving/price variants.
2. **Visual mapping:** 118/118 entries in `menu-visual-registry.ts`, resolved from existing menu data.
3. **All items have visuals:** yes. Every normal row contains an accessible illustrative thumbnail and opens a richer detail scene. **Text-only exceptions: none.** Existing category features and the food story remain.
4. **Families:** pizza 20; burger 8; fries/wedges 8; chicken 9; bucket 3; garlic bread/Pita 5; stuffed bread 4; salad 3; rice 10; fruit shake 5; milkshake 7; mojito 6; cooler/bottles 6; dessert 8; ice cream 5; snack 2; dip 2; extras 7. These 18 presentation families share lightweight assembly renderers.
5. **Pizza:** all 20 existing pizzas have recipe-based toppings and deterministic placement. Base, sauce, cheese, toppings and a baked finish assemble in sequence. Existing recipe assignments remain; no new menu recipe is invented.
6. **Burgers:** veg, paneer, chicken and crispy Zinger patties; meal versions include fries. Layers begin separated and assemble automatically. Selecting With Cheese adds cheese; the standard option omits it. Extra Patty's selected protein also changes its illustration.
7. **Fries:** salted, chilli garlic, peri peri, Maggi masala, potato wedges and Cheesy Loaded Fries. Groups fall onto a plate; cheesy fries receive a visible stream and drizzle. No chicken-loaded-fries product was added because none exists in the source menu.
8. **Chicken:** wings, popcorn, nuggets, cheesy balls, tenders, fried drumsticks and grilled chicken. Wings slide, popcorn bounces, tenders slide diagonally, grilled chicken has heat/steam. Buckets fill piece by piece; qualifying deals show their fries/dip accompaniment. Illustrations represent the dish, not an exact piece-count photograph.
9. **Rice:** Basmathi and short-grain Chittimutyalu have different grain treatments; veg, egg, chicken and plain portions are distinct. Quinoa curd rice and the protein combo also have visuals. Bowls fill, relevant protein/garnish arrives, and hot rice releases steam.
10. **Drinks:** all 24 entries. Fruit/flavor colors and garnish distinguish banana, berry, mango, avocado, dry fruit, chocolate, cookie, butterscotch, mint, blue curacao, watermelon, peach, lemon, jeera and kala katta. Glass, ice/garnish and liquid build sequentially; shake liquid visibly rises. Cold Coffee Shake is the existing coffee entry. Packaged drinks use a bottle illustration; no hot coffee was invented.
11. **Desserts:** plain brownie, brownie with vanilla ice cream, sizzling brownie, lava cake, three jamuns, two jamuns with ice cream, rabdi and jamuns with rabdi. Five existing ice-cream flavors have colored scoops dropping into cups.
12. **Fallback:** the total resolver assigns a safe snack visual to a future unrecognized item. Before a scene approaches the viewport, a family-shaped SVG is shown. Failed image decoding switches to an SVG fallback, so the row never becomes text-only. New graphics are original inline SVG; existing optimized WebP assets are reused. No new external asset dependency.

## Playback and responsive behavior

13. **Automatic loops:** pizza/burger 10 seconds, drinks 9 seconds, other families 8 seconds. Assembly is followed by a settled hold and a short fade reset. A CSS animation-end event restarts the sequence; no interval is required. Replay is optional. Rich scenes have Pause/Play controls; a page-level control pauses every food scene.
14. **Offscreen pause:** IntersectionObserver gates playback; CSS animation state is paused outside the active viewport. A shared budget permits at most six scenes, with feature priority. An open visible detail scene takes priority and pauses background scenes. Near-viewport loading avoids mounting full scenes for the entire menu immediately.
15. **Desktop/mobile:** desktop thumbnails are 100–120 pixels wide; mobile thumbnails are 82 pixels wide. Mobile reduces cheese shreds, toppings, steam, grain details and particles, wraps prices below item copy, and retains the bottom-sheet detail flow. Reduced-motion CSS and the Motion preference hook show composed, non-looping visuals. Reduced-motion behavior was inspected in code; no physical-device FPS or OS preference test is claimed.

## Files

16. **New files:**
    - `src/lib/menu-animation-resolver.ts`
    - `src/data/menu-visual-registry.ts`
    - `src/components/menu/AnimatedMenuRow.tsx`
    - `src/components/menu/food-animation/useAnimationBudget.ts`
    - `src/components/menu/food-animation/FoodShape.tsx`
    - `src/components/menu/food-animation/AdditionalAssemblies.tsx`
    - `LIVE-MENU-V2-REPORT.md`
17. **Modified files:**
    - `src/data/menu-animation-data.ts`
    - `src/components/menu/MenuExplorer.tsx`
    - `src/components/menu/MenuItemModal.tsx`
    - `src/components/menu/food-animation/FoodAnimationStage.tsx`
    - `src/components/menu/food-animation/BurgerAssembly.tsx`
    - `src/components/menu/food-animation/ChickenAssembly.tsx`
    - `src/components/menu/food-animation/RiceReveal.tsx`
    - `src/components/menu/food-animation/DrinkAnimation.tsx`
    - `src/components/menu/food-animation/PizzaAssembly.tsx`
    - `src/components/menu/food-animation/CategoryFoodFeature.tsx`
    - `src/components/menu/food-animation/MenuFoodStory.tsx`
    - `src/components/menu/food-animation/food-animation.css`
    - `scripts/verify-live-menu.mjs`
    - `LIVE-MENU-REPORT.md` (superseded notice)
18. **Lint:** `npm run lint` passed.
19. **TypeScript:** `npm run typecheck` passed.
20. **Production build:** `npm run build` passed; all existing routes generated successfully.

## Verification evidence

- `node scripts/verify-live-menu.mjs` passes: complete registry, cycle bounds, asset paths, pizza recipes, safe dietary variants, variant differences and future fallback.
- Original menu source remains byte-identical: SHA256 `C1DF68064CD277F5740CB40008B4C92B4BA24042CDA98DE3A8C4678F164CD0BB`.
- Browser review traversed all 25 categories. DOM audit: 118 rows, 118 visual stages, zero broken loaded images.
- Responsive inspection at 360, 390, 430, 1024, 1280 and 1440 pixels; no document horizontal overflow detected.
- Burger and bucket detail cycle counters advanced automatically without Replay. Offscreen scene animation states reported paused. Global pause reported zero active scenes; modal testing reported one active scene.
- Search returned both existing Zinger entries. Veg filtering retained 58/58 visuals; non-veg/egg retained 35/35. Serving selection added cheese and produced the correct existing WhatsApp destination and serving text. No message was sent.
- Original names, descriptions, categories, dietary values, prices, confirmation notes, routes and restaurant ordering configuration were retained. Unknown dietary entries display a neutral question marker rather than being inferred vegetarian.
- Assets are illustrative SVG/photo composites, not claimed photographs of the restaurant's actual portions. Physical low-end-device performance has not been benchmarked.

No project initialization, new Git repository, commit, push or deployment. Work stayed within the Mozza Italia workspace and supplied assets.
