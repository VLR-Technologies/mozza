import type {Metadata} from 'next';
import {GalleryGrid} from '@/components/gallery/GalleryGrid';
export const metadata:Metadata={title:'Food Gallery',description:'A food-focused look at the flavours of Mozza Italia. Explore illustrative pizza, chicken, burgers, ghee pulav, drinks and desserts.'};
export default function Gallery(){return <><section className="page-hero"><span className="kicker">Food gallery</span><h1>A feast before the first bite.</h1><p>Explore the flavours and food categories across the Mozza Italia menu.</p></section><GalleryGrid/></>;}
