'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {useInView,useReducedMotion,type MotionValue} from 'motion/react';
import {RotateCcw,Pause,Play} from 'lucide-react';
import type {FoodAnimationConfig} from '@/data/menu-animation-data';
import {PizzaAssembly} from './PizzaAssembly';
import {BurgerAssembly} from './BurgerAssembly';
import {CheesePull} from './CheesePull';
import {ChickenAssembly} from './ChickenAssembly';
import {RiceReveal} from './RiceReveal';
import {DrinkAnimation} from './DrinkAnimation';
import {DessertAnimation} from './DessertAnimation';
import {FriesAssembly,BucketFill,BreadBuild,SaladBuild,SnackBuild,IceCreamBuild,SweetBuild,DipBuild,ExtraBuild,GraphicFallback} from './AdditionalAssemblies';
import {useAnimationBudget} from './useAnimationBudget';
import './food-animation.css';
const renderers={pizzaAssembly:PizzaAssembly,burgerAssembly:BurgerAssembly,cheesePull:CheesePull,chickenReveal:ChickenAssembly,riceReveal:RiceReveal,drinkBuild:DrinkAnimation,dessertReveal:DessertAnimation,friesAssembly:FriesAssembly,bucketFill:BucketFill,breadBuild:BreadBuild,saladBuild:SaladBuild,snackBuild:SnackBuild,iceCreamBuild:IceCreamBuild,sweetBuild:SweetBuild,dipBuild:DipBuild,extraBuild:ExtraBuild};
export type FoodAnimationStageProps={config:FoodAnimationConfig;itemName:string;withCheese?:boolean;mode?:'category'|'detail'|'story'|'thumbnail';alreadyPlayed?:boolean;onPlayed?:()=>void;progress?:MotionValue<number>;scrollDriven?:boolean};
export function FoodAnimationStage({config,itemName,withCheese=false,mode='category'}:FoodAnimationStageProps){
 const ref=useRef<HTMLDivElement>(null);const scene=useRef<HTMLDivElement>(null);const near=useInView(ref,{margin:'160px 0px',once:true});const visible=useInView(ref,{amount:.4});const reduced=useReducedMotion();
 const active=useAnimationBudget(visible,mode==='detail'?100:mode==='thumbnail'?1:2);const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false);const [cycle,setCycle]=useState(0);const [paused,setPaused]=useState(false);const [started,setStarted]=useState(false);
 useEffect(()=>{if(!near||!scene.current)return;let cancelled=false;const images=Array.from(scene.current.querySelectorAll('img'));Promise.all(images.map(img=>img.decode())).then(()=>{if(!cancelled)setReady(true);}).catch(()=>{if(!cancelled){setFailed(true);setReady(true);}});return()=>{cancelled=true;};},[near,config.itemId]);
 useEffect(()=>{if(!active||!ready||started)return;const timer=setTimeout(()=>setStarted(true),mode==='detail'?150:60);return()=>clearTimeout(timer);},[active,ready,started,mode]);
 const Renderer=failed?GraphicFallback:renderers[config.animationType];const playing=started&&!reduced;const running=active&&!paused&&!reduced;
 return <div ref={ref} className={`fa-stage fa-stage-${mode}`} data-animation={config.animationType} data-variant={config.variant} data-item={config.itemId} data-cycle={cycle} data-play={playing} data-visible={visible} data-active={running} data-reduced={!!reduced} style={{'--food-accent':config.accentColor,'--cycle':`${config.cycleSeconds||9}s`,'--food-color':config.color||config.accentColor} as CSSProperties}>
 <div className="fa-stage-ring" aria-hidden="true"/><div className="fa-art" role="img" aria-label={`Illustrative ${itemName}`}>
 {near?<div ref={scene} key={cycle} className="fa-scene-content" aria-hidden="true" onAnimationEnd={e=>{if(e.target===e.currentTarget&&e.animationName==='fa-cycle'&&running)setCycle(c=>c+1);}}><Renderer config={config} withCheese={withCheese}/></div>:<GraphicFallback config={config}/>}
 </div>{mode!=='thumbnail'&&<><span className="fa-visual-note">ILLUSTRATIVE FOOD VISUAL</span><div className="fa-controls"><button type="button" className="fa-pause" aria-label={`${paused?'Play':'Pause'} ${itemName} animation`} disabled={!!reduced} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button><button type="button" className="fa-replay" aria-label={`Replay ${itemName} animation`} disabled={!ready||!!reduced} onClick={()=>{setCycle(c=>c+1);setPaused(false);}}><RotateCcw size={14}/><span>Replay</span></button></div></>}
 </div>;
}
