import Link from 'next/link';
import { breadcrumbSchema, type Breadcrumb } from '@/lib/structured-data';
import { JsonLd } from './JsonLd';

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return <>
    <JsonLd data={breadcrumbSchema(items)} />
    <nav aria-label="Breadcrumb" className="outlet-breadcrumbs">
      <ol>{items.map((item, index) => <li key={item.path}>
        {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
      </li>)}</ol>
    </nav>
  </>;
}
