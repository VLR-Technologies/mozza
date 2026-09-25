import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CategoryCard({ name, image, count }: { name: string; image: string; count: number }) {
  return <Link className="category-card" href={`/menu?group=${encodeURIComponent(name)}`}>
    <span className="category-card-image"><Image src={image} fill sizes="(max-width: 600px) 55vw, (max-width: 1000px) 28vw, 18vw" alt="" /></span>
    <span className="category-card-copy"><strong>{name}</strong><small>{count} menu items</small></span>
    <ArrowUpRight size={19} />
  </Link>;
}
