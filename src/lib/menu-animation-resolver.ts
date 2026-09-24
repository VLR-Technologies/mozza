import {menuCategories,type MenuItem} from '@/data/menu-data';
import {foodVisuals} from '@/data/food-visuals';
import {getMenuAnimation,type FoodAnimationConfig,type FoodAnimationType} from '@/data/menu-animation-data';
const categories=new Map(menuCategories.flatMap(c=>c.items.map(i=>[i.id,c] as const)));
function flavour(name:string){
 const n=name.toLowerCase();
 const choices:[RegExp,string,string][]=[[/blue curacao/,'#53bcd2','none'],[/raspberry|strawberry/,'#df6a88','berry'],[/watermelon/,'#df6963','watermelon'],[/peach/,'#e8a76d','peach'],[/mango/,'#edba3b','mango'],[/banana/,'#e6d492','banana'],[/avacado/,'#adbf7e','avocado'],[/coffee/,'#96704e','coffee'],[/chocolate|choco|kit kat/,'#895236','chocolate'],[/oreo/,'#c9b8a2','cookie'],[/butter scotch/,'#d0a15b','caramel'],[/dry fruit/,'#d4b78b','nuts'],[/mint|pudina/,'#adc76d','mint'],[/lemon/,'#d4d98b','lemon'],[/kala katta/,'#864260','none'],[/jeera/,'#b99764','none'],[/pina colada/,'#efe1b5','none']];
 return choices.find(([re])=>re.test(n))?.slice(1) as [string,string]||['#f1dfb3','none'];
}
/** Presentation only. Existing menu content and dietary classifications are never mutated. */
export function getMenuItemAnimation(item:MenuItem):FoodAnimationConfig {
 const c=categories.get(item.id);const n=item.name.toLowerCase();const text=`${n} ${item.description||''}`.toLowerCase();const flags:string[]=[];
 const [color,garnish]=flavour(n);let type:FoodAnimationType='snackBuild',family='snack',variant=item.diet==='non-veg'?'chicken':'veg';
 if(c?.id==='veg-pizza'||c?.id==='non-veg-pizza')return {...getMenuAnimation(item)!,itemId:item.id,family:'pizza',variant:item.id,cycleSeconds:10,seed:[...item.id].reduce((a,x)=>a+x.charCodeAt(0),0)};
 if(c?.group==='Burgers'&&item.id!=='extra-patty'){type='burgerAssembly';family='burger';variant=n.includes('zinger')?'zinger':n.includes('paneer')?'paneer':item.diet==='veg'?'veg':'chicken';if(n.includes('meal'))flags.push('meal');}
 else if(/fries|wedges/.test(n)){type='friesAssembly';family='fries';variant=n.includes('wedges')?'wedges':n.includes('cheesy')?'cheesy':n.includes('salted')?'salted':n.includes('peri')?'peri-peri':n.includes('chilli')?'chilli-garlic':'masala';if(/chees/.test(text))flags.push('cheese');if(/chicken/.test(text))flags.push('chicken');if(/paneer/.test(text))flags.push('paneer');}
 else if(c?.id==='bucket-deals'){type='bucketFill';family='bucket';variant=n.includes('crispy')?'mixed':'wings';flags.push(n.includes('bucket')?'large':'medium');if(text.includes('fries'))flags.push('fries');if(text.includes('dips'))flags.push('dip');}
 else if(c?.id==='dips'){type='dipBuild';family='dip';variant=n.includes('mustard')?'mustard-chipotle':'mayo-southwest';}
 else if(c?.id.includes('extra-toppings')||item.id==='extra-patty'){type='extraBuild';family='extras';variant=item.id==='extra-patty'?'patty':n.includes('paneer')?'paneer':item.diet==='non-veg'?'chicken':'cheese';}
 else if(c?.id.includes('garlic-bread')||item.id==='pita-bread'){type='breadBuild';family=c?.id==='stuffed-garlic-bread'?'stuffed-bread':'garlic-bread';variant=item.id==='pita-bread'?'pita':family==='stuffed-bread'?'stuffed':'slices';if(/cheese/.test(n))flags.push('cheese');if(n.includes('chicken'))flags.push('chicken');if(n.includes('paneer'))flags.push('paneer');}
 else if(c?.id==='broasted-chicken'||c?.id==='grill-chicken'||item.diet==='non-veg'&&c?.id==='non-veg-snacks'){type='chickenReveal';family='chicken';variant=n.includes('grill')?(n.includes('joint')?'grill-joint':'grill'):n.includes('wing')?'wing':n.includes('pop corn')?'popcorn':n.includes('tender')?'tender':n.includes('nugget')?'nugget':n.includes('balls')?'balls':'drumstick';if(n.includes('cheesy'))flags.push('cheese');}
 else if(c?.group==='Rice'){type='riceReveal';family='rice';variant=item.id==='quinoa-curd-rice'?'quinoa':n.startsWith('extra')?'plain':item.diet;flags.push(n.includes('chittimutyalu')?'short-grain':'basmathi');if(/boiled egg/.test(text))flags.push('egg');if(/paneer/.test(text))flags.push('paneer');if(n.includes('combo'))flags.push('combo');}
 else if(c?.group==='Salads'){type='saladBuild';family='salad';variant=item.diet;if(/olive oil/.test(text))flags.push('dressing');if(/feta/.test(text))flags.push('feta');if(/quinoa/.test(text))flags.push('quinoa');}
 else if(c?.group==='Drinks'){type='drinkBuild';family=c.id==='mojitos'?'mojito':c.id==='coolers'?'cooler':c.id==='real-fruit-milk-shakes'?'fruit-shake':'milkshake';variant=item.id==='soft-drinks-water-bottles'?'bottles':n.includes('coffee')?'cold-coffee':family.includes('shake')?'shake':'cooler';if(garnish==='mint')flags.push('mint','lemon');else if(garnish==='lemon')flags.push('lemon');}
 else if(c?.id==='ice-creams'){type='iceCreamBuild';family='ice-cream';variant=item.id;}
 else if(c?.group==='Desserts'){type=/brownie/.test(n)?'dessertReveal':'sweetBuild';family='dessert';variant=n.includes('brownie')?(n.includes('ice cream')?'icecream':'plain'):n.includes('lava')?'lava':n.includes('gulab')?'jamun':'rabdi';if(n.includes('ice cream'))flags.push('icecream');if(n.includes('rabdi'))flags.push('rabdi');if(n.includes('3 pcs'))flags.push('three');if(n.includes('sizzling'))flags.push('steam');}
 else {variant=n.includes('fingers')?'fingers':n.includes('nuggets')?'nuggets':item.diet==='non-veg'?'chicken':'veg';}
 const old=getMenuAnimation(item);
 return {animationType:type,family,variant,flags,color,garnish,itemId:item.id,ingredients:[],visual:old?.visual||foodVisuals[item.image||'fries'],headline:old?.headline||'YOUR NEXT CRAVING.',subheadline:old?.subheadline||'Made for a delicious little pause.',accentColor:color,triggerMode:'enter',cycleSeconds:type==='burgerAssembly'?10:type==='drinkBuild'?9:8,seed:[...item.id].reduce((a,x)=>a+x.charCodeAt(0),0)};
}
