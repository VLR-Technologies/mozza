import { pageMetadata } from '@/lib/seo';
import {GalleryGrid} from '@/components/gallery/GalleryGrid';
export const metadata = pageMetadata('/gallery');
export default function Gallery(){return <><section className="page-hero"><span className="kicker">Food gallery</span><h1>A feast before the first bite.</h1><p>Explore the flavours and food categories across the Mozza Italia menu.</p></section><GalleryGrid/></>;}
