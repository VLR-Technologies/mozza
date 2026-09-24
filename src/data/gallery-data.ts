import type {FoodVisual} from './food-visuals';
export type GalleryCategory='Pizza'|'Chicken'|'Burgers'|'Rice'|'Snacks'|'Drinks'|'Desserts'|'Restaurant';
export const galleryData:{id:string;image:FoodVisual;title:string;category:GalleryCategory;alt:string}[]=[
 {id:'pizza',image:'pizza',title:'A slice of the good life',category:'Pizza',alt:'Illustrative vegetable and cheese pizza'},
 {id:'chicken',image:'chicken',title:'Turn up the crunch',category:'Chicken',alt:'Illustrative broasted chicken and wings'},
 {id:'burger',image:'burger',title:'Stacked with flavour',category:'Burgers',alt:'Illustrative Chicken Zinger Burger'},
 {id:'rice',image:'rice',title:'Comfort in every spoonful',category:'Rice',alt:'Illustrative copper bowl of chicken ghee pulav'},
 {id:'drinks',image:'drinks',title:'Sip something good',category:'Drinks',alt:'Illustrative mint mojito and chocolate milkshake'},
 {id:'dessert',image:'desserts',title:'Always room for this',category:'Desserts',alt:'Illustrative brownie with vanilla ice cream'},
 {id:'chicken-pizza',image:'chickenPizza',title:'Loaded with the good stuff',category:'Pizza',alt:'Illustrative chicken pizza'},
 {id:'grill',image:'grill',title:'Smoky. Juicy. Irresistible.',category:'Chicken',alt:'Illustrative grilled chicken joint'},
 {id:'fries',image:'fries',title:'One more handful',category:'Snacks',alt:'Illustrative loaded cheese fries'},
 {id:'garlic',image:'garlic',title:'Cheesy garlic goodness',category:'Snacks',alt:'Illustrative garlic cheese bread'},
 {id:'veg-rice',image:'vegRice',title:'Pure comfort',category:'Rice',alt:'Illustrative vegetable ghee pulav'},
 {id:'chitti',image:'chittimutyalu',title:'Flavour in every grain',category:'Rice',alt:'Illustrative Chittimutyalu chicken rice'},
 {id:'icecream',image:'iceCream',title:'A sweet little pause',category:'Desserts',alt:'Illustrative ice cream scoops'},
];
// Add approved real outlet photographs with category: 'Restaurant' when supplied.
