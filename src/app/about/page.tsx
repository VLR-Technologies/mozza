import type {Metadata} from 'next';
import {AboutContent} from '@/components/home/Sections';
export const metadata:Metadata={title:'Our Story',description:'More than just food. Meet Mozza Italia: pizza, crispy chicken, burgers and ghee pulav for every kind of craving.'};
export default function About(){return <><section className="page-hero"><span className="kicker">Our story</span><h1>Good food has a way of bringing people together.</h1><p>Familiar favourites, generous portions, and a reason to stay for one more bite.</p></section><AboutContent/></>;}
