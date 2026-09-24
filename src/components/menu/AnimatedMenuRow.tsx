'use client';
import {useRef,type CSSProperties} from 'react';
import {useInView} from 'motion/react';
import {ArrowUpRight} from 'lucide-react';
import {DietIcon} from '@/components/ui/Motion';
import {menuVisualRegistry} from '@/data/menu-visual-registry';
import {type MenuItem,formatPrice} from '@/data/menu-data';
import {FoodAnimationStage} from './food-animation/FoodAnimationStage';
export function MenuDietMarker({item}:{item:MenuItem}){return item.diet==='unspecified'?<span className="diet-neutral" aria-label="Dietary status unspecified; ask the restaurant">?</span>:<DietIcon diet={item.diet}/>;}
export function AnimatedMenuRow({item,index,onSelect}:{item:MenuItem;index:number;onSelect:()=>void}){
 const ref=useRef<HTMLButtonElement>(null);const entered=useInView(ref,{amount:.15,once:true});
 return <button ref={ref} type="button" className="menu-row visual-menu-row" data-entered={entered} data-item-id={item.id} style={{'--row-delay':`${index%3*.06}s`} as CSSProperties} onClick={onSelect} aria-label={`View ${item.name}`}><div className="menu-thumbnail"><FoodAnimationStage config={menuVisualRegistry[item.id]} itemName={item.name} mode="thumbnail"/></div><div className="menu-row-copy"><div className="menu-name"><MenuDietMarker item={item}/><h3>{item.name}</h3></div>{item.description&&<p>{item.description}</p>}{item.note&&<small>{item.note}</small>}<span className="row-order-label">View & order <ArrowUpRight size={12}/></span></div><div className="row-prices">{item.sizes.map(s=><span key={s.label}><small>{s.label}</small><strong>{s.label==='MRP'?'MRP':formatPrice(s.price)}</strong></span>)}<ArrowUpRight className="row-arrow" size={17}/></div></button>;
}
