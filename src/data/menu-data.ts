import type { FoodVisual } from './food-visuals';
export type Diet = 'veg' | 'non-veg' | 'egg' | 'unspecified';
export type Size = { label: string; price: number | null; detail?: string };
export type MenuItem = { id:string; name:string; description?:string; diet:Diet; sizes:Size[]; image?:FoodVisual; manualVerification?:string; sourcePage:number; note?:string };
export type MenuCategory = { id:string; name:string; group:string; items:MenuItem[]; note?:string };
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
function row(name:string,prices:(number|null)[],labels:string[],diet:Diet,page:number,description?:string,image?:FoodVisual,manualVerification?:string):MenuItem{return{id:slug(name),name,description,diet,sourcePage:page,sizes:prices.map((price,i)=>({label:labels[i]||'Serving',price})),image,manualVerification};}
const single=(name:string,price:number,diet:Diet,page:number,description?:string,image?:FoodVisual)=>row(name,[price],['Serving'],diet,page,description,image);
const two=(name:string,a:number,b:number,diet:Diet,page:number,description?:string,labels=['Small','Large'])=>row(name,[a,b],labels,diet,page,description);
const pizza=(name:string,a:number,b:number,diet:Diet,page:number,description:string)=>({...two(name,a,b,diet,page,description,['Regular 7″','Large 10″']),image:'pizza' as FoodVisual});
const cat=(name:string,group:string,items:MenuItem[],note?:string):MenuCategory=>({id:slug(name),name,group,items,note});
function pulav(name:string,prices:number[],diet:Diet,page:number,description:string):MenuItem{
 const chicken=diet==='non-veg';const egg=diet==='egg';
 return {...row(name,prices,['Regular','Large','Family'],diet,page,description,'rice'),sizes:prices.map((price,i)=>({label:['Regular','Large','Family'][i],price,detail:`${['1 person · 500 g','2 persons · 1 kg','4 persons · 1900 g'][i]} pulav · ${chicken?`${[230,450,750][i]} g chicken · ${[1,2,3][i]} boiled egg${i?'s':''}`:`${[200,350,650][i]} g ${egg?'Egg Dum Ki Masala':'Paneer Soya Kheema Masala · Roasted Kaju & Badam'}`} · Kaju Till Ki Khatta · Curd Raitha`}))};
}
// Transcribed from all nine pages of the supplied premium menu. Preserve printed client spellings.
// null prices are intentional; never substitute an inferred price for a manualVerification item.
export const menuCategories:MenuCategory[]=[
 cat('Veg Snacks','Snacks',[
 two('Veg Fingers',115,185,'veg',2,undefined,['Small · 6 pcs','Large · 10 pcs']),two('Veg Nuggets',110,150,'veg',2,undefined,['Small · 8 pcs','Large · 12 pcs']),
 two('Salted French Fries',85,150,'veg',2),two('Chilli Garlic Fries',90,165,'veg',2),two('Peri Peri Fries',90,165,'veg',2),two('Maggi Masala Fries',90,165,'veg',2),two('Maggi Masala Potato Wedges',90,160,'veg',2),two('Chilli Garlic Potato Wedges',90,160,'veg',2),two('Peri Peri Potato Wedges',90,160,'veg',2),row('Cheesy Loaded Fries',[160],['Small'],'veg',2)
 ]),
 cat('Non-Veg Snacks','Snacks',[
 two('Chicken Nuggets',130,190,'non-veg',2,undefined,['Small · 6 pcs','Large · 10 pcs']),
 {...row('Chicken Pop Corn',[null,250],['Small · 12 pcs','Large · 20 pcs'],'non-veg',2,undefined,'chicken','TODO: page 2 lists 12 pcs at 170; page 3 lists 12 pcs at 175. Confirm before publishing a price.'),id:'snacks-chicken-pop-corn'},
 two('Cheesy Chicken Balls',150,220,'non-veg',2,undefined,['Small · 6 pcs','Large · 10 pcs'])
 ]),
 cat('Garlic Bread Slices','Snacks',[single('Garlic Cheese Slices',140,'veg',2),single('Veg Garlic Cheese Slices',160,'veg',2),single('Paneer Garlic Cheese Slices',170,'veg',2),single('Chicken Garlic Cheese Slices',190,'non-veg',2)]),
 cat('Stuffed Garlic Bread','Snacks',[single('Plain Garlic Bread',120,'veg',2),single('Cheese Stuffed Garlic Bread',180,'veg',2),single('Paneer Stuffed Garlic Bread',210,'veg',2),single('Chicken Stuffed Garlic Bread',210,'non-veg',2)]),
 cat('Broasted Chicken','Chicken',[
 row('Boneless Tenders',[null,null],['6 pcs','10 pcs'],'non-veg',3,undefined,'chicken','TODO: PDF shows 170, 6 Pc and 10 Pc without clear size/price alignment. Confirm both prices.'),
 {...row('Hot & Crispy Fried Chicken',[230,420],['2 pcs','4 pcs'],'non-veg',3,undefined,'chicken'),note:'Available on weekends'},
 row('Chicken Hot Wings',[175,245,295,350],['4 pcs','6 pcs','8 pcs','10 pcs'],'non-veg',3,undefined,'chicken'),
 row('Chicken Pop Corn',[null,250],['Regular · 12 pcs','Large · 20 pcs'],'non-veg',3,undefined,'chicken','TODO: 12-piece price conflicts with page 2 (170 versus 175). Confirm with restaurant.')
 ]),
 cat('Bucket Deals','Chicken',[
 single('Hot Wings Treat',445,'non-veg',3,'10 Chicken Hot Wings, 1 Chilli Garlic Fries + 2 Dips','chicken'),single('Hot Wings Bucket',580,'non-veg',3,'16 Chicken Hot Wings + 2 Dips','chicken'),single('Hot & Crispy Treat',765,'non-veg',3,'4 Hot & Crispy Chicken, 6 Hot Wings + 1 Popcorn','chicken')
 ]),
 cat('Dips','Snacks',[
 row('Mayonnaise / Southwest Sauce',[null],['Dip'],'unspecified',3,undefined,undefined,'TODO: printed as Mayonnaise / Southwest Sauce 10/-, 20/-. Confirm mapping and dietary classification.'),
 {...row('Mustard Sauce / Chipotle Sauce',[25],['Dip'],'unspecified',3),note:'Ask the restaurant about ingredients and dietary suitability.'}
 ]),
 cat('Grill Chicken','Chicken',[
 row('Grill Chicken Drum Stick',[195,380,550,890],['2 pcs','4 pcs','6 pcs','10 pcs'],'non-veg',3,undefined,'chicken'),row('Grill Chicken Full Joint',[165,320,630],['1 pc','2 pcs','4 pcs'],'non-veg',3,undefined,'chicken'),single('Pita Bread',79,'unspecified',3,'Whole wheat sourdough Italian butter pita bread. Comes with southwest mayo, green chutney & onion jalapeno salad.')
 ]),
 cat('Veg Pizza','Pizza',[
 pizza('Margarita',200,320,'veg',4,'Sun Ripened Tomato Sauce, Mozzarella & Cheddar'),pizza('Simple Veg',230,350,'veg',4,'Tomato Sauce, Mozzarella & Cheddar, Onion, Green Pepper'),pizza('Corn Delight',260,380,'veg',4,'Onion, Green Pepper, Golden Corn & Baby Corn Shoots'),pizza('American Corn Pizza',260,380,'veg',4,'Onion, Green Pepper, Golden Corn'),pizza('Veg Deluxe',260,380,'veg',4,'Onion, Green Pepper, Black Olives & Red Paprika'),pizza('Veg Valcano',270,380,'veg',4,'Onion, Green Pepper, Jalapenos, Red Paprika, Green Chilli & Red Chilli Flakes'),pizza('Barbeque Delight',270,380,'veg',4,'Onion, Green Pepper, Tomato, Jalapenos, Red Chilli Flakes & Black Olives. BBQ Sauce is Mild Sweet Smoky American Sauce.'),pizza('Veg Full House',270,380,'veg',4,'Onion, Green Pepper, Black Olives, Jalapenos, Sweet Corn, Red Paprika & Baby Corn Shoots'),pizza('Tandoori Paneer',290,390,'veg',4,'Tandoori Paneer, Onion, Green Pepper, Tomato, Black Olives, Mushroom & Green Chilli'),pizza('Paneer Peri Peri',290,390,'veg',4,'Panner Peri Peri, Onion, Green Pepper, Red Paprika, Jalapenos, Mushroom & Green Chilli'),pizza('Veg Feast',290,390,'veg',4,'Onion, Green Pepper, Tomato, Black Olives, Paneer, Baby Corn Shoots & Green Chilli')
 ]),
 cat('Veg Pizza Extra Toppings','Pizza',[
 {...two('Cheese Burst',60,90,'veg',4,undefined,['Regular','Large']),id:'veg-cheese-burst'},two('Paneer',40,70,'veg',4,undefined,['Regular','Large']),{...two('Cheese',50,80,'veg',4,undefined,['Regular','Large']),id:'veg-extra-cheese'}
 ]),
 cat('Non-Veg Pizza','Pizza',[
 pizza('South Chicken',260,380,'non-veg',5,'Spicy Chicken, Onion & Green Pepper'),pizza('Chicken Valcano',280,390,'non-veg',5,'Spicy Chicken, Onion, Green Pepper, Green Chilli, Jalapinos, Red Paprika & Red Chilli Flakes'),pizza('Tandoori Chicken',290,390,'non-veg',5,'Tandoori Chicken, Onion, Green Pepper, Tomato, Jalapenos, Black Olives & Red Paprika'),pizza('Peri Peri Chicken',290,390,'non-veg',5,'Peri Peri Chicken, Onion, Green Pepper, Green Chilli, Jalapenos & Black Olives'),pizza('Barbeque Chicken',290,395,'non-veg',5,'Barbeque Chicken, Onion, Green Pepper, Tomato, Jalapenos, Sweet Corn & Red Chilli Flakes. BBQ Sauce is Mild Sweet Smoky American Sauce.'),pizza('Chicken Feast',290,395,'non-veg',5,'Spicy Chicken, Tandoori Chicken, Onion, Green Pepper, Tomato, Jalapenos & Sweet Corn'),pizza('Shahi Chicken',290,395,'non-veg',5,'Onion, Green Pepper, Jalapenos, Shahi Chicken, Garlic, Red Paprika, Mushroom & Red Chilli Flakes'),pizza('Chicken Sausage',290,395,'non-veg',5,'Chicken Sausage, Onion, Green Pepper, Red Paprika, Mushroom, Sweet Corn & Green Chilli'),pizza('Mozza Italia Spl',300,400,'non-veg',5,'Tandoori Chicken, Peri Peri Chicken, Spicy Chicken, Onion, Onion, Green Pepper, Jalapenos, Mushroom & Green Chilli')
 ]),
 cat('Non-Veg Pizza Extra Toppings','Pizza',[
 {...two('Cheese Burst',60,90,'veg',5,undefined,['Regular','Large']),id:'nonveg-cheese-burst'},two('Non Veg',50,80,'non-veg',5,undefined,['Regular','Large']),{...two('Cheese',50,80,'veg',5,undefined,['Regular','Large']),id:'nonveg-extra-cheese'}
 ]),
 cat('Burger','Burgers',[
 {...two('Veg Burger',120,135,'veg',6,undefined,['Small/Normal','With Cheese']),image:'burger'}, {...two('Chicken Burger',130,145,'non-veg',6,undefined,['Small/Normal','With Cheese']),image:'burger'}, {...two('Chicken Zinger Burger',160,175,'non-veg',6,undefined,['Small/Normal','With Cheese']),image:'burger'}, {...two('Paneer Burger',150,165,'veg',6,undefined,['Small/Normal','With Cheese']),image:'burger'},row('Extra Patty',[40,50,60],['Veg','Chicken','Paneer'],'unspecified',6,'Choose a veg, chicken or paneer patty.')
 ]),
 cat('Burger Meal','Burgers',[
 two('Veg Burger Meal',230,245,'veg',6,undefined,['Small/Normal','With Cheese']),two('Chicken Burger Meal',245,260,'non-veg',6,undefined,['Small/Normal','With Cheese']),two('Chicken Zinger Burger Meal',275,290,'non-veg',6,undefined,['Small/Normal','With Cheese']),two('Paneer Burger Meal',260,275,'veg',6,undefined,['Small/Normal','With Cheese'])
 ],'Burger + Salted Fries + Fresh Lemonade'),
 cat('Mediterranean Healthy Salads','Salads',[
 single('Veg Caesar Salad',235,'veg',6,'Contains Virgin Olive Oil Dressing, Feta Cheese & Quinoa'),single('Chicken Caesar Salad',290,'non-veg',6,'Contains Virgin Olive Oil Dressing, Feta Cheese & Quinoa'),single('Egg Caesar Salad',255,'egg',6,'Contains Virgin Olive Oil Dressing, Feta Cheese, Quinoa & Boiled Eggs')
 ]),
 cat('High Protein Non-Veg Combo Meal','Rice',[single('High Protein Non-Veg Combo Meal',349,'non-veg',6,'1 Grill Full Joint or 2 Grill Drum Sticks; 250 g Ghee Pulav Rice; Chicken Dum Masala; Boiled Egg; English Caesar Salad; Curd Raitha & Kaju Till Ki Katta','rice')]),
 cat('Quinoa Curd Rice','Rice',[single('Quinoa Curd Rice',175,'veg',6,'Curd Rice Is Made With Whole Quinoa Grains With Hung Curd, Season with perfection. The menu describes it as a source of rich fiber, protein, calcium, low glycemic index, gluten free, a great magnesium source and packed with vitamins and minerals.','rice')]),
 cat('Basmathi Ghee Pulav','Rice',[
 pulav('Basmathi Veg Ghee Pulav',[185,350,650],'veg',7,'Healthy Protein Veg Masala cooked with Nutri Soya Keema, assorted vegetables, ghee, paneer, cashew, almonds, Kaju & Till ki Khatta, Curd Raitha, Onion Salad.'),pulav('Basmathi Egg Ghee Pulav',[185,345,645],'egg',7,'Chef special Egg Dum Ki Masala, Kaju & Till ki Khatta, Curd Raitha, Onion Salad.'),pulav('Basmathi Chicken Ghee Pulav',[210,375,690],'non-veg',7,'Dhum Cooked Chicken with Chef Spl Masala, Chicken, Boiled Egg, Kaju & Till ki Khatta, Curd Raitha, Onion Salad.'),single('Extra Basmathi Rice',100,'veg',7)
 ]),
 cat('Chittimutyalu Ghee Pulav','Rice',[
 pulav('Chittimutyalu Veg Ghee Pulav',[200,370,650],'veg',8,'Aromatic Chittimutyalu or Gobind Bhog Rice with Kongu style semi gravy Masala, ghee, paneer, Nutri Soya Keema, cashew, almond, assorted vegetables, Curd Raitha, Onion Salad.'),pulav('Chittimutyalu Egg Ghee Pulav',[200,370,650],'egg',8,'Chef special Egg Dum Ki Masala, Kaju & Till ki Khatta, Curd Raitha, Onion Salad.'),pulav('Chittimutyalu Chicken Ghee Pulav',[230,420,750],'non-veg',8,'Dhum Cooked Chicken with Chef Spl Masala, Chicken, Boiled Egg, Kaju & Till ki Khatta, Curd Raitha, Onion Salad.'),single('Extra Chittimutyalu Rice',120,'veg',8)
 ]),
 cat('Real Fruit Milk Shakes','Drinks',[
 ...(['Banana','Strawberry','Mango','Avacado'] as const).map((n,i)=>({...single(n,[130,150,150,180][i],'veg',9,undefined,'drinks'),id:`fruit-${slug(n)}`})),single('Rich Dry Fruit Shake',190,'veg',9,'Contains 130 gms of Dry Fruits','drinks')
 ]),
 cat('Milk Shakes','Drinks',[
 ...['Alphanso Mango','Belgium Chocolate','Cold Coffee Shake','Choco Brownie Shake','Butter Scotch','Oreo Shake','Kit Kat Shake'].map((n,i)=>({...single(n,[130,150,150,150,140,150,160][i],'unspecified',9,undefined,'drinks'),id:`shake-${slug(n)}`}))
 ]),
 cat('Mojitos','Drinks',['Classic Mint','Pina Colada','Raspberry','Watermelon','Blue Curacao','Dazzling Peach'].map(n=>single(n,85,'veg',9,undefined,'drinks'))),
 cat('Coolers','Drinks',[
 ...['Pudina Lemon','Jeera Masala','Masala Kala Katta','Fresh Lemon Soda','Fresh Lemonade'].map((n,i)=>single(n,[70,70,70,50,45][i],'veg',9,undefined,'drinks')),
 {...row('Soft Drinks & Water Bottles',[null],['MRP'],'unspecified',9),note:'At printed MRP. Ask for available brands and bottle sizes.'}
 ]),
 cat('Desserts','Desserts',[
 ...['Choco Lava Cake','Chocolate Brownie','Chocolate Brownie with Vanilla Ice Cream','Sizzling Brownie with Vanilla Ice Cream','Gulab Jamun 3 Pcs','Gulab Jamun 2 Pcs With Vanilla Ice Cream','Rabdi Kheer','Gulab Jamun 2 Pcs With Rabdi'].map((n,i)=>single(n,[75,80,130,150,80,90,80,130][i],'unspecified',9,undefined,'desserts'))
 ]),
 cat('Ice Creams','Desserts',['Vanilla','Strawberry','Mango','Belgium Chocolate','Butter Scotch'].map((n,i)=>({...single(n,[60,70,75,80,70][i],'unspecified',9,undefined,'desserts'),id:`icecream-${slug(n)}`})))
];
// Category-aware illustrative assets; never show a chicken visual for a vegetarian dish.
for (const category of menuCategories) for (const item of category.items) {
 if(category.id==='non-veg-pizza') item.image='chickenPizza';
 if(category.id==='grill-chicken' && item.diet==='non-veg') item.image='grill';
 if(category.id.includes('garlic-bread')) item.image='garlic';
 if(item.id==='cheesy-loaded-fries') item.image='fries';
 if(item.name.startsWith('Chittimutyalu') && item.diet==='non-veg') item.image='chittimutyalu';
 if(category.group==='Rice' && item.diet==='veg') item.image='vegRice';
 if(category.group==='Rice' && item.diet==='egg') item.image=undefined;
 if(category.group==='Burgers' && item.diet==='veg') item.image=undefined;
 if(category.id==='ice-creams') item.image='iceCream';
 if(category.id==='desserts' && !/Brownie|Lava/.test(item.name)) item.image=undefined;
}
export const menuItems=menuCategories.flatMap(c=>c.items);
export const formatPrice=(p:number|null)=>p===null?'Please confirm':`₹${p}`;
export const findItem=(id:string)=>menuItems.find(i=>i.id===id)!;

