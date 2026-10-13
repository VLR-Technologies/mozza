import { pageMetadata } from '@/lib/seo';
import {MenuExplorer} from '@/components/menu/MenuExplorer';
import {FoodDrift} from '@/components/menu/FoodDrift';
export const metadata = pageMetadata('/menu');

export default async function MenuPage({searchParams}:{searchParams:Promise<{q?:string;group?:string;branch?:string;item?:string}>}){
 const params=await searchParams;
 return <><section className="page-hero menu-page-hero"><FoodDrift/><span className="kicker">The Mozza Italia menu</span><h1>Find your kind of hungry.</h1><p>Search 118 dishes, filter by food type, choose a serving, and prepare your order for WhatsApp.</p></section><MenuExplorer initialQuery={params.q} initialGroup={params.group} initialBranch={params.branch} initialItem={params.item}/></>;
}
