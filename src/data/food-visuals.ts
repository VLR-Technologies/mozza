// Central food photography library. Replace local assets with approved Mozza Italia photography.
export const foodVisuals = {
 pizza:'/food/hero/hero-pizza.webp', chickenPizza:'/food/pizza/chicken-pizza.webp',
 chicken:'/food/chicken/broasted-chicken.webp', grill:'/food/chicken/grilled-chicken.webp',
 burger:'/food/burger/zinger-burger.webp', burgerLayers:'/food/burger/burger-layers.webp',
 rice:'/food/rice/chicken-ghee-pulav.webp', vegRice:'/food/rice/veg-ghee-pulav.webp', chittimutyalu:'/food/rice/chittimutyalu-chicken.webp',
 fries:'/food/snacks/loaded-fries.webp', garlic:'/food/snacks/garlic-bread.webp',
 drinks:'/food/drinks/mojito-milkshake.webp', desserts:'/food/desserts/brownie.webp', iceCream:'/food/desserts/ice-cream.webp',
 vegSnacks:'/food/menu/veg-snacks.jpg', vegBurger:'/food/menu/veg-burger.jpg',
 salad:'/food/menu/mediterranean-salad.jpg', dips:'/food/menu/dips.jpg',
} as const;
export type FoodVisual = keyof typeof foodVisuals;

// Set false when replacing the separated-layer asset with an ordinary client burger photograph.
export const visualSettings = { burgerLayered: true };
