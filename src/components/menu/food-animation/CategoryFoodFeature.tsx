'use client';
import {useMemo,useRef} from 'react';
import {useScroll} from 'motion/react';
import {ArrowUpRight} from 'lucide-react';
import {getMenuItemAnimation as getMenuAnimation} from '@/lib/menu-animation-resolver';
import {formatPrice,type MenuItem} from '@/data/menu-data';
import {DietIcon} from '@/components/ui/Motion';
import {FoodAnimationStage} from './FoodAnimationStage';
export function CategoryFoodFeature({item,sizeIndex=0,onSelect,alreadyPlayed,onPlayed}:{item:MenuItem;sizeIndex?:number;onSelect:()=>void;alreadyPlayed:boolean;onPlayed:()=>void}){
 const ref=useRef<HTMLDivElement>(null);const {scrollYProgress}=useScroll({target:ref,offset:['start end','end center']});const config=useMemo(()=>getMenuAnimation(item),[item]);if(!config)return null;
 const size=item.sizes[sizeIndex]||item.sizes[0];
 return <div ref={ref} className="live-food-feature" data-feature={item.id}>
 <div className="live-food-feature-copy"><span className="eyebrow">WATCH IT COME TOGETHER</span><h3>{config.headline}</h3><p>{config.subheadline}</p><button className="live-feature-dish" onClick={onSelect}><span><DietIcon diet={item.diet}/>{item.name}</span><strong>{formatPrice(size.price)} <small>{size.label}</small></strong><ArrowUpRight size={20}/></button></div>
 <FoodAnimationStage key={item.id} config={config} itemName={item.name} withCheese={size.label==='With Cheese'} alreadyPlayed={alreadyPlayed} onPlayed={onPlayed} progress={scrollYProgress} scrollDriven={config.triggerMode==='scroll'}/>
 </div>;
}
