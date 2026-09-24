'use client';
import {useState,useMemo} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {Modal} from '@/components/ui/Modal';
import {MenuDietMarker} from './AnimatedMenuRow';
import {type MenuItem,formatPrice} from '@/data/menu-data';
import {itemOrderUrl} from '@/config/restaurant';
import {getMenuItemAnimation as getMenuAnimation} from '@/lib/menu-animation-resolver';
import {FoodAnimationStage} from './food-animation/FoodAnimationStage';
export function MenuItemModal({item,category,onClose,initialSize=0}:{item:MenuItem|null;category?:string;onClose:()=>void;initialSize?:number}){
 return <Modal open={!!item} onClose={onClose} title={item?.name||'Menu item'} className="menu-detail" animated sheet>{item&&<ItemDetail key={`${item.id}-${initialSize}`} item={item} category={category} initialSize={initialSize}/>}</Modal>;
}
function ItemDetail({item,category,initialSize}:{item:MenuItem;category?:string;initialSize:number}){
 const [size,setSize]=useState(initialSize);
 const config=useMemo(()=>getMenuAnimation(item),[item]);
 const choice=item?.sizes[size]||item?.sizes[0];
 return <>{config?<FoodAnimationStage key={`${item.id}-${choice?.label}`} config={config.variant==='patty'?{...config,garnish:choice?.label.toLowerCase().includes('chicken')?'chicken':choice?.label.toLowerCase().includes('paneer')?'paneer':'veg'}:config} itemName={item.name} mode="detail" withCheese={choice?.label==='With Cheese'}/>:null}<span className="eyebrow">{category||'FROM THE MOZZA ITALIA MENU'}</span><div className="item-title"><MenuDietMarker item={item}/><h2>{item.name}</h2></div>{item.description&&<p>{item.description}</p>}{item.note&&<p className="item-note">{item.note}</p>}<fieldset className="size-options"><legend>Choose your serving</legend>{item.sizes.map((s,i)=><label key={s.label}><input type="radio" name="serving" checked={choice===s} onChange={()=>setSize(i)}/><span>{s.label}{s.detail&&<small>{s.detail}</small>}</span><strong>{s.label==='MRP'?'MRP':formatPrice(s.price)}</strong></label>)}</fieldset>{item.manualVerification&&<p className="verification-note">Please confirm the price with our team before ordering.</p>}<a className="button red full" href={itemOrderUrl(item.name,choice?.label)} target="_blank" rel="noreferrer">Order this on WhatsApp <ArrowUpRight size={18}/></a><p className="detail-footnote">Our team will confirm availability and ordering details. Food imagery is illustrative.</p></>;
}
