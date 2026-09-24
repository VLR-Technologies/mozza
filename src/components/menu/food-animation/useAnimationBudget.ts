'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
const entries=new Map<symbol,number>();const listeners=new Set<()=>void>();let active=new Set<symbol>();let paused=false;
function update(){const ordered=[...entries].sort((a,b)=>b[1]-a[1]);const detail=ordered.some(([,p])=>p===100);active=new Set((paused?[]:ordered).filter(([,p])=>!detail||p===100).slice(0,6).map(([id])=>id));for(const notify of listeners)notify();}
const subscribe=(notify:()=>void)=>{listeners.add(notify);return()=>{listeners.delete(notify);};};
export function useAnimationBudget(visible:boolean,priority:number){const [id]=useState(()=>Symbol('food-scene'));useEffect(()=>{if(visible)entries.set(id,priority);else entries.delete(id);update();return()=>{entries.delete(id);update();};},[id,visible,priority]);return useSyncExternalStore(subscribe,()=>active.has(id),()=>false);}

export function useFoodMotionPreference(){const value=useSyncExternalStore(subscribe,()=>paused,()=>false);return [value,()=>{paused=!paused;update();}] as const;}
