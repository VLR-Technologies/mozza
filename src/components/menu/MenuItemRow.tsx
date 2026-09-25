'use client';

import {ArrowUpRight} from 'lucide-react';
import {DietIcon} from '@/components/ui/DietIcon';
import {getMenuItemPhoto} from '@/data/menu-images';
import {type MenuItem, formatPrice} from '@/data/menu-data';
import {StaticMenuImage} from './StaticMenuImage';

export function MenuDietMarker({item}: {item: MenuItem}) {
  return item.diet === 'unspecified'
    ? <span className="diet-neutral" aria-label="Dietary status unspecified; ask the restaurant">?</span>
    : <DietIcon diet={item.diet}/>;
}

export function MenuItemRow({item, onSelect}: {item: MenuItem; onSelect: () => void}) {
  const photo = getMenuItemPhoto(item);

  return <button
    type="button"
    className="menu-row static-menu-row"
    data-item-id={item.id}
    onClick={onSelect}
    aria-label={`View ${item.name}`}
  >
    <StaticMenuImage
      photo={photo}
      className="menu-thumbnail"
      sizes="(max-width: 600px) 88px, (max-width: 1100px) 104px, 120px"
      alt=""
    />
    <div className="menu-row-copy">
      <div className="menu-name"><MenuDietMarker item={item}/><h3>{item.name}</h3></div>
      {item.description && <p>{item.description}</p>}
      {item.note && <small>{item.note}</small>}
      <span className="row-order-label">View & order <ArrowUpRight size={12}/></span>
    </div>
    <div className="row-prices">
      {item.sizes.map(size => <span key={size.label}>
        <small>{size.label}</small>
        <strong>{size.label === 'MRP' ? 'MRP' : formatPrice(size.price)}</strong>
      </span>)}
      <ArrowUpRight className="row-arrow" size={17}/>
    </div>
  </button>;
}
