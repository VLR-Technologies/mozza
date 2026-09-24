import type {Metadata} from 'next';
import {GalleryGrid} from '@/components/gallery/GalleryGrid';
export const metadata:Metadata={title:'Food Gallery',description:'A food-focused look at the flavours of Mozza Italia. Explore illustrative pizza, chicken, burgers, ghee pulav, drinks and desserts.'};
export default function Gallery(){return <><section className="page-hero"><span className="eyebrow gold">A FEAST BEFORE THE FIRST BITE</span><h1>LOOKS GOOD.<br/><span className="hero-outline">TASTES LIKE A PLAN.</span></h1></section><GalleryGrid/></>;}
