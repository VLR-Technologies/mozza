import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { findItem } from '@/data/menu-data';
import { MenuItemCard } from '@/components/menu/MenuItemCard';

const popularIds = ['mozza-italia-spl', 'chicken-zinger-burger', 'chicken-hot-wings', 'basmathi-chicken-ghee-pulav'];

export function PopularItems() {
  return <section className="content-section popular-section">
    <div className="section-heading"><div><span className="kicker">Customer favourites</span><h2>Popular at Mozza</h2><p>Big flavour, clear choices, and a direct path to your next order.</p></div><Link className="inline-link" href="/menu">Browse everything <ArrowRight size={17} /></Link></div>
    <div className="food-card-grid">{popularIds.map(id => <MenuItemCard key={id} item={findItem(id)} />)}</div>
  </section>;
}
