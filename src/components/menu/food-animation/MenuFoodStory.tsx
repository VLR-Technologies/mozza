'use client';
import {useMemo,useRef,useState,useEffect} from 'react';
import {useInView,useScroll} from 'motion/react';
import {ArrowUpRight} from 'lucide-react';
import {foodStoryItems} from '@/data/menu-animation-data';
import {getMenuItemAnimation as getMenuAnimation} from '@/lib/menu-animation-resolver';
import {findItem,formatPrice,type MenuItem} from '@/data/menu-data';
import {FoodAnimationStage} from './FoodAnimationStage';
export function MenuFoodStory({onSelect}:{onSelect:(item:MenuItem,sizeIndex?:number)=>void}){
 const [step,setStep]=useState(0);
 return <section id="food-story" className="live-menu-story" aria-label="From craving to plate"><div className="live-story-heading"><span className="eyebrow">FIVE MOODS. ONE TABLE.</span><h2>FROM CRAVING<br/>TO <em>PLATE.</em></h2><p>A slice. A stack. A crunch.<br/>Watch your favourites come together.</p><div className="live-story-steps" aria-label="Food story progress">{['Pizza','Burger','Chicken','Pulav','Drink'].map((name,i)=><a key={name} href={`#live-story-${i}`} aria-current={step===i?'step':undefined}><span>0{i+1}</span>{name}</a>)}</div><a href="#main" className="text-link">Back to the menu ↑</a></div><div className="live-story-scenes">{foodStoryItems.map((id,i)=><StoryChapter key={id} id={id} index={i} onEnter={()=>setStep(i)} onSelect={onSelect}/>)}</div></section>;
}
function StoryChapter({id,index,onEnter,onSelect}:{id:string;index:number;onEnter:()=>void;onSelect:(item:MenuItem,sizeIndex?:number)=>void}){
 const ref=useRef<HTMLDivElement>(null);const inView=useInView(ref,{amount:.5});const {scrollYProgress}=useScroll({target:ref,offset:['start end','end center']});const item=findItem(id);const config=useMemo(()=>getMenuAnimation(item)!,[item]);
 useEffect(()=>{if(inView){const frame=requestAnimationFrame(onEnter);return()=>cancelAnimationFrame(frame);}},[inView,onEnter]);
 return <div ref={ref} id={`live-story-${index}`} className="live-story-chapter" data-current={inView}><span className="live-chapter-number">0{index+1}</span><FoodAnimationStage config={config} itemName={item.name} mode="story" progress={scrollYProgress} scrollDriven={config.triggerMode==='scroll'} withCheese={id==='chicken-zinger-burger'} onPlayed={onEnter}/><button className="live-story-caption" onClick={()=>onSelect(item,id==='chicken-zinger-burger'?1:0)}><span>{item.name}</span><strong>{formatPrice(item.sizes[id==='chicken-zinger-burger'?1:0].price)}<small>{id==='chicken-zinger-burger'?'With Cheese':item.sizes[0].label}</small></strong><ArrowUpRight/></button></div>;
}
