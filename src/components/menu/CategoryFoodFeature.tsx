'use client';

import {ArrowUpRight} from 'lucide-react';
import {formatPrice, type MenuItem} from '@/data/menu-data';
import {getMenuItemPhoto} from '@/data/menu-images';
import {DietIcon} from '@/components/ui/Motion';
import {StaticMenuImage} from './StaticMenuImage';

export function CategoryFoodFeature({
  item,
  headline,
  subheadline,
  sizeIndex = 0,
  onSelect,
}: {
  item: MenuItem;
  headline: string;
  subheadline: string;
  sizeIndex?: number;
  onSelect: () => void;
}) {
  const size = item.sizes[sizeIndex] || item.sizes[0];

  return <div className="category-photo-feature">
    <div className="category-photo-feature-copy">
      <span className="eyebrow">A CLOSER LOOK</span>
      <h3>{headline}</h3>
      <p>{subheadline}</p>
      <button className="category-feature-dish" onClick={onSelect}>
        <span><DietIcon diet={item.diet}/>{item.name}</span>
        <strong>{formatPrice(size.price)} <small>{size.label}</small></strong>
        <ArrowUpRight size={20}/>
      </button>
    </div>
    <StaticMenuImage
      photo={getMenuItemPhoto(item)}
      className="category-feature-image"
      sizes="(max-width: 600px) 88vw, (max-width: 1100px) 46vw, 38vw"
    />
  </div>;
}
