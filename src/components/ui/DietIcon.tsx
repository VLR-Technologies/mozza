import type { Diet } from '@/data/menu-data';

export function DietIcon({ diet }: { diet: Diet }) {
  if (diet === 'unspecified') return null;

  const label = diet === 'veg'
    ? 'Vegetarian'
    : diet === 'egg'
      ? 'Contains egg'
      : 'Non-vegetarian';

  return <span className={`diet ${diet}`} aria-label={label}><span /></span>;
}
