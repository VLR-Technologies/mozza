'use client';

import {ArrowUpRight} from 'lucide-react';
import {menuShowcaseItemIds, getMenuItemPhoto} from '@/data/menu-images';
import {findItem, formatPrice, type MenuItem} from '@/data/menu-data';
import {StaticMenuImage} from './StaticMenuImage';

const labels = ['Pizza', 'Burger', 'Chicken', 'Pulav', 'Drink'];

export function MenuFoodShowcase({onSelect}: {onSelect: (item: MenuItem, sizeIndex?: number) => void}) {
  return <section id="menu-showcase" className="menu-photo-showcase" aria-label="From craving to plate">
    <div className="menu-showcase-heading">
      <span className="eyebrow">FIVE MOODS. ONE TABLE.</span>
      <h2>FROM CRAVING<br/>TO <em>PLATE.</em></h2>
      <p>A slice. A stack. A crunch.<br/>Five favourites, ready for a closer look.</p>
      <a href="#main" className="text-link">Back to the menu ↑</a>
    </div>
    <div className="menu-showcase-grid">
      {menuShowcaseItemIds.map((id, index) => {
        const item = findItem(id);
        const sizeIndex = id === 'chicken-zinger-burger' ? 1 : 0;
        const size = item.sizes[sizeIndex];

        return <button
          key={id}
          type="button"
          className="menu-showcase-card"
          onClick={() => onSelect(item, sizeIndex)}
        >
          <StaticMenuImage
            photo={getMenuItemPhoto(item)}
            className="menu-showcase-image"
            sizes="(max-width: 600px) 88vw, (max-width: 1000px) 42vw, 30vw"
            alt=""
          />
          <span className="menu-showcase-index">0{index + 1} / {labels[index]}</span>
          <span className="menu-showcase-caption">
            <strong>{item.name}</strong>
            <span>{formatPrice(size.price)}<small>{size.label}</small></span>
            <ArrowUpRight size={18}/>
          </span>
        </button>;
      })}
    </div>
  </section>;
}
