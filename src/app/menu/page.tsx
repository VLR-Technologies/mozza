import type {Metadata} from 'next';
import {MenuExplorer} from '@/components/menu/MenuExplorer';
export const metadata:Metadata={title:'The Menu',description:'Explore the complete Mozza Italia menu. Search pizza, chicken, burgers, rice, drinks and desserts with sizes and prices in rupees.'};

export default async function MenuPage({searchParams}:{searchParams:Promise<{q?:string;group?:string;branch?:string;item?:string}>}){
 const params=await searchParams;
 return <><section className="page-hero menu-page-hero"><span className="kicker">The Mozza Italia menu</span><h1>Find your kind of hungry.</h1><p>Search 118 dishes, filter by food type, choose a serving, and prepare your order for WhatsApp.</p></section><MenuExplorer initialQuery={params.q} initialGroup={params.group} initialBranch={params.branch} initialItem={params.item}/></>;
}
