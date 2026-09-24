import type {Metadata} from 'next';
import {VisitSection} from '@/components/home/Sections';
import {ReservationSection} from '@/components/home/ReservationSection';
export const metadata:Metadata={title:'Visit & Book a Table',description:'Contact Mozza Italia Shadnagar, call +91 99497 99488 or send a table reservation request on WhatsApp.'};
export default function Contact(){return <><section className="page-hero"><span className="eyebrow gold">MOZZA ITALIA · SHADNAGAR</span><h1>GOOD TIMES<br/><span className="hero-outline">START HERE.</span></h1><p>A table with friends. A family food plan. Or simply your favourite bite. Let’s make it happen.</p></section><VisitSection/><ReservationSection/></>;}
