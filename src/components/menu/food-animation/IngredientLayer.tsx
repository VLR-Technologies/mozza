'use client';
import Image from 'next/image';
import type {CSSProperties} from 'react';
export type LayerStyle = CSSProperties & Record<`--${string}`, string | number>;
export function IngredientLayer({src,className='',style={}}:{src:string;className?:string;style?:LayerStyle}) {
  return <span className={`fa-layer ${className}`} style={style}><Image src={src} unoptimized fill sizes="(max-width:600px) 220px, 420px" alt="" draggable={false}/></span>;
}
