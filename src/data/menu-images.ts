import {foodVisuals, type FoodVisual} from './food-visuals';
import {menuCategories, type MenuCategory, type MenuItem} from './menu-data';

export type MenuPhoto = {
  src: string;
  alt: string;
  position?: string;
};

const photo = (visual: FoodVisual, alt: string, position = '50% 50%'): MenuPhoto => ({
  src: foodVisuals[visual],
  alt,
  position,
});

export const menuPhotos = {
  pizza: photo('pizza', 'Vegetable and cheese pizza on a dark green restaurant backdrop'),
  chickenPizza: photo('chickenPizza', 'Loaded chicken pizza on a dark green restaurant backdrop'),
  chicken: photo('chicken', 'Golden broasted chicken on a dark ceramic plate'),
  grill: photo('grill', 'Grilled chicken served on a dark restaurant backdrop'),
  burger: photo('burger', 'Crispy chicken burger with lettuce and tomato'),
  vegBurger: photo('vegBurger', 'Vegetarian burger with a crisp vegetable and paneer patty'),
  rice: photo('rice', 'Chicken ghee pulav in a copper serving bowl'),
  vegRice: photo('vegRice', 'Vegetable ghee pulav in a copper serving bowl'),
  chittimutyalu: photo('chittimutyalu', 'Chittimutyalu chicken rice in a restaurant serving bowl'),
  fries: photo('fries', 'Seasoned loaded fries on a dark ceramic plate'),
  vegSnacks: photo('vegSnacks', 'Vegetable fingers, nuggets and potato wedges on a dark ceramic plate'),
  garlic: photo('garlic', 'Golden garlic cheese bread on a dark ceramic plate'),
  salad: photo('salad', 'Mediterranean salad with feta, quinoa and crisp vegetables'),
  dips: photo('dips', 'Creamy restaurant dipping sauces in dark ceramic ramekins'),
  drinks: photo('drinks', 'Mint mojito and chocolate milkshake on a dark green backdrop'),
  desserts: photo('desserts', 'Chocolate brownie with vanilla ice cream and chocolate sauce'),
  iceCream: photo('iceCream', 'Scoops of ice cream on a dark green restaurant backdrop'),
} as const satisfies Record<string, MenuPhoto>;

export type MenuPhotoKey = keyof typeof menuPhotos;

export const categoryPhotoKeys: Record<string, MenuPhotoKey> = {
  'veg-snacks': 'vegSnacks',
  'non-veg-snacks': 'chicken',
  'garlic-bread-slices': 'garlic',
  'stuffed-garlic-bread': 'garlic',
  'broasted-chicken': 'chicken',
  'bucket-deals': 'chicken',
  dips: 'dips',
  'grill-chicken': 'grill',
  'veg-pizza': 'pizza',
  'veg-pizza-extra-toppings': 'pizza',
  'non-veg-pizza': 'chickenPizza',
  'non-veg-pizza-extra-toppings': 'chickenPizza',
  burger: 'burger',
  'burger-meal': 'burger',
  'mediterranean-healthy-salads': 'salad',
  'high-protein-non-veg-combo-meal': 'rice',
  'quinoa-curd-rice': 'vegRice',
  'basmathi-ghee-pulav': 'rice',
  'chittimutyalu-ghee-pulav': 'chittimutyalu',
  'real-fruit-milk-shakes': 'drinks',
  'milk-shakes': 'drinks',
  mojitos: 'drinks',
  coolers: 'drinks',
  desserts: 'desserts',
  'ice-creams': 'iceCream',
};

