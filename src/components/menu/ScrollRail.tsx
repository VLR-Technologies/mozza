'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
export function ScrollRail({children,label,className=''}:{children:ReactNode;label:string;className?:string}) {
 const ref=useRef<HTMLDivElement>(null);const [edges,setEdges]=useState({left:false,right:false});
 useEffect(()=>{const el=ref.current;if(!el)return;const update=()=>setEdges({left:el.scrollLeft>4,right:el.scrollLeft+el.clientWidth<el.scrollWidth-4});const observer=new ResizeObserver(update);observer.observe(el);for(const child of el.children)observer.observe(child);el.addEventListener('scroll',update,{passive:true});update();return()=>{observer.disconnect();el.removeEventListener('scroll',update);};},[children]);
 const move=(direction:number)=>{const el=ref.current;if(el)el.scrollBy({left:direction*el.clientWidth*.7,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});};
 return <div className="menu-rail" data-left={edges.left} data-right={edges.right}><div ref={ref} className={`menu-rail-track ${className}`} aria-label={label}>{children}</div><button className="rail-arrow rail-left" type="button" aria-label={`Scroll ${label.toLowerCase()} left`} disabled={!edges.left} onClick={()=>move(-1)}><ChevronLeft size={17}/></button><button className="rail-arrow rail-right" type="button" aria-label={`Scroll ${label.toLowerCase()} right`} disabled={!edges.right} onClick={()=>move(1)}><ChevronRight size={17}/></button></div>;
}
