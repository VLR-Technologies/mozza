import type {Metadata} from 'next';
import Image from 'next/image';
import {AboutContent} from '@/components/home/Sections';
export const metadata:Metadata={title:'Our Story',description:'More than just food. Meet Mozza Italia: pizza, crispy chicken, burgers and ghee pulav for every kind of craving.'};
export default function About(){return <><section className="page-hero image-hero"><div className="image-hero-media"><Image src="/food/items/chittimutyalu-veg-ghee-pulav.webp" alt="" fill priority sizes="100vw" style={{objectPosition: "center 35%"}}/></div><div className="image-hero-copy"><span className="kicker">Our story</span><h1>Good food has a way of bringing people together.</h1><p>Familiar favourites, generous portions, and a reason to stay for one more bite.</p></div></section><AboutContent/></>;}
