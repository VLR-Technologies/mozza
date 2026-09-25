import type {Metadata} from 'next';
import {LocationsSection} from '@/components/home/LocationsSection';
import {ReservationSection} from '@/components/home/ReservationSection';
export const metadata:Metadata={title:'Locations & Reservations',description:'Find Mozza Italia in Hyderabad, Shadnagar, Jadcherla and Guntur, or prepare a table request on WhatsApp.'};
export default function Contact(){return <><section className="page-hero"><span className="kicker">Visit Mozza Italia</span><h1>Your next food plan starts here.</h1><p>Choose a city, browse the menu, or prepare a table request for the restaurant team.</p></section><LocationsSection/><ReservationSection/></>;}