// Dish-specific photography in public/food/items, keyed by menu item id.
// Items not listed here fall back to their category photo.
export const itemPhotoFiles: Record<string, string> = {
  'veg-fingers': 'veg-fingers',
  'veg-nuggets': 'veg-nuggets',
  'salted-french-fries': 'salted-french-fries',
  'chilli-garlic-fries': 'chilli-garlic-fries',
  'peri-peri-fries': 'peri-peri-fries',
  'maggi-masala-fries': 'maggi-masala-fries',
  'maggi-masala-potato-wedges': 'maggi-masala-potato-wedges',
  'chilli-garlic-potato-wedges': 'chilli-garlic-potato-wedges',
  'peri-peri-potato-wedges': 'peri-peri-potato-wedges',
  'cheesy-loaded-fries': 'cheesy-loaded-fries',
  'chicken-nuggets': 'chicken-nuggets',
  'snacks-chicken-pop-corn': 'chicken-pop-corn',
  'cheesy-chicken-balls': 'cheesy-chicken-balls',
  'garlic-cheese-slices': 'garlic-cheese-slices',
  'veg-garlic-cheese-slices': 'veg-garlic-cheese-slices',
  'paneer-garlic-cheese-slices': 'paneer-garlic-cheese-slices',
  'chicken-garlic-cheese-slices': 'chicken-garlic-cheese-slices',
  'plain-garlic-bread': 'plain-garlic-bread',
  'cheese-stuffed-garlic-bread': 'cheese-stuffed-garlic-bread',
  'paneer-stuffed-garlic-bread': 'paneer-stuffed-garlic-bread',
  'chicken-stuffed-garlic-bread': 'chicken-stuffed-garlic-bread',
  'boneless-tenders': 'boneless-tenders',
  'hot-crispy-fried-chicken': 'hot-crispy-fried-chicken',
  'chicken-hot-wings': 'chicken-hot-wings',
  'chicken-pop-corn': 'chicken-pop-corn',
  'hot-wings-treat': 'hot-wings-treat',
  'hot-wings-bucket': 'hot-wings-bucket',
  'hot-crispy-treat': 'hot-crispy-treat',
  'grill-chicken-drum-stick': 'grill-chicken-drum-stick',
  'grill-chicken-full-joint': 'grill-chicken-full-joint',
  'pita-bread': 'pita-bread',
  margarita: 'margarita',
  'simple-veg': 'simple-veg',
  'corn-delight': 'corn-delight',
  'american-corn-pizza': 'american-corn-pizza',
  'veg-deluxe': 'veg-deluxe',
  'veg-valcano': 'veg-valcano',
  'barbeque-delight': 'barbeque-delight',
  'veg-full-house': 'veg-full-house',
  'tandoori-paneer': 'tandoori-paneer',
  'paneer-peri-peri': 'paneer-peri-peri',
  'veg-feast': 'veg-feast',
  'south-chicken': 'south-chicken',
  'chicken-valcano': 'chicken-valcano',
  'tandoori-chicken': 'tandoori-chicken',
  'peri-peri-chicken': 'peri-peri-chicken',
  'barbeque-chicken': 'barbeque-chicken',
  'chicken-feast': 'chicken-feast',
  'shahi-chicken': 'shahi-chicken',
  'chicken-sausage': 'chicken-sausage',
  'mozza-italia-spl': 'mozza-italia-spl',
  'veg-burger': 'veg-burger',
  'chicken-burger': 'chicken-burger',
  'chicken-zinger-burger': 'chicken-zinger-burger',
  'paneer-burger': 'paneer-burger',
};

const categoryByItemId = new Map(
  menuCategories.flatMap(category => category.items.map(item => [item.id, category] as const)),
);

export function getMenuItemPhoto(item: MenuItem): MenuPhoto {
  const itemFile = itemPhotoFiles[item.id];
  if (itemFile) return {src: `/food/items/${itemFile}.webp`, alt: item.name};

  const category = categoryByItemId.get(item.id);

  if (item.id === 'pita-bread') return menuPhotos.garlic;
  if (category?.group === 'Burgers' && item.diet === 'veg') return menuPhotos.vegBurger;
  if (category?.group === 'Rice' && item.diet !== 'non-veg') return menuPhotos.vegRice;
  if (category?.id === 'non-veg-pizza') return menuPhotos.chickenPizza;
  if (
    item.image
    && item.image in menuPhotos
  ) {
    return menuPhotos[item.image as MenuPhotoKey];
  }

  return menuPhotos[categoryPhotoKeys[category?.id || ''] || 'fries'];
}

export function getCategoryPhoto(category: MenuCategory): MenuPhoto {
  return menuPhotos[categoryPhotoKeys[category.id] || 'fries'];
}
