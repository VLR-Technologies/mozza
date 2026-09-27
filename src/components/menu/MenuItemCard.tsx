import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DietIcon } from '@/components/ui/DietIcon';
import { formatPrice, type MenuItem } from '@/data/menu-data';
import { getMenuItemPhoto } from '@/data/menu-images';

export function MenuItemCard({ item, branch = 'shadnagar' }: { item: MenuItem; branch?: string }) {
  const photo = getMenuItemPhoto(item);
  const firstPrice = item.sizes.find(size => size.price !== null) || item.sizes[0];

  return <article className="food-card">
    <Link className="food-card-image" href={`/menu?branch=${branch}&item=${item.id}`} aria-label={`View ${item.name}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 82vw, (max-width: 1100px) 42vw, 28vw" style={{ objectPosition: photo.position }} />
    </Link>
    <div className="food-card-body">
      <div className="food-card-title"><DietIcon diet={item.diet} /><h3>{item.name}</h3></div>
      {item.description && <p>{item.description}</p>}
      <div className="food-card-meta"><span>{firstPrice.label === 'MRP' ? 'MRP' : `From ${formatPrice(firstPrice.price)}`}</span><Link href={`/menu?branch=${branch}&item=${item.id}`}>View <ArrowRight size={15} /></Link></div>
    </div>
  </article>;
}
