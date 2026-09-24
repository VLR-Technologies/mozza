'use client';
import {useEffect,useMemo,useState,useRef} from 'react';
import {Search,ArrowUpRight,X,Download,Sparkles} from 'lucide-react';
import {menuCategories,type MenuItem} from '@/data/menu-data';
import {featuredMenuCategories} from '@/data/menu-images';
import {DietIcon} from '@/components/ui/Motion';
import {MenuItemModal} from './MenuItemModal';
import {CategoryFoodFeature} from './CategoryFoodFeature';
import {MenuFoodShowcase} from './MenuFoodShowcase';
import {MenuItemRow} from './MenuItemRow';
import {ScrollRail} from './ScrollRail';
import './menu-images.css';
const groups=['All','Pizza','Chicken','Burgers','Rice','Snacks','Salads','Drinks','Desserts'];
export function MenuExplorer(){
 const root=useRef<HTMLDivElement>(null);
 const [query,setQuery]=useState('');const [group,setGroup]=useState('All');const [diet,setDiet]=useState('all');const [active,setActive]=useState('');
 const [selected,setSelected]=useState<{item:MenuItem;category:string;sizeIndex?:number}|null>(null);
 useEffect(()=>{const element=root.current;const controls=element?.querySelector<HTMLElement>('.menu-controls');if(!element||!controls)return;const observer=new ResizeObserver(()=>element.style.setProperty('--menu-controls-height',`${controls.offsetHeight}px`));observer.observe(controls);return()=>observer.disconnect();},[]);
 const categories=useMemo(()=>menuCategories.map(c=>({...c,items:c.items.filter(i=>(group==='All'||c.group===group)&&(diet==='all'||(diet==='non-veg'?(i.diet==='non-veg'||i.diet==='egg'):i.diet===diet))&&`${i.name} ${i.description||''} ${c.name}`.toLowerCase().includes(query.toLowerCase().trim()))})).filter(c=>c.items.length),[query,group,diet]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(e.target.id);},{rootMargin:'-190px 0px -55% 0px',threshold:0});root.current?.querySelectorAll('[data-menu-section]').forEach(e=>observer.observe(e));return()=>observer.disconnect();},[categories]);
 const returnToResults=(smooth=false)=>requestAnimationFrame(()=>{const hero=document.querySelector<HTMLElement>('.menu-page-hero');if(hero)window.scrollTo({top:hero.offsetHeight-(window.innerWidth<=600?74:86),behavior:smooth&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant'});});
 const showItem=(item:MenuItem,sizeIndex=0)=>setSelected({item,sizeIndex,category:menuCategories.find(c=>c.items.some(i=>i.id===item.id))?.name||''});
 const count=categories.reduce((a,c)=>a+c.items.length,0);
 return <><div ref={root} className="menu-experience">
  <div className="menu-controls"><div className="search-row">
   <label className="search-box"><Search size={20}/><input aria-label="Search the menu" value={query} onChange={e=>{setQuery(e.target.value);returnToResults();}} placeholder="Pizza, pulav, your next craving…"/>{query&&<button onClick={()=>{setQuery('');returnToResults();}} aria-label="Clear search"><X size={18}/></button>}</label>
   <div className="diet-filters" aria-label="Dietary filter">{[['all','All'],['veg','Veg'],['non-veg','Non-veg & egg']].map(([value,label])=><button key={value} aria-pressed={diet===value} onClick={()=>{setDiet(value);returnToResults(true);}}>{value!=='all'&&<DietIcon diet={value as 'veg'|'non-veg'}/>} {label}</button>)}</div>
  </div><ScrollRail className="group-pills" label="Food type">{groups.map(g=><button key={g} aria-pressed={group===g} onClick={()=>{setGroup(g);returnToResults(true);}}>{g}</button>)}</ScrollRail></div>
  <div className="menu-layout"><aside className="category-nav"><span className="eyebrow">WHAT ARE YOU CRAVING?</span><ScrollRail className="category-rail" label="Menu categories"><nav aria-label="Menu categories">{categories.map(c=><a className={active===c.id?'active':''} aria-current={active===c.id?'location':undefined} href={`#${c.id}`} key={c.id} onClick={()=>setActive(c.id)}>{c.name}<span>{c.items.length.toString().padStart(2,'0')}</span></a>)}</nav></ScrollRail><a className="download-menu" href="/menu/mozza-italia-menu.pdf" target="_blank" rel="noreferrer"><Download size={16}/> Original menu PDF</a>{group==='All'&&!query&&diet==='all'&&<a href="#menu-showcase" className="menu-showcase-jump"><Sparkles size={15}/> From craving to plate <ArrowUpRight size={15}/></a>}</aside>
   <div className="menu-results"><div className="results-count" aria-live="polite">{count} menu entries <span>Prices in Indian rupees</span></div>
   {!count&&<div className="empty-state"><h2>ANOTHER CRAVING?</h2><p>No matches for this search. Try a dish name or explore the full menu.</p><button className="button red" onClick={()=>{setQuery('');setDiet('all');setGroup('All');returnToResults(true);}}>Reset filters</button></div>}
   {categories.map(c=>{const featureConfig=featuredMenuCategories[c.id];const feature=featureConfig&&!query?featureConfig.itemIds.map(id=>c.items.find(i=>i.id===id)).find(Boolean):undefined;
    return <section className="menu-section" id={c.id} key={c.id} data-menu-section><div className="menu-section-title"><h2>{c.name}</h2><span>{c.items.length.toString().padStart(2,'0')}</span></div>{c.note&&<p className="category-note">{c.note}</p>}
     {feature&&<CategoryFoodFeature item={feature} headline={featureConfig.headline} subheadline={featureConfig.subheadline} sizeIndex={featureConfig.sizeIndex} onSelect={()=>setSelected({item:feature,category:c.name,sizeIndex:featureConfig.sizeIndex})}/>}
     <div className="menu-rows">{c.items.map(item=><MenuItemRow key={item.id} item={item} onSelect={()=>setSelected({item,category:c.name})}/>)}</div>
    </section>;})}
   <p className="menu-disclaimer">For dietary requirements, allergens, taxes and current availability, please speak with our team. Items without a dietary marker need ingredient confirmation.</p></div>
  </div><MenuItemModal item={selected?.item||null} category={selected?.category} initialSize={selected?.sizeIndex} onClose={()=>setSelected(null)}/>
 </div>{group==='All'&&!query&&diet==='all'&&<MenuFoodShowcase onSelect={showItem}/>}</>;
}
