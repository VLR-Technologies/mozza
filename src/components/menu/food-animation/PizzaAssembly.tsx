import {IngredientLayer} from './IngredientLayer';
import {animationAssets,ingredientAssets} from '@/data/menu-animation-data';
import type {SceneProps} from './types';
const spots=[[32,32],[59,30],[47,43],[26,56],[65,53],[48,66],[70,39],[36,71],[23,42],[59,72],[43,25],[72,65]];
export function PizzaAssembly({config}:SceneProps){
  const toppings=config.ingredients.flatMap((ingredient,i)=>[{ingredient,spot:spots[(i+(config.seed||0))%spots.length],delay:.95+i*.07},{ingredient,spot:spots[(i+5+(config.seed||0))%spots.length],delay:1.3+i*.065}]).slice(0,12);
  return <div className="fa-pizza fa-composition"><div className="fa-oven-glow"/><div className="fa-pizza-tilt"><IngredientLayer src={animationAssets.pizza.base} className="fa-pizza-base"/><IngredientLayer src={animationAssets.pizza.sauce} className="fa-pizza-sauce"/><IngredientLayer src={animationAssets.pizza.cheese} className="fa-pizza-cheese"/><IngredientLayer src={animationAssets.pizza.finished} className="fa-pizza-finished"/><div className="fa-shreds">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${25+(i*13)%49}%`,top:`${30+(i*17)%40}%`,'--delay':`${.5+i*.055}s`,'--angle':`${i*43}deg`} as React.CSSProperties}/>)}</div>{toppings.map(({ingredient,spot,delay},i)=><IngredientLayer key={`${ingredient}-${i}`} src={ingredientAssets[ingredient]} className="fa-topping" style={{left:`${spot[0]}%`,top:`${spot[1]}%`,'--delay':`${delay}s`,'--angle':`${(i*47)%150-75}deg`,'--fall-x':`${i%2?24:-28}px`}}/>)}</div></div>;
}
