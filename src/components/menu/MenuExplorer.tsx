'use client';
import {useEffect,useMemo,useState,useRef} from 'react';
import {Search,X,Download,MapPin} from 'lucide-react';
import {menuCategories,menuItems,type MenuItem} from '@/data/menu-data';
import {branches} from '@/config/restaurant';
import {DietIcon} from '@/components/ui/DietIcon';
import {MenuItemModal} from './MenuItemModal';
import {MenuItemRow} from './MenuItemRow';
import {ScrollRail} from './ScrollRail';
import './menu-images.css';
const groups=['All','Pizza','Chicken','Burgers','Rice','Snacks','Salads','Drinks','Desserts'];
export function MenuExplorer({initialQuery='',initialGroup='All',initialBranch='shadnagar',initialItem=''}:{initialQuery?:string;initialGroup?:string;initialBranch?:string;initialItem?:string}){
 const root=useRef<HTMLDivElement>(null);
 const [query,setQuery]=useState(initialQuery);const [group,setGroup]=useState(groups.includes(initialGroup)?initialGroup:'All');const [diet,setDiet]=useState('all');const [active,setActive]=useState('');
 const [branch,setBranch]=useState(branches.some(item=>item.id===initialBranch)?initialBranch:'shadnagar');
 const initialSelected=menuItems.find(item=>item.id===initialItem);
 const [selected,setSelected]=useState<{item:MenuItem;category:string;sizeIndex?:number}|null>(()=>initialSelected?{item:initialSelected,category:menuCategories.find(category=>category.items.some(item=>item.id===initialSelected.id))?.name||''}:null);
 useEffect(()=>{const element=root.current;const controls=element?.querySelector<HTMLElement>('.menu-controls');if(!element||!controls)return;const observer=new ResizeObserver(()=>element.style.setProperty('--menu-controls-height',`${controls.offsetHeight}px`));observer.observe(controls);return()=>observer.disconnect();},[]);
 const categories=useMemo(()=>menuCategories.map(c=>({...c,items:c.items.filter(i=>(group==='All'||c.group===group)&&(diet==='all'||(diet==='non-veg'?(i.diet==='non-veg'||i.diet==='egg'):i.diet===diet))&&`${i.name} ${i.description||''} ${c.name}`.toLowerCase().includes(query.toLowerCase().trim()))})).filter(c=>c.items.length),[query,group,diet]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(e.target.id);},{rootMargin:'-190px 0px -55% 0px',threshold:0});root.current?.querySelectorAll('[data-menu-section]').forEach(e=>observer.observe(e));return()=>observer.disconnect();},[categories]);
 const returnToResults=(smooth=false)=>requestAnimationFrame(()=>{const hero=document.querySelector<HTMLElement>('.menu-page-hero');if(hero)window.scrollTo({top:hero.offsetHeight-(window.innerWidth<=600?74:86),behavior:smooth&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant'});});
 const count=categories.reduce((a,c)=>a+c.items.length,0);
 const activeBranch=branches.find(item=>item.id===branch)||branches[1];
 return <div ref={root} className="menu-experience">
  <div className="menu-controls"><div className="search-row">
   <label className="search-box"><Search size={20}/><input aria-label="Search the menu" value={query} onChange={e=>{setQuery(e.target.value);returnToResults();}} placeholder="Pizza, pulav, your next craving…"/>{query&&<button onClick={()=>{setQuery('');returnToResults();}} aria-label="Clear search"><X size={18}/></button>}</label>
   <div className="diet-filters" aria-label="Dietary filter">{[['all','All'],['veg','Veg'],['non-veg','Non-veg & egg']].map(([value,label])=><button key={value} aria-pressed={diet===value} onClick={()=>{setDiet(value);returnToResults(true);}}>{value!=='all'&&<DietIcon diet={value as 'veg'|'non-veg'}/>} {label}</button>)}</div>
  </div><ScrollRail className="group-pills" label="Food type">{groups.map(g=><button key={g} aria-pressed={group===g} onClick={()=>{setGroup(g);returnToResults(true);}}>{g}</button>)}</ScrollRail></div>
  <div className="menu-layout"><aside className="category-nav"><span className="kicker">Menu categories</span><ScrollRail className="category-rail" label="Menu categories"><nav aria-label="Menu categories">{categories.map(c=><a className={active===c.id?'active':''} aria-current={active===c.id?'location':undefined} href={`#${c.id}`} key={c.id} onClick={()=>setActive(c.id)}>{c.name}<span>{c.items.length.toString().padStart(2,'0')}</span></a>)}</nav></ScrollRail><a className="download-menu" href="/menu/mozza-italia-menu.pdf" target="_blank" rel="noreferrer"><Download size={16}/> Original menu PDF</a></aside>
   <div className="menu-results"><div className="menu-results-top"><div className="results-count" aria-live="polite">{count} menu entries <span>Prices in Indian rupees</span></div><label className="menu-branch"><MapPin size={15}/><span>Ordering for</span><select value={branch} onChange={event=>setBranch(event.target.value)}>{branches.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
   {!count&&<div className="empty-state"><h2>Another craving?</h2><p>No matches for this search. Try a dish name or explore the full menu.</p><button className="button button-primary" onClick={()=>{setQuery('');setDiet('all');setGroup('All');returnToResults(true);}}>Reset filters</button></div>}
   {categories.map(c=><section className="menu-section" id={c.id} key={c.id} data-menu-section><div className="menu-section-title"><div><span className="kicker">{c.group}</span><h2>{c.name}</h2></div><span>{c.items.length.toString().padStart(2,'0')}</span></div>{c.note&&<p className="category-note">{c.note}</p>}<div className="menu-rows">{c.items.map(item=><MenuItemRow key={item.id} item={item} onSelect={()=>setSelected({item,category:c.name})}/>)}</div></section>)}
   <p className="menu-disclaimer">For dietary requirements, allergens, taxes and current availability, please speak with our team. Items without a dietary marker need ingredient confirmation.</p></div>
  </div><MenuItemModal item={selected?.item||null} category={selected?.category} branch={activeBranch.name} initialSize={selected?.sizeIndex} onClose={()=>setSelected(null)}/>
 </div>;
}
