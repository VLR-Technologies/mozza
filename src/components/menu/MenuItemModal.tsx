'use client';
import {useState} from 'react';
import {ArrowUpRight, MapPin} from 'lucide-react';
import {Modal} from '@/components/ui/Modal';
import {MenuDietMarker} from './MenuItemRow';
import {type MenuItem,formatPrice} from '@/data/menu-data';
import {itemOrderUrl} from '@/config/restaurant';
import {getMenuItemPhoto} from '@/data/menu-images';
import {StaticMenuImage} from './StaticMenuImage';
export function MenuItemModal({item,category,branch='Shadnagar',onClose,initialSize=0}:{item:MenuItem|null;category?:string;branch?:string;onClose:()=>void;initialSize?:number}){
 return <Modal open={!!item} onClose={onClose} title={item?.name||'Menu item'} className="menu-detail" animated sheet>{item&&<ItemDetail key={`${item.id}-${initialSize}`} item={item} category={category} branch={branch} initialSize={initialSize}/>}</Modal>;
}
function ItemDetail({item,category,branch,initialSize}:{item:MenuItem;category?:string;branch:string;initialSize:number}){
 const [size,setSize]=useState(initialSize);
 const choice=item?.sizes[size]||item?.sizes[0];
 return <><StaticMenuImage photo={getMenuItemPhoto(item)} className="detail-image menu-detail-image" sizes="(max-width: 600px) 100vw, 620px"/><span className="kicker">{category||'From the Mozza Italia menu'}</span><div className="item-title"><MenuDietMarker item={item}/><h2>{item.name}</h2></div>{item.description&&<p>{item.description}</p>}{item.note&&<p className="item-note">{item.note}</p>}<p className="detail-branch"><MapPin size={15}/> Ordering for {branch}</p><fieldset className="size-options"><legend>Choose your serving</legend>{item.sizes.map((s,i)=><label key={s.label}><input type="radio" name="serving" checked={choice===s} onChange={()=>setSize(i)}/><span>{s.label}{s.detail&&<small>{s.detail}</small>}</span><strong>{s.label==='MRP'?'MRP':formatPrice(s.price)}</strong></label>)}</fieldset>{item.manualVerification&&<p className="verification-note">Please confirm the price with our team before ordering.</p>}<a className="button button-primary button-full" href={itemOrderUrl(item.name,choice?.label,branch)} target="_blank" rel="noreferrer">Order this on WhatsApp <ArrowUpRight size={18}/></a><p className="detail-footnote">Our verified WhatsApp contact will confirm the selected outlet, availability and ordering details. Food imagery is illustrative.</p></>;
}
