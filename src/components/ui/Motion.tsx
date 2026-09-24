'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
export function Reveal({children,className=''}:{children:ReactNode;className?:string}) {const reduce=useReducedMotion();return <motion.div className={className} initial={reduce?false:{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.65,ease:[.22,1,.36,1]}}>{children}</motion.div>;}
export function Parallax({children,className=''}:{children:ReactNode;className?:string}) {const ref=useRef<HTMLDivElement>(null);const reduce=useReducedMotion();const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});const y=useTransform(scrollYProgress,[0,1],[24,-24]);const rotate=useTransform(scrollYProgress,[0,1],[-3,3]);return <motion.div ref={ref} className={className} style={reduce?{}:{y,rotate}}>{children}</motion.div>;}
export function DietIcon({diet}:{diet:'veg'|'non-veg'|'egg'|'unspecified'}) {if(diet==='unspecified')return null;return <span className={`diet ${diet}`} aria-label={diet==='veg'?'Vegetarian':diet==='egg'?'Contains egg':'Non-vegetarian'}><span/></span>;}
