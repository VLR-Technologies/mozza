'use client';
import {useState} from 'react';
import {ArrowUpRight, MapPin} from 'lucide-react';
import {Modal} from '@/components/ui/Modal';
import {MenuDietMarker} from './MenuItemRow';
import {type MenuItem,formatPrice} from '@/data/menu-data';
import { useOrder } from '@/components/order/OrderProvider';
import { QuantityControl } from '@/components/order/QuantityControl';
import { orderBranches } from '@/lib/order-utils';
import {getMenuItemPhoto} from '@/data/menu-images';
import {StaticMenuImage} from './StaticMenuImage';
export function MenuItemModal({item,category,branch='Shadnagar',onClose,initialSize=0}:{item:MenuItem|null;category?:string;branch?:string;onClose:()=>void;initialSize?:number}){
 return <Modal open={!!item} onClose={onClose} title={item?.name||'Menu item'} className="menu-detail" animated sheet>{item&&<ItemDetail key={`${item.id}-${initialSize}`} item={item} category={category} branch={branch} initialSize={initialSize}/>}</Modal>;
}
function ItemDetail({item,category,branch,initialSize}:{item:MenuItem;category?:string;branch:string;initialSize:number}){
 const order = useOrder();
 const [quantity,setQuantity]=useState(1);
 const [notice,setNotice]=useState('');
 const canOrder=orderBranches.some(b=>b.name===branch);
 const [size,setSize]=useState(initialSize);
 const choice=item?.sizes[size]||item?.sizes[0];
 return <><StaticMenuImage photo={getMenuItemPhoto(item)} className="detail-image menu-detail-image" sizes="(max-width: 600px) 100vw, 620px"/><span className="kicker">{category||'From the Mozza Italia menu'}</span><div className="item-title"><MenuDietMarker item={item}/><h2>{item.name}</h2></div>{item.description&&<p>{item.description}</p>}{item.note&&<p className="item-note">{item.note}</p>}<p className="detail-branch"><MapPin size={15}/> Ordering for {branch}</p><fieldset className="size-options"><legend>Choose your serving</legend>{item.sizes.map((s,i)=><label key={s.label}><input type="radio" name="serving" checked={choice===s} onChange={()=>setSize(i)}/><span>{s.label}{s.detail&&<small>{s.detail}</small>}</span><strong>{s.label==='MRP'?'MRP':formatPrice(s.price)}</strong></label>)}</fieldset>{item.manualVerification&&<p className="verification-note">Please confirm the price with our team before ordering.</p>}<QuantityControl value={quantity} onChange={setQuantity}/><button className="button button-primary button-full" disabled={!canOrder} onClick={()=>{try{order.add({menuItemId:item.id,variant:size,quantity});setNotice('Added to your order. Close this detail to choose another dish.');}catch(e){setNotice((e as Error).message);}}}>Add to order <ArrowUpRight size={18}/></button>{!canOrder&&<p>Ordering is currently available for Shadnagar. Choose Shadnagar in the menu outlet selector.</p>}{notice&&<p role="status">{notice}</p>}<p className="detail-footnote">Our verified WhatsApp contact will confirm the selected outlet, availability and ordering details. Food imagery is illustrative.</p></>;
}
