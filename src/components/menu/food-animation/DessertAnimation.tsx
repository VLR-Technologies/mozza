import {IngredientLayer} from './IngredientLayer';
import {animationAssets} from '@/data/menu-animation-data';
import type {SceneProps} from './types';
import {Steam} from './RiceReveal';
export function DessertAnimation({config}:SceneProps){return <div className="fa-dessert fa-composition"><IngredientLayer src={animationAssets.dessert.brownie} className="fa-brownie"/>{config.variant!=='plain'&&<><IngredientLayer src={animationAssets.dessert.scoop} className="fa-scoop"/><svg className="fa-chocolate-sauce" viewBox="0 0 500 400" fill="none" aria-hidden="true"><path d="M212 125 Q260 105 292 133 Q310 145 265 159 Q212 175 309 190 Q335 198 315 216" stroke="#4b2010" strokeWidth="5" strokeLinecap="round" pathLength="1"/></svg><div className="fa-frost-highlight"/></>}<Steam/></div>;}
