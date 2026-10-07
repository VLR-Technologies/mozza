import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { branches, restaurant } from '@/config/restaurant';
import { MenuExplorer } from '@/components/menu/MenuExplorer';
import { OrderScene } from '@/components/order/OrderScene';

export const metadata: Metadata = {
  title: 'Order online',
  description: 'Build your Mozza Italia order — search the menu, pick a serving, add to your order and check out for pickup or dine-in.',
};

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ q?: string; group?: string; branch?: string; item?: string }> }) {
  const params = await searchParams;

  return <>
    {/* `menu-page-hero` is intentional: MenuExplorer measures this hero when it
        scrolls results back into view after a filter change. */}
    <section className="page-hero menu-page-hero order-page-hero">
      <OrderScene />
      <span className="kicker">Order from Mozza Italia</span>
      <h1>Craving Mozza?</h1>
      <p>Search the full menu, choose your serving, and build your order. Checkout confirms the outlet and how you want it.</p>
      <div className="order-mode-note">
        <span><ShoppingBag size={16} /> Pickup</span>
        <span><UtensilsCrossed size={16} /> Dine-in</span>
        <span className="order-mode-muted"><MapPin size={16} /> Delivery by enquiry — <Link href="/catering">ask the team</Link></span>
      </div>
      <p className="order-hero-note">Ordering is currently live for {restaurant.branch}. Other outlets ({branches.filter(branch => branch.id !== 'shadnagar').map(branch => branch.name).join(', ')}) confirm orders over WhatsApp — <Link className="inline-link" href="/locations">see all locations <ArrowRight size={15} /></Link></p>
    </section>

    <MenuExplorer initialQuery={params.q} initialGroup={params.group} initialBranch={params.branch} initialItem={params.item} />
  </>;
}
