import { menuCategories, type MenuItem } from './menu-data';
import { foodVisuals } from './food-visuals';

export type LegacyFoodAnimationType = 'pizzaAssembly' | 'burgerAssembly' | 'cheesePull' | 'chickenReveal' | 'riceReveal' | 'drinkBuild' | 'dessertReveal';
export type FoodAnimationType = LegacyFoodAnimationType | 'friesAssembly' | 'bucketFill' | 'breadBuild' | 'saladBuild' | 'snackBuild' | 'iceCreamBuild' | 'sweetBuild' | 'dipBuild' | 'extraBuild';
export type Ingredient = 'mushroom' | 'onion' | 'capsicum' | 'tomato' | 'corn' | 'paneer' | 'chicken' | 'olive' | 'jalapeno' | 'baby-corn' | 'paprika' | 'chilli';
export type FoodAnimationConfig = {
  animationType: FoodAnimationType;
  visual: string;
  ingredients: Ingredient[];
  headline: string;
  subheadline: string;
  accentColor: string;
  triggerMode: 'enter' | 'scroll' | 'detail';
  variant?: string;
  itemId?: string;
  family?: string;
  cycleSeconds?: number;
  color?: string;
  garnish?: string;
  flags?: string[];
  seed?: number;
};
// Animation assets are illustrative, never claimed as actual outlet photography.
export const animationAssets = {
  pizza: { base:'/food/animations/pizza/base.webp', sauce:'/food/animations/pizza/sauce.webp', cheese:'/food/animations/pizza/cheese.webp', finished:'/food/animations/pizza/finished.webp' },
  burger: { top:'/food/animations/burger/top.webp', bottom:'/food/animations/burger/bottom.webp', lettuce:'/food/animations/burger/lettuce.webp', patty:'/food/animations/burger/patty.webp', cheese:'/food/animations/burger/cheese.webp', sauce:'/food/animations/burger/sauce.webp' },
  cheese: { group:'/food/animations/cheese/group.webp', piece:'/food/animations/cheese/piece.webp', strands:'/food/animations/cheese/strands.webp', finished:'/food/animations/cheese/finished.webp' },
  chicken: { drumstick:'/food/animations/chicken/drumstick.webp', wing:'/food/animations/chicken/wing.webp', tender:'/food/animations/chicken/tender.webp', popcorn:'/food/animations/chicken/popcorn.webp' },
  rice: { bowl:'/food/animations/rice/bowl.webp', garnish:'/food/animations/rice/garnish.webp', chicken:'/food/animations/rice/chicken.webp' },
  drink: { glass:'/food/animations/drinks/glass.webp', lime:'/food/animations/drinks/lime.webp', mint:'/food/animations/drinks/mint.webp', ice:'/food/animations/drinks/ice.webp' },
  dessert: { brownie:'/food/animations/desserts/brownie.webp', scoop:'/food/animations/desserts/scoop.webp', chocolate:'/food/animations/desserts/chocolate.webp', cream:'/food/animations/desserts/cream.webp' },
} as const;
export const ingredientAssets: Record<Ingredient,string> = Object.fromEntries(['mushroom','onion','capsicum','tomato','corn','paneer','chicken','olive','jalapeno','baby-corn','paprika','chilli'].map(i=>[i,`/food/ingredients/${i}.webp`])) as Record<Ingredient,string>;
const base: Record<LegacyFoodAnimationType,Omit<FoodAnimationConfig,'ingredients'>> = {
  pizzaAssembly:{animationType:'pizzaAssembly',visual:foodVisuals.pizza,headline:'TOPPED. LOADED. READY.',subheadline:'A little sauce. A lot to love.',accentColor:'#c8322d',triggerMode:'enter'},
  burgerAssembly:{animationType:'burgerAssembly',visual:foodVisuals.burger,headline:'BUILT. LAYER BY LAYER.',subheadline:'Stacked for the craving.',accentColor:'#c19a4b',triggerMode:'scroll'},
  cheesePull:{animationType:'cheesePull',visual:foodVisuals.garlic,headline:'ONE MORE CHEESY BITE.',subheadline:'Pull apart. Bring everyone together.',accentColor:'#bd943e',triggerMode:'enter'},
  chickenReveal:{animationType:'chickenReveal',visual:foodVisuals.chicken,headline:'CRUNCH YOU CAN ALMOST HEAR.',subheadline:'Crispy. Juicy. Gone fast.',accentColor:'#bd5c32',triggerMode:'enter'},
  riceReveal:{animationType:'riceReveal',visual:foodVisuals.rice,headline:'COMFORT IN EVERY SPOONFUL.',subheadline:'Slow down. Dig in.',accentColor:'#b98a46',triggerMode:'enter'},
  drinkBuild:{animationType:'drinkBuild',visual:foodVisuals.drinks,headline:'A LITTLE SIP OF HAPPY.',subheadline:'Cool, from the first sip.',accentColor:'#799746',triggerMode:'enter'},
  dessertReveal:{animationType:'dessertReveal',visual:foodVisuals.desserts,headline:'SAVE THE SWEETEST FOR LAST.',subheadline:'There’s always room for this.',accentColor:'#986447',triggerMode:'enter'},
};
const pizzaIds=new Set(menuCategories.filter(c=>c.id==='veg-pizza'||c.id==='non-veg-pizza').flatMap(c=>c.items.map(i=>i.id)));
// Explicit item assignments. Unknown recipes keep the original static detail experience.
export const animationItemGroups = {
  burgerAssembly:['chicken-zinger-burger','chicken-zinger-burger-meal'],
  cheesePull:['garlic-cheese-slices','cheese-stuffed-garlic-bread'],
  chickenReveal:['hot-crispy-fried-chicken','chicken-hot-wings','boneless-tenders','chicken-pop-corn','snacks-chicken-pop-corn','hot-wings-treat','hot-wings-bucket','hot-crispy-treat','grill-chicken-drum-stick','grill-chicken-full-joint'],
  riceReveal:['basmathi-veg-ghee-pulav','basmathi-egg-ghee-pulav','basmathi-chicken-ghee-pulav','chittimutyalu-veg-ghee-pulav','chittimutyalu-egg-ghee-pulav','chittimutyalu-chicken-ghee-pulav'],
  drinkBuild:['classic-mint','fresh-lemon-soda','fresh-lemonade','pudina-lemon','shake-belgium-chocolate','shake-cold-coffee-shake','shake-choco-brownie-shake'],
  dessertReveal:['chocolate-brownie','chocolate-brownie-with-vanilla-ice-cream','sizzling-brownie-with-vanilla-ice-cream'],
} satisfies Partial<Record<FoodAnimationType,string[]>>;
const toppingMatchers: [Ingredient,RegExp][] = [['mushroom',/mushroom/i],['onion',/onion/i],['capsicum',/green pepper/i],['tomato',/(?<!ripened )tomato(?! sauce)/i],['corn',/golden corn|sweet corn/i],['paneer',/paneer|panner/i],['chicken',/chicken/i],['olive',/olive/i],['jalapeno',/jalapeno|jalapino/i],['baby-corn',/baby corn/i],['paprika',/paprika/i],['chilli',/green chilli/i]];
export function getMenuAnimation(item:MenuItem):FoodAnimationConfig|null {
  if(pizzaIds.has(item.id)) return {...base.pizzaAssembly,visual:foodVisuals[item.diet==='veg'?'pizza':'chickenPizza'],ingredients:toppingMatchers.filter(([,re])=>re.test(item.description||'')).map(([ingredient])=>ingredient)};
  const entry=Object.entries(animationItemGroups).find(([,ids])=>ids.includes(item.id));
  if(!entry)return null;
  const type=entry[0] as LegacyFoodAnimationType;
  let variant='';
  if(type==='chickenReveal')variant=item.id.startsWith('grill-')?'grill':item.id.includes('wing')?'wing':item.id.includes('tender')?'tender':item.id.includes('pop-corn')?'popcorn':'drumstick';
  if(type==='riceReveal')variant=item.diet;
  if(type==='drinkBuild')variant=item.id.includes('shake')?'shake':item.id==='classic-mint'||item.id==='pudina-lemon'?'mint':'lemon';
  if(type==='dessertReveal')variant=item.id==='chocolate-brownie'?'plain':'icecream';
  return {...base[type],ingredients:[],variant,...(variant==='grill'?{visual:foodVisuals.grill}:{})};
}
export const animatedCategoryFeatures:Record<string,{itemIds:string[];sizeIndex?:number}>={
  'veg-pizza':{itemIds:['tandoori-paneer','veg-full-house','margarita']},
  'non-veg-pizza':{itemIds:['mozza-italia-spl','chicken-valcano','south-chicken']},
  'broasted-chicken':{itemIds:['chicken-hot-wings','hot-crispy-fried-chicken']},
  'burger':{itemIds:['chicken-zinger-burger'],sizeIndex:1},
  'garlic-bread-slices':{itemIds:['garlic-cheese-slices']},
  'basmathi-ghee-pulav':{itemIds:['basmathi-chicken-ghee-pulav','basmathi-veg-ghee-pulav','basmathi-egg-ghee-pulav']},
  'chittimutyalu-ghee-pulav':{itemIds:['chittimutyalu-chicken-ghee-pulav','chittimutyalu-veg-ghee-pulav','chittimutyalu-egg-ghee-pulav']},
  'mojitos':{itemIds:['classic-mint']},
  'milk-shakes':{itemIds:['shake-belgium-chocolate','shake-cold-coffee-shake']},
  'desserts':{itemIds:['sizzling-brownie-with-vanilla-ice-cream','chocolate-brownie']},
};
export const foodStoryItems=['margarita','chicken-zinger-burger','chicken-hot-wings','basmathi-chicken-ghee-pulav','classic-mint'];
