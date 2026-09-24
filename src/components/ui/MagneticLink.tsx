'use client';
import Link from 'next/link';
import {motion,useMotionValue,useSpring,useReducedMotion} from 'motion/react';
import type {ReactNode} from 'react';
const AnimatedLink=motion.create(Link);
export function MagneticLink({href,children,className}:{href:string;children:ReactNode;className?:string}){
 const x=useMotionValue(0),y=useMotionValue(0);const sx=useSpring(x,{stiffness:180,damping:18}),sy=useSpring(y,{stiffness:180,damping:18});const reduce=useReducedMotion();
 return <AnimatedLink href={href} className={className} style={reduce?{}:{x:sx,y:sy}} onPointerMove={e=>{if(reduce||e.pointerType!=='mouse'||!window.matchMedia('(min-width:901px) and (pointer:fine)').matches)return;const r=e.currentTarget.getBoundingClientRect();x.set((e.clientX-r.left-r.width/2)*.08);y.set((e.clientY-r.top-r.height/2)*.12);}} onPointerLeave={()=>{x.set(0);y.set(0);}}>{children}</AnimatedLink>;
}
