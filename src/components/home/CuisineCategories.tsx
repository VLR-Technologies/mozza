import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { menuCategories } from '@/data/menu-data';
import { foodVisuals } from '@/data/food-visuals';
import { CategoryCard } from '@/components/menu/CategoryCard';

const visuals: Record<string, string> = {
  Pizza: foodVisuals.pizza,
  Chicken: foodVisuals.chicken,
  Burgers: foodVisuals.burger,
  Rice: foodVisuals.rice,
  Snacks: foodVisuals.fries,
  Salads: foodVisuals.salad,
  Drinks: foodVisuals.drinks,
  Desserts: foodVisuals.desserts,
};

export function CuisineCategories() {
  const categories = Object.entries(menuCategories.reduce<Record<string, number>>((totals, category) => {
    totals[category.group] = (totals[category.group] || 0) + category.items.length;
    return totals;
  }, {})).filter(([name]) => visuals[name]);

  return <section className="content-section category-section" id="explore">
    <div className="section-heading">
      <div><span className="kicker">Explore the menu</span><h2>What are you craving?</h2></div>
      <Link className="inline-link" href="/menu">See the full menu <ArrowRight size={17} /></Link>
    </div>
    <div className="category-rail-home">{categories.map(([name, count]) => <CategoryCard key={name} name={name} count={count} image={visuals[name]} />)}</div>
  </section>;
}
