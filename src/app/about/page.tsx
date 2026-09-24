import type {Metadata} from 'next';
import {AboutContent} from '@/components/home/Sections';
export const metadata:Metadata={title:'Our Story',description:'More than just food. Meet Mozza Italia Shadnagar: pizza, crispy chicken, burgers and ghee pulav for every kind of craving.'};
export default function About(){return <><section className="page-hero"><span className="eyebrow gold">GOOD FOOD HAS A WAY OF BRINGING PEOPLE TOGETHER</span><h1>THE FOOD.<br/>THE PEOPLE.<br/><span className="hero-outline">THE GOOD TIMES.</span></h1></section><AboutContent/></>;}
