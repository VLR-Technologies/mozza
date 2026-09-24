import type {Metadata} from 'next';
import {MenuExplorer} from '@/components/menu/MenuExplorer';
export const metadata:Metadata={title:'The Menu',description:'Explore the complete Mozza Italia Shadnagar menu. Search pizza, chicken, burgers, rice, drinks and desserts with sizes and prices in rupees.'};
export default function MenuPage(){return <><section className="page-hero menu-page-hero"><span className="eyebrow gold">FLAVOURS FOR EVERY MOOD</span><h1>FOLLOW YOUR<br/><span className="hero-outline">CRAVINGS.</span></h1><p>A slice, a crunch, a little comfort. Find your kind of good food.</p></section><MenuExplorer/></>;}
