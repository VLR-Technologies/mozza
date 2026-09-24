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

const categoryByItemId = new Map(
  menuCategories.flatMap(category => category.items.map(item => [item.id, category] as const)),
);

export function getMenuItemPhoto(item: MenuItem): MenuPhoto {
  const category = categoryByItemId.get(item.id);

  if (item.id === 'pita-bread') return menuPhotos.garlic;
  if (category?.group === 'Burgers' && item.diet === 'veg') return menuPhotos.vegBurger;
  if (category?.group === 'Rice' && item.diet !== 'non-veg') return menuPhotos.vegRice;
  if (category?.id === 'non-veg-pizza') return menuPhotos.chickenPizza;
  if (
    item.image
    && item.image !== 'burgerLayers'
    && item.image in menuPhotos
  ) {
    return menuPhotos[item.image as MenuPhotoKey];
  }

  return menuPhotos[categoryPhotoKeys[category?.id || ''] || 'fries'];
}

export function getCategoryPhoto(category: MenuCategory): MenuPhoto {
  return menuPhotos[categoryPhotoKeys[category.id] || 'fries'];
}

export const featuredMenuCategories: Record<string, {
  itemIds: string[];
  headline: string;
  subheadline: string;
  sizeIndex?: number;
}> = {
  'veg-pizza': {itemIds: ['tandoori-paneer', 'veg-full-house', 'margarita'], headline: 'TOPPED. LOADED. READY.', subheadline: 'A little sauce. A lot to love.'},
  'non-veg-pizza': {itemIds: ['mozza-italia-spl', 'chicken-valcano', 'south-chicken'], headline: 'LOADED WITH THE GOOD STUFF.', subheadline: 'Big flavour, baked into every slice.'},
  'broasted-chicken': {itemIds: ['chicken-hot-wings', 'hot-crispy-fried-chicken'], headline: 'CRUNCH YOU CAN ALMOST HEAR.', subheadline: 'Crispy. Juicy. Gone fast.'},
  burger: {itemIds: ['chicken-zinger-burger'], sizeIndex: 1, headline: 'STACKED FOR THE CRAVING.', subheadline: 'Big on crunch. Better with company.'},
  'garlic-bread-slices': {itemIds: ['garlic-cheese-slices'], headline: 'ONE MORE CHEESY BITE.', subheadline: 'Pull apart. Bring everyone together.'},
  'basmathi-ghee-pulav': {itemIds: ['basmathi-chicken-ghee-pulav', 'basmathi-veg-ghee-pulav', 'basmathi-egg-ghee-pulav'], headline: 'COMFORT IN EVERY SPOONFUL.', subheadline: 'Slow down. Dig in.'},
  'chittimutyalu-ghee-pulav': {itemIds: ['chittimutyalu-chicken-ghee-pulav', 'chittimutyalu-veg-ghee-pulav', 'chittimutyalu-egg-ghee-pulav'], headline: 'FLAVOUR IN EVERY GRAIN.', subheadline: 'A warm, generous bowl made for sharing.'},
  mojitos: {itemIds: ['classic-mint'], headline: 'A LITTLE SIP OF HAPPY.', subheadline: 'Cool, from the first sip.'},
  'milk-shakes': {itemIds: ['shake-belgium-chocolate', 'shake-cold-coffee-shake'], headline: 'RICH. COLD. SERIOUSLY GOOD.', subheadline: 'A smooth finish for any craving.'},
  desserts: {itemIds: ['sizzling-brownie-with-vanilla-ice-cream', 'chocolate-brownie'], headline: 'SAVE THE SWEETEST FOR LAST.', subheadline: 'There is always room for this.'},
};

export const menuShowcaseItemIds = [
  'margarita',
  'chicken-zinger-burger',
  'chicken-hot-wings',
  'basmathi-chicken-ghee-pulav',
  'classic-mint',
] as const;
